package ru.neoflex.nfcore.base.auth.impl


import org.eclipse.emf.ecore.resource.Resource
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.auth.Role
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

import java.util.function.BiConsumer
import java.util.function.Consumer

class AuthPackageInit {

    /*Audit*/
    {
        Context.current.store.registerBeforeSave(new BiConsumer<Resource, Resource>() {
            @Override
            void accept(Resource oldResource, Resource resource) {
                resource.contents.forEach {eObject->AuditInit.setAuditInfo(eObject)}
            }
        })
    }

    /*Role*/
    {
        Context.current.store.registerAfterSave(new BiConsumer<Resource, Resource>() {
            @Override
            void accept(Resource oldResource, Resource resource) {
                if (resource.contents.count {eObject->eObject instanceof Role} > 0) {
                    Context.current.authorization.clearRolesCache()
                }
            }
        })
        Context.current.store.registerBeforeDelete(new Consumer<Resource>() {
            @Override
            void accept(Resource resource) {
                if (resource.contents.count {eObject->eObject instanceof Role} > 0) {
                    Context.current.authorization.clearRolesCache()
                }
            }
        })
    }

    /*User*/
    {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()
        // encode password before save EObject
        Context.current.store.registerBeforeSave(new BiConsumer<Resource, Resource>() {
            @Override
            void accept(Resource oldResource, Resource resource) {
                resource.contents.forEach {eObject->UserInit.encodeUserPassword(eObject, encoder)}
            }
        })

        // create default admin user
        def sus = DocFinder.create(Context.current.store, AuthPackage.Literals.ROLE, [name: "su"]).execute().resources
        def su = sus.size() > 0 ? sus[0].contents[0] : UserInit.createSU()
        def actuators = DocFinder.create(Context.current.store, AuthPackage.Literals.ROLE, [name: "ACTUATOR"]).execute().resources
        def actuator = actuators.size() > 0 ? actuators[0].contents[0] : UserInit.createActuator()
        def admins = DocFinder.create(Context.current.store, AuthPackage.Literals.USER, [name: "admin"]).execute().resources
        if (admins.size() == 0) {
            UserInit.createAdmin("admin", "admin", su, actuator)
            UserInit.createAdmin("anna", "anna", su, actuator)
        }
        else {
            Context.current.store.saveResource(admins[0])
        }
    }
}
