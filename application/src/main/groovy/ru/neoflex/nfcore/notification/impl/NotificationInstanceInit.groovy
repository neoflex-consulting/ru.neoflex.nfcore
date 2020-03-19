package ru.neoflex.nfcore.notification.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.Notification
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage

class NotificationInstanceInit {
    static def findOrCreateEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateNotificationInstance(String name) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notificationInstance1 = NotificationFactory.eINSTANCE.createNotificationInstance()
            notificationInstance1.name = name
            notificationInstance1.date = new Date()
            def notification = findOrCreateEObject(NotificationPackage.Literals.NOTIFICATION, "A 1993",false) as Notification
            notificationInstance1.setNotification(notification)
            rs.resources.add(Context.current.store.createEObject(notificationInstance1))
        }
        return rs.resources.get(0).contents.get(0)
    }

    static def deleteNotificationInstance(String name) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_INSTANCE, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
    }
}
