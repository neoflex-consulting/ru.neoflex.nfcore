package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.meta.emfgit.Events
import ru.neoflex.meta.emfgit.Transaction
import ru.neoflex.nfcore.base.auth.*
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

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
        def su = sus.size() > 0 ? sus[0].contents[0] : createSU()
        def actuators = DocFinder.create(Context.current.store, AuthPackage.Literals.ROLE, [name: "ACTUATOR"]).execute().resources
        def actuator = actuators.size() > 0 ? actuators[0].contents[0] : createActuator()
        def admins = DocFinder.create(Context.current.store, AuthPackage.Literals.USER, [name: "admin"]).execute().resources
        if (admins.size() == 0) {
            createAdmin("admin", "admin", su, actuator)
            createAdmin("anna", "anna", su, actuator)
        }
        else {
            Context.current.store.saveResource(admins[0])
        }
    }
}
