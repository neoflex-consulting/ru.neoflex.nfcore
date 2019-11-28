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
//        PreparedStatement ps = connection.createStatement()
        Statement st = connection.createStatement()
        ResultSet rs = st.executeQuery(query)

        def rows = []
        def columnCount = rs.metaData.columnCount

        //Add columns name as first row
        def row = []
        for (int i = 1; i <= columnCount; ++i) {
            def object = rs.metaData.getColumnName(i)
            row.add(object == null ? null : object.toString())
        }
        rows.add(row)

        //Add row with data
        while (rs.next()) {
            row = []
            for (int i = 1; i <= columnCount; ++i) {
                def object = rs.getObject(i)
                row.add(object == null ? null : object.toString())
            }
            rows.add(row)
        }
        return JsonOutput.toJson(rows)
    }
}

