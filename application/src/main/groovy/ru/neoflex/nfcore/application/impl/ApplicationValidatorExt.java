package ru.neoflex.nfcore.application.impl;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.DiagnosticChain;
import org.eclipse.emf.ecore.EObject;
import ru.neoflex.nfcore.application.*;
import ru.neoflex.nfcore.application.util.ApplicationValidator;

import java.util.Map;

public class ApplicationValidatorExt extends ApplicationValidator {

    @Override
    public boolean validateUserComponent_IsValid(UserComponent userComponent, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (userComponent.getComponentClassName() == null) {
            return validate(userComponent, diagnostics, context, "componentClassName - must be set");
        }
        else {
            return false;
        }
    }

    @Override
    public boolean validateAppModule_IsValid(AppModule appModule, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (appModule.isUseParentReferenceTree() && appModule.getReferenceTree() != null) {
            return validate(appModule, diagnostics, context, "field useParentReferenceTree - must be set 'false'");
        }
        else {
            return false;
        }
    }

    @Override
    public boolean validateApplication_IsValid(Application application, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (application.isUseParentReferenceTree() && application.getReferenceTree() != null) {
            return validate(application, diagnostics, context, "field useParentReferenceTree - must be set 'false'");
        }
        else {
            return false;
        }
    }

    @Override
    public boolean validateViewElement_IsValid(ViewElement viewElement, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (viewElement.getName() == null) {
            return validate(viewElement, diagnostics, context, "name - must be set");
        }
        else {
            return false;
        }
    }

    @Override
    public boolean validateDatasetView(DatasetView datasetView, DiagnosticChain diagnostics, Map<Object, Object> context) {
        return false;
    }

    @Override
    public boolean validateTreeNode_IsValid(TreeNode treeNode, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (treeNode.getName() == null) {
            return validate(treeNode, diagnostics, context, "name - must be set");
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
