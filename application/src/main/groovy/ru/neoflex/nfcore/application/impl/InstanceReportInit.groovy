package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.reports.Report
import ru.neoflex.nfcore.reports.ReportsFactory
import ru.neoflex.nfcore.reports.ReportsPackage

class InstanceReportInit {
    static def findOrCreateEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateInstanceReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.INSTANCE_REPORT, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def instanceReport1 = ReportsFactory.eINSTANCE.createInstanceReport()
            instanceReport1.name = name
            instanceReport1.date = new Date()
            def report = findOrCreateEObject(ReportsPackage.Literals.REPORT, "A 1993",false) as Report
            instanceReport1.setReport(report)
            rs.resources.add(Context.current.store.createEObject(instanceReport1))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def deleteInstanceReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.INSTANCE_REPORT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }
}
