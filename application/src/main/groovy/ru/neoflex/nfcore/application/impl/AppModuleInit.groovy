package ru.neoflex.nfcore.application.impl

//import org.eclipse.emf.common.util.URI
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

    static def deletedAppModule(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }

    static def recreateAppModule2(String name) {
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

            def Tabs = ApplicationFactory.eINSTANCE.createTabsViewReport()
            Tabs.name = 'View Report'
            def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
            def componentElement2 = ApplicationFactory.eINSTANCE.createComponentElement()
            def componentElement3 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement1.name = 'Pivot'
            componentElement2.name = 'Rich Grid'
            componentElement3.name = 'Diagram'
            componentElement1.setComponent(userComponent1)
            componentElement2.setComponent(userComponent2)
            componentElement3.setComponent(userComponent3)
            Tabs.children.add(componentElement1)
            Tabs.children.add(componentElement2)
            Tabs.children.add(componentElement3)
            application.view = Tabs

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateInstanceReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.INSTANCE_REPORT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def instanceReport1 = ReportsFactory.eINSTANCE.createInstanceReport()
            instanceReport1.name = name
            instanceReport1.date = new Date()
            def report = findOrCreateEObject(ReportsPackage.Literals.REPORT, "A 1993", "",false)
            instanceReport1.report = report
            rs.resources.add(Context.current.store.createEObject(instanceReport1))
        }
        return rs.resources.get(0).contents.get(0)
    }

    {
        deletedAppModule("ReportSingle")
        recreateApplication("ReportsApp")
        recreateApplication("ApplicationForExample")
        recreateAppModule2("ReportSingle")
        recreateInstanceReport("InstanceReport1")
    }
}
