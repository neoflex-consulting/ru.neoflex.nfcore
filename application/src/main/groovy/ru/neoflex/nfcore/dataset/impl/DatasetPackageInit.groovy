package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.application.impl.AppModuleInit

class DatasetPackageInit {

    {
        /*DatasetPackage*/
        JdbcDriverInit.recreateDriver("JdbcDriverPostgresqlTest")
        JdbcConnectionInit.recreateConnection("JdbcConnectionPostgresqlTest")
        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetTest")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTest")
        DatasetGridInit.recreateDatasetGrid("DatasetGridTest")
        DatasetGridInit.createAllColumn("DatasetGridTest")
        DatasetGridInit.createServerFilters("DatasetGridTest")

        /*ApplicationPackage*/
        AppModuleInit.deletedAppModule("ReportSingle")
        AppModuleInit.recreateApplication("ReportsApp")
        AppModuleInit.recreateApplication("ApplicationForExample")
        AppModuleInit.recreateAppModule2("ReportSingle")
        AppModuleInit.recreateInstanceReport("InstanceReport1")

    }
}
