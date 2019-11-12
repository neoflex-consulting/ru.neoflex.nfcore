package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.reports.ReportsFactory
import ru.neoflex.nfcore.reports.ReportsPackage

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

    static def recreateAppModule(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {

            def userComponent2 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Pivot", "ReportPivot",true)
            def userComponent3 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Rich Grid", "ReportRichGrid",true)
            def userComponent4 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Diagram", "ReportDiagram",true)
            def userComponent5 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Page Not Found", "PageNotFound",true)

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def componentElement = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement.code = 'Mandatory Reporting'
            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReporting",true)
            componentElement.setComponent(userComponent1)
            application.view = componentElement

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            def appModuleNode = ApplicationFactory.eINSTANCE.createAppModuleNode()
            referenceTree.children.add(appModuleNode)
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    {
        recreateAppModule("ReportsApp")
    }
}
