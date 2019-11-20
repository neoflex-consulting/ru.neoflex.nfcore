package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.ObjectPermission

class ObjectPermissionExt extends ObjectPermissionImpl {

    @Override
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        if (eObject == this.getEObject() &&
                (this.actionTypes.contains(ActionType.ALL) || this.actionTypes.contains(actionType))) {
            return permission.grantStatus
        }
        return GrantStatus.UNDEFINED
    }
}
