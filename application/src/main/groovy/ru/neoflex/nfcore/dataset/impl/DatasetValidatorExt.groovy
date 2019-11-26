package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.common.util.Diagnostic
import org.eclipse.emf.common.util.DiagnosticChain
import ru.neoflex.nfcore.dataset.JdbcDriver
import ru.neoflex.nfcore.dataset.JdbcConnection
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.ValueType
import ru.neoflex.nfcore.dataset.Dataset
import ru.neoflex.nfcore.dataset.util.DatasetValidator

class DatasetValidatorExt extends DatasetValidator {
    @Override
    boolean validateJdbcDriver_IsValid(JdbcDriver jdbcDriver, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcDriver.name == null || jdbcDriver.name.length() < 3) {
            return validate(diagnostics, context, "name - must contain more than two characters")
        }
        if (jdbcDriver.driverClassName == null || jdbcDriver.driverClassName.length() == 0) {
            return validate(diagnostics, context, "driverClassName - must be set")
        }
    }

    @Override
    boolean validateJdbcConnection_IsValid(JdbcConnection jdbcConnection, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcConnection.name == null || jdbcConnection.name.length() < 3) {
            return validate(diagnostics, context, "name - must contain more than two characters")
        }
        if (jdbcConnection.url == null || jdbcConnection.url.length() == 0) {
            return validate(diagnostics, context, "url - must be set")
        }
        if (jdbcConnection.userName == null || jdbcConnection.userName.length() == 0) {
            return validate(diagnostics, context, "userName - must be set")
        }
        if (jdbcConnection.password == null || jdbcConnection.password.length() == 0) {
            return validate(diagnostics, context, "password - must be set")
        }
    }

    @Override
    boolean validateDataset_IsValid(Dataset dataset, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (dataset.name == null || dataset.name.length() < 3) {
            return validate(diagnostics, context, "name - must contain more than two characters")
        }
    }

    @Override
    boolean validateJdbcDataset_IsValid(JdbcDataset jdbcDataset, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (jdbcDataset.query == null || jdbcDataset.query.length() == 0) {
            return validate(diagnostics, context, "query - must be set")
        }
    }

    @Override
    boolean validateValueType_IsValid(ValueType valueType, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (valueType.name == null || valueType.name.length() < 3) {
            return validate(diagnostics, context, "name - must contain more than two characters")
        }
        if (valueType.defaultValue == null || valueType.defaultValue.length() == 0) {
            return validate(diagnostics, context, "defaultValue - must be set")
        }
        if (valueType.dataType.toString() == "UNDEFINED") {
            return validate(diagnostics, context, "dataType - must be set")
        }
        if (valueType.domain != null && valueType.domain.dataType.toString() != valueType.dataType.toString()) {
            return validate(diagnostics, context, "domain dataType - must be equal field dataType")
        }
    }

    private boolean validate(DiagnosticChain diagnostics, Map<Object, Object> context, String message) {
        if (diagnostics != null) {
            diagnostics.add(createDiagnostic(
                    Diagnostic.ERROR,
                    DIAGNOSTIC_SOURCE,
                    0,
                    message,
                    null,
                    null,
                    null
            ))
        }
        return false
    }
}
