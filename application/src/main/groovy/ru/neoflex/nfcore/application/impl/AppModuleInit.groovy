package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.RowPerPage
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.application.Theme
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

    static def recreateAppModule(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
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

}
