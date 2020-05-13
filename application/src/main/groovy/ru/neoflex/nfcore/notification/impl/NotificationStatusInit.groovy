package ru.neoflex.nfcore.notification.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.AppModule
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.NotificationFactory
import ru.neoflex.nfcore.notification.NotificationPackage

class NotificationStatusInit {
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
