package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.ecore.EObject
import org.springframework.security.crypto.password.PasswordEncoder
import ru.neoflex.nfcore.base.auth.AuthPackage
import ru.neoflex.nfcore.base.auth.Authenticator
import ru.neoflex.nfcore.base.auth.PasswordAuthenticator
import ru.neoflex.nfcore.base.auth.User

class UserInit extends UserImpl {

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
}
