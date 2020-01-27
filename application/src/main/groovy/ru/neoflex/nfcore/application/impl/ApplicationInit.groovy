package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

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

}
