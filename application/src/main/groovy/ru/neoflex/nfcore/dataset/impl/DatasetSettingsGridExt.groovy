package ru.neoflex.nfcore.dataset.impl

import com.sun.jmx.remote.util.ClassLogger
import groovy.json.JsonOutput
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DataType
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DatasetSettingsGrid
import ru.neoflex.nfcore.dataset.Filter
import ru.neoflex.nfcore.dataset.Operations

import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement

class DatasetSettingsGridExt extends DatasetSettingsGridImpl {

    @Override
    String createAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources[0])
                    def datasetSettingsGrid = resource.resources.get(0).contents.get(0) as DatasetSettingsGrid
                    if (datasetSettingsGrid.dataset.datasetColumn != null) {
                        def columns = datasetSettingsGrid.dataset.datasetColumn
                        if (columns != []) {
                            for (int i = 0; i <= columns.size() - 1; ++i) {
                                def rdbmsColumn = DatasetFactory.eINSTANCE.createRdbmsColumn()
                                rdbmsColumn.name = columns[i].name
                                rdbmsColumn.datasetColumn = columns[i]
                                def typography = ApplicationFactory.eINSTANCE.createTypography()
                                typography.name = columns[i].name
                                rdbmsColumn.headerName = typography
                                rdbmsColumn.headerTooltip = "type: " + columns[i].convertDataType
                                rdbmsColumn.filter = columns[i].convertDataType == DataType.DATE || columns[i].convertDataType == DataType.TIMESTAMP
                                        ? Filter.DATE_COLUMN_FILTER :
                                        columns[i].convertDataType == DataType.INTEGER || columns[i].convertDataType == DataType.DECIMAL
                                                ? Filter.NUMBER_COLUMN_FILTER : Filter.TEXT_COLUMN_FILTER
                                datasetSettingsGrid.column.each { c->
                                    if (c.name == columns[i].name.toString()) {
                                        throw new IllegalArgumentException("Please, change your query in Dataset. It has similar column`s name")
                                    }
                                }
                                datasetSettingsGrid.column.add(rdbmsColumn)
                            }
                            Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                            Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                            return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were created")
                        }
                    }
                    return JsonOutput.toJson("Settings 'dataset' don`t specified OR settings 'dataset' contain any columns")
                }
            }
        })
    }

    @Override
    String deleteAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources.get(0))
                    def datasetSettingsGrid = resource.resources.get(0).contents.get(0) as DatasetSettingsGrid
                    datasetSettingsGrid.column.clear()
                    Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                    Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                    return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were deleted")
                }
            }
        })
    }

    @Override
    String runQueryDatasetSettings() {
        if (column) {
            ResultSet rs = connectionToDB()
            def columnCount = rs.metaData.columnCount
            def rowData = []
            while (rs.next()) {
                def map = [:]
                for (int i = 1; i <= columnCount; ++i) {
                    def object = rs.getObject(i)
                    map["${rs.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
                }
                rowData.add(map)
            }
            return JsonOutput.toJson(rowData)
        }
        else {
            throw new IllegalArgumentException("Please created columns in this object.")
        }
    }


    ResultSet connectionToDB() {
        try {
            Class.forName(dataset.connection.driver.driverClassName)
        } catch (ClassNotFoundException e) {
            logger.info("connectionToDB", "Driver " + dataset.connection.driver.driverClassName + " is not found")
            e.printStackTrace()
            return
        }
        logger.info("connectionToDB", "Driver successfully connected")
        Connection jdbcConnection
        try {
            jdbcConnection = DriverManager.getConnection(dataset.connection.url, dataset.connection.userName, dataset.connection.password)
        } catch (SQLException e) {
            logger.info("connectionToDB", "Connection to database " + dataset.connection.url + " failed")
            e.printStackTrace()
            return
        }
        if (jdbcConnection != null) {
            logger.info("connectionToDB", "You successfully connected to database " + dataset.connection.url)
        }

        /*Execute query*/
        def queryColumns = []
        if (column != []) {
            for (int i = 0; i <= column.size() - 1; ++i) {
                if (column[i].class.toString().toLowerCase().contains('rdbms')) {
                    if (queryColumns.contains("${column[i].datasetColumn.name}")) {
                        throw new IllegalArgumentException("Please, change your query in Dataset. It has similar column`s name")
                    } else {
                        queryColumns.add("\"${column[i].datasetColumn.name}\"")
                    }
                } else {
                    def valueCustomColumn
                    if (column[i].customColumnExpression == null || column[i].customColumnExpression == "" && column[i].defaultValue != null && column[i].defaultValue != "") {
                        valueCustomColumn = column[i].defaultValue
                    } else if (column[i].customColumnExpression == null || column[i].customColumnExpression == "" && column[i].defaultValue == null ||  column[i].defaultValue == "") {
                        valueCustomColumn = null
                    } else {
                        valueCustomColumn = column[i].customColumnExpression
                    }

                    if (queryColumns.contains(" \"${column[i].headerName.name}\"")) {
                        throw new IllegalArgumentException("Please, change headerNames in this object. It has similar names")
                    } else {
                        queryColumns.add(valueCustomColumn + " \"${column[i].headerName.name}\"")
                    }
                }
            }
        }

        def serverFilters = []
        if (serverFilter) {
            for (int i = 0; i <= serverFilter.size() - 1; ++i) {
                if (serverFilter[i].enable) {
                    def operator = getConvertOperator(serverFilter[i].operation.toString().toLowerCase())
                    if (operator == 'LIKE') {
                        serverFilters.add(
                                "LOWER(CAST(t.${serverFilter[i].datasetColumn.name} AS TEXT)) ${operator} LOWER('${serverFilter[i].value}') OR " +
                                        "LOWER(CAST(t.${serverFilter[i].datasetColumn.name} AS TEXT)) ${operator} LOWER('%${serverFilter[i].value}') OR " +
                                        "LOWER(CAST(t.${serverFilter[i].datasetColumn.name} AS TEXT)) ${operator} LOWER('${serverFilter[i].value}%') OR " +
                                        "LOWER(CAST(t.${serverFilter[i].datasetColumn.name} AS TEXT)) ${operator} LOWER('%${serverFilter[i].value}%')"
                        )
                    } else {
                        serverFilters.add("t.${serverFilter[i].datasetColumn.name} ${operator} ${serverFilter[i].value}")
                    }
                }
            }
        }

        String currentQuery
        if (serverFilters) {
            currentQuery = "SELECT ${queryColumns.join(', ')} FROM (${dataset.query}) t" +
                    " WHERE ${serverFilters.join(' AND ')}"
            logger.info("connectionToDB", currentQuery)

        }
        else {
            currentQuery = "SELECT ${queryColumns.join(', ')} FROM (${dataset.query}) t"
            logger.info("connectionToDB", currentQuery)
        }

        Statement st = jdbcConnection.createStatement()
        ResultSet rs = st.executeQuery(currentQuery)
        return rs
    }

    String getConvertOperator(String operator) {
        if (operator == Operations.LESS_THAN.toString().toLowerCase()) {return '<'}
        else if (operator == Operations.LESS_THEN_OR_EQUAL_TO.toString().toLowerCase()) {return '<='}
        else if (operator== Operations.EQUAL_TO.toString().toLowerCase()) {return '='}
        else if (operator == Operations.GREATER_THAN.toString().toLowerCase()) {return '>'}
        else if (operator == Operations.GREATER_THEN_OR_EQUAL_TO.toString().toLowerCase()) {return '>='}
        else if (operator == Operations.NOT_EQUAL.toString().toLowerCase()) {return '!='}
        else if (operator == Operations.INCLUDE_IN.toString().toLowerCase()) {return 'LIKE'}
    }

    private static final ClassLogger logger =
            new ClassLogger("javax.management.remote.misc", "EnvHelp")
}
