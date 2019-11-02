package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.CatalogNode
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.reports.ReportsFactory
import ru.neoflex.nfcore.reports.ReportsPackage

class ApplicationInit {
    static def findOrCreateEObject(EClass eClass, String name, String componentClassName, boolean replace = false) {
        def rs = DocFinder.create(Context.current.store, eClass, [name: name])
                    .execute().resourceSet
            while (replace && !rs.resources.empty) {
                Context.current.store.deleteResource(rs.resources.remove(0).getURI())
            }
            if (rs.resources.empty) {
                def eObject = EcoreUtil.create(eClass)
                eObject.eSet(eClass.getEStructuralFeature("name"), name)
                if (componentClassName != "") {eObject.eSet(eClass.getEStructuralFeature("componentClassName"), componentClassName)}
                rs.resources.add(Context.current.store.createEObject(eObject))
            }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateApplication(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def application = ApplicationFactory.eINSTANCE.createApplication()
            application.name = name

            def componentElement = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement.code = 'Mandatory Reporting'
            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReportingTrans",true)
            componentElement.setComponent(userComponent1)
            application.view = componentElement

            def referenceTree = ApplicationFactory.eINSTANCE.createTree()
            referenceTree.name = 'ReportsApp'

            def eObjectNode1 = ApplicationFactory.eINSTANCE.createEObjectNode()
            eObjectNode1.name = 'Report 1'
            def report1 = findOrCreateEObject(ReportsPackage.Literals.REPORT, "Report1", "",true)
            eObjectNode1.EObject = report1
            referenceTree.root.add(eObjectNode1)

            def view1 = ApplicationFactory.eINSTANCE.createView()
            view1.name = 'View'
            referenceTree.root.add(view1)

            def catalogNode1 = ApplicationFactory.eINSTANCE.createCatalogNode()
            catalogNode1.name = 'rootCatalogNode'
            referenceTree.root.add(catalogNode1)

            def view2 = ApplicationFactory.eINSTANCE.createView()
            view2.name = 'childrenView'
            def eObjectNode2 = ApplicationFactory.eINSTANCE.createEObjectNode()
            eObjectNode2.name = 'childrenEObject'
            def catalogNode2 = ApplicationFactory.eINSTANCE.createCatalogNode()
            catalogNode2.name = 'childrenCatalogNode'

            catalogNode1.children.add(view2)
            catalogNode1.children.add(eObjectNode2)
            catalogNode1.children.add(catalogNode2)

            application.setReferenceTree(referenceTree)

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateClassComponentReport(String name, String uri) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.CLASS_COMPONENT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def ClassComponent = ApplicationFactory.eINSTANCE.createClassComponent()
            ClassComponent.AClass = rs.getEObject(URI.createURI(uri), true)
            ClassComponent.name = name
            def viewTree = ApplicationFactory.eINSTANCE.createForm()
            viewTree.code = 'User Component Form'
            def ReportDivName = ApplicationFactory.eINSTANCE.createDiv()
            ReportDivName.code = 'Report Name'
            viewTree.children.add(ReportDivName)
            def ReportTab = ApplicationFactory.eINSTANCE.createTabsViewReport()
            ReportTab.code = 'Report Tab'
            viewTree.children.add(ReportTab)
            def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement1.code = 'Pivot'
            def componentElement2 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement2.code = 'Diagram'
            def componentElement3 = ApplicationFactory.eINSTANCE.createComponentElement()
            componentElement3.code = 'Rich Grid'
            def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Pivot", "ReportPivotTrans",true)
            def userComponent2 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Diagram", "ReportDiagramTrans",true)
            def userComponent3 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Rich Grid", "ReportRichGridTrans",true)
            componentElement1.setComponent(userComponent1)
            componentElement2.setComponent(userComponent2)
            componentElement3.setComponent(userComponent3)
            ReportTab.children.add(componentElement1)
            ReportTab.children.add(componentElement2)
            ReportTab.children.add(componentElement3)
            ClassComponent.setView(viewTree)
            rs.resources.add(Context.current.store.createEObject(ClassComponent))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def recreateReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.REPORT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {
            def Report = ReportsFactory.eINSTANCE.createReport()
            Report.name = name
            Report.date = new Date()
            rs.resources.add(Context.current.store.createEObject(Report))
        }
        return rs.resources.get(0).contents.get(0)
    }
    {
//        recreateApplication("ReportsApp")
//        recreateClassComponentReport("ReportsReport", "ru.neoflex.nfcore.reports#//Report")
//        recreateReport("ReportAuto1")
    }
}
