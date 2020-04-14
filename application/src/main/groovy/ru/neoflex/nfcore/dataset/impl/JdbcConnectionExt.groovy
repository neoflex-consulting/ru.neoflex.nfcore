package ru.neoflex.nfcore.dataset.impl

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.base.util.DriverShim

import java.sql.Connection
import java.sql.DriverManager

class JdbcConnectionExt extends JdbcConnectionImpl {
    private static final Logger logger = LoggerFactory.getLogger(JdbcConnectionExt.class);

    Connection connect() {
        DriverShim.registerDriver(driver.driverClassName)
        Connection jdbcConnection = DriverManager.getConnection(url, userName, password)
        logger.info("Connected to " + url)
        return jdbcConnection
    }

}
