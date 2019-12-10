package ru.neoflex.nfcore.dataset.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.Dataset
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DataType

import java.sql.Connection
import java.sql.DriverManager
//import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement

class JdbcDatasetExt extends JdbcDatasetImpl {

    @Override
    String runQuery() {
        ResultSet rs = connectionToDB()

        def result = []
        def columnDefs = []
        def columnCount = rs.metaData.columnCount

        //Add columns name as first row
        for (int i = 1; i <= columnCount; ++i) {
            def object = rs.metaData.getColumnName(i)
            def columnType = rs.metaData.getColumnTypeName(i)
            columnDefs.add([
                    field: object == null ? null : object.toString(),
                    type: object == null ? null : columnType.toString()
            ])
        }
        result.add([columnDefs: columnDefs])
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
        result.add([rowData: rowData])

        return JsonOutput.toJson(result)
    }

    @Override
    String loadAllColumns() {
        ResultSet resultSet = connectionToDB()
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetRef = Context.current.store.getRef(resource.resources)
                    def dataset = resource.resources.get(0).contents.get(0) as Dataset
                    def columnCount = resultSet.metaData.columnCount
                    if (columnCount > 0) {
                        for (int i = 1; i <= columnCount; ++i) {
                            def object = resultSet.metaData.getColumnName(i)
                            def columnType = resultSet.metaData.getColumnTypeName(i)

                            def datasetColumn = DatasetFactory.eINSTANCE.createDatasetColumn()
                            datasetColumn.name = object.toString()
                            datasetColumn.rdbmsDataType = columnType.toString()
                            datasetColumn.convertDataType = getConvertDataType(columnType.toString().toLowerCase())
                            dataset.datasetColumn.add(datasetColumn)
                        }
                        Context.current.store.updateEObject(datasetRef, dataset)
                        Context.current.store.commit("Entity was updated " + datasetRef)

                        return JsonOutput.toJson("Columns in entity " + dataset.name + " was loaded. Please, run function Reload.")
                    }
                    else {
                        return JsonOutput.toJson("Entity " + dataset.name + " was not updated.")
                    }
                }
            })
        }
    }

    @Override
    String deleteAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetRef = Context.current.store.getRef(resource.resources)
                    def dataset = resource.resources.get(0).contents.get(0) as Dataset
                    dataset.datasetColumn.clear()
                    Context.current.store.updateEObject(datasetRef, dataset)
                    Context.current.store.commit("Entity was updated " + datasetRef)

                    return JsonOutput.toJson("Columns in entity " + dataset.name + " was deleted. Please, run function Reload.")
                }
            })
        }
    }

    ResultSet connectionToDB() {
        try {
            Class.forName(getConnection().driver.driverClassName)
        } catch (ClassNotFoundException e) {
            System.out.println("JDBC Driver " + getConnection().driver.driverClassName + " is not found")
            e.printStackTrace()
            return
        }
        System.out.println("JDBC Driver successfully connected")
        Connection connection = null
        try {
            connection = DriverManager.getConnection(getConnection().url, getConnection().userName, getConnection().password)
        } catch (SQLException e) {
            System.out.println("Connection to database " + getConnection().url + " failed")
            e.printStackTrace()
            return
        }
        if (connection != null) {
            System.out.println("You successfully connected to database " + getConnection().url)
        }

        /*Execute query*/
        Statement st = connection.createStatement()
        ResultSet rs = st.executeQuery(query)
        return rs
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

}
