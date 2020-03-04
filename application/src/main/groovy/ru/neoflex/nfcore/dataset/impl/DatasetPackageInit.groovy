package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.application.impl.AppModuleInit
import ru.neoflex.nfcore.application.impl.ApplicationInit
import ru.neoflex.nfcore.application.impl.GradientStyleInit
import ru.neoflex.nfcore.application.impl.InstanceReportInit
import ru.neoflex.nfcore.application.impl.ReportInit
import ru.neoflex.nfcore.application.impl.TypographyStyleInit

class DatasetPackageInit {

    {
        /*DatasetPackage*/
        JdbcDriverInit.recreateDriver("JdbcDriverPostgresqlTest")
        JdbcConnectionInit.recreateConnection("JdbcConnectionPostgresqlTest")
        JdbcConnectionInit.recreateConnectionLine("JdbcConnectionPostgresqlNeoflexCore")


        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetTest", "sse_workspace","public", "JdbcConnectionPostgresqlTest")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTest")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridTest", "JdbcDatasetTest")
        DatasetComponentInit.createAllColumn("DatasetGridTest")
        DatasetComponentInit.createServerFilters("DatasetGridTest", "JdbcDatasetTest")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetTestAAA", "aaa_test", "public", "JdbcConnectionPostgresqlTest")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTestAAA")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridTestAAA", "JdbcDatasetTestAAA")
        DatasetComponentInit.createAllColumn("DatasetGridTestAAA")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetLine","\"lineDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetLine")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridLine", "JdbcDatasetLine")
        DatasetComponentInit.createAllColumn("DatasetGridLine")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetPie","\"pieDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetPie")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridPie", "JdbcDatasetPie")
        DatasetComponentInit.createAllColumn("DatasetGridPie")

        JdbcDatasetInit.recreateJdbcDatasetInit("JdbcDatasetBar","\"barDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
        JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetBar")
        DatasetComponentInit.recreateDatasetComponent("DatasetGridBar", "JdbcDatasetBar")
        DatasetComponentInit.createAllColumn("DatasetGridBar")

        /*ApplicationPackage*/
        GradientStyleInit.createGradientStyle("Neoflex")
        TypographyStyleInit.createTypographyStyle("Title")
        InstanceReportInit.deleteInstanceReport("InstanceReport1")
        ReportInit.deleteReport("A 1993")
        AppModuleInit.deletedAppModule("ReportSingle")
        ApplicationInit.recreateApplication("Обязательная отчетность")
        ApplicationInit.recreateApplication("Налоговая отчетность")
        ApplicationInit.recreateApplication("Администрирование")
        AppModuleInit.recreateAppModule("ReportSingle")
        ReportInit.recreateReport("A 1993")
        InstanceReportInit.recreateInstanceReport("InstanceReport1")
        ApplicationInit.recreateApplicationLine("Линейная диаграмма")
        ApplicationInit.recreateApplicationPie("Круговая диаграмма")
        ApplicationInit.recreateApplicationBar("Ступенчатая диаграмма")
    }
}
