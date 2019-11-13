package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.AuthPackage

class AuthPackageInit {
    {
        AuthPackage.eINSTANCE.setEFactoryInstance(new AuthFactoryExt())
    }
}
