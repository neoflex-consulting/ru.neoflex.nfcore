package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.AllPermission

class AuthFactoryExt extends AuthFactoryImpl{
    @Override
    AllPermission createAllPermission() {
        return new AllPermissionExt()
    }
}
