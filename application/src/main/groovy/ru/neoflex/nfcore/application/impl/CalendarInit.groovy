package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.Notification
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.Periodicity

import java.text.SimpleDateFormat

class CalendarExt extends CalendarImpl {
    @Override
    String getNotificationInstances(String dateFrom, String dateTo) {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, NotificationPackage.Literals.NOTIFICATION, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def notificationRef = Context.current.store.getRef(resource.resources.get(0))
                    def notification = resource.resources.get(0).contents.get(0) as Notification

                    if (notification.periodicity == Periodicity.MONTH) {
                        if (notification.reportingDateOn.size() != 0) {

                        }
                    }





                    Context.current.store.updateEObject(notificationRef, notification)
                    Context.current.store.commit("Entity was updated " + notificationRef)
                    return JsonOutput.toJson("Columns in entity " + notification.name + " were deleted")
                }
            }
        })
    }

}
