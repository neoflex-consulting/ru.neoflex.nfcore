package ru.neoflex.nfcore.base.util;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Logger;

class DriverShim implements Driver {
    private Driver driver;
    private static Map<String, Driver> drivers = new HashMap<>();

    public static void registerDriver(String className) throws SQLException {
        try {
            DriverManager.registerDriver(DriverShim.getDriver(className));
        } catch (ClassNotFoundException|IllegalAccessException|InstantiationException e) {
            throw new SQLException(e);
        }
    }

    private static synchronized Driver getDriver(String className) throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        try {
            return drivers.computeIfAbsent(className, s -> {
                try {
                    Driver driver = (Driver) Class.forName(className, true, Thread.currentThread().getContextClassLoader()).newInstance();
                    return new DriverShim(driver);
                } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            });
        }
        catch (RuntimeException e) {
            Throwable t = e.getCause();
            if (t instanceof ClassNotFoundException) throw (ClassNotFoundException) e.getCause();
            if (t instanceof InstantiationException) throw (InstantiationException) e.getCause();
            if (t instanceof IllegalAccessException) throw (IllegalAccessException) e.getCause();
        }
        return null;
    }

    DriverShim(Driver d) {
        this.driver = d;
    }
    public boolean acceptsURL(String u) throws SQLException {
        return this.driver.acceptsURL(u);
    }
    public Connection connect(String u, Properties p) throws SQLException {
        return this.driver.connect(u, p);
    }
    public int getMajorVersion() {
        return this.driver.getMajorVersion();
    }
    public int getMinorVersion() {
        return this.driver.getMinorVersion();
    }
    public DriverPropertyInfo[] getPropertyInfo(String u, Properties p) throws SQLException {
        return this.driver.getPropertyInfo(u, p);
    }
    public boolean jdbcCompliant() {
        return this.driver.jdbcCompliant();
    }

    @Override
    public Logger getParentLogger() throws SQLFeatureNotSupportedException {
        return this.driver.getParentLogger();
    }
}
