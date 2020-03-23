package ru.neoflex.nfcore.dataset.impl

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.impl.AppModuleInit
import ru.neoflex.nfcore.application.impl.ApplicationInit
import ru.neoflex.nfcore.application.impl.GradientStyleInit
import ru.neoflex.nfcore.application.impl.TypographyStyleInit
import ru.neoflex.nfcore.notification.impl.NotificationInit
import ru.neoflex.nfcore.notification.impl.NotificationInstanceInit

class DatasetPackageInit {
    private static final Logger logger = LoggerFactory.getLogger(DatasetPackageInit.class);

    {
        /*DatasetPackage*/
        JdbcDriverInit.createDriver("JdbcDriverPostgresqlTest")
        JdbcConnectionInit.createConnection("JdbcConnectionPostgresqlTest")
        JdbcConnectionInit.createConnectionLine("JdbcConnectionPostgresqlNeoflexCore")


        try {
            JdbcDatasetInit.createJdbcDatasetInit("JdbcDatasetTest", "sse_workspace","public", "JdbcConnectionPostgresqlTest")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTest")
            DatasetComponentInit.createDatasetComponent("DatasetGridTest", "JdbcDatasetTest")
            DatasetComponentInit.createAllColumn("DatasetGridTest")
            DatasetComponentInit.createServerFilters("DatasetGridTest", "JdbcDatasetTest")

            JdbcDatasetInit.createJdbcDatasetInit("JdbcDatasetTestAAA", "aaa_test", "public", "JdbcConnectionPostgresqlTest")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetTestAAA")
            DatasetComponentInit.createDatasetComponent("DatasetGridTestAAA", "JdbcDatasetTestAAA")
            DatasetComponentInit.createAllColumn("DatasetGridTestAAA")

            JdbcDatasetInit.createJdbcDatasetInit("JdbcDatasetLine","\"lineDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetLine")
            DatasetComponentInit.createDatasetComponent("DatasetGridLine", "JdbcDatasetLine")
            DatasetComponentInit.createAllColumn("DatasetGridLine")

            JdbcDatasetInit.createJdbcDatasetInit("JdbcDatasetPie","\"pieDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetPie")
            DatasetComponentInit.createDatasetComponent("DatasetGridPie", "JdbcDatasetPie")
            DatasetComponentInit.createAllColumn("DatasetGridPie")

            JdbcDatasetInit.createJdbcDatasetInit("JdbcDatasetBar","\"barDataset\"","datasets","JdbcConnectionPostgresqlNeoflexCore")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("JdbcDatasetBar")
            DatasetComponentInit.createDatasetComponent("DatasetGridBar", "JdbcDatasetBar")
            DatasetComponentInit.createAllColumn("DatasetGridBar")
        }
        catch (Throwable e) {
            logger.error("DatasetPackage", e)
        }

        /*ApplicationPackage*/
        GradientStyleInit.createGradientStyle("Neoflex")
        TypographyStyleInit.createTypographyStyle("Title")
        NotificationInstanceInit.deleteNotificationInstance("NotificationInstance1")
        NotificationInit.deleteNotification("A 1993")
        AppModuleInit.deletedAppModule("ReportSingle")
        ApplicationInit.createApplication("Обязательная отчетность")
        ApplicationInit.createApplication("Налоговая отчетность")
        ApplicationInit.createApplication("Администрирование")
        AppModuleInit.createAppModule("ReportSingle")
        NotificationInit.createNotification("A 1993")
        NotificationInstanceInit.createNotificationInstance("NotificationInstance1")
        ApplicationInit.createApplicationLine("Линейная диаграмма")
        ApplicationInit.createApplicationPie("Круговая диаграмма")
        ApplicationInit.createApplicationBar("Ступенчатая диаграмма")
    }
}
