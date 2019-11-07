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

            def userComponent2 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Pivot", "ReportPivotTrans",true)
            def userComponent3 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Rich Grid", "ReportRichGridTrans",true)
            def userComponent4 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Diagram", "ReportDiagramTrans",true)

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def componentElement = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement.code = 'Mandatory Reporting'
            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReportingTrans",true)
            componentElement.setComponent(userComponent1)
            application.view = componentElement

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            def appModuleNode = ApplicationFactory.eINSTANCE.createAppModuleNode()
            appModuleNode.name = "TestAppModuleNodePivot"
            referenceTree.children.add(appModuleNode)
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateAppModuleTest(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APP_MODULE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {

            def userComponent5 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Test Component", "TestComponentLeftTrans",true)

            def application = ApplicationFactory.eINSTANCE.createAppModule()
            application.name = name

            def componentElement = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement.code = 'Test Component'
            componentElement.setComponent(userComponent5)
            application.view = componentElement

            def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
            def catalogNode = ApplicationFactory.eINSTANCE.createCatalogNode()
            referenceTree.children.add(catalogNode)
            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.INSTANCE_REPORT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def instanceReport1 = ReportsFactory.eINSTANCE.createInstanceReport()
            instanceReport1.date = new Date()
//            def statusReport1 = findOrCreateEObject(ReportsPackage.Literals.REPORT_STATUS, "NOT_FOUND", "",true)
//            instanceReport1.setStatus(statusReport1)
//            def report1 = findOrCreateEObject(ReportsPackage.Literals.REPORT, "${name}", "",true)
//            instanceReport1.report = report1

            rs.resources.add(Context.current.store.createEObject(instanceReport1))
        }
        return rs.resources.get(0).contents.get(0)
    }

    {
        recreateAppModule("ReportsApp")
        recreateAppModuleTest("TestAppModuleNodePivot")
//        recreateReport("ReportAuto1")
    }
}
