package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.IconName
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.application.AxisXPositionType
import ru.neoflex.nfcore.application.AxisYPositionType
import ru.neoflex.nfcore.application.DiagramType
import ru.neoflex.nfcore.application.LegendAnchorPositionType
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetColumn
import ru.neoflex.nfcore.dataset.DatasetPackage

class ApplicationInit {
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

    static def recreateApplication(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createApplication()

            if (name == "Налоговая отчетность") {
                application.name = name
                application.iconName = IconName.FA_EYE

                def userComponent5 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Page Not Found", "PageNotFound",false)

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Page Not Found'
                componentElement1.setComponent(userComponent5)
                application.view = componentElement1
            }
            else if (name == "Администрирование") {
                application.name = name
                application.iconName = IconName.FA_COGS
                def row = ApplicationFactory.eINSTANCE.createRow()
                row.name = "row1"
                row.textAlign = TextAlign.LEFT
                row.borderBottom = true
                row.height = '80px'

                def column = ApplicationFactory.eINSTANCE.createColumn()
                column.name = "column1"
                column.span = "9"

                def typography = ApplicationFactory.eINSTANCE.createTypography()
                typography.name = "Администрирование системы"

                def typographyStyle = findOrCreateEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title", "",false)
                typography.setTypographyStyle(typographyStyle)

                column.children.add(typography)
                row.children.add(column)
                application.setView(row)

                def catalogNode1 = ApplicationFactory.eINSTANCE.createCatalogNode()
                catalogNode1.name = "CatalogNodeAdmin"

                def catalogNode2 = ApplicationFactory.eINSTANCE.createCatalogNode()
                catalogNode2.name = "Журналы"
                def viewNode1 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode1.name = 'Журнал активности пользователей'
               def viewNode2 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode2.name = 'Журнал обновлений системы'
               def viewNode3 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode3.name = 'Журнал попыток входа в систему'
               def viewNode4 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode4.name = 'Журнал изменения статуса отчета'
               def viewNode5 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode5.name = 'Журнал изменения данных'
               def viewNode6 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode6.name = 'Журнал загрузки данных из СПУР'
               catalogNode2.children.add(viewNode1)
               catalogNode2.children.add(viewNode2)
               catalogNode2.children.add(viewNode3)
               catalogNode2.children.add(viewNode4)
               catalogNode2.children.add(viewNode5)
               catalogNode2.children.add(viewNode6)

               def catalogNode3 = ApplicationFactory.eINSTANCE.createCatalogNode()
               catalogNode3.name = "Права доступа"
               def viewNode7 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode7.name = 'Пользователи'
               def viewNode8 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode8.name = 'Группы'
               def viewNode9 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode9.name = 'Роли'
               catalogNode3.children.add(viewNode7)
               catalogNode3.children.add(viewNode8)
               catalogNode3.children.add(viewNode9)

               def catalogNode4 = ApplicationFactory.eINSTANCE.createCatalogNode()
               catalogNode4.name = "Установка поставки"
               def viewNode10 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode10.name = 'Выбор поставки'
               catalogNode4.children.add(viewNode10)

               catalogNode1.children.add(catalogNode2)
               catalogNode1.children.add(catalogNode3)
               catalogNode1.children.add(catalogNode4)

               application.setReferenceTree(catalogNode1)
           }
            else {
                def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReporting",false)
                def userComponent6 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Tax Reporting", "TaxReporting",false)

                application.name = name

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Mandatory Reporting'
                componentElement1.setComponent(userComponent1)
                application.view = componentElement1
            }

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateApplicationLine(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createApplication()
            application.name = name
            def lineFrom = ApplicationFactory.eINSTANCE.createForm()
            lineFrom.name = "LineForm"
            def datasetViewRow = ApplicationFactory.eINSTANCE.createRow()
            datasetViewRow.name = "DatasetViewRow"
            datasetViewRow.textAlign = TextAlign.LEFT
            datasetViewRow.marginTop = "20px"
            datasetViewRow.marginLeft = "20px"
            datasetViewRow.marginBottom = "20px"

            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "DatasetGridRow"
            datasetGridRow.textAlign = TextAlign.LEFT
            datasetGridRow.marginTop = "20px"
            datasetGridRow.marginLeft = "20px"
            datasetGridRow.marginBottom = "20px"
            def lineDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            lineDiagramRow.name = "LineDiagramRow"
            lineDiagramRow.marginTop = "20px"
            lineDiagramRow.marginLeft = "20px"
            lineDiagramRow.marginBottom = "20px"
            lineFrom.children.add(datasetViewRow)
            lineFrom.children.add(datasetGridRow)
            lineFrom.children.add(lineDiagramRow)

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "DatasetView"
            def jdbcDatasetLine = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetLine", "",false)
            datasetView.setDataset(jdbcDatasetLine)
            def datasetGridLine =  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, "DatasetGridLine", "",false)
            datasetView.setDatasetComponent(datasetGridLine)
            datasetViewRow.children.add(datasetView)

            def datasetGrid = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGrid.name = "DatasetGrid"
            datasetGrid.setDatasetView(datasetView)
            datasetGridRow.children.add(datasetGrid)

            def datasetDiagram = ApplicationFactory.eINSTANCE.createDatasetDiagramView()
            datasetDiagram.name = "DatasetDiagram"
            datasetDiagram.setDatasetView(datasetView)
            datasetDiagram.indexBy = datasetView.dataset.getDatasetColumn().get(1)//"branch"
            datasetDiagram.keyColumn = datasetView.dataset.getDatasetColumn().get(0)//"incomedate"
            datasetDiagram.valueColumn = datasetView.dataset.getDatasetColumn().get(2)//"income"
            datasetDiagram.legendAnchorPosition = LegendAnchorPositionType.BOTTOM_RIGHT
            datasetDiagram.axisXPosition = AxisXPositionType.BOTTOM
            datasetDiagram.axisXLegend = "Dates"
            datasetDiagram.axisYPosition = AxisYPositionType.LEFT
            datasetDiagram.axisYLegend = "Income"
            datasetDiagram.colorSchema = "nivo"
            datasetDiagram.diagramType = DiagramType.LINE
            lineDiagramRow.children.add(datasetDiagram)

            application.setView(lineFrom)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateApplicationPie(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def application = ApplicationFactory.eINSTANCE.createApplication()
            application.name = name

            def pieFrom = ApplicationFactory.eINSTANCE.createForm()
            pieFrom.name = "PieForm"
            def datasetViewRow = ApplicationFactory.eINSTANCE.createRow()
            datasetViewRow.name = "ViewDatasetRow"
            datasetViewRow.textAlign = TextAlign.LEFT
            datasetViewRow.marginTop = "20px"
            datasetViewRow.marginLeft = "20px"
            datasetViewRow.marginBottom = "20px"
            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "GridDatasetRow"
            datasetGridRow.textAlign = TextAlign.LEFT
            datasetGridRow.marginTop = "20px"
            datasetGridRow.marginLeft = "20px"
            datasetGridRow.marginBottom = "20px"
            def pieDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            pieDiagramRow.name = "PieRow"
            pieDiagramRow.marginTop = "20px"
            pieDiagramRow.marginLeft = "20px"
            pieDiagramRow.marginBottom = "20px"
            pieFrom.children.add(datasetViewRow)
            pieFrom.children.add(datasetGridRow)
            pieFrom.children.add(pieDiagramRow)

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "ViewDataset"
            def jdbcDatasetPie = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetPie", "",false)
            datasetView.setDataset(jdbcDatasetPie)
            def datasetGridPie =  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, "DatasetGridPie", "",false)
            datasetView.setDatasetComponent(datasetGridPie)
            datasetViewRow.children.add(datasetView)

            def datasetGrid = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGrid.name = "GridDataset"
            datasetGrid.setDatasetView(datasetView)
            datasetGridRow.children.add(datasetGrid)

            def datasetDiagram = ApplicationFactory.eINSTANCE.createDatasetDiagramView()
            datasetDiagram.name = "PieChart"
            datasetDiagram.setDatasetView(datasetView)

            datasetDiagram.indexBy = datasetView.dataset.getDatasetColumn().get(1)//"department"
            datasetDiagram.keyColumn = datasetView.dataset.getDatasetColumn().get(1)//"department"
            datasetDiagram.valueColumn = datasetView.dataset.getDatasetColumn().get(2)//"income"
            datasetDiagram.legendAnchorPosition = LegendAnchorPositionType.BOTTOM_RIGHT
            datasetDiagram.axisXPosition = AxisXPositionType.TOP
            datasetDiagram.axisYPosition = AxisYPositionType.LEFT
            datasetDiagram.colorSchema = "nivo"
            datasetDiagram.diagramType = DiagramType.PIE
            pieDiagramRow.children.add(datasetDiagram)

            application.setView(pieFrom)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateApplicationBar(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def application = ApplicationFactory.eINSTANCE.createApplication()
            application.name = name

            def barFrom = ApplicationFactory.eINSTANCE.createForm()
            barFrom.name = "BarForm"
            def datasetViewRow = ApplicationFactory.eINSTANCE.createRow()
            datasetViewRow.name = "ViewDatasetRow"
            datasetViewRow.textAlign = TextAlign.LEFT
            datasetViewRow.marginTop = "20px"
            datasetViewRow.marginLeft = "20px"
            datasetViewRow.marginBottom = "20px"
            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "GridDatasetRow"
            datasetGridRow.textAlign = TextAlign.LEFT
            datasetGridRow.marginTop = "20px"
            datasetGridRow.marginLeft = "20px"
            datasetGridRow.marginBottom = "20px"
            def barDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            barDiagramRow.name = "BarRow"
            barDiagramRow.marginTop = "20px"
            barDiagramRow.marginLeft = "20px"
            barDiagramRow.marginBottom = "20px"
            barFrom.children.add(datasetViewRow)
            barFrom.children.add(datasetGridRow)
            barFrom.children.add(barDiagramRow)

            def datasetView = ApplicationFactory.eINSTANCE.createDatasetView()
            datasetView.name = "ViewDataset"
            def jdbcDatasetBar = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetBar", "",false)
            datasetView.setDataset(jdbcDatasetBar)
            def datasetGridBar =  findOrCreateEObject(DatasetPackage.Literals.DATASET_COMPONENT, "DatasetGridBar", "",false)
            datasetView.setDatasetComponent(datasetGridBar)
            datasetViewRow.children.add(datasetView)

            def datasetGrid = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGrid.name = "GridDataset"
            datasetGrid.setDatasetView(datasetView)
            datasetGridRow.children.add(datasetGrid)

            def datasetDiagram = ApplicationFactory.eINSTANCE.createDatasetDiagramView()
            datasetDiagram.name = "BarChart"
            datasetDiagram.setDatasetView(datasetView)

            datasetDiagram.indexBy = datasetView.dataset.getDatasetColumn().get(0)//"year"
            datasetDiagram.keyColumn = datasetView.dataset.getDatasetColumn().get(1)//"branch"
            datasetDiagram.valueColumn = datasetView.dataset.getDatasetColumn().get(2)//"income"
            datasetDiagram.legendAnchorPosition = LegendAnchorPositionType.BOTTOM_RIGHT
            datasetDiagram.axisXPosition = AxisXPositionType.BOTTOM
            datasetDiagram.axisXLegend = "year"
            datasetDiagram.axisYPosition = AxisYPositionType.LEFT
            datasetDiagram.axisYLegend = "income"
            datasetDiagram.colorSchema = "nivo"
            datasetDiagram.diagramType = DiagramType.BAR

            barDiagramRow.children.add(datasetDiagram)

            application.setView(barFrom)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }
}
