package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus

class AllPermissionExt extends AllPermissionImpl {
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        if (this.actionTypes.contains(ActionType.ALL) || this.actionTypes.contains(actionType)) {
            return this.grantStatus
        }
        return GrantStatus.UNDEFINED
    }
}
