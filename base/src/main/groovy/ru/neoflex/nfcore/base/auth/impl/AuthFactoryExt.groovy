package ru.neoflex.nfcore.base.auth.impl

import ru.neoflex.nfcore.base.auth.AllPermission
import ru.neoflex.nfcore.base.auth.ClassPermission
import ru.neoflex.nfcore.base.auth.ObjectPermission
import ru.neoflex.nfcore.base.auth.ReferencePermission
import ru.neoflex.nfcore.base.auth.Role

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
}
