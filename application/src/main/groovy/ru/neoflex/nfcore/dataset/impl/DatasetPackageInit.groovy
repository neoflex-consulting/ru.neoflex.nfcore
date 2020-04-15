package ru.neoflex.nfcore.dataset.impl

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.impl.AppModuleInit
import ru.neoflex.nfcore.application.impl.ApplicationInit
import ru.neoflex.nfcore.application.impl.GlobalSettingsInit
import ru.neoflex.nfcore.application.impl.YearBookInit
import ru.neoflex.nfcore.application.impl.GradientStyleInit
import ru.neoflex.nfcore.application.impl.TypographyStyleInit
import ru.neoflex.nfcore.notification.Periodicity
import ru.neoflex.nfcore.notification.impl.NotificationInit
import ru.neoflex.nfcore.notification.impl.NotificationStatusInit

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

        /*NotificationPackage*/
        NotificationStatusInit.createNotificationStatus('Отчет не рассчитан','#cd5680')
        NotificationStatusInit.createNotificationStatus('Отчёт за дату проверен','#cd8056')
        NotificationStatusInit.createNotificationStatus('Отчёт не сдаётся из NR','#aaaaaa')
        NotificationStatusInit.createNotificationStatus('Расчет отчета за дату произведён','#56cd80')
        NotificationStatusInit.createNotificationStatus('Отчёт по нормативам за дату проверен','#5680cd')
        NotificationStatusInit.createNotificationStatus('Отчёт сдан в проверяющий орган','#8056CD')
        NotificationStatusInit.createNotificationStatus('Личная заметка','#ff57da')

        /*ApplicationPackage*/
        YearBookInit.createWeekendYearBook("Календарь выходных дней")
        YearBookInit.createHolidaysYearBook("Календарь праздничных дней")
        YearBookInit.createWorkDaysYearBook("Календарь рабочих дней", "Календарь выходных дней", "Календарь праздничных дней")
        GlobalSettingsInit.createGlobalSettings("Календарь рабочих дней", "Календарь выходных дней", "Календарь праздничных дней")

        GradientStyleInit.createGradientStyle("Neoflex")
        TypographyStyleInit.createTypographyStyle("Title")

        AppModuleInit.createAppModule("ReportSingle")
        NotificationInit.createNotification("A 1993", Periodicity.MONTH, "17",  "18:00", "15", "ReportSingle", "Отчет не рассчитан")

        NotificationInit.createNotification("A 1994", Periodicity.MONTH, "16",  "18:00", "15", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("A 1995", Periodicity.MONTH, "15",  "18:00", "14", "ReportSingle", "Расчет отчета за дату произведён")
        NotificationInit.createNotification("A 1996", Periodicity.MONTH, "14",  "18:00", "13", "ReportSingle", "Расчет отчета за дату произведён")

        NotificationInit.createEmptyNotification("Ф 2020", Periodicity.MONTH, "10",  "18:00", "8", "Отчёт не сдаётся из NR")
        NotificationInit.createEmptyNotification("Проверить почту", Periodicity.MONTH, "10",  "18:00", "8", "Личная заметка")
        NotificationInit.createNotification("Period.MONTH", Periodicity.MONTH, "9",  "18:00", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.DAY", Periodicity.DAY, "9",  "18:00", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.QUARTER", Periodicity.QUARTER, "9",  "18:00", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.YEAR", Periodicity.YEAR, "9",  "18:00", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")

        ApplicationInit.createApplication("Обязательная отчетность")
        ApplicationInit.createApplication("Налоговая отчетность")
        ApplicationInit.createApplication("Администрирование")
        ApplicationInit.createApplicationLine("Линейная диаграмма")
        ApplicationInit.createApplicationPie("Круговая диаграмма")
        ApplicationInit.createApplicationBar("Ступенчатая диаграмма")
    }
}
