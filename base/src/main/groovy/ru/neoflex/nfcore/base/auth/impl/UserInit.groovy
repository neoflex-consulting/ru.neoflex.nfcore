package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.meta.emfgit.Events
import ru.neoflex.meta.emfgit.Transaction
import ru.neoflex.nfcore.base.auth.ActionType
import ru.neoflex.nfcore.base.auth.Audit
import ru.neoflex.nfcore.base.auth.AuthFactory
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.auth.Authenticator
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


    {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()
        // encode password before save EObject
        Context.current.publisher.subscribe(new Publisher.BeforeSaveHandler<EObject>(null) {
            @Override
            EObject handleEObject(EObject eObject) {
                encodeUserPassword(eObject, encoder)
                return eObject
            }
        })
        // encode password for gitdb
        Context.current.workspace.database.events.registerBeforeSave(new Events.BeforeSave() {
            @Override
            void handle(Resource old, Resource resource, Transaction tx) throws IOException {
                if (resource.contents.isEmpty()) return
                def eObject = resource.contents.get(0)
                encodeUserPassword(eObject, encoder)
            }
        })

        // create default admin user
        def sus = DocFinder.create(Context.current.store, AuthPackage.Literals.ROLE, [name: "su"]).execute().resources
        def su = sus.size() > 0 ? sus[0] : createSU()
        def admins = DocFinder.create(Context.current.store, AuthPackage.Literals.USER, [name: "admin"]).execute().resources
        if (admins.size() == 0) {
            createAdmin(su)
        }
        else {
            Context.current.store.saveResource(admins[0])
        }
    }
}
