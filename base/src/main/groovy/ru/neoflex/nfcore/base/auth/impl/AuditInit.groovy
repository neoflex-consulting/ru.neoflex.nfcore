package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.util.EcoreUtil
import org.springframework.security.core.context.SecurityContextHolder
import ru.neoflex.meta.gitdb.Events
import ru.neoflex.meta.gitdb.Transaction
import ru.neoflex.nfcore.base.auth.Audit
import ru.neoflex.nfcore.base.auth.AuthFactory
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.types.TypesPackage
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.base.util.EMFUtil

import java.sql.Timestamp

class AuditInit extends AuditImpl {
    {
        // set audit info before save EObject
        Context.current.publisher.subscribe(new Publisher.BeforeSaveHandler<EObject>(null) {
            @Override
            EObject handleEObject(EObject eObject) {
                def auditClass = AuthPackage.Literals.AUDIT;
                def auditRefs = eObject.eClass().EAllReferences.findAll {it.EReferenceType == auditClass && !it.isMany() && it.containment}
                auditRefs.each {
                    def audit = eObject.eGet(it) as Audit
                    if (audit == null) {
                        audit = AuthFactory.eINSTANCE.createAudit()
                        eObject.eSet(it, audit)
                    }
                    def userName = SecurityContextHolder?.context?.authentication?.name
                    def now = new Timestamp(new Date().time)
                    if (audit.created == null) {
                        audit.setCreated(now)
                        audit.setCreatedBy(userName)
                    }
                    else {
                        audit.setModified(now)
                        audit.setModifiedBy(userName)
                    }
                }
                return eObject
            }
        })
        // AuditInfo for gitdb
        Context.current.workspace.database.events.registerBeforeInsert(new Events.BeforeInsert() {
            @Override
            void handle(Resource resource, Transaction tx) throws IOException {
                if (resource.contents.isEmpty()) return
                def eObject = resource.contents.get(0)
                def auditClass = AuthPackage.Literals.AUDIT;
                def auditRefs = eObject.eClass().EAllReferences.findAll {it.EReferenceType == auditClass && !it.isMany() && it.containment}
                auditRefs.each {
                    def audit = eObject.eGet(it) as Audit
                    if (audit == null) {
                        audit = AuthFactory.eINSTANCE.createAudit()
                        eObject.eSet(it, audit)
                    }
                    def userName = SecurityContextHolder?.context?.authentication?.name
                    def now = new Timestamp(new Date().time)
                    audit.setCreated(now)
                    audit.setCreatedBy(userName)
                }
            }
        })
        Context.current.workspace.database.events.registerBeforeUpdate(new Events.BeforeUpdate() {
            @Override
            void handle(Resource old, Resource resource, Transaction tx) throws IOException {
                if (resource.contents.isEmpty()) return
                def eObject = resource.contents.get(0)
                def auditClass = AuthPackage.Literals.AUDIT;
                def auditRefs = eObject.eClass().EAllReferences.findAll {it.EReferenceType == auditClass && !it.isMany() && it.containment}
                auditRefs.each {
                    def audit = eObject.eGet(it) as Audit
                    if (audit == null) {
                        audit = AuthFactory.eINSTANCE.createAudit()
                        eObject.eSet(it, audit)
                    }
                    def userName = SecurityContextHolder?.context?.authentication?.name
                    def now = new Timestamp(new Date().time)
                    audit.setModified(now)
                    audit.setModifiedBy(userName)
                }
            }
        })
    }
}
