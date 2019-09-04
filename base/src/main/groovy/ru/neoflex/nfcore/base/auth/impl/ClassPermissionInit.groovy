package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.ClassPermission
import ru.neoflex.nfcore.base.auth.GrantStatus

class ClassPermissionInit extends ClassPermissionImpl{
    {
        ClassPermission.metaClass.permitted = { ActionType actionType, EObject eObject ->
            ClassPermission permission = (ClassPermission) delegate
            if (eObject.eClass() == permission.getTheClass() &&
                    (permission.actionTypes.contains(ActionType.ALL) || permission.actionTypes.contains(actionType))) {
                return permission.grantStatus
            }
            return GrantStatus.UNDEFINED
        } as Closure<GrantStatus>
    }
}
