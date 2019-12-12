package ru.neoflex.nfcore.dataset.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DatasetSettingsGrid
import ru.neoflex.nfcore.dataset.Operations

import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement

class DatasetSettingsGridExt extends DatasetSettingsGridImpl {

    @Override
    String createAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources)
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
                                datasetSettingsGrid.column.add(rdbmsColumn)
                            }
                            Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                            Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                            return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were created")
                        }
                    }
                    return JsonOutput.toJson("Settings 'dataset' don`t specified OR settings 'dataset' contain any columns")
                }
            })
        }
    }

    @Override
    String deleteAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources)
                    def datasetSettingsGrid = resource.resources.get(0).contents.get(0) as DatasetSettingsGrid
                    datasetSettingsGrid.column.clear()
                    Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                    Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                    return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were deleted")
                }
            })
        }
    }

    @Override
    String runQueryWithServerFilters() {
        ResultSet rs = connectionToDB()

        def result = []
        //def columnDefs = []
        def columnCount = rs.metaData.columnCount

        //Add columns name as first row
//        for (int i = 1; i <= columnCount; ++i) {
//            def object = rs.metaData.getColumnName(i)
//            def columnType = rs.metaData.getColumnTypeName(i)
//            columnDefs.add([
//                    field: object == null ? null : object.toString(),
//                    type: object == null ? null : columnType.toString()
//            ])
//        }
//        result.add([columnDefs: columnDefs])
        //Add row with data
        def rowData = []
        while (rs.next()) {
            def map = [:]
            for (int i = 1; i <= columnCount; ++i) {
                def object = rs.getObject(i)
                map["${rs.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
            }
            rowData.add(map)
        }
        result.add(rowData)

        return JsonOutput.toJson(rowData)
    }

    ResultSet connectionToDB() {
        try {
            Class.forName(dataset.connection.driver.driverClassName)
        } catch (ClassNotFoundException e) {
            System.out.println("Driver " + dataset.connection.driver.driverClassName + " is not found")
            e.printStackTrace()
            return
        }
        System.out.println("Driver successfully connected")
        Connection jdbcConnection = null
        try {
            jdbcConnection = DriverManager.getConnection(dataset.connection.url, dataset.connection.userName, dataset.connection.password)
        } catch (SQLException e) {
            System.out.println("Connection to database " + dataset.connection.url + " failed")
            e.printStackTrace()
            return
        }
        if (jdbcConnection != null) {
            System.out.println("You successfully connected to database " + dataset.connection.url)
        }

        /*Execute query*/
        String operator = getConvertOperator(serverFilter[0].operation.toString().toLowerCase())

        String currentQuery =
                "SELECT * FROM ${dataset.schemaName}.${dataset.tableName} WHERE ${serverFilter[0].datasetColumn.name} ${operator} ${serverFilter[0].value}"
//                "SELECT * FROM " + dataset.schemaName + "." + dataset.tableName + " WHERE " +
//                        serverFilter[0].datasetColumn.name + " " +
//                        operator + " " + serverFilter[0].value
        Statement st = jdbcConnection.createStatement()
        ResultSet rs = st.executeQuery(currentQuery)
        return rs
    }
//на LIKE нужны кавычки
    String getConvertOperator(String operator) {
        if (operator == Operations.LESS_THAN.toString().toLowerCase()) {return '<'}
        else if (operator == Operations.LESS_THEN_OR_EQUAL_TO.toString().toLowerCase()) {return '<='}
        else if (operator== Operations.EQUAL_TO.toString().toLowerCase()) {return '='}
        else if (operator == Operations.GREATER_THAN.toString().toLowerCase()) {return '>'}
        else if (operator == Operations.GREATER_THEN_OR_EQUAL_TO.toString().toLowerCase()) {return '>='}
        else if (operator == Operations.NOT_EQUAL.toString().toLowerCase()) {return '!='}
        else if (operator == Operations.INCLUDE_IN.toString().toLowerCase()) {return 'LIKE'}
    }
}
