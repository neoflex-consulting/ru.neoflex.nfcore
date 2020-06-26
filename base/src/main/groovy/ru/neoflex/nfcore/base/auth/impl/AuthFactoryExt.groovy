package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.*

class AuthFactoryExt extends AuthFactoryImpl{
    @Override
    AllPermission createAllPermission() {
        return new AllPermissionExt()
    }

    @Override
    ObjectPermission createObjectPermission() {
        return new ObjectPermissionExt()
    }

    @Override
    Role createRole() {
        return new RoleExt()
    }
}
