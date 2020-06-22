package ru.neoflex.nfcore.application.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.GlobalSettings
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.utils.Utils

import java.text.SimpleDateFormat

class YearBookExt extends YearBookImpl {

    @Override
    String recreateWeekend(String year) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
                    def yearBook = resource.resources.get(0).contents.get(0) as YearBook
                    def dateFormat = new SimpleDateFormat("yyyy-MM-dd");

                    def days = []
                    if (yearBook.days.size() != 0) {
                        for (int i = 0; i < yearBook.days.size(); i++) {
                            def yearThis = yearBook.days[i].date.toYear().toString()
                            if (yearThis != year) {
                                days.push(yearBook.days[i])
                            }
                        }
                        yearBook.days.clear()
                    }

                    def date1 = year + "-01-01";
                    def date2 = year + "-12-31";
                    def d1 = dateFormat.parse(date1) as java.util.Date
                    def d2 = dateFormat.parse(date2) as java.util.Date
                    while( d1.before(d2) ){
                        def day = ApplicationFactory.eINSTANCE.createDay()
                            if (d1.toDayOfWeek().ordinal() == 5 || d1.toDayOfWeek().ordinal() == 6) {
                                day.date = d1
                                day.setTitle('Выходной')
                                days.push(day)
                            }
                        d1 = addDays(d1, 1);
                    }
                    yearBook.days.addAll(days)
                    Context.current.store.updateEObject(yearBookRef, yearBook)
                    Context.current.store.commit("Entity was updated " + yearBookRef)
                    return JsonOutput.toJson("Days in entity " + yearBook.name + " were created")
                }
            }
        })
    }

    @Override
    String copyHolidays(String yearFrom, String yearTo) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def yearBookRef = Context.current.store.getRef(resource.resources.get(0))
                    def yearBook = resource.resources.get(0).contents.get(0) as YearBook
                    def dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                    def daysFrom = []
                    def days = []
                    if (yearBook.days.size() != 0) {
                        for (int i = 0; i < yearBook.days.size(); i++) {
                            def yearThis = yearBook.days[i].date.toYear().toString()
                            if (yearThis == yearFrom) {
                                daysFrom.push(yearBook.days[i])
                            }
                        }
                        if (daysFrom.size() != 0) {

                            for (int i = 0; i < yearBook.days.size(); i++) {
                                def yearThis = yearBook.days[i].date.toYear().toString()
                                if (yearThis != yearTo) {
                                    days.push(yearBook.days[i])
                                }
                            }
                            for (int i = 0; i < daysFrom.size(); i++) {
                                def day = ApplicationFactory.eINSTANCE.createDay()
                                def monthThis = (daysFrom[i].date as java.sql.Timestamp).toMonthDay().month.ordinal() + 1
                                def dayThis = (daysFrom[i].date as java.sql.Timestamp).toMonthDay().day
                                def date1 = yearTo + "-" + monthThis + "-" + dayThis;
                                def d1 = dateFormat.parse(date1) as java.util.Date
                                day.date = d1
                                day.setTitle(daysFrom[i].title)
                                days.push(day)
                            }
                        }
                        if (days.size() != 0) {
                            yearBook.days.addAll(days)
                            Context.current.store.updateEObject(yearBookRef, yearBook)
                            Context.current.store.commit("Entity was updated " + yearBookRef)
                            return JsonOutput.toJson("Days in entity " + yearBook.name + " were created")
                        }
                    }
                }
            }
        })
    }

    @Override
    String recreateWorkingDays(String year) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def workDaysYearBookRef = Context.current.store.getRef(resource.resources.get(0))
                    def workDaysYearBook = resource.resources.get(0).contents.get(0) as YearBook
                    def dateFormat = new SimpleDateFormat("yyyy-MM-dd");

                    def globalSettings = Utils.findEClass(ApplicationPackage.Literals.GLOBAL_SETTINGS) as GlobalSettings
                    def weekendYearBook = globalSettings.getWeekendCalendar().days
                    def holidaysYearBook = globalSettings.getHolidayCalendar().days

                    def oldDays = []
                    if (workDaysYearBook.days.size() != 0) {
                        for (int i = 0; i < workDaysYearBook.days.size(); i++) {
                            def yearThis = workDaysYearBook.days[i].date.toYear().toString()
                            if (yearThis != year) {
                                oldDays.push(workDaysYearBook.days[i])
                            }
                        }
                        workDaysYearBook.days.clear()
                    }
                    def date1 = year + "-01-01";
                    def date2 = year + "-12-31";
                    def d1 = dateFormat.parse(date1) as java.util.Date
                    def d2 = dateFormat.parse(date2) as java.util.Date

                    def titleNumber = 1
                    while( d1.before(d2) ){
                        def day = ApplicationFactory.eINSTANCE.createDay()
                        day.date = d1
                        day.setTitle(titleNumber + ' рабочий день')
                        if (weekendYearBook.size() != 0) {
                            if (!weekendYearBook.date.contains(d1)) {
                                if (holidaysYearBook.size() != 0) {
                                    if (!holidaysYearBook.date.contains(d1)) {
                                        if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                            titleNumber = 1
                                            day.setTitle(titleNumber + ' рабочий день')
                                        }
                                        titleNumber += 1
                                        workDaysYearBook.days.add(day)
                                    }
                                }
                                else {
                                    if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                        titleNumber = 1
                                        day.setTitle(titleNumber + ' рабочий день')
                                    }
                                    titleNumber += 1
                                    workDaysYearBook.days.add(day)
                                }
                            }
                        }
                        else {
                            if (holidaysYearBook.size() != 0) {
                                if (!holidaysYearBook.date.contains(d1)) {
                                    if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                        titleNumber = 1
                                        day.setTitle(titleNumber + ' рабочий день')
                                    }
                                    titleNumber += 1
                                    workDaysYearBook.days.add(day)
                                }
                            }
                            else {
                                workDaysYearBook.days.add(day)
                                if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                    titleNumber = 1
                                    day.setTitle(titleNumber + ' рабочий день')
                                }
                                titleNumber += 1
                            }
                        }
                        d1 = addDays(d1, 1);
                    }
                    if (oldDays.size() != 0) {
                        workDaysYearBook.days.addAll(oldDays)
                    }
                    Context.current.store.updateEObject(workDaysYearBookRef, workDaysYearBook)
                    Context.current.store.commit("Entity was updated " + workDaysYearBookRef)
                    return JsonOutput.toJson("Days in entity " + workDaysYearBook.name + " were created")
                }
            }
        })
    }

    private static java.util.Date addDays(java.util.Date d1, int i) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(d1);
        cal.add(Calendar.DATE, 1);
        return cal.getTime();
    }
}
