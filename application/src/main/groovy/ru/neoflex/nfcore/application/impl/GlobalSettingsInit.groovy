package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.utils.Utils

class GlobalSettingsInit {

    static def createGlobalSettings(String workDaysYearBookName, String weekendYearBookName, String holidaysYearBookName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.GLOBAL_SETTINGS)
                .execute().resourceSet
        if (rs.resources.empty) {
            def globalSettings = ApplicationFactory.eINSTANCE.createGlobalSettings()

            def weekendYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, weekendYearBookName) as YearBook
            def holidaysYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, holidaysYearBookName) as YearBook
            def workDaysYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, workDaysYearBookName) as YearBook

            globalSettings.setWeekendCalendar(weekendYearBook)
            globalSettings.setHolidayCalendar(holidaysYearBook)
            globalSettings.setWorkingDaysCalendar(workDaysYearBook)

            rs.resources.add(Context.current.store.createEObject(globalSettings))
        }
        return rs.resources.get(0).contents.get(0)
    }
}
