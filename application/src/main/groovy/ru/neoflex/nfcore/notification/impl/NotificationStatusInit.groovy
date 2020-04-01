package ru.neoflex.nfcore.notification.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity

class NotificationStatusInit {
    static def findOrCreateEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def createNotificationStatus(String name, String color) {
        def rs = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION_STATUS, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def notificationStatus = NotificationFactory.eINSTANCE.createNotificationStatus()
            notificationStatus.name = name
            notificationStatus.color = color
            rs.resources.add(Context.current.store.createEObject(notificationStatus))
        }
        return rs.resources.get(0).contents.get(0)
    }
}
