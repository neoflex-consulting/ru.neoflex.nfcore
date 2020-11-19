package ru.neoflex.nfcore.application.impl;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.DiagnosticChain;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import ru.neoflex.nfcore.application.*;
import ru.neoflex.nfcore.application.util.ApplicationValidator;
import ru.neoflex.nfcore.utils.Utils;

import java.util.Map;

public class ApplicationValidatorExt extends ApplicationValidator {

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
        boolean testResult = false;
        EList<Resource> allApplications = (EList<Resource>) Utils.findAllEClass(ApplicationPackage.Literals.APPLICATION);
        for (Resource resource : allApplications) {
            EList<Application> apps = (EList<Application>) (EList<?>) resource.getContents();
            if (application.getHeaderOrder() != null
                    && apps.get(0).getHeaderOrder() != null
                    && !apps.get(0).getName().equals(application.getName())
                    && apps.get(0).getHeaderOrder().equals(application.getHeaderOrder())) {
                testResult = validate(application, diagnostics, context, "two applications cant have same headerOrder application " + apps.get(0).getName() + " and " + application.getName());
            }
        }
        if (application.isUseParentReferenceTree() && application.getReferenceTree() != null) {
            return validate(application, diagnostics, context, "field useParentReferenceTree - must be set 'false'");
        }
        return testResult;
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
    public boolean validateCssClass_IsValid(CssClass cssClass, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (cssClass.getName() == null || cssClass.getName().equals("")) {
            return validate(cssClass, diagnostics, context, "field name - must be set");
        }
        if (cssClass.getStyle() == null || cssClass.getStyle().equals("")) {
            return validate(cssClass, diagnostics, context, "field style - must be set");
        }
        else {
            return false;
        }
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
