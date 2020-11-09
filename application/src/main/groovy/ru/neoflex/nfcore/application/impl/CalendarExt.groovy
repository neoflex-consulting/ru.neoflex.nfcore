package ru.neoflex.nfcore.application.impl

import com.fasterxml.jackson.databind.node.ObjectNode
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.emf.ecore.util.EcoreUtil
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.base.util.EmfJson
import ru.neoflex.nfcore.notification.CalculationInterval
import ru.neoflex.nfcore.notification.Notification
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationInstance
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity
import ru.neoflex.nfcore.utils.Utils

import java.text.SimpleDateFormat
import java.time.LocalDate

class CalendarExt extends CalendarImpl {
    private static final Logger logger = LoggerFactory.getLogger(CalendarExt.class);

    @Override
    String createNotification(String newNotification) {
        try {
            return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def jsonSlurper = new JsonSlurper()
                    def notificationDTO = jsonSlurper.parseText(newNotification)
                    def notification = NotificationFactory.eINSTANCE.createNotification()

                    notification.name = notificationDTO.fullName
                    notification.shortName = notificationDTO.shortName
                    notification.weekendReporting = notificationDTO.weekendReporting
                    notification.periodicity =
                            notificationDTO.periodicity == 'Day' ? Periodicity.DAY :
                                    notificationDTO.periodicity == 'Month' ? Periodicity.MONTH :
                                            notificationDTO.periodicity == 'Quarter' ? Periodicity.QUARTER :
                                                    Periodicity.YEAR

                    def dateOn = NotificationFactory.eINSTANCE.createReportingDateOn()
                    dateOn.name = notificationDTO.deadlineDay.toString()
                    notification.reportingDateOn.add(dateOn)
                    notification.deadlineDay = notificationDTO.deadlineDay.toString()
                    notification.deadlineTime = notificationDTO.deadlineTime.toString()
                    notification.calculationInterval =
                            notificationDTO.periodicity == 'Day' ? CalculationInterval.PER_DAY :
                                    notificationDTO.periodicity == 'Month' ? CalculationInterval.PER_MONTH :
                                            notificationDTO.periodicity == 'Quarter' ? CalculationInterval.FOR_THE_QUARTER :
                                                    CalculationInterval.FROM_THE_BEGINNING_OF_THE_YEAR

                    notification.setDefaultStatus(CalendarExt.this.defaultStatus)

                    def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: notification.name])
                            .execute().resourceSet
                    if (rs.resources.empty) {
                        Context.current.store.createEObject(notification)
                        def savedNotification = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, notification.name)
                        CalendarExt.this.notifications.add(savedNotification)

                        def appModule = EcoreUtil.getRootContainer(CalendarExt.this)
                        def appModuleRef = Context.current.store.getRef(appModule.eResource())
                        Context.current.store.updateEObject(appModuleRef, appModule)
                    }

                    return JsonOutput.toJson("Notification created")
                }
            })
        }
        catch (Throwable e) {
            logger.error("Name already exists")
        }
    }

    @Override
    String getNotificationInstances(String dateFrom, String dateTo) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resourceSet = Context.current.store.createResourceSet()

                def calendar = this
                if (calendar.notifications.size() !=  0) {

                    for (int i = 0; i < calendar.notifications.size(); i++) {

                        def notification = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, calendar.notifications[i].name) as Notification
                        createNotificationInstance(notification,dateFrom,calendar.yearBook as YearBook,resourceSet)
                    }
                    def resourceSetNode = EmfJson.resourceSetToTree(Context.current.store, resourceSet.resources) as ObjectNode
                    return resourceSetNode
                }
            }
        })
    }

    static void createNotificationInstance(Notification notification, String dateFrom, YearBook yearBook, ResourceSet resourceSet) {
        for (int g = 0; g < notification.reportingDateOn.size(); g++) {
            def notificationDateOn = notification.reportingDateOn[g].name.toInteger()
            def notificationDateOnFull = notificationDateOn < 10 ? '0' + notificationDateOn : notificationDateOn

            def notificationInstance = NotificationFactory.eINSTANCE.createNotificationInstance()
            notificationInstance.setNotification(notification)

            def notificationInstanceDTO = NotificationFactory.eINSTANCE.createNotificationInstanceDTO()
            notificationInstanceDTO.notificationName = notification.name
            notificationInstanceDTO.notificationShortName = notification.shortName
            if (notification.appModule != null) {
                notificationInstanceDTO.appModuleName = notification.appModule.name
            }
            if (notification.calculationInterval != null) {
                notificationInstanceDTO.calculationInterval = notification.calculationInterval.toString()
            }

            notificationInstance.status.add(notification.defaultStatus)
            notificationInstanceDTO.statusColor = notification.defaultStatus.color

            def dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            //Только время и дата
            def d1 = new SimpleDateFormat('yyyy-MM-dd HH:mm:ss').parse(dateFrom)
            def yearDateFrom = d1.toYear().toString()
            def monthDateFrom = d1.toMonth().ordinal() + 1
            def monthDateFromFull = monthDateFrom < 10 ? '0' + monthDateFrom : monthDateFrom

            def deadlineTimeFull = notification.deadlineTime.toInteger() < 10 ? '0' + notification.deadlineTime : notification.deadlineTime

            if (notification.periodicity == Periodicity.MONTH || notification.periodicity == Periodicity.DAY) {
                if (notification.weekendReporting) {
                    def deadlineDayFull = notification.deadlineDay.toInteger() < 10 ? '0' + notification.deadlineDay : notification.deadlineDay
                    def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + deadlineDayFull + "T" + deadlineTimeFull + ":00:00"
                    notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                    notificationInstance.name = notification.name + "." + newDate

                    notificationInstanceDTO.name = notificationInstance.name
                    notificationInstanceDTO.calendarDate = newDate
                    notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull

                    def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: notificationInstance.name])
                            .execute().resourceSet
                    if (rs.resources.empty) {
                        Context.current.store.createEObject(notificationInstance)
                    } else {
                        notificationInstance = rs.resources[0].contents[0] as NotificationInstance
                        notificationInstanceDTO.statusColor = notificationInstance.status[0].color
                    }
                    def newResource = Context.current.store.createEmptyResource(resourceSet)
                    newResource.getContents().add(notificationInstanceDTO)
                } else {
                    def yearBookMonth = yearBook.days.findAll { day ->
                        day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == monthDateFrom
                    }
                    if (yearBookMonth.size() != 0 && notification.deadlineDay.toInteger() - 1 <= yearBookMonth.size()) {
                        def newDeadlineDay = yearBookMonth[notification.deadlineDay.toInteger() - 1].date.toMonthDay().day
                        def deadlineDayFull = newDeadlineDay < 10 ? '0' + newDeadlineDay : newDeadlineDay

                        def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + deadlineDayFull + "T" + deadlineTimeFull + ":00:00"
                        notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                        notificationInstance.name = notification.name + "." + newDate

                        notificationInstanceDTO.name = notificationInstance.name
                        notificationInstanceDTO.calendarDate = newDate
                        notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull

                        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: notificationInstance.name])
                                .execute().resourceSet
                        if (rs.resources.empty) {
                            Context.current.store.createEObject(notificationInstance)
                        } else {
                            notificationInstance = rs.resources[0].contents[0] as NotificationInstance
                            notificationInstanceDTO.statusColor = notificationInstance.status[0].color
                        }
                        def newResource = Context.current.store.createEmptyResource(resourceSet)
                        newResource.getContents().add(notificationInstanceDTO)
                    } else {
                        logger.info("The year " + yearDateFrom + " is distracting in the system Working Days Calendar")
                    }
                }
            } else if (notification.periodicity == Periodicity.QUARTER) {
                def deadlineDay
                for (int j = 1; j < 12; j += 3) {
                    if ([j, j + 1, j + 2].contains(monthDateFrom)) {
                        if (notification.weekendReporting) {
                            def month1 = LocalDate.of(yearDateFrom.toInteger(), j, 1) as LocalDate
                            def month2 = LocalDate.of(yearDateFrom.toInteger(), j + 1, 1) as LocalDate
                            def month3 = LocalDate.of(yearDateFrom.toInteger(), j + 2, 1) as LocalDate

                            if (notification.deadlineDay.toInteger() <= month1.lengthOfMonth() && monthDateFrom == j) {
                                deadlineDay = notification.deadlineDay.toInteger()
                            } else if (notification.deadlineDay.toInteger() <= month1.lengthOfMonth() + month2.lengthOfMonth() && monthDateFrom == j + 1) {
                                deadlineDay = notification.deadlineDay.toInteger() - month1.lengthOfMonth()
                            } else if (notification.deadlineDay.toInteger() <= month1.lengthOfMonth() + month2.lengthOfMonth() + month3.lengthOfMonth() && monthDateFrom == j + 2) {
                                deadlineDay = notification.deadlineDay.toInteger() - month1.lengthOfMonth() - month2.lengthOfMonth()
                            }
                        } else {
                            def month1 = yearBook.days.findAll { day ->
                                day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == j
                            }
                            def month2 = yearBook.days.findAll { day ->
                                day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == j + 1
                            }
                            def month3 = yearBook.days.findAll { day ->
                                day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == j + 2
                            }
                            if (month1.size() != 0 && month2.size() != 0 && month3.size() != 0) {
                                if (notification.deadlineDay.toInteger() <= month1.size() && monthDateFrom == j) {
                                    deadlineDay = month1[notification.deadlineDay.toInteger() - 1].date.toMonthDay().day
                                } else if (notification.deadlineDay.toInteger() <= month1.size() + month2.size() &&
                                        monthDateFrom == j + 1 &&
                                        notification.deadlineDay.toInteger() - month1.size() - 1 >= 0
                                ) {
                                    deadlineDay = month2[notification.deadlineDay.toInteger() - month1.size() - 1].date.toMonthDay().day
                                } else if (notification.deadlineDay.toInteger() <= month3.size() + month2.size() + month3.size() &&
                                        monthDateFrom == j + 2 &&
                                        notification.deadlineDay.toInteger() - month1.size() - month2.size() - 1 >= 0
                                ) {
                                    deadlineDay = month3[notification.deadlineDay.toInteger() - month1.size() - month2.size() - 1].date.toMonthDay().day
                                }
                            } else {
                                logger.info("The year " + yearDateFrom + " is distracting in the system Working Days Calendar")
                            }
                        }
                    }
                }
                if (deadlineDay != null) {
                    def deadlineDayFull = deadlineDay.toInteger() < 10 ? '0' + deadlineDay : deadlineDay

                    def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + deadlineDayFull + "T" + deadlineTimeFull + ":00:00"
                    notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                    notificationInstance.name = notification.name + "." + newDate

                    notificationInstanceDTO.name = notificationInstance.name
                    notificationInstanceDTO.calendarDate = newDate
                    notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull

                    def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: notificationInstance.name])
                            .execute().resourceSet
                    if (rs.resources.empty) {
                        Context.current.store.createEObject(notificationInstance)
                    } else {
                        notificationInstance = rs.resources[0].contents[0] as NotificationInstance
                        notificationInstanceDTO.statusColor = notificationInstance.status[0].color
                    }
                    def newResource = Context.current.store.createEmptyResource(resourceSet)
                    newResource.getContents().add(notificationInstanceDTO)
                }
            } else if (notification.periodicity == Periodicity.YEAR) {
                def deadlineDay

                if (notification.weekendReporting) {
                    def year = []
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 12, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 11, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 10, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 9, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 8, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 7, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 6, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 5, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 4, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 3, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 2, 1) as LocalDate)
                    year.push(LocalDate.of(yearDateFrom.toInteger(), 1, 1) as LocalDate)

                    for (int j = 0; j < monthDateFrom - 1; j++) {
                        if (deadlineDay == null) {
                            deadlineDay = notification.deadlineDay.toInteger() - year[0].lengthOfMonth()
                        } else {
                            deadlineDay -= year[j].lengthOfMonth()
                        }
                        if (j == monthDateFrom - 2 && (deadlineDay < 0 || deadlineDay > year[j].lengthOfMonth())) {
                            deadlineDay = null
                        }
                    }
                } else {
                    def year = []
                    for (int j = 12; j >= 1; j--) {
                        year.push(
                                yearBook.days.findAll { day ->
                                    day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == j
                                }
                                        .size()
                        )
                    }

                    if (year.size() != 0) {
                        for (int j = 0; j < monthDateFrom - 1; j++) {
                            if (deadlineDay == null) {
                                deadlineDay = notification.deadlineDay.toInteger() - year[0].toInteger()
                            } else {
                                deadlineDay -= year[j].toInteger()
                            }

                            if (j == monthDateFrom - 2 && (deadlineDay < 0 || deadlineDay > year[j].toInteger())) {
                                deadlineDay = null
                            } else if (j == monthDateFrom - 2 && deadlineDay >= 0 && deadlineDay <= year[j].toInteger()) {

                                def yearBookMonth = yearBook.days.findAll { day ->
                                    day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == monthDateFrom
                                }
                                deadlineDay = yearBookMonth[deadlineDay.toInteger() - 1].date.toMonthDay().day
                            }
                        }
                    } else {
                        logger.info("The year " + yearDateFrom + " is distracting in the system Working Days Calendar")
                    }
                }

                if (deadlineDay != null) {
                    def deadlineDayFull = deadlineDay.toInteger() < 10 ? '0' + deadlineDay : deadlineDay

                    def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + deadlineDayFull + "T" + deadlineTimeFull + ":00:00"
                    notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                    notificationInstance.name = notification.name + "." + newDate

                    notificationInstanceDTO.name = notificationInstance.name
                    notificationInstanceDTO.calendarDate = newDate
                    notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull

                    def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: notificationInstance.name])
                            .execute().resourceSet
                    if (rs.resources.empty) {
                        Context.current.store.createEObject(notificationInstance)
                    } else {
                        notificationInstance = rs.resources[0].contents[0] as NotificationInstance
                        notificationInstanceDTO.statusColor = notificationInstance.status[0].color
                    }
                    def newResource = Context.current.store.createEmptyResource(resourceSet)
                    newResource.getContents().add(notificationInstanceDTO)
                }
            }
        }
    }
}
