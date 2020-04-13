package ru.neoflex.nfcore.notification.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity

class NotificationInit {
    static def findOrCreateEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def createNotification(String name) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notification = NotificationFactory.eINSTANCE.createNotification()
            notification.name = name
            notification.shortName = name + '_Short'
            def appModule1 = findOrCreateEObject(ApplicationPackage.Literals.APP_MODULE, "ReportSingle",false) as AppModule
            notification.setAppModule(appModule1)
            notification.periodicity = Periodicity.MONTH
            notification.deadlineDay = "17"
            notification.deadlineTime = "18:00"

            def dateOn1 = NotificationFactory.eINSTANCE.createReportingDateOn()
            dateOn1.name = "15"
            notification.reportingDateOn.add(dateOn1)

            rs.resources.add(Context.current.store.createEObject(notification))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createEmptyNotification(String name) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notification = NotificationFactory.eINSTANCE.createNotification()
            notification.name = name
            notification.shortName = name + '_Short'

            notification.periodicity = Periodicity.MONTH
            notification.deadlineDay = "10"
            notification.deadlineTime = "18:00"

            def dateOn1 = NotificationFactory.eINSTANCE.createReportingDateOn()
            dateOn1.name = "8"
            notification.reportingDateOn.add(dateOn1)

            rs.resources.add(Context.current.store.createEObject(notification))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def deleteNotification(String name) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }
}
