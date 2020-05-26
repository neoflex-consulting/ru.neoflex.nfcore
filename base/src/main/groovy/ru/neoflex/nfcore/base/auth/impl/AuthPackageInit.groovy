package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.meta.emfgit.Events
import ru.neoflex.meta.emfgit.Transaction
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class AuthPackageInit {

    /*Audit*/
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

    /*User*/
    {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()
        // encode password before save EObject
        Context.current.publisher.subscribe(new Publisher.BeforeSaveHandler<EObject>(null) {
            @Override
            EObject handleEObject(EObject eObject) {
                UserInit.encodeUserPassword(eObject, encoder)
                return eObject
            }
        })
        // encode password for gitdb
        Context.current.workspace.database.events.registerBeforeSave(new Events.BeforeSave() {
            @Override
            void handle(Resource old, Resource resource, Transaction tx) throws IOException {
                if (resource.contents.isEmpty()) return
                def eObject = resource.contents.get(0)
                UserInit.encodeUserPassword(eObject, encoder)
            }
        })
    }
}
