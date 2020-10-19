package ru.neoflex.nfcore.base.tag.impl;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.DiagnosticChain;
import org.eclipse.emf.ecore.EObject;
import ru.neoflex.nfcore.base.tag.Tag;
import ru.neoflex.nfcore.base.tag.util.TagValidator;

import java.util.Map;

public class TagValidatorExt extends TagValidator {
    @Override
    public boolean validateTag_IsValid(Tag tag, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (tag.getName() == null || tag.getName().equals(""))  {
            return validate(tag, diagnostics, context, "Tag name - must be set");
        } else if (tag.getName().contains(",")) {
            return validate(tag, diagnostics, context, "Tag name - shouldn't contain ','");
        }
        else {
            return false;
        }
    }

    private boolean validate(EObject validateEObject, DiagnosticChain diagnostics, Map<Object, Object> context, String message) {
        if (diagnostics != null) {
            Object[] newMessage = new Object[] {message, getObjectLabel(validateEObject, context)};
            Object[] data = new Object[] {validateEObject};
            diagnostics.add(createDiagnostic(
                    Diagnostic.ERROR,
                    DIAGNOSTIC_SOURCE,
                    0,
                    "_UI_GenericConstraint_diagnostic",
                    newMessage,
                    data,
                    context
            ));
        }
        return false;
    }
}
