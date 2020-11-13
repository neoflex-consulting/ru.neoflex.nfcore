package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.nfcore.base.auth.*
import ru.neoflex.nfcore.base.services.Context

class UserInit extends UserImpl {
    static Role createSU() {
        def superUserRole = AuthFactory.eINSTANCE.createRole()
        superUserRole.setName("su")
        superUserRole.setDescription("Super User Role - All Permissions granted")
        def allPermission = AuthFactory.eINSTANCE.createAllPermission()
        allPermission.setGrantType(GrantType.WRITE)
        superUserRole.getGrants().add(allPermission)
        Context.current.store.createEObject(superUserRole)
        return superUserRole
    }

    static Role createActuator() {
        def actuator = AuthFactory.eINSTANCE.createRole()
        actuator.setName("ACTUATOR")
        actuator.setDescription("ACTUATOR - access to spring endpoints")
        Context.current.store.createEObject(actuator)
        return actuator
    }

    static User createAdmin(String name, String password, Role... roles) {
        def adminUser = AuthFactory.eINSTANCE.createUser()
        adminUser.setName(name)
        adminUser.setDescription(name + " user with Super User role")
        adminUser.setEmail("admin@neoflex.ru")
        def passwordAuthenticator = AuthFactory.eINSTANCE.createPasswordAuthenticator()
        passwordAuthenticator.setPassword(password)
        passwordAuthenticator.setDisabled(false)
        adminUser.getAuthenticators().add(passwordAuthenticator)
        for (role in roles) {
            adminUser.getRoles().add(role)
        }
        Context.current.store.createEObject(adminUser)
        return adminUser
    }

    static void encodeUserPassword(EObject eObject, PasswordEncoder pencoder) {
        if (eObject.eClass() == AuthPackage.Literals.USER) {
            User user = (User) eObject
            for (Authenticator a : user.getAuthenticators()) {
                if (a instanceof PasswordAuthenticator) {
                    PasswordAuthenticator pa = (PasswordAuthenticator) a
                    if (pencoder.upgradeEncoding(pa.password)) {
                        pa.password = pencoder.encode(pa.password)
                    }
                }
            }
        }
    }
}
