package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject

class AllPermissionExt extends AllPermissionImpl {
    @Override
    Integer isEObjectPermitted(EObject eObject) {
        return this.grantType.value
    }
}
