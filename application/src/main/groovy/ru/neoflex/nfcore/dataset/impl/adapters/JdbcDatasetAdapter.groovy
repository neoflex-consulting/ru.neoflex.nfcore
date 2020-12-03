package ru.neoflex.nfcore.dataset.impl.adapters

abstract class JdbcDatasetAdapter {
    String showAllTables() {
        return "SELECT table_schema, table_name FROM information_schema.tables ORDER BY table_schema, table_name ASC"
    }

    static JdbcDatasetAdapter getDBAdapter(String driver) {
        switch (driver) {
            case "org.postgresql.Driver":
                return DefaultJdbcDatasetAdapter.getInstance()
            case "oracle.jdbc.driver.OracleDriver":
                return OracleJdbcDatasetAdapter.getInstance()
            case "com.orientechnologies.orient.jdbc.OrientJdbcDriver":
                return OrientDBJdbcDatasetAdapter.getInstance()
            default:
                return DefaultJdbcDatasetAdapter.getInstance()
        }
    }
}


class OracleJdbcDatasetAdapter extends JdbcDatasetAdapter {
    private static final INSTANCE = new OrientDBJdbcDatasetAdapter()
    static getInstance() { return INSTANCE }

    @Override
    String showAllTables() {
        return "SELECT owner, table_name from all_tables"
    }
}

class OrientDBJdbcDatasetAdapter extends JdbcDatasetAdapter {
    private static final INSTANCE = new OrientDBJdbcDatasetAdapter()
    static getInstance() { return INSTANCE }

    @Override
    String showAllTables() {
        return "SELECT expand(classes) from metadata:schema"
    }
}

class DefaultJdbcDatasetAdapter extends JdbcDatasetAdapter {
    private static final INSTANCE = new DefaultJdbcDatasetAdapter()
    static getInstance() { return INSTANCE }
}


