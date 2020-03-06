package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import ru.neoflex.meta.emfgit.Events
import ru.neoflex.meta.emfgit.Transaction
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context

class AuthPackageInit {

    {
        // set audit info before save EObject
        Context.current.publisher.subscribe(new Publisher.BeforeSaveHandler<EObject>(null) {
            @Override
            EObject handleEObject(EObject eObject) {
                return AuditInit.setAuditInfo(eObject)
            }

        })
        // AuditInfo for gitdb
        Context.current.workspace.database.events.registerBeforeSave(new Events.BeforeSave() {
            @Override
            void handle(Resource old, Resource resource, Transaction tx) throws IOException {
                if (resource.contents.isEmpty()) return
                def eObject = resource.contents.get(0)
                AuditInit.setAuditInfo(eObject)
            }
        })
    }
}
