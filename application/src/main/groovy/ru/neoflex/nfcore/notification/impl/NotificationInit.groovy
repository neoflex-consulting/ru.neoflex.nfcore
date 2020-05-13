package ru.neoflex.nfcore.notification.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.NotificationStatus
import ru.neoflex.nfcore.notification.Periodicity
import ru.neoflex.nfcore.utils.Utils

class NotificationInit {

    static def createNotification(String name, Periodicity periodicity, String deadlineDay, String deadlineTime, String dateOn, String appModuleName, String statusName) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notification = NotificationFactory.eINSTANCE.createNotification()
            notification.name = name
            notification.shortName = name
            def appModule1 = Utils.findEObject(ApplicationPackage.Literals.APP_MODULE, appModuleName) as AppModule
            notification.setAppModule(appModule1)
            notification.periodicity = periodicity
            notification.deadlineDay = deadlineDay
            notification.deadlineTime = deadlineTime

            def status = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION_STATUS, statusName) as NotificationStatus
            notification.setDefaultStatus(status)

            def dateOn1 = NotificationFactory.eINSTANCE.createReportingDateOn()
            dateOn1.name = dateOn
            notification.reportingDateOn.add(dateOn1)

            rs.resources.add(Context.current.store.createEObject(notification))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def createEmptyNotification(String name, Periodicity periodicity, String deadlineDay, String deadlineTime, String dateOn, String statusName) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notification = NotificationFactory.eINSTANCE.createNotification()
            notification.name = name
            notification.shortName = name

            notification.periodicity = periodicity
            notification.deadlineDay = deadlineDay
            notification.deadlineTime = deadlineTime

            def dateOn1 = NotificationFactory.eINSTANCE.createReportingDateOn()
            dateOn1.name = dateOn
            notification.reportingDateOn.add(dateOn1)

            def status = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION_STATUS, statusName) as NotificationStatus
            notification.setDefaultStatus(status)

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
