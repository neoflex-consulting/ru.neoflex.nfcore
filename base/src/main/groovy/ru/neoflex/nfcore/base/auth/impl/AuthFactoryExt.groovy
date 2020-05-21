package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.*

class AuthFactoryExt extends AuthFactoryImpl{
    @Override
    AllPermission createAllPermission() {
        return new AllPermissionExt()
    }

    @Override
    ClassPermission createClassPermission() {
        return new ClassPermissionExt()
    }

    @Override
    ObjectPermission createObjectPermission() {
        return new ObjectPermissionExt()
    }

    @Override
    Role createRole() {
        return new RoleExt()
    }

    @Override
    ReferencePermission createReferencePermission() {
        return new ReferencePermissionExt()
    }

    @Override
    Authorization createAuthorization() {
        return new AuthorizationImpl() {

        }
    }
}
