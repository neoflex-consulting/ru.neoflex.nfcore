package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.reports.ReportsFactory
import ru.neoflex.nfcore.reports.ReportsPackage

class ReportInit {
    static def findOrCreateEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.REPORT, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def report = ReportsFactory.eINSTANCE.createReport()
            report.name = name
            def appModule1 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "ReportSingle",false) as AppModule
            report.setAppModule(appModule1)
            rs.resources.add(Context.current.store.createEObject(report))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def deleteReport(String name) {
        def rs = DocFinder.create(Context.current.store, ReportsPackage.Literals.REPORT, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }
}
