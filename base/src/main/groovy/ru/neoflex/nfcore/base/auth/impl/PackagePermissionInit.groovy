package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.PackagePermission

class PackagePermissionInit extends PackagePermissionImpl {
    {
        PackagePermission.metaClass.permitted = { ActionType actionType, EObject eObject ->
            PackagePermission permission = (PackagePermission) delegate;
            if (eObject.eClass().getEPackage() == permission.getEPackage() &&
                    permission.actionTypes.contains(actionType)) {
                return permission.grantStatus
            }
            return GrantStatus.UNDEFINED
        }
    }
}
