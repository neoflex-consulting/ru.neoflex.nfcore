package ru.neoflex.nfcore.dataset.impl

import groovy.json.JsonOutput
import java.sql.Connection
import java.sql.DriverManager
//import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Statement

class JdbcDatasetExt extends JdbcDatasetImpl {

    @Override
    String runQuery() {
        /*Connection to DB*/
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

        def result = []
        def columnDefs = []
        def columnCount = rs.metaData.columnCount

        //Add columns name as first row
        for (int i = 1; i <= columnCount; ++i) {
            def object = rs.metaData.getColumnName(i)
            def columnType = rs.metaData.getColumnTypeName(i)
            columnDefs.add([
                    //headerName: object == null ? null : object.toString().substring(0,1).toUpperCase() + object.toString().substring(1),
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
}
