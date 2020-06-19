package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.AuthPackage

class RoleExt extends RoleImpl {

    @Override
    Integer isEObjectPermitted(EObject eObject) {
        def result = 0
        this.grants
                .findAll { g ->
                    AuthPackage.Literals.OBJECT_PERMISSION.isInstance(g) ||
                            AuthPackage.Literals.ALL_PERMISSION.isInstance(g)
                }
                .each { g ->
                    result |= g.isEObjectPermitted(eObject)
                }
        return result
    }
}
