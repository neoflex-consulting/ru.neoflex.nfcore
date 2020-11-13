ru.neoflex.nfcore.dsl.EcoreBuilder.build "auth", "Role", {
    id "auth_Role_My Role"
    attr "name", "My Role!"
    attr "description", "Test Role to build with EcoreBuilder"
    contains "grants", "auth", "ObjectPermission", {
        attr "grantType", "Write"
        refers "eObject", "auth_UserProfile_ivanov", "parameter2"
    }
    contains "audit", "auth", "Audit", {
        attr "createdBy", "ivanov"
        attr "created", "2020-05-26T10:24:20.644+0300"
    }
}
