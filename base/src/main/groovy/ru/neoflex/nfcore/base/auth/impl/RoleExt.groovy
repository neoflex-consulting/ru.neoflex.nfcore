package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.Role

class RoleExt extends RoleImpl {

    @Override
    GrantStatus permitted(ActionType actionType, EObject eObject) {
        def sorted = this.grants.toSorted {e1, e2 -> e1.priority() > e2.priority()}
        GrantStatus result = GrantStatus.UNDEFINED
        for (permission in sorted) {
            def permitted = permission.permitted(actionType, eObject)
            if (permitted != GrantStatus.UNDEFINED) {
                result = permitted
            }
        }
        return result
    }
}
