package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.*
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import java.util.Calendar;

import java.text.SimpleDateFormat

class DaysOnTheCalendarInit {
    def findOrCreateEObject(EClass eClass, String name, String componentClassName, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        if (resources.resources.empty) {
            def eObject = EcoreUtil.create(eClass)
            eObject.eSet(eClass.getEStructuralFeature("name"), name)
            if (componentClassName != "") {eObject.eSet(eClass.getEStructuralFeature("componentClassName"), componentClassName)}
            resources.resources.add(Context.current.store.createEObject(eObject))
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def createDaysOnTheCalendar(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.DAYS_ON_THE_CALENDAR, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def calendar = ApplicationFactory.eINSTANCE.createDaysOnTheCalendar()
            calendar.name = name

            def myFormat = new SimpleDateFormat("yyyy-MM-dd");
            def date1 = "2020-01-01";
            def date2 = "2020-12-31";
            def d1 = myFormat.parse(date1) as Date
            def d2 = myFormat.parse(date2) as Date
            while( d1.before(d2) ){
                if (d1.toDayOfWeek().ordinal() != 5 && d1.toDayOfWeek().ordinal() != 6) {
                    def day = ApplicationFactory.eINSTANCE.createDay()
                    day.name = myFormat.format(d1)
                    calendar.days.add(day)
                }
                d1 = addDays(d1, 1);
            }
            rs.resources.add(Context.current.store.createEObject(calendar))
        }
        return rs.resources.get(0).contents.get(0)
    }
    private static Date addDays(Date d1, int i) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(d1);
        cal.add(Calendar.DATE, 1);
        return cal.getTime();
    }

    private static boolean isSaturdayOrSunday(Calendar gc) {
        return (gc.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY || gc.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY);
    }

}
