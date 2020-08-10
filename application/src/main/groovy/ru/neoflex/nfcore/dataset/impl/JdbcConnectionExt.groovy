package ru.neoflex.nfcore.dataset.impl

import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.base.util.DriverShim

import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet

class JdbcConnectionExt extends JdbcConnectionImpl {
    private static final Logger logger = LoggerFactory.getLogger(JdbcConnectionExt.class);

    Connection connect() {
        DriverShim.registerDriver(driver.driverClassName)
        Connection jdbcConnection = DriverManager.getConnection(url, userName, password)
        logger.info("Connected to " + url)
        return jdbcConnection
    }

    static List<Map<String, String>> select(Connection conn, String sql) {
        try {
            def st = conn.createStatement()
            try {
                def rs = st.executeQuery(sql)
                try {
                    return readResultSet(rs)
                }
                finally {
                    rs.close()
                }
            }
            finally {
                st.close()
            }
        }
        finally {
            conn.close()
        }
    }

    static List readResultSet(ResultSet rs) {
        def rawData = []
        def columnCount = rs.metaData.columnCount
        while (rs.next()) {
            def map = [:]
            for (int i = 1; i <= columnCount; ++i) {
                def object = rs.getObject(i)
                map["${rs.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
            }
            rawData.add(map)
        }
        return rawData
    }

    List<Map<String, String>> query(String sql) {
        def currentDB = ODatabaseRecordThreadLocal.instance().getIfDefined();
        try {
            def conn = connect()
            try {
                return select(conn, sql)
            }
            finally {
                conn.close()
            }
        }
        finally {
            if (currentDB != null) {
                ODatabaseRecordThreadLocal.instance().set(currentDB);
            }
        }
    }
}
