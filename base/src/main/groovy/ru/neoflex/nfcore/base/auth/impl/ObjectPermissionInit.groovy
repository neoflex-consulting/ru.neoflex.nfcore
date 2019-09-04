package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.ObjectPermission

class ObjectPermissionInit extends ObjectPermissionImpl {
    {
        ObjectPermission.metaClass.permitted = { ActionType actionType, EObject eObject ->
            ObjectPermission permission = (ObjectPermission) delegate;
            if (eObject == permission.getEObject() &&
                    (permission.actionTypes.contains(ActionType.ALL) || permission.actionTypes.contains(actionType))) {
                return permission.grantStatus
            }
            return GrantStatus.UNDEFINED
        } as Closure<GrantStatus>
    }
}
