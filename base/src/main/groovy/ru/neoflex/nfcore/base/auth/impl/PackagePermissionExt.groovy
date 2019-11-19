package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.PackagePermission

class PackagePermissionExt extends PackagePermissionImpl {
    @Override
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        if (eObject.eClass().getEPackage() == this.getEPackage() &&
                this.actionTypes.contains(actionType)) {
            return this.grantStatus
        }
        return GrantStatus.UNDEFINED
    }
}
