package ru.neoflex.nfcore.dataset.impl

import com.sun.jmx.remote.util.ClassLogger
import groovy.json.JsonOutput
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder

import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DataType
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.QueryType

import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement

class JdbcDatasetExt extends JdbcDatasetImpl {

    @Override
    String runQueryDataset() {
        if (datasetColumn) {
            Connection jdbcConnection = connectionToDB()
            ResultSet resultSet = getResultSet(jdbcConnection, false)
            def columnCount = resultSet.metaData.columnCount
            def rowData = []
            while (resultSet.next()) {
                def map = [:]
                for (int i = 1; i <= columnCount; ++i) {
                    def object = resultSet.getObject(i)
                    map["${resultSet.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
                }
                rowData.add(map)
            }
            return JsonOutput.toJson(rowData)
        } else {
            return JsonOutput.toJson("Please, run operation loadAllColumns in this object")
        }
    }

    @Override
    String loadAllColumns() {
        Connection jdbcConnection = connectionToDB()
        ResultSet resultSet = getResultSet(jdbcConnection, false)
        return Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def jdbcDatasetRef = Context.current.store.getRef(resource.resources.get(0))
                    def jdbcDataset = resource.resources.get(0).contents.get(0) as JdbcDataset
                    def columnCount = resultSet.metaData.columnCount
                    if (columnCount > 0) {
                        for (int i = 1; i <= columnCount; ++i) {
                            def object = resultSet.metaData.getColumnName(i)
                            def columnType = resultSet.metaData.getColumnTypeName(i)
                            def datasetColumn = DatasetFactory.eINSTANCE.createDatasetColumn()
                            datasetColumn.rdbmsDataType = columnType.toString()
                            datasetColumn.convertDataType = getConvertDataType(columnType.toString().toLowerCase())
                            datasetColumn.name = object.toString()
                            jdbcDataset.datasetColumn.each { c->
                                if (c.name == object.toString()) {
                                    throw new IllegalArgumentException("Please, change your query. It has similar column`s name")
                                }
                            }
                            jdbcDataset.datasetColumn.add(datasetColumn)
                        }
                        Context.current.store.updateEObject(jdbcDatasetRef, jdbcDataset)
                        Context.current.store.commit("Entity was updated " + jdbcDatasetRef)
                        return JsonOutput.toJson("Columns in entity " + jdbcDataset.name + " were loaded")
                    }
                    else {
                        return JsonOutput.toJson("Entity " + jdbcDataset.name + " was not updated")
                    }
                }
            }
        })
    }

    @Override
    String deleteAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def jdbcDatasetRef = Context.current.store.getRef(resource.resources.get(0))
                    def jdbcDataset = resource.resources.get(0).contents.get(0) as JdbcDataset
                    jdbcDataset.datasetColumn.clear()
                    Context.current.store.updateEObject(jdbcDatasetRef, jdbcDataset)
                    Context.current.store.commit("Entity was updated " + jdbcDatasetRef)
                    return JsonOutput.toJson("Columns in entity " + jdbcDataset.name + " were deleted")
                }
            }
        })
    }

    @Override
    String showAllTables() {
        Connection jdbcConnection = connectionToDB()
        ResultSet resultSet = getResultSet(jdbcConnection, true)
        def columnCount = resultSet.metaData.columnCount
        def rowData = []
        while (resultSet.next()) {
            def map = [:]
            for (int i = 1; i <= columnCount; ++i) {
                def object = resultSet.getObject(i)
                map["${resultSet.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
            }
            rowData.add(map)
        }
        return JsonOutput.toJson(rowData)
    }

    Connection connectionToDB() {
        try {
            Class.forName(connection.driver.driverClassName)
        } catch (ClassNotFoundException e) {
            logger.info("connectionToDB", "Driver " + connection.driver.driverClassName + " is not found")
            e.printStackTrace()
            return
        }
        logger.info("connectionToDB", "Driver successfully connected")
        Connection jdbcConnection
        try {
            jdbcConnection = DriverManager.getConnection(connection.url, connection.userName, connection.password)
        } catch (SQLException e) {
            logger.info("connectionToDB", "Connection to database " + connection.url + " failed")
            e.printStackTrace()
            return
        }
        if (jdbcConnection != null) {
            logger.info("connectionToDB", "You successfully connected to database " + connection.url)
        }
        return jdbcConnection
    }

    ResultSet getResultSet(Connection jdbcConnection, boolean showAllTables) {
        /*Execute query*/
        String currentQuery = ""
        if (showAllTables) {
            currentQuery = "SELECT table_schema, table_name FROM information_schema.tables ORDER BY table_schema, table_name ASC"
        }
        else {
            if (queryType == QueryType.USE_TABLE_NAME) {
                currentQuery = "SELECT * FROM ${schemaName}.${tableName}"
            }
            else if (queryType == QueryType.USE_QUERY) {
                currentQuery = "SELECT * FROM (${query}) t"
            }
        }
        logger.info("connectionToDB", currentQuery)
        Statement st = jdbcConnection.createStatement()
        ResultSet resultSet = st.executeQuery(currentQuery)
        return resultSet
    }

    Object getConvertDataType(String rdbmsDataType) {
        if (rdbmsDataType.empty){return DataType.UNDEFINED}
        else if (rdbmsDataType.indexOf('boolean') != -1) {return DataType.BOOLEAN}

        else if (rdbmsDataType.indexOf('int') != -1 ||
                rdbmsDataType.indexOf('number') != -1) {return DataType.INTEGER}

        else if (rdbmsDataType.indexOf('float') != -1 ||
                rdbmsDataType.indexOf('real') != -1 ||
                rdbmsDataType.indexOf('numeric') != -1) {return DataType.DECIMAL}

        else if (rdbmsDataType.indexOf('date') != -1 ||
                rdbmsDataType.indexOf('time') != -1) {return DataType.DATE}

        else if (rdbmsDataType.indexOf('timestamp') != -1) {return DataType.TIMESTAMP}

        else {return DataType.STRING}
    }

    private static final ClassLogger logger =
            new ClassLogger("javax.management.remote.misc", "EnvHelp")
}
