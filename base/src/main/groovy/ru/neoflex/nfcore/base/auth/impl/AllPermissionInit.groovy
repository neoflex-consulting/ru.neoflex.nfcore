package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.AllPermission
import ru.neoflex.nfcore.base.auth.GrantStatus

class AllPermissionInit extends AllPermissionImpl {
    {
        AllPermission.metaClass.permitted = { ActionType actionType, EObject eObject ->
            AllPermission permission = (AllPermission) delegate;
            if (permission.actionTypes.contains(ActionType.ALL) || permission.actionTypes.contains(actionType)) {
                return permission.grantStatus
            }
            return GrantStatus.UNDEFINED
        } as Closure<GrantStatus>
    }
}
