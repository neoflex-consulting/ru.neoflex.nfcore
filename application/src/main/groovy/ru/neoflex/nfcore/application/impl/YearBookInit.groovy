package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

import java.text.SimpleDateFormat

class YearBookInit {

    static def findEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def createWeekendYearBook(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def yearBook = ApplicationFactory.eINSTANCE.createYearBook()
            yearBook.name = name
            def dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            def year = new Date().toYear().year

            def date1 = year + "-01-01";
            def date2 = year + "-12-31";
            def d1 = dateFormat.parse(date1) as java.util.Date
            def d2 = dateFormat.parse(date2) as java.util.Date
            while( d1.before(d2) ){
                def day = ApplicationFactory.eINSTANCE.createDay()
                if (d1.toDayOfWeek().ordinal() == 5 || d1.toDayOfWeek().ordinal() == 6) {
                    day.date = d1
                    day.setTitle('Выходной')
                    yearBook.days.add(day)
                }
                d1 = addDays(d1, 1);
            }
            rs.resources.add(Context.current.store.createEObject(yearBook))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createHolidaysYearBook(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def yearBook = ApplicationFactory.eINSTANCE.createYearBook()
            yearBook.name = name
            rs.resources.add(Context.current.store.createEObject(yearBook))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createWorkDaysYearBook(String name, String weekendYearBookName, String holidaysYearBookName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.YEAR_BOOK, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def workDaysYearBook = ApplicationFactory.eINSTANCE.createYearBook()
            workDaysYearBook.name = name

            def weekendYearBook = findEObject(ApplicationPackage.Literals.YEAR_BOOK, weekendYearBookName) as YearBook
            def holidaysYearBook = findEObject(ApplicationPackage.Literals.YEAR_BOOK, holidaysYearBookName) as YearBook

            def dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            def year = new Date().toYear().year

            def date1 = year + "-01-01";
            def date2 = year + "-12-31";
            def d1 = dateFormat.parse(date1) as java.util.Date
            def d2 = dateFormat.parse(date2) as java.util.Date

            def titleNumber = 1
            while( d1.before(d2) ){
                def day = ApplicationFactory.eINSTANCE.createDay()
                day.date = d1
                day.setTitle(titleNumber + ' рабочий день')
                if (weekendYearBook.days.size() != 0) {
                    if (!weekendYearBook.days.date.contains(d1)) {
                        if (holidaysYearBook.days.size() != 0) {
                            if (!holidaysYearBook.days.date.contains(d1)) {
                                if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                    titleNumber = 1
                                    day.setTitle(titleNumber + ' рабочий день')
                                }
                                else {
                                    titleNumber += 1
                                }
                                workDaysYearBook.days.add(day)
                            }
                        }
                        else {
                            if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                titleNumber = 1
                                day.setTitle(titleNumber + ' рабочий день')
                            }
                            else {
                                titleNumber += 1
                            }
                            workDaysYearBook.days.add(day)
                        }
                    }
                }
                else {
                    if (holidaysYearBook.days.size() != 0) {
                        if (!holidaysYearBook.days.date.contains(d1)) {
                            if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                                titleNumber = 1
                                day.setTitle(titleNumber + ' рабочий день')
                            }
                            else {
                                titleNumber += 1
                            }
                            workDaysYearBook.days.add(day)
                        }
                    }
                    else {
                        workDaysYearBook.days.add(day)
                        if (titleNumber != 1 && day.date.toMonth().ordinal() != workDaysYearBook.days[workDaysYearBook.days.size() - 1].date.toMonth().ordinal()) {
                            titleNumber = 1
                            day.setTitle(titleNumber + ' рабочий день')
                        }
                        else {
                            titleNumber += 1
                        }
                    }
                }
                d1 = addDays(d1, 1);
            }
            rs.resources.add(Context.current.store.createEObject(workDaysYearBook))
        }
        return rs.resources.get(0).contents.get(0)
    }

    private static java.util.Date addDays(java.util.Date d1, int i) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(d1);
        cal.add(java.util.Calendar.DATE, 1);
        return cal.getTime();
    }
}
