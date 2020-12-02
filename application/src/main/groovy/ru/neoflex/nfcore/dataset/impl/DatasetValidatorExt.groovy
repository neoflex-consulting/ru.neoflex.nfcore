package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.common.util.Diagnostic
import org.eclipse.emf.common.util.DiagnosticChain
import org.eclipse.emf.ecore.EObject
import ru.neoflex.nfcore.dataset.*
import ru.neoflex.nfcore.dataset.util.DatasetValidator
import ru.neoflex.nfcore.utils.Utils

class DatasetValidatorExt extends DatasetValidator {
    @Override
    boolean validateJdbcDriver_IsValid(JdbcDriver jdbcDriver, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcDriver.name == null || jdbcDriver.name.length() < 3) {
            return validate(jdbcDriver, diagnostics, context, "name - must contain more than two characters")
        }
        if (jdbcDriver.driverClassName == null || jdbcDriver.driverClassName.length() == 0) {
            return validate(jdbcDriver, diagnostics, context, "driverClassName - must be set")
        }
    }

    @Override
    boolean validateJdbcConnection_IsValid(JdbcConnection jdbcConnection, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcConnection.name == null || jdbcConnection.name.length() < 3) {
            return validate(jdbcConnection, diagnostics, context, "name - must contain more than two characters")
        }
        if (jdbcConnection.url == null || jdbcConnection.url.length() == 0) {
            return validate(jdbcConnection, diagnostics, context, "url - must be set")
        }
        if (jdbcConnection.userName == null || jdbcConnection.userName.length() == 0) {
            return validate(jdbcConnection, diagnostics, context, "userName - must be set")
        }
        if (jdbcConnection.password == null || jdbcConnection.password.length() == 0) {
            return validate(jdbcConnection, diagnostics, context, "password - must be set")
        }
    }

    @Override
    boolean validateJdbcDataset_IsValid(JdbcDataset jdbcDataset, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcDataset.queryType == QueryType.USE_QUERY && (jdbcDataset.query == null || jdbcDataset.query.length() == 0)) {
            return validate(jdbcDataset, diagnostics, context, "query - must be set")
        }
        if (jdbcDataset.queryType == QueryType.USE_TABLE_NAME && (jdbcDataset.tableName == null || jdbcDataset.tableName.length() == 0)) {
            return validate(jdbcDataset, diagnostics, context, "tableName - must be set")
        }
    }

    @Override
    boolean validateDatasetComponent_IsValid(DatasetComponent datasetComponent, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (datasetComponent.dataset != null && datasetComponent.access != Access.DEFAULT) {
            def allDatasetComponent = Utils.findAllEClass(DatasetPackage.Literals.DATASET_COMPONENT);
            if (allDatasetComponent != null && allDatasetComponent.size() != 0) {
                def currentDatasetComponent = []
                try {
                    for (int i = 0; i < allDatasetComponent.size(); i++) {
                        if (allDatasetComponent[i].contents[0].metaClass.getTheClass().name.indexOf('DatasetComponent') != -1
                                && allDatasetComponent[i].contents[0].dataset.name == datasetComponent.dataset.name) {
                            currentDatasetComponent.add(allDatasetComponent[i])
                        }
                    }
                }
                catch (Throwable e) {}
                if (currentDatasetComponent.size() == 0 ||
                        (currentDatasetComponent.size() == 1 && currentDatasetComponent.contents[0].get(0).access != Access.DEFAULT)
                ) {
                    return validate(datasetComponent, diagnostics, context, "access - must be set 'Default' ")
                }
            }
        }
        if ((datasetComponent.insertQuery || datasetComponent.deleteQuery || datasetComponent.updateQuery) && datasetComponent.dataset instanceof GroovyDataset) {
            return validate(datasetComponent, diagnostics, context, "GroovyDataset can't have DML operations")
        }
    }

    private boolean validate(EObject validateEObject, DiagnosticChain diagnostics, Map<Object, Object> context, String message) {
        if (diagnostics != null) {
            diagnostics.add(createDiagnostic(
                    Diagnostic.ERROR,
                    DIAGNOSTIC_SOURCE,
                    0,
                    "_UI_GenericConstraint_diagnostic",
                    [message, getObjectLabel(validateEObject, context)] as Object[],
                    [validateEObject] as Object[],
                    context
            ))
        }
        return false
    }
}
