package ru.neoflex.nfcore.dataset.impl

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.application.AppModule
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
        JdbcDriverInit.createDriver("JdbcDriverPostgresqlTest", "org.postgresql.Driver")
        JdbcConnectionInit.createConnection("JdbcConnectionPostgresqlTest", "JdbcDriverPostgresqlTest", "jdbc:postgresql://cloud.neoflex.ru:5432/teneodev", "postgres", "ne0f1ex")
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

            /*NRDEMO*/
            JdbcDriverInit.createDriver("JdbcDriverNRDemo", "oracle.jdbc.driver.OracleDriver")
            JdbcConnectionInit.createConnection("JdbcConnectionNRDemo", "JdbcDriverNRDemo", "jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=nrdemo.neoflex.ru)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl.neoflex.ru))) ", "system", "Ne0f1ex")

            /*MAIN*/
            String query =
                    "select :REPORT_DATE as on_date,\n" +
                            "       row_number,\n" +
                            "       f110_code,\n" +
                            "       amount_rub,\n" +
                            "       amount_cur,\n" +
                            "       section_number\n" +
                            "  from table(data_representation.rep_f110.GetF110Apex(\n" +
                            "         i_AppUser         => 0,\n" +
                            "         i_OnDate          => to_date('20190331','YYYYMMDD'),\n" +
                            /*"         i_OnDate          => :i_OnDate,\n" +*/
                            "         i_BranchCode      => nrsettings.settings_tools.getParamChrValue('HEAD_OFFICE_BRANCH_CODE'),\n" +
                            "         i_ReportPrecision => :REPORT_PRECISION,\n" +
                            "         i_SpodDate        => null\n" +
                            "       ))\n"
            String querySection1 = query + " where section_number = 1"
            String querySection2 = query + " where section_number = 2"
            String querySection3 = query + " where section_number = 3"
            String querySection4 = query + " where section_number = 4"

            JdbcDatasetInit.createJdbcDatasetQueryInit("jdbcNRDemoSection1","dm_f110_aggregated_f","dma",querySection1,"JdbcConnectionNRDemo")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("jdbcNRDemoSection1")
            DatasetComponentInit.createDatasetComponent("DatasetNRDemoSection1", "jdbcNRDemoSection1")
            DatasetComponentInit.createAllColumnNRDemoMain("DatasetNRDemoSection1")

            JdbcDatasetInit.createJdbcDatasetQueryInit("jdbcNRDemoSection2","dm_f110_aggregated_f","dma",querySection2,"JdbcConnectionNRDemo")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("jdbcNRDemoSection2")
            DatasetComponentInit.createDatasetComponent("DatasetNRDemoSection2", "jdbcNRDemoSection2")
            DatasetComponentInit.createAllColumnNRDemoMain("DatasetNRDemoSection2")

            JdbcDatasetInit.createJdbcDatasetQueryInit("jdbcNRDemoSection3","dm_f110_aggregated_f","dma",querySection3,"JdbcConnectionNRDemo")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("jdbcNRDemoSection3")
            DatasetComponentInit.createDatasetComponent("DatasetNRDemoSection3", "jdbcNRDemoSection3")
            DatasetComponentInit.createAllColumnNRDemoMain("DatasetNRDemoSection3")

            JdbcDatasetInit.createJdbcDatasetQueryInit("jdbcNRDemoSection4","dm_f110_aggregated_f","dma",querySection4,"JdbcConnectionNRDemo")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("jdbcNRDemoSection4")
            DatasetComponentInit.createDatasetComponent("DatasetNRDemoSection4", "jdbcNRDemoSection4")
            DatasetComponentInit.createAllColumnNRDemoMain("DatasetNRDemoSection4")

            /*DETAIL*/
            //TODO получать список столбцов по запросу а не по таблице
            String detailQuery = "select section_number,\n" +
                    "       row_number,\n" +
                    "       f110_code,\n" +
                    "       account_number,\n" +
                    "       f102_symbol,\n" +
                    "       amount_rub,\n" +
                    //"       amount_cur,\n" +
                    "       account_name,\n" +
                    "       account_amount_rub,\n" +
                    "       option_premium_amount,\n" +
                    "       customer_name,\n" +
                    "       party_type,\n" +
                    //"       customer_role_name,\n" +
                    "       is_co,\n" +
                    "       is_resident,\n" +
                    //"       legal_career_type_name,\n" +
                    //"       agreement_type_name,\n" +
                    "       agreement_number,\n" +
                    //"       account_link_type_name,\n" +
                    "       active_reserve_type\n" +
                    "  from table(data_representation.rep_f110_detail.GetF110DetailApex(\n" +
                    "         i_AppUser         => 0,\n" +
                    "         i_OnDate          => to_date('20190401','YYYYMMDD'),\n" +
                    "         i_BranchCode      => '000001',\n" +
                    "         i_SectionNumber   => null,\n" +
                    "         i_F110Code        => null\n" +
                    "       ))"

            JdbcDatasetInit.createJdbcDatasetQueryInit("jdbcNRDemoDetail","dm_f110_detail_f","dma",detailQuery,"JdbcConnectionNRDemo")
            JdbcDatasetInit.loadAllColumnsJdbcDatasetInit("jdbcNRDemoDetail")
            DatasetComponentInit.createDatasetComponent("DatasetNRDemoDetail", "jdbcNRDemoDetail")
            //TODO настраивать ширину столбцов в момент создания
            DatasetComponentInit.createAllColumnNRDemoDetail("DatasetNRDemoDetail")
            DatasetComponentInit.createServerFiltersNRDemoDetail("DatasetNRDemoDetail", "")

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
        NotificationInit.createNotification("A 1993", Periodicity.MONTH, "17",  "18", "15", "ReportSingle", "Отчет не рассчитан")

        NotificationInit.createNotification("A 1994", Periodicity.MONTH, "16",  "18", "15", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("A 1995", Periodicity.MONTH, "15",  "18", "14", "ReportSingle", "Расчет отчета за дату произведён")
        NotificationInit.createNotification("A 1996", Periodicity.MONTH, "14",  "18", "13", "ReportSingle", "Расчет отчета за дату произведён")

        NotificationInit.createEmptyNotification("Ф 2020", Periodicity.MONTH, "10",  "18", "8", "Отчёт не сдаётся из NR")
        NotificationInit.createEmptyNotification("Проверить почту", Periodicity.MONTH, "10",  "18", "8", "Личная заметка")
        NotificationInit.createNotification("Period.MONTH", Periodicity.MONTH, "9",  "18", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.DAY", Periodicity.DAY, "9",  "18", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.QUARTER", Periodicity.QUARTER, "9",  "18", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")
        NotificationInit.createNotification("Period.YEAR", Periodicity.YEAR, "9",  "18", "7", "ReportSingle", "Отчёт сдан в проверяющий орган")

        /*NRdemo*/
        //TODO отсутствуют листы занчений (желатьльно динамические)
        def nrDemoSection1 = AppModuleInit.createAppModuleNRDemoMain("F110_Section1","Раздел I. Расшифровки, используемые для формирования бухгалтерского баланса (публикуемая форма)", "jdbcNRDemoSection1", "DatasetNRDemoSection1")
        def nrDemoSection2 = AppModuleInit.createAppModuleNRDemoMain("F110_Section2", "Раздел II. Расшифровки, используемые для формирования отчета о финансовых результатах (публикуемая форма)", "jdbcNRDemoSection2", "DatasetNRDemoSection2")
        def nrDemoSection3 = AppModuleInit.createAppModuleNRDemoMain("F110_Section3", "Раздел III. Расшифровки для расчета показателей, используемых для оценки финансовой устойчивости кредитных организаций", "jdbcNRDemoSection3", "DatasetNRDemoSection3")
        def nrDemoSection4 = AppModuleInit.createAppModuleNRDemoMain("F110_Section4", "Раздел IV. Расшифровки, используемые при расчете денежно-кредитных показателей", "jdbcNRDemoSection4", "DatasetNRDemoSection4")

        def nrDemoDetail = AppModuleInit.createAppModuleNRDemoMain("F110_Detail", "Расшифровочный отчет", "jdbcNRDemoDetail", "DatasetNRDemoDetail")

        NotificationInit.createNotification("Ф110", Periodicity.MONTH, "15", "17", "15", "F110_Section1", "Отчет не рассчитан")

        try {
        ApplicationInit.createApplication("Обязательная отчетность")
        ApplicationInit.createApplication("Налоговая отчетность")
        ApplicationInit.createApplication("Администрирование")
        ApplicationInit.createApplicationLine("Линейная диаграмма")
        ApplicationInit.createApplicationPie("Круговая диаграмма")
        ApplicationInit.createApplicationBar("Ступенчатая диаграмма")
        }
        catch (Throwable e) {
            logger.error("Application was not created", e)
        }


        //TODO после первой пересборик ошибки, добавить проверку
        def referenceTree1 = AppModuleInit.makeRefTreeNRDemo()
        AppModuleInit.assignRefTreeNRDemo(nrDemoSection1 as AppModule, "F110_Section1", referenceTree1)
        //TODO при создании ссылки на втором appModule приложение виснет
        /*def referenceTree2 = AppModuleInit.makeRefTreeNRDemo()
        AppModuleInit.assignRefTreeNRDemo(nrDemoSection2 as AppModule, "F110_Section2", referenceTree2)*/
    }
}
