package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.*
import ru.neoflex.nfcore.base.components.SpringContext
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.masterdata.EntityType
import ru.neoflex.nfcore.masterdata.EnumType
import ru.neoflex.nfcore.masterdata.MasterdataPackage
import ru.neoflex.nfcore.masterdata.services.MasterdataProvider

import java.util.function.Consumer

//ClassComponent.AClass = rs.getEObject(URI.createURI(uri), true)

class AppModuleInit {
    static def createEObject(EClass eClass, Map<String, Object> attrs) {
        def eObject = EcoreUtil.create(eClass)
        attrs.each {entry->eObject.eSet(eClass.getEStructuralFeature(entry.key), entry.value)}
        return eObject
    }

    static def findOrCreateEObject(EClass eClass, String name, String componentClassName, boolean replace = false, Consumer<EObject> consumer=null) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                    .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        if (resources.resources.empty) {
            def eObject = createEObject(eClass, ["name": name])
            if (componentClassName != "") {eObject.eSet(eClass.getEStructuralFeature("componentClassName"), componentClassName)}
            if (consumer != null) {
                consumer.accept(eObject)
            }
            resources.resources.add(Context.current.store.createEObject(eObject))
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def deletedAppModule(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }

    static def createAppModule(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {

            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Pivot", "DatasetPivot",true)

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def tabs = ApplicationFactory.eINSTANCE.createTabsViewReport()
            tabs.name = 'View Report'

            def componentElement4 = ApplicationFactory.eINSTANCE.createForm()
            componentElement4.name = "Two Grids With Different Datasets"

            def row1 = ApplicationFactory.eINSTANCE.createRow()
            row1.name = 'row1'
            row1.textAlign = TextAlign.LEFT
            row1.marginTop = "20px"
            row1.marginLeft = "20px"
            row1.marginBottom = "20px"

            def datasetView1 = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView1.name = "DatasetViewTest_1"
            def jdbcDataset1 = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetTest", "",false)
            datasetView1.setDataset(jdbcDataset1)
            def datasetComponent1 = findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, "DatasetGridTest", "",false)
            datasetView1.setDatasetComponent(datasetComponent1)

            def row2 = ApplicationFactory.eINSTANCE.createRow()
            row2.name = 'row2'
            row2.textAlign = TextAlign.LEFT
            row2.marginLeft = "20px"
            row2.marginBottom = "20px"
            row2.marginRight = "20px"

            row1.children.add(datasetView1)
            componentElement4.children.add(row1)
            componentElement4.children.add(row2)

            def row3 = ApplicationFactory.eINSTANCE.createRow()
            row3.name = 'row3'
            row3.textAlign = TextAlign.LEFT
            row3.marginLeft = "20px"
            row3.marginBottom = "20px"

            def datasetView2 = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView2.name = "DatasetViewTest_2"
            def jdbcDataset2 = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetTestAAA", "",false)
            datasetView2.setDataset(jdbcDataset2)
            def datasetComponent2 = findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, "DatasetGridTestAAA", "",false)
            datasetView2.setDatasetComponent(datasetComponent2)

            def row4 = ApplicationFactory.eINSTANCE.createRow()
            row4.name = 'row4'
            row4.textAlign = TextAlign.LEFT
            row4.marginLeft = "20px"
            row4.marginBottom = "20px"
            row4.marginRight = "20px"

            row3.children.add(datasetView2)
            componentElement4.children.add(row3)
            componentElement4.children.add(row4)

            def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement1.name = 'Pivot'
            componentElement1.setComponent(userComponent1)
            tabs.children.add(componentElement1)
            tabs.children.add(componentElement4)
            application.view = tabs

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            referenceTree.name = "CatalogNode1"
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createAppModuleNRDemoMain(String name, String header, String jdbcDatasetName, String datasetComponentName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def form = ApplicationFactory.eINSTANCE.createForm()
            form.name = "SectionForm"

            def typography = ApplicationFactory.eINSTANCE.createTypography()
            typography.name = header //"Раздел I. Расшифровки, используемые для формирования бухгалтерского баланса (публикуемая форма)"

            def typographyStyle = findOrCreateEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title", "",false)
            typography.setTypographyStyle(typographyStyle)

            def row1 = ApplicationFactory.eINSTANCE.createRow()
            row1.name = "row1"
            row1.textAlign = TextAlign.LEFT
            row1.borderBottom = true

            row1.children.add(typography)

            def row2 = ApplicationFactory.eINSTANCE.createRow()
            row2.name = "row2"

            def col21 = ApplicationFactory.eINSTANCE.createColumn()
            col21.name = "col21"
            col21.span = 2

            def col22 = ApplicationFactory.eINSTANCE.createColumn()
            col22.name = "col22"
            col22.span = 2

            def typography22 = ApplicationFactory.eINSTANCE.createTypography()
            typography22.name = "Отчётная дата (на)"
            col22.children.add(typography22)

            def col23 = ApplicationFactory.eINSTANCE.createColumn()
            col23.name = "col23"
            col23.span = 2

            def datePicker = ApplicationFactory.eINSTANCE.createDatePicker()
            datePicker.name = 'REPORT_DATE'
            datePicker.allowClear = false
            datePicker.disabled = false
            datePicker.format = "YYYY-MM-DD"
            datePicker.width = 200

            col23.children.add(datePicker)

            row2.children.add(col21)
            row2.children.add(col22)
            row2.children.add(col23)

            def row3 = ApplicationFactory.eINSTANCE.createRow()
            row3.name = "row3"

            def col31 = ApplicationFactory.eINSTANCE.createColumn()
            col31.name = "col31"
            col31.span = 2

            def col32 = ApplicationFactory.eINSTANCE.createColumn()
            col32.name = "col32"
            col32.span = 2

            def typography32 = ApplicationFactory.eINSTANCE.createTypography()
            typography32.name = "Точность"
            col32.children.add(typography32)

            def col33 = ApplicationFactory.eINSTANCE.createColumn()
            col33.name = "col33"
            col33.span = 2

            def datasetSelect = ApplicationFactory.eINSTANCE.createSelect()
            datasetSelect.name = 'REPORT_PRECISION' //Название совпадает с тем что мы передаем в качестве параметра в запрос
            datasetSelect.value = 1000 //Пока только по default значению
            datasetSelect.staticValues = "Округленная\\:1000\\;Точная\\:1"

            col33.children.add(datasetSelect)

            row3.children.add(col31)
            row3.children.add(col32)
            row3.children.add(col33)

            def row4 = ApplicationFactory.eINSTANCE.createRow()
            row4.name = "row4"

            def col41 = ApplicationFactory.eINSTANCE.createColumn()
            col41.name = "col41"
            col41.span = 2

            def col42 = ApplicationFactory.eINSTANCE.createColumn()
            col42.name = "col42"
            col42.span = 2

            def button = ApplicationFactory.eINSTANCE.createButton()
            button.name = "InputButton"
            button.buttonSubmit = true

            col42.children.add(button)

            row4.children.add(col41)
            row4.children.add(col42)

            def row5 = ApplicationFactory.eINSTANCE.createRow()
            row5.name = "row5"

            def htmlContent = ApplicationFactory.eINSTANCE.createHtmlContent()
            htmlContent.name = "futureDynamicContent"
            htmlContent.htmlContent = "<span style=\"font-size:1.6rem;white-space:nowrap;\">:GROOVY_JSON_HOLDER</span>"
            //htmlContent.valueItems

            def valueHolder = ApplicationFactory.eINSTANCE.createValueHolder()
            valueHolder.name = "GROOVY_JSON_HOLDER"
            valueHolder.groovyCommandResultColumnName = "APEXDQCMESSAGE"

            def groovyCommand = ApplicationFactory.eINSTANCE.createGroovyCommand()
            groovyCommand.name = "CHECK_DQC"
            groovyCommand.executeOnStartup = true
            groovyCommand.valueItems.add(datePicker)
            groovyCommand.command = "import ru.neoflex.nfcore.base.services.Context\n" +
                    "import ru.neoflex.nfcore.base.util.DocFinder\n" +
                    "import ru.neoflex.nfcore.dataset.DatasetPackage\n" +
                    "import ru.neoflex.nfcore.dataset.JdbcConnection\n" +
                    "\n" +
                    "def jc = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: 'JdbcConnectionNRDemo'])\n" +
                    "        .execute().resourceSet.resources.get(0).contents.get(0) as JdbcConnection\n" +
                    "def conn = jc.connect()\n" +
                    "try {\n" +
                    "    def st = conn.createStatement()\n" +
                    "    try {\n" +
                    "        def rs = st.executeQuery(\"\"\"select nrapp.APEX_NR_UTIL.getApexDqcMessage\n" +
                    "                (\n" +
                    "                        i_ReportId    => 11100,\n" +
                    "                        i_OnDate      => to_date(':REPORT_DATE','YYYY-MM-DD') - 1,\n" +
                    "                        i_AppId       => 11100,\n" +
                    "                        i_PageId      => 79,\n" +
                    "                        i_CallerPage  => 2,\n" +
                    "                        i_SessionId   => '',\n" +
                    "                        i_Debug       => '',\n" +
                    "                        i_PicturePath => '/images/'\n" +
                    "                ) as ApexDqcMessage\n" +
                    "                from dual\"\"\")\n" +
                    "        try {\n" +
                    "            def rowData = []\n" +
                    "            while (rs.next()) {\n" +
                    "                def map = [:]\n" +
                    "                def columnCount = rs.metaData.columnCount\n" +
                    "                for (int i = 1; i <= columnCount; ++i) {\n" +
                    "                    def object = rs.getObject(i)\n" +
                    "                    map[\"\${rs.metaData.getColumnName(i)}\"] = (object == null ? null : object.toString())\n" +
                    "                }\n" +
                    "                rowData.add(map)\n" +
                    "            }\n" +
                    "            return rowData\n" +
                    "        }\n" +
                    "        finally {\n" +
                    "            rs.close()\n" +
                    "        }\n" +
                    "    }\n" +
                    "    finally {\n" +
                    "        st.close()\n" +
                    "    }\n" +
                    "}\n" +
                    "finally {\n" +
                    "    conn.close()\n" +
                    "}";

            valueHolder.contextWriter = groovyCommand
            htmlContent.valueItems.add(valueHolder)

            row5.children.add(htmlContent)
            row5.children.add(groovyCommand)
            row5.children.add(valueHolder)

            def row6 = ApplicationFactory.eINSTANCE.createRow()
            row6.name = "row6"

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "SectionDatasetView"
            def jdbcDataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, jdbcDatasetName/*"jdbcNRDemoSection1"*/, "",false)
            datasetView.setDataset(jdbcDataset)
            def datasetComponent=  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, datasetComponentName/*"DatasetNRDemoSection1"*/, "",false)
            datasetView.setDatasetComponent(datasetComponent)
            datasetView.valueItems.add(datasetSelect)
            datasetView.valueItems.add(datePicker)

            button.submitItems.add(datasetView)

            row6.children.add(datasetView)

            form.children.add(row1)
            form.children.add(row2)
            form.children.add(row3)
            form.children.add(row4)
            form.children.add(row5)
            form.children.add(row6)
            application.setView(form)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createAppModuleNRDemoCalcMart(String name, String header, String jdbcDatasetName, String datasetComponentName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def form = ApplicationFactory.eINSTANCE.createForm()
            form.name = "CalcMartForm"

            def typography = ApplicationFactory.eINSTANCE.createTypography()
            typography.name = header //"Раздел I. Расшифровки, используемые для формирования бухгалтерского баланса (публикуемая форма)"

            def typographyStyle = findOrCreateEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title", "",false)
            typography.setTypographyStyle(typographyStyle)

            def row1 = ApplicationFactory.eINSTANCE.createRow()
            row1.name = "row1"
            row1.textAlign = TextAlign.LEFT
            row1.borderBottom = true

            row1.children.add(typography)

            def row2 = ApplicationFactory.eINSTANCE.createRow()
            row2.name = "row2"

            def col21 = ApplicationFactory.eINSTANCE.createColumn()
            col21.name = "col21"
            col21.span = 2

            def col22 = ApplicationFactory.eINSTANCE.createColumn()
            col22.name = "col22"
            col22.span = 2

            def typography22 = ApplicationFactory.eINSTANCE.createTypography()
            typography22.name = "Отчётная дата (на)"
            col22.children.add(typography22)

            def col23 = ApplicationFactory.eINSTANCE.createColumn()
            col23.name = "col23"
            col23.span = 2

            def datePicker = ApplicationFactory.eINSTANCE.createDatePicker()
            datePicker.name = 'REPORT_DATE'
            datePicker.allowClear = false
            datePicker.disabled = false
            datePicker.format = "YYYY-MM-DD"
            datePicker.width = 200

            col23.children.add(datePicker)

            row2.children.add(col21)
            row2.children.add(col22)
            row2.children.add(col23)

            def row3 = ApplicationFactory.eINSTANCE.createRow()
            row3.name = "row3"

            def col31 = ApplicationFactory.eINSTANCE.createColumn()
            col31.name = "col31"
            col31.span = 2

            def col32 = ApplicationFactory.eINSTANCE.createColumn()
            col32.name = "col32"
            col32.span = 2

            def typography32 = ApplicationFactory.eINSTANCE.createTypography()
            typography32.name = "Вид расчёта"
            col32.children.add(typography32)

            def col33 = ApplicationFactory.eINSTANCE.createColumn()
            col33.name = "col33"
            col33.span = 2

            def datasetSelect = ApplicationFactory.eINSTANCE.createSelect()
            datasetSelect.name = 'REPORT_FILL_TYPE'
            datasetSelect.value = 'DEF_F110MAIN'
            datasetSelect.staticValues = "Основной отчёт\\:DEF_F110MAIN\\;Полный отчёт\\:DEF_F110ALL"

            col33.children.add(datasetSelect)

            row3.children.add(col31)
            row3.children.add(col32)
            row3.children.add(col33)

            def row4 = ApplicationFactory.eINSTANCE.createRow()
            row4.name = "row4"

            def col41 = ApplicationFactory.eINSTANCE.createColumn()
            col41.name = "col41"
            col41.span = 2

            def button1 = ApplicationFactory.eINSTANCE.createButton()
            button1.name = "calcButton"
            button1.label = "submit"
            button1.buttonSubmit = true

            col41.children.add(button1)

            def col42 = ApplicationFactory.eINSTANCE.createColumn()
            col42.name = "col42"
            col42.span = 2

            def button2 = ApplicationFactory.eINSTANCE.createButton()
            button2.name = "RefreshButton"
            button2.label = "refresh"
            button2.buttonSubmit = true

            col42.children.add(button2)

            row4.children.add(col41)
            row4.children.add(col42)

            def row5 = ApplicationFactory.eINSTANCE.createRow()
            row5.name = "row5"

            def groovyCommand = ApplicationFactory.eINSTANCE.createGroovyCommand()
            groovyCommand.name = "groovyCommand"
            groovyCommand.command = "import ru.neoflex.nfcore.base.services.Context\n" +
                    "import ru.neoflex.nfcore.base.util.DocFinder\n" +
                    "import ru.neoflex.nfcore.dataset.DatasetPackage\n" +
                    "import ru.neoflex.nfcore.dataset.JdbcConnection\n" +
                    "\n" +
                    "def jc = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: 'JdbcConnectionNRDemo'])\n" +
                    "        .execute().resourceSet.resources.get(0).contents.get(0) as JdbcConnection\n" +
                    "def conn = jc.connect()\n" +
                    "try {\n" +
                    "    def st = conn.createStatement()\n" +
                    "    try {\n" +
                    "        st.execute(\"declare\\n\" +\n" +
                    "                \"  lv_CalcTypeCount number;\\n\" +\n" +
                    "                \"  lv_UnderwoodName nrapp.ref_calc_type.underwood_name%type;\\n\" +\n" +
                    "                \"  lv_OnDate        date := to_date(':REPORT_DATE','YYYY-MM-DD') - 1;\\n\" +\n" +
                    "                \"  lv_event_record_id number;\\n\" +\n" +
                    "                \"begin\\n\" +\n" +
                    "                \"  --\\n\" +\n" +
                    "                \"  EXECUTE IMMEDIATE 'alter session set nls_date_format=\\\"DD-MON-RR\\\"';\\n\" +\n" +
                    "                \"  --\\n\" +\n" +
                    "                \"  select count(1)\\n\" +\n" +
                    "                \"    into lv_CalcTypeCount\\n\" +\n" +
                    "                \"    from table(nrapp.apex_nr_util.GetCalcType\\n\" +\n" +
                    "                \"         (\\n\" +\n" +
                    "                \"           i_AppId => '11100',\\n\" +\n" +
                    "                \"           i_OnDate => lv_OnDate\\n\" +\n" +
                    "                \"         ));\\n\" +\n" +
                    "                \"  --\\n\" +\n" +
                    "                \"  if lv_CalcTypeCount = 1\\n\" +\n" +
                    "                \"  then\\n\" +\n" +
                    "                \"    select underwood_name\\n\" +\n" +
                    "                \"      into lv_UnderwoodName\\n\" +\n" +
                    "                \"      from table(nrapp.apex_nr_util.GetCalcType\\n\" +\n" +
                    "                \"           (\\n\" +\n" +
                    "                \"             i_AppId => '11100',\\n\" +\n" +
                    "                \"             i_OnDate => lv_OnDate\\n\" +\n" +
                    "                \"           ));\\n\" +\n" +
                    "                \"  else\\n\" +\n" +
                    "                \"    lv_UnderwoodName := ':REPORT_FILL_TYPE';\\n\" +\n" +
                    "                \"  end if;\\n\" +\n" +
                    "                \"  --\\n\" +\n" +
                    "                \"  dma.pck_support.pSetScheduleCalcNREtl\\n\" +\n" +
                    "                \"  (\\n\" +\n" +
                    "                \"    i_partition_key               => lv_UnderwoodName,\\n\" +\n" +
                    "                \"    i_is_send_mail_dds_dma        => 0,\\n\" +\n" +
                    "                \"    i_is_run_dma_dqc              => 0,\\n\" +\n" +
                    "                \"    i_is_send_mail_dma_dqc        => 0,\\n\" +\n" +
                    "                \"    i_oper_date                   => lv_OnDate,\\n\" +\n" +
                    "                \"    i_oper_date_to                => lv_OnDate,\\n\" +\n" +
                    "                \"    i_debug_mode                  => 0,\\n\" +\n" +
                    "                \"    o_event_record_id             => lv_event_record_id\\n\" +\n" +
                    "                \"  );  \\n\" +\n" +
                    "                \"end;\\n\")\n" +
                    "        return []\n" +
                    "    }\n" +
                    "    finally {\n" +
                    "        st.close()\n" +
                    "    }\n" +
                    "}\n" +
                    "finally {\n" +
                    "    conn.close()\n" +
                    "}"
            groovyCommand.valueItems.add(datePicker)
            groovyCommand.valueItems.add(datasetSelect)

            button1.submitItems.add(groovyCommand)

            row5.children.add(groovyCommand)

            def row6 = ApplicationFactory.eINSTANCE.createRow()
            row6.name = "row6"

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "SectionDatasetView"
            def jdbcDataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, jdbcDatasetName/*"jdbcNRDemoSection1"*/, "",false)
            datasetView.setDataset(jdbcDataset)
            def datasetComponent=  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, datasetComponentName/*"DatasetNRDemoSection1"*/, "",false)
            datasetView.setDatasetComponent(datasetComponent)

            button2.submitItems.add(datasetView)

            row6.children.add(datasetView)

            form.children.add(row1)
            form.children.add(row2)
            form.children.add(row3)
            form.children.add(row4)
            form.children.add(row5)
            form.children.add(row6)
            application.setView(form)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }


    static def createAppModuleNRDemoKliko(String name, String header, String jdbcDatasetName, String datasetComponentName) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def form = ApplicationFactory.eINSTANCE.createForm()
            form.name = "KlikoForm"

            def typography = ApplicationFactory.eINSTANCE.createTypography()
            typography.name = header

            def typographyStyle = findOrCreateEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title", "",false)
            typography.setTypographyStyle(typographyStyle)

            def row1 = ApplicationFactory.eINSTANCE.createRow()
            row1.name = "row1"
            row1.textAlign = TextAlign.LEFT
            row1.borderBottom = true

            row1.children.add(typography)

            def row2 = ApplicationFactory.eINSTANCE.createRow()
            row2.name = "row2"

            def col21 = ApplicationFactory.eINSTANCE.createColumn()
            col21.name = "col21"
            col21.span = 2

            def col22 = ApplicationFactory.eINSTANCE.createColumn()
            col22.name = "col22"
            col22.span = 2

            def typography22 = ApplicationFactory.eINSTANCE.createTypography()
            typography22.name = "Отчётная дата (на)"
            col22.children.add(typography22)

            def col23 = ApplicationFactory.eINSTANCE.createColumn()
            col23.name = "col23"
            col23.span = 2

            def datePicker = ApplicationFactory.eINSTANCE.createDatePicker()
            datePicker.name = 'REPORT_DATE'
            datePicker.allowClear = false
            datePicker.disabled = false
            datePicker.format = "YYYY-MM-DD"
            datePicker.width = 200

            col23.children.add(datePicker)

            row2.children.add(col21)
            row2.children.add(col22)
            row2.children.add(col23)

            def row3 = ApplicationFactory.eINSTANCE.createRow()
            row3.name = "row3"

            def col31 = ApplicationFactory.eINSTANCE.createColumn()
            col31.name = "col31"
            col31.span = 2

            def col32 = ApplicationFactory.eINSTANCE.createColumn()
            col32.name = "col32"
            col32.span = 2

            def typography32 = ApplicationFactory.eINSTANCE.createTypography()
            typography32.name = "Файл описателей"
            col32.children.add(typography32)

            def col33 = ApplicationFactory.eINSTANCE.createColumn()
            col33.name = "col33"
            col33.span = 2

            def datasetSelect = ApplicationFactory.eINSTANCE.createSelect()
            datasetSelect.name = 'REPORT_FILL_TYPE'
            datasetSelect.value = 'F110_34(Месячная)'
            datasetSelect.staticValues = "F110_34(Месячная)\\:F110_KLIKO|M|F110\\;F110_39(Месячная)\\:F110_KLIKO|M|F110" //TODO Динамические select листы

            col33.children.add(datasetSelect)

            row3.children.add(col31)
            row3.children.add(col32)
            row3.children.add(col33)

            def row4 = ApplicationFactory.eINSTANCE.createRow()
            row4.name = "row4"

            def col41 = ApplicationFactory.eINSTANCE.createColumn()
            col41.name = "col41"
            col41.span = 2

            def button1 = ApplicationFactory.eINSTANCE.createButton()
            button1.name = "calcButton"
            button1.label = "submit"
            button1.buttonSubmit = true

            col41.children.add(button1)

            def col42 = ApplicationFactory.eINSTANCE.createColumn()
            col42.name = "col42"
            col42.span = 2

            def button2 = ApplicationFactory.eINSTANCE.createButton()
            button2.name = "RefreshButton"
            button2.label = "refresh"
            button2.buttonSubmit = true

            col42.children.add(button2)

            row4.children.add(col41)
            row4.children.add(col42)

            def row5 = ApplicationFactory.eINSTANCE.createRow()
            row5.name = "row5"

            def groovyCommand = ApplicationFactory.eINSTANCE.createGroovyCommand()
            groovyCommand.name = "groovyCommand"
            groovyCommand.command = "import ru.neoflex.nfcore.base.services.Context\n" +
                    "import ru.neoflex.nfcore.base.util.DocFinder\n" +
                    "import ru.neoflex.nfcore.dataset.DatasetPackage\n" +
                    "import ru.neoflex.nfcore.dataset.JdbcConnection\n" +
                    "\n" +
                    "def jc = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: 'JdbcConnectionNRDemo'])\n" +
                    "        .execute().resourceSet.resources.get(0).contents.get(0) as JdbcConnection\n" +
                    "def conn = jc.connect()\n" +
                    "try {\n" +
                    "    def st = conn.createStatement()\n" +
                    "    try {\n" +
                    "        st.execute(\"declare\\n\" +\n" +
                    "                \"  v_list_pairs_values            varchar2(1000);\\n\" +\n" +
                    "                \"  v_file_name                    varchar2(1000);\\n\" +\n" +
                    "                \"  v_FromDate                     date;\\n\" +\n" +
                    "                \"  v_ToDate                       date := nvl(to_date(':REPORT_DATE','YYYY-MM-DD'),trunc(to_date(null,'dd.mm.yyyy'),'YYYY'))-1;\\n\" +\n" +
                    "                \"  v_SpodDate                     date := to_date(null,'dd.mm.yyyy')-1;\\n\" +\n" +
                    "                \"  v_kliko_version                varchar2(255 char) :=  substr(':REPORT_FILL_TYPE',1,instr(':REPORT_FILL_TYPE','|')-1);\\n\" +\n" +
                    "                \"  v_FormType                     varchar2(5 char) := upper(regexp_substr(':REPORT_FILL_TYPE','[^|]+', 1, 2));\\n\" +\n" +
                    "                \"  v_KLIKOPack                    varchar2(20 char) := regexp_substr(':REPORT_FILL_TYPE','[^|]+', 1, 3);\\n\" +\n" +
                    "                \"  v_BranchRK                     number := to_number(1);\\n\" +\n" +
                    "                \"  v_BranchCode                   varchar2(20 char) := nrsettings.settings_tools.getParamChrValue('HEAD_OFFICE_BRANCH_CODE');\\n\" +\n" +
                    "                \"begin\\n\" +\n" +
                    "                \"  -- Если дата (ЗА) не передана, то выход\\n\" +\n" +
                    "                \"  if v_ToDate is null\\n\" +\n" +
                    "                \"  then\\n\" +\n" +
                    "                \"    return;\\n\" +\n" +
                    "                \"  end if;\\n\" +\n" +
                    "                \"\\n\" +\n" +
                    "                \"  -- Формирование Дата (С)\\n\" +\n" +
                    "                \"  v_FromDate := case\\n\" +\n" +
                    "                \"                  when v_FormType like 'D%'\\n\" +\n" +
                    "                \"                    then trunc(v_ToDate,'DD')\\n\" +\n" +
                    "                \"                  when v_FormType like 'M%'\\n\" +\n" +
                    "                \"                    then trunc(v_ToDate,'MM')\\n\" +\n" +
                    "                \"                  when v_FormType like 'Q%'\\n\" +\n" +
                    "                \"                    then trunc(v_ToDate,'Q')\\n\" +\n" +
                    "                \"                  when v_FormType like 'H%'\\n\" +\n" +
                    "                \"                    then case when to_char(trunc(v_ToDate,'Q'),'ddmm') in ('0101','0104') then to_date('01.01.' || to_char(v_ToDate,'YYYY'),'DD.MM.YYYY') else to_date('01.07.' || to_char(v_ToDate,'YYYY'),'DD.MM.YYYY') end\\n\" +\n" +
                    "                \"                  when v_FormType like 'Y%'\\n\" +\n" +
                    "                \"                    then trunc(v_ToDate,'YYYY')\\n\" +\n" +
                    "                \"                end;\\n\" +\n" +
                    "                \"   \\n\" +\n" +
                    "                \"  if v_BranchRK is null\\n\" +\n" +
                    "                \"  then\\n\" +\n" +
                    "                \"    -- Определение филиала для однофилиального банка\\n\" +\n" +
                    "                \"    select branch_rk\\n\" +\n" +
                    "                \"      into v_BranchRK\\n\" +\n" +
                    "                \"      from dma.dm_branch_d\\n\" +\n" +
                    "                \"     where v_ToDate between data_actual_date and data_actual_end_date\\n\" +\n" +
                    "                \"       and branch_code = v_BranchCode;\\n\" +\n" +
                    "                \"  else\\n\" +\n" +
                    "                \"    begin\\n\" +\n" +
                    "                \"      select branch_code\\n\" +\n" +
                    "                \"        into v_BranchCode\\n\" +\n" +
                    "                \"        from dma.dm_branch_d\\n\" +\n" +
                    "                \"       where v_ToDate between data_actual_date and data_actual_end_date\\n\" +\n" +
                    "                \"         and branch_rk = v_BranchRK;\\n\" +\n" +
                    "                \"    exception\\n\" +\n" +
                    "                \"    when no_data_found\\n\" +\n" +
                    "                \"    then\\n\" +\n" +
                    "                \"      v_BranchCode := 'SUMMARY';\\n\" +\n" +
                    "                \"    end;\\n\" +\n" +
                    "                \"  end if;\\n\" +\n" +
                    "                \"\\n\" +\n" +
                    "                \"  select '0409110_kliko'\\n\" +\n" +
                    "                \"           || '_' || v_BranchCode\\n\" +\n" +
                    "                \"           || '_' || to_char(v_FromDate,'yyyymmdd')\\n\" +\n" +
                    "                \"           || case when not v_FromDate = v_ToDate then '_' || nvl(to_char(v_SpodDate,'yyyymmdd'),to_char(v_ToDate,'yyyymmdd')) end\\n\" +\n" +
                    "                \"           || '_' || 'F110'\\n\" +\n" +
                    "                \"           || '_' || nvl2(v_SpodDate,'S',substr(v_FormType,1,1))\\n\" +\n" +
                    "                \"           || '.txt'\\n\" +\n" +
                    "                \"    into v_file_name\\n\" +\n" +
                    "                \"    from dual;\\n\" +\n" +
                    "                \"\\n\" +\n" +
                    "                \"  v_list_pairs_values := 'I_ONDATE=>' || to_char(v_ToDate,'dd.mm.yyyy');\\n\" +\n" +
                    "                \"  v_list_pairs_values := v_list_pairs_values || ';I_BRANCH_RK=>'   || to_char(v_BranchRK);\\n\" +\n" +
                    "                \"  v_list_pairs_values := v_list_pairs_values || ';I_SPODDATE=>'    || to_char(v_SpodDate,'dd.mm.yyyy');\\n\" +\n" +
                    "                \"  v_list_pairs_values := v_list_pairs_values || ';I_FORM_TYPE=>'   || v_FormType;\\n\" +\n" +
                    "                \"\\n\" +\n" +
                    "                \"\\n\" +\n" +
                    "                \" DATA_REPRESENTATION.EXPORT_UTIL.StartJobLoadSqltoBlob\\n\" +\n" +
                    "                \"  (\\n\" +\n" +
                    "                \"    i_type_format_name             => v_kliko_version,\\n\" +\n" +
                    "                \"    i_file_name                    => v_file_name,\\n\" +\n" +
                    "                \"    i_list_pairs_values            => v_list_pairs_values,\\n\" +\n" +
                    "                \"    i_rows_in_file                 => 200000\\n\" +\n" +
                    "                \"  );\\n\" +\n" +
                    "                \"end;\")\n" +
                    "        return []\n" +
                    "    }\n" +
                    "    finally {\n" +
                    "        st.close()\n" +
                    "    }\n" +
                    "}\n" +
                    "finally {\n" +
                    "    conn.close()\n" +
                    "}"
            groovyCommand.valueItems.add(datePicker)
            groovyCommand.valueItems.add(datasetSelect)

            button1.submitItems.add(groovyCommand)

            row5.children.add(groovyCommand)

            def row6 = ApplicationFactory.eINSTANCE.createRow()
            row6.name = "row6"

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "SectionDatasetView"
            def jdbcDataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, jdbcDatasetName/*"jdbcNRDemoSection1"*/, "",false)
            datasetView.setDataset(jdbcDataset)
            def datasetComponent=  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, datasetComponentName/*"DatasetNRDemoSection1"*/, "",false)
            datasetView.setDatasetComponent(datasetComponent)

            button2.submitItems.add(datasetView)

            row6.children.add(datasetView)

            form.children.add(row1)
            form.children.add(row2)
            form.children.add(row3)
            form.children.add(row4)
            form.children.add(row5)
            form.children.add(row6)
            application.setView(form)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static initBalAccountClassifier = new Consumer<EntityType>() {
        @Override
        void accept(EntityType entityType) {
            findOrCreateEObject(MasterdataPackage.Literals.ENUM_TYPE, "YN", "", false, new Consumer<EnumType>() {
                @Override
                void accept(EnumType eObject) {
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "Да"]))
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "Нет"]))
                }
            })
            findOrCreateEObject(MasterdataPackage.Literals.ENUM_TYPE, "PartyType", "", false, new Consumer<EnumType>() {
                @Override
                void accept(EnumType eObject) {
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "ЮЛ"]))
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "ФЛ"]))
                }
            })
            findOrCreateEObject(MasterdataPackage.Literals.ENUM_TYPE, "CharType", "", false, new Consumer<EnumType>() {
                @Override
                void accept(EnumType eObject) {
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "А"]))
                    eObject.values.add(createEObject(MasterdataPackage.Literals.ENUM_VALUE, [name: "П"]))
                }
            })
            MasterdataProvider md = SpringContext.getBean(MasterdataProvider.class)
            md.createAttribute(entityType, 'section_number', "INTEGER", "Раздел отчёта")
            md.createAttribute(entityType, 'f110_code', "STRING", "Код обозначения расшифровки")
            md.createAttribute(entityType, 'is_manually_classified', "YN", "Признак того, что в расчёт кода включаются счета только через ручной классификатор")
            md.createAttribute(entityType, 'ledger_account_mask', "STRING", "Маска балансового счёта 1/2 порядка")
            md.createAttribute(entityType, 'f102_symbol_mask', "STRING", "Маска символа по форме 0409102")
            md.createAttribute(entityType, 'party_type', "PartyType", "Тип клиента, владельца счёта")
            md.createAttribute(entityType, 'customer_type_110i_id', "STRING", "Код клиента по 180-И")
            md.createAttribute(entityType, 'sign', "INTEGER", "Знак, с которым сумма по б/с входят в код")
            md.createAttribute(entityType, 'VALUATION_TYPE', "STRING", "Тип оценки актива/обязательства")
            md.createAttribute(entityType, 'AGREEMENT_TYPE_LIST', "STRING", "Тип оценки актива/обязательства")
            md.createAttribute(entityType, 'IS_SELF_EMPLOYED', "YN", "Признак: является ли клиент по счёту ИП")
            md.createAttribute(entityType, 'CHAR_TYPE', "CharType", "Характеристика счёта (А/П)")
            md.createAttribute(entityType, 'actual_date', "DATE", "Дата начала действия")
            md.createAttribute(entityType, 'actual_end_date', "DATE", "Дата окончания действия")
        }
    }

    static initBalAccountClassifierAppModule = new Consumer<AppModule>() {
        @Override
        void accept(AppModule appModule) {
            def view = EcoreUtil.create(ApplicationPackage.Literals.MASTERDATA_VIEW) as MasterdataView
            view.name = 'MasterdataView_1'
            view.entityType = findOrCreateEObject(MasterdataPackage.Literals.ENTITY_TYPE, "F110_BalAccountClassifier", "", false, initBalAccountClassifier)
            appModule.view = view
        }
    }

    static def makeRefTreeNRDemo() {
        def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
        referenceTree.name = "F110_REF_TREE"
        def appModule1 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section1", "",false) as AppModule
        def appModule2 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section2", "",false) as AppModule
        def appModule3 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section3", "",false) as AppModule
        def appModule4 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section4", "",false) as AppModule
        def appModule5 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Detail", "",false) as AppModule
        def appModule6 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_BalAccountClassifier", "",false, initBalAccountClassifierAppModule) as AppModule
        def appModule8 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_CalcMart", "",false) as AppModule
        def appModule14 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_KLIKO", "",false) as AppModule


        def catalog1 = ApplicationFactory.eINSTANCE.createCatalogNode()
        catalog1.name = "Основной отчёт"

        def appModuleNode1 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode1.name = "Раздел 1"
        appModuleNode1.appModule = appModule1
        def appModuleNode2 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode2.name = "Раздел 2"
        appModuleNode2.appModule = appModule2
        def appModuleNode3 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode3.name = "Раздел 3"
        appModuleNode3.appModule = appModule3
        def appModuleNode4 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode4.name = "Раздел 4"
        appModuleNode4.appModule = appModule4

        def appModuleNode5 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode5.name = "Расшифровочный отчёт"
        appModuleNode5.appModule = appModule5

        def catalog2 = ApplicationFactory.eINSTANCE.createCatalogNode()
        catalog2.name = "Классификаторы"

        def appModuleNode6 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode6.name = "Классификатор балансовых счетов"
        appModuleNode6.appModule = appModule6
        def appModuleNode7 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode7.name = "Счета для включения или исключения"
        //appModuleNode7.appModule = appModule7

        def appModuleNode8 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode8.name = "Запуск расчёта"
        appModuleNode8.appModule = appModule8

        def appModuleNode9 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode9.name = "Управление статусом формы"
        //appModuleNode9.appModule = appModule9

        def catalog3 = ApplicationFactory.eINSTANCE.createCatalogNode()
        catalog3.name = "Контроль качества данных"

        def appModuleNode10 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode10.name = "Проверки"
        //appModuleNode10.appModule = appModule10
        def appModuleNode11 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode11.name = "Наборы проверок"
        //appModuleNode11.appModule = appModule11
        def appModuleNode12 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode12.name = "Журнал ошибок"
        //appModuleNode12.appModule = appModule12
        def appModuleNode13 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode13.name = "История запуска наборов"
        //appModuleNode13.appModule = appModule13

        def catalog4 = ApplicationFactory.eINSTANCE.createCatalogNode()
        catalog4.name = "Выгрузка"

        def appModuleNode14 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode14.name = "KLIKO"
        appModuleNode14.appModule = appModule14

        catalog1.children.add(appModuleNode1)
        catalog1.children.add(appModuleNode2)
        catalog1.children.add(appModuleNode3)
        catalog1.children.add(appModuleNode4)
        referenceTree.children.add(catalog1)
        referenceTree.children.add(appModuleNode5)
        catalog2.children.add(appModuleNode6)
        catalog2.children.add(appModuleNode7)
        referenceTree.children.add(catalog2)
        referenceTree.children.add(appModuleNode8)
        referenceTree.children.add(appModuleNode9)
        catalog3.children.add(appModuleNode10)
        catalog3.children.add(appModuleNode11)
        catalog3.children.add(appModuleNode12)
        catalog3.children.add(appModuleNode13)
        referenceTree.children.add(catalog3)
        catalog4.children.add(appModuleNode14)
        referenceTree.children.add(catalog4)

        return referenceTree
    }

    static def assignRefTreeNRDemo(AppModule appModule, String name, CatalogNode referenceTree) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        if (!rs.resources.empty && !appModule.referenceTree) {
            def appModuleRef = Context.current.store.getRef(rs.resources.get(0))

            appModule.setReferenceTree(referenceTree)

            Context.current.store.updateEObject(appModuleRef, appModule)
        }
    }
}


