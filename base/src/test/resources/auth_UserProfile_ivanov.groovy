ru.neoflex.nfcore.dsl.EcoreBuilder.build "auth", "UserProfile", {
    id "auth_UserProfile_ivanov"
    attr "userName", "ivanova"
    contains "params", "auth", "Parameter", {
        attr "key", "12345"
        attr "value", "My Value"
    }
    contains "params", "auth", "Parameter", {
        id "parameter2"
        attr "key", "1111"
        attr "value", "My Value2"
    }
}