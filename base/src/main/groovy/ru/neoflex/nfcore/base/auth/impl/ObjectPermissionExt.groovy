package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.GrantType
import ru.neoflex.nfcore.base.services.Context

class ObjectPermissionExt extends ObjectPermissionImpl {

    @Override
    Integer isEObjectPermitted(EObject eObject) {
        def store = Context.current.store
        return store.getId(eObject.eResource()) == store.getId(this.eObject.eResource()) ? this.grantType.value : GrantType.UNKNOWN.value
    }
}
