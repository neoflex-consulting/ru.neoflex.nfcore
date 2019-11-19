package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.services.Context

class ReferencePermissionExt extends ReferencePermissionImpl{
    @Override
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        def rs = Context.current.store.createResourceSet()
        rs.resources.add(eObject.eResource())
        EcoreUtil.resolveAll(rs)
        for (def r: rs.resources) {
            def refObject = r.contents[0]
            if (refObject == this.getReferencedEObject() &&
                    (this.actionTypes.contains(ActionType.ALL) || this.actionTypes.contains(actionType))) {
                return this.grantStatus
            }
        }
        return GrantStatus.UNDEFINED
    }
}
