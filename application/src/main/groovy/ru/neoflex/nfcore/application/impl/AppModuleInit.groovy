package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.CatalogNode
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetPackage

//ClassComponent.AClass = rs.getEObject(URI.createURI(uri), true)

class AppModuleInit {
    static def findOrCreateEObject(EClass eClass, String name, String componentClassName, boolean replace = false) {
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

            def datasetGridView1 = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGridView1.name = 'DatasetGridTest'
            datasetGridView1.setDatasetView(datasetView1)

            row1.children.add(datasetView1)
            row2.children.add(datasetGridView1)
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

            def datasetGridView2 = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGridView2.name = 'DatasetGridTestAAA'
            datasetGridView2.setDatasetView(datasetView2)

            row3.children.add(datasetView2)
            row4.children.add(datasetGridView2)
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

            def datePicker = ApplicationFactory.eINSTANCE.createDatePicker()
            datePicker.name = 'REPORT_DATE'
            datePicker.allowClear = false
            datePicker.disabled = false
            datePicker.format = "YYYY-MM-DD"
            datePicker.width = 200

            row2.children.add(datePicker)

            def row3 = ApplicationFactory.eINSTANCE.createRow()
            row3.name = "row3"

            def datasetSelect = ApplicationFactory.eINSTANCE.createSelect()
            datasetSelect.name = 'REPORT_PRECISION' //Название совпадает с тем что мы передаем в качестве параметра в запрос
            datasetSelect.value = 1000 //Пока только по default значению
            datasetSelect.staticValues = "Округленная\\:1000\\;Точная\\:1"

            row3.children.add(datasetSelect)

            def row4 = ApplicationFactory.eINSTANCE.createRow()
            row4.name = "row4"

            def button = ApplicationFactory.eINSTANCE.createButton()
            button.name = "InputButton"
            button.buttonSubmit = true

            def row5 = ApplicationFactory.eINSTANCE.createRow()
            row5.name = "row5"

            def htmlContent = ApplicationFactory.eINSTANCE.createHtmlContent()
            htmlContent.name = "futureDynamicContent"
            htmlContent.htmlContent = "<span style=\"font-size:1.6rem;white-space:nowrap;\"><img src=\"/images/Success-icon.png\" width=\"30\" height=\"22\"> Ошибки ПККД отсутствуют.</span>"

            row5.children.add(htmlContent)

            def row6 = ApplicationFactory.eINSTANCE.createRow()
            row6.name = "row6"

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "SectionDatasetView"
            def jdbcDataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, jdbcDatasetName/*"jdbcNRDemoSection1"*/, "",false)
            datasetView.setDataset(jdbcDataset)
            def datasetComponent=  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, datasetComponentName/*"DatasetNRDemoSection1"*/, "",false)
            datasetView.setDatasetComponent(datasetComponent)
            datasetView.itemsToSubmit.add(datasetSelect)
            datasetView.itemsToSubmit.add(datePicker)

            button.itemsToReceiveSubmit.add(datasetView)
            row4.children.add(button)

            row6.children.add(datasetView)

            def row7 = ApplicationFactory.eINSTANCE.createRow()
            row7.name = "row7"

            def datasetGrid = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGrid.name = "SectionGrid"
            datasetGrid.setDatasetView(datasetView)
            row7.children.add(datasetGrid)


            form.children.add(row1)
            form.children.add(row2)
            form.children.add(row3)
            form.children.add(row4)
            form.children.add(row5)
            form.children.add(row6)
            form.children.add(row7)
            application.setView(form)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def makeRefTreeNRDemo() {
        def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
        referenceTree.name = "F110_REF_TREE"
        def appModule1 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section1", "",false) as AppModule
        def appModule2 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section2", "",false) as AppModule
        def appModule3 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section3", "",false) as AppModule
        def appModule4 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Section4", "",false) as AppModule
        def appModule5 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "F110_Detail", "",false) as AppModule



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
        //appModuleNode6.appModule = appModule6
        def appModuleNode7 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode7.name = "Счета для включения или исключения"
        //appModuleNode7.appModule = appModule7

        def appModuleNode8 = ApplicationFactory.eINSTANCE.createAppModuleNode()
        appModuleNode8.name = "Запуск расчёта"
        //appModuleNode8.appModule = appModule8

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
        //appModuleNode14.appModule = appModule14

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
