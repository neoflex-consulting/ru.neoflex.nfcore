package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.springframework.security.core.context.SecurityContextHolder
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.Audit
import ru.neoflex.nfcore.base.auth.AuthFactory
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.auth.GrantStatus
import ru.neoflex.nfcore.base.auth.PasswordAuthenticator
import ru.neoflex.nfcore.base.auth.Permission
import ru.neoflex.nfcore.base.auth.Role
import ru.neoflex.nfcore.base.auth.User
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

import java.sql.Timestamp

class UserInit extends UserImpl {
    static Role createSU() {
        def superUserRole = AuthFactory.eINSTANCE.createRole()
        superUserRole.setName("su")
        superUserRole.setDescription("Super User Role - All Permissions granted")
        def allPermission = AuthFactory.eINSTANCE.createAllPermission()
        allPermission.setGrantStatus(GrantStatus.GRANTED)
        allPermission.getActionTypes().add(ActionType.ALL)
        superUserRole.getGrants().add(allPermission)
        Context.current.store.createEObject(superUserRole)
        return superUserRole
    }

    static User createAdmin(Role role) {
        def adminUser = AuthFactory.eINSTANCE.createUser()
        adminUser.setName("admin")
        adminUser.setDescription("Admin user with Super User role")
        adminUser.setEmail("admin@neoflex.ru")
        def passwordAuthenticator = AuthFactory.eINSTANCE.createPasswordAuthenticator()
        passwordAuthenticator.setPassword("admin")
        passwordAuthenticator.setDisabled(false)
        adminUser.getAuthenticators().add(passwordAuthenticator)
        adminUser.getRoles().add(role)
        Context.current.store.createEObject(adminUser)
        return adminUser
    }

    {
        // create default admin user
        def sus = DocFinder.create(Context.current.store, AuthPackage.Literals.ROLE, [name: "su"]).execute().resourceSet
        def su = sus.resources.size() > 0 ? sus.resources.get(0) : createSU()
        def admins = DocFinder.create(Context.current.store, AuthPackage.Literals.USER, [name: "admin"]).execute().resourceSet
        if (admins.resources.size() == 0) {
            createAdmin(su)
        }
    }
}
