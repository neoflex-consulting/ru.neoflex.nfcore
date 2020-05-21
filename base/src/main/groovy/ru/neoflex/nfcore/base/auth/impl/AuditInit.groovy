package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.springframework.security.core.context.SecurityContextHolder
import ru.neoflex.nfcore.base.auth.Audit
import ru.neoflex.nfcore.base.auth.AuthFactory
import ru.neoflex.nfcore.base.auth.AuthPackage

import java.sql.Timestamp

class AuditInit extends AuditImpl {
    private static EObject setAuditInfo(EObject eObject) {
        def auditClass = AuthPackage.Literals.AUDIT;
        def auditRefs = eObject.eClass().EAllReferences.findAll {
            it.EReferenceType == auditClass && !it.isMany() && it.containment
        }
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
            } else {
                audit.setModified(now)
                audit.setModifiedBy(userName)
            }
        }
        return eObject
    }

}
