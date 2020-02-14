package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.*
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class UserProfileInit extends UserProfileImpl {

    static UserProfile createUserProfile(String name) {
        def userProfile = AuthFactory.eINSTANCE.createUserProfile()
        userProfile.setUserName(name)
        Context.current.store.createEObject(userProfile)
        return userProfile
    }

    {
        def admins = DocFinder.create(Context.current.store, AuthPackage.Literals.USER_PROFILE, [name: "admin"]).execute().resources
        if (admins.size() == 0) {
            createUserProfile("admin")
        }
        def anna = DocFinder.create(Context.current.store, AuthPackage.Literals.USER_PROFILE, [name: "anna"]).execute().resources
        if (anna.size() == 0) {
            createUserProfile("anna")
        }
    }
}
