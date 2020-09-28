package ru.neoflex.nfcore.utils

import org.eclipse.emf.common.util.EList
import ru.neoflex.nfcore.dataset.DataType
import ru.neoflex.nfcore.dataset.QueryParameter
import ru.neoflex.nfcore.jdbcLoader.NamedParameterStatement

import java.sql.Date
import java.sql.Timestamp
import java.time.LocalDate
import java.time.LocalDateTime

class JdbcUtils {
    static NamedParameterStatement getNamedParameterStatement(EList<QueryParameter> parameters, NamedParameterStatement p, String query = "") {
        for (int i = 0; i <= parameters.size() - 1; ++i) {
            if (query.find(":${parameters[i].parameterName}") || query == "") {
                if (!parameters[i].parameterValue) {
                    p.setString(parameters[i].parameterName, null)
                }
                if (parameters[i].parameterValue == null && parameters[i].parameterDataType == DataType.DATE.getName()) {
                    p.setDate(parameters[i].parameterName, null)
                } else if (parameters[i].parameterValue == null) {
                    p.setObject(parameters[i].parameterName, null)
                } else if (parameters[i].parameterDataType == DataType.DATE.getName()) {
                    p.setDate(parameters[i].parameterName, Date.valueOf(LocalDate.parse(parameters[i].parameterValue, parameters[i].parameterDateFormat)))
                } else if (parameters[i].parameterDataType == DataType.TIMESTAMP.getName()) {
                    p.setTimestamp(parameters[i].parameterName, Timestamp.valueOf(LocalDateTime.parse(parameters[i].parameterValue, parameters[i].parameterTimestampFormat)))
                } else if (parameters[i].parameterDataType == DataType.INTEGER.getName()) {
                    p.setInt(parameters[i].parameterName, parameters[i].parameterValue.toInteger())
                } else {
                    p.setString(parameters[i].parameterName, parameters[i].parameterValue)
                }
            }
        }
        return p
    }
}
