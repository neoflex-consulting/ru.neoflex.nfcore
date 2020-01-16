package ru.neoflex.nfcore.application.impl;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.DiagnosticChain;
import org.eclipse.emf.ecore.EObject;
import ru.neoflex.nfcore.application.DatasetGridView;
import ru.neoflex.nfcore.application.DatasetView;
import ru.neoflex.nfcore.application.util.ApplicationValidator;

import java.util.Map;

public class ApplicationValidatorExt extends ApplicationValidator {
    @Override
    public boolean validateDatasetView(DatasetView datasetView, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (datasetView.getDataset() == null) {
            return validate(datasetView, diagnostics, context, "datasetGrid - must be set");
        }
        if (datasetView.getName() == null) {
            return validate(datasetView, diagnostics, context, "name - must be set");
        }
        else {
            return false;
        }
    }

    @Override
    public boolean validateDatasetGridView_IsValid(DatasetGridView datasetGridView, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (datasetGridView.getDefaultDatasetGrid() == null) {
            return validate(datasetGridView, diagnostics, context, "defaultDatasetGrid - must be set");
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
