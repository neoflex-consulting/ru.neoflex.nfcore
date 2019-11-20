package ru.neoflex.nfcore.base.auth.impl

import org.eclipse.emf.common.util.Diagnostic
import org.eclipse.emf.common.util.DiagnosticChain
import ru.neoflex.nfcore.base.auth.Authorization
import ru.neoflex.nfcore.base.auth.util.AuthValidator

class AuthValidatorExt extends AuthValidator {
    @Override
    boolean validateAuthorization_IsValid(Authorization authorization, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (authorization.name == null || authorization.name.length() < 3) {
            if (diagnostics != null) {
                diagnostics.add(createDiagnostic(
                        Diagnostic.ERROR,
                        DIAGNOSTIC_SOURCE,
                        0,
                        "_UI_GenericConstraint_diagnostic",
                        ["IsValid", getObjectLabel(authorization, context)] as Object[],
                        [authorization] as Object[],
                        context
                ));
            }
            return false;
        }
        return true;
    }
}
