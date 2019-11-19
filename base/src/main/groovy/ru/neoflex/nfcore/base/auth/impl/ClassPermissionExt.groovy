package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.ClassPermission
import ru.neoflex.nfcore.base.auth.GrantStatus

class ClassPermissionExt extends ClassPermissionImpl {

    @Override
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        ClassPermission permission = this
        if (eObject.eClass() == permission.getTheClass() &&
                (permission.actionTypes.contains(ActionType.ALL) || permission.actionTypes.contains(actionType))) {
            return permission.grantStatus
        }
        return GrantStatus.UNDEFINED
    }
}
