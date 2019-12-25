package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
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

            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Pivot", "ReportPivot",true)
            def userComponent2 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Rich Grid", "ReportRichGrid",true)
            def userComponent3 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Diagram", "ReportDiagram",true)

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def tabs = ApplicationFactory.eINSTANCE.createTabsViewReport()
            tabs.name = 'View Report'

            def datasetGridView = ApplicationFactory.eINSTANCE.createDatasetGridView()
            datasetGridView.name = 'Dataset View Grid'
            def jdbcDataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetTest", "",false)
            datasetGridView.setDataset(jdbcDataset)

            def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
            def componentElement2 = ApplicationFactory.eINSTANCE.createComponentElement()
            def componentElement3 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement1.name = 'Pivot'
            componentElement2.name = 'Rich Grid'
            componentElement3.name = 'Diagram'
            componentElement1.setComponent(userComponent1)
            componentElement2.setComponent(userComponent2)
            componentElement3.setComponent(userComponent3)
            tabs.children.add(componentElement1)
            tabs.children.add(componentElement2)
            tabs.children.add(componentElement3)
            tabs.children.add(datasetGridView)
            application.view = tabs

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
