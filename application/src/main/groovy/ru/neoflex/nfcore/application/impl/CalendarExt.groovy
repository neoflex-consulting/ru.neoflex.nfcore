package ru.neoflex.nfcore.application.impl

import com.fasterxml.jackson.databind.node.ObjectNode
import org.eclipse.emf.ecore.EClass
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.Calendar
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.base.util.EmfJson
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity

import java.text.SimpleDateFormat

class CalendarExt extends CalendarImpl {
    private static final Logger logger = LoggerFactory.getLogger(CalendarExt.class);

    static def findEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    @Override
    String getNotificationInstances(String dateFrom, String dateTo) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.CALENDAR, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def resourceSet = Context.current.store.createResourceSet()

                    def calendar = resource.resources.get(0).contents.get(0) as Calendar
                    if (calendar.notifications.size()!= 0) {

                        for (int i = 0; i < calendar.notifications.size(); i++) {

                            def newResource = Context.current.store.createEmptyResource(resourceSet)

                            def notification = findEObject(NotificationPackage.Literals.NOTIFICATION, calendar.notifications[i].name)

                            if (notification.periodicity == Periodicity.MONTH) {
                                if (notification.reportingDateOn.size() == 1) {

                                    def notificationDateOn = notification.reportingDateOn[0].name.toInteger()
                                    def notificationDateOnFull = notificationDateOn < 10 ? '0' + notificationDateOn : notificationDateOn

                                    def notificationInstance = NotificationFactory.eINSTANCE.createNotificationInstance()
                                    notificationInstance.setNotification(notification)

                                    def notificationInstanceDTO = NotificationFactory.eINSTANCE.createNotificationInstanceDTO()
                                    notificationInstanceDTO.notificationName = notification.name
                                    notificationInstanceDTO.notificationShortName = notification.shortName
                                    if (notification.appModule != null) {
                                        notificationInstanceDTO.appModuleName = notification.appModule.name
                                    }
                                    def d1 = new Date(dateFrom)
                                    def yearDateFrom = d1.toYear().toString()
                                    def monthDateFrom = d1.toMonth().ordinal() + 1
                                    def monthDateFromFull = monthDateFrom < 10 ? '0' + monthDateFrom : monthDateFrom
                                    def dayDateFrom = d1.toMonthDay().day < 10 ? '0' + d1.toMonth().ordinal() : d1.toMonth().ordinal()

                                    def d2 = new Date(dateTo)
                                    def yearDateTo = d2.toYear().toString()
                                    def monthDateTo = d2.toMonth().ordinal()  + 1
                                    def monthDateToFull = monthDateTo < 10 ? '0' + monthDateTo : monthDateTo
                                    def dayDateTo = d2.toMonthDay().day < 10 ? '0' + d2.toMonth().ordinal() : d2.toMonth().ordinal()

                                    if (monthDateFromFull == monthDateToFull) {
                                        def dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

                                        if (notification.weekendReporting) {
                                            def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + notification.deadlineDay + "T" + notification.deadlineTime + ":00"
                                            notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                                            notificationInstance.name = notification.name + "." + newDate

                                            notificationInstanceDTO.name = notificationInstance.name
                                            notificationInstanceDTO.calendarDate = newDate
                                            notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull
                                        }
                                        else {
                                            def yearBookMonth = calendar.yearBook.days.findAll{ day ->
                                                day.date.toYear().toString() == yearDateFrom && day.date.toMonth().ordinal() + 1 == monthDateFrom
                                            }
                                            def newDeadlineDay = yearBookMonth[notification.deadlineDay.toInteger()]
                                            def newDate = yearDateFrom + "-" + monthDateFromFull + "-" + newDeadlineDay.date.toMonthDay().day + "T" + notification.deadlineTime + ":00"
                                            notificationInstance.calendarDate = dateFormat.parse(newDate) as java.util.Date
                                            notificationInstance.name = notification.name + "." + newDate

                                            notificationInstanceDTO.name = notificationInstance.name
                                            notificationInstanceDTO.calendarDate = newDate
                                            notificationInstanceDTO.notificationDateOn = yearDateFrom + "-" + monthDateFromFull + "-" + notificationDateOnFull
                                        }

                                        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: notificationInstance.name])
                                                .execute().resourceSet
                                        if (rs.resources.empty) {
                                            Context.current.store.createEObject(notificationInstance)
                                        }
                                        newResource.getContents().add(notificationInstanceDTO)
                                    }
                                }
                            }
                        }
                        def resourceSetNode = EmfJson.resourceSetToTree(Context.current.store, resourceSet.resources) as ObjectNode
                        return resourceSetNode
                    }
                }
            }
        })
    }

}
