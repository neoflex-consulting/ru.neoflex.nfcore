package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.application.impl.AppModuleInit
import ru.neoflex.nfcore.application.impl.ApplicationInit
import ru.neoflex.nfcore.application.impl.InstanceReportInit
import ru.neoflex.nfcore.application.impl.ReportInit

class DatasetPackageInit {

    {
        /*DatasetPackage*/
        JdbcDriverInit.recreateDriver("JdbcDriverPostgresqlTest")
        JdbcConnectionInit.recreateConnection("JdbcConnectionPostgresqlTest")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetTest", "sse_workspace")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTest")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridTest", "JdbcDatasetTest")
        DatasetComponentInit.createAllColumn("DatasetGridTest")
        DatasetComponentInit.createServerFilters("DatasetGridTest", "JdbcDatasetTest")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetTestAAA", "aaa_test")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTestAAA")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridTestAAA", "JdbcDatasetTestAAA")
        DatasetComponentInit.createAllColumn("DatasetGridTestAAA")

        /*ApplicationPackage*/
        InstanceReportInit.deleteInstanceReport("InstanceReport1")
        ReportInit.deleteReport("A 1993")
        AppModuleInit.deletedAppModule("ReportSingle")
        ApplicationInit.recreateApplication("ReportsApp")
        ApplicationInit.recreateApplication("ApplicationForExample")
        AppModuleInit.recreateAppModule("ReportSingle")
        ReportInit.recreateReport("A 1993")
        InstanceReportInit.recreateInstanceReport("InstanceReport1")

    }
}
