package ru.neoflex.nfcore.application.impl


import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.YearBook
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.utils.Utils

class GlobalSettingsInit {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationPackage.class);

    static def createGlobalSettings(String workDaysYearBookName, String weekendYearBookName, String holidaysYearBookName, String dashboardName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.GLOBAL_SETTINGS)
                .execute().resourceSet
        if (rs.resources.empty) {
            def globalSettings = ApplicationFactory.eINSTANCE.createGlobalSettings()

            def weekendYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, weekendYearBookName) as YearBook
            def holidaysYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, holidaysYearBookName) as YearBook
            def workDaysYearBook = Utils.findEObject(ApplicationPackage.Literals.YEAR_BOOK, workDaysYearBookName) as YearBook

            try {
                def dashboard = Utils.findEObject(ApplicationPackage.Literals.APP_MODULE, dashboardName) as AppModule
                globalSettings.setDashboard(dashboard)
            } catch (Throwable e) {
                logger.error("Application Dashboard not found", e)
            }

            globalSettings.setWeekendCalendar(weekendYearBook)
            globalSettings.setHolidayCalendar(holidaysYearBook)
            globalSettings.setWorkingDaysCalendar(workDaysYearBook)


            rs.resources.add(Context.current.store.createEObject(globalSettings))
        }
        return rs.resources.get(0).contents.get(0)
    }
}
