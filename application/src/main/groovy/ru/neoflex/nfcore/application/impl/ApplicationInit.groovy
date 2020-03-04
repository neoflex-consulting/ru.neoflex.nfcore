package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.AxisXPositionType
import ru.neoflex.nfcore.application.AxisYPositionType
import ru.neoflex.nfcore.application.DiagramType
import ru.neoflex.nfcore.application.LegendAnchorPositionType
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
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

            if (name == "ApplicationForExample") {
                application.name = name

                def userComponent5 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Page Not Found", "PageNotFound",false)

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Page Not Found'
                componentElement1.setComponent(userComponent5)
                application.view = componentElement1
            }
            else {
                def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReporting",false)
                def userComponent6 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Tax Reporting", "TaxReporting",false)

                application.name = name

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Mandatory Reporting'
                componentElement1.setComponent(userComponent1)
                application.view = componentElement1

                def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
                referenceTree.name = "CatalogNode1"
                def componentElement3 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement3.name = 'Mandatory Reporting'
                componentElement3.setComponent(userComponent1)
                def viewNode1 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode1.name = 'Mandatory Reporting'
                viewNode1.view = componentElement3
                referenceTree.children.add(viewNode1)
                def componentElement2 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement2.name = 'Tax Reporting'
                componentElement2.setComponent(userComponent6)
                def viewNode2 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode2.name = 'Tax Reporting'
                viewNode2.view = componentElement2
                referenceTree.children.add(viewNode2)
                application.setReferenceTree(referenceTree)
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
            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "DatasetGridRow"
            def lineDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            lineDiagramRow.name = "LineDiagramRow"
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
            datasetDiagram.indexBy = "branch"
            datasetDiagram.keyColumn = "incomedate"
            datasetDiagram.valueColumn = "income"
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
            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "GridDatasetRow"
            def pieDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            pieDiagramRow.name = "PieRow"
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
            datasetDiagram.indexBy = "department"
            datasetDiagram.keyColumn = "department"
            datasetDiagram.valueColumn = "income"
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
            def datasetGridRow = ApplicationFactory.eINSTANCE.createRow()
            datasetGridRow.name = "GridDatasetRow"
            def barDiagramRow = ApplicationFactory.eINSTANCE.createRow()
            barDiagramRow.name = "BarRow"
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
            datasetDiagram.indexBy = "year"
            datasetDiagram.keyColumn = "branch"
            datasetDiagram.valueColumn = "income"
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
