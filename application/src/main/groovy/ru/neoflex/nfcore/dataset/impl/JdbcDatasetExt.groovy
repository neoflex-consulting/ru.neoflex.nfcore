package ru.neoflex.nfcore.dataset.impl

import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal
import groovy.json.JsonOutput
import org.eclipse.emf.common.util.EList
import org.eclipse.emf.ecore.util.EcoreUtil
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.*
import ru.neoflex.nfcore.jdbcLoader.NamedParameterStatement
import ru.neoflex.nfcore.utils.JdbcUtils

import java.sql.Connection
import java.sql.ResultSet

class JdbcDatasetExt extends JdbcDatasetImpl {
    private static final Logger logger = LoggerFactory.getLogger(JdbcDatasetExt.class);

    @Override
    String runQueryDataset(EList<QueryParameter> parameters) {
        if (datasetColumn) {
            def currentDb = ODatabaseRecordThreadLocal.instance().getIfDefined();
            def currentDbNew = ODatabaseRecordThreadLocal.instance().getIfDefined();
            Connection jdbcConnection = null;
            ResultSet resultSet = null;
            NamedParameterStatement ps = null;
            def rowData = null
            try {
                try {
                    try {
                        jdbcConnection = (connection as JdbcConnectionExt).connect()
                        resultSet = getResultSet(jdbcConnection, false, parameters, ps)
                        currentDbNew = ODatabaseRecordThreadLocal.instance().getIfDefined();
                        if (currentDb != null && currentDbNew != null && currentDbNew.getURL() != currentDb.getURL()) {
                            ODatabaseRecordThreadLocal.instance().set(currentDb);
                        }
                        rowData = JdbcConnectionExt.readResultSet(resultSet)
                    } finally {
                        (resultSet) ? resultSet.close() : null
                    }
                } finally {
                    (ps) ? ps.close() : null
                }
            } finally {
                if (currentDb != null && currentDbNew != null && currentDbNew.getURL() == currentDb.getURL()) {
                    (jdbcConnection) ? jdbcConnection.close() : null
                }
                ODatabaseRecordThreadLocal.instance().set(currentDb);
            }
            return JsonOutput.toJson(rowData)
        } else {
            return JsonOutput.toJson("Please, run operation loadAllColumns in this object")
        }
    }

    @Override
    String loadAllColumns() {
        def resourceSet = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                .execute().resourceSet
        if (!resourceSet.resources.empty) {
            def currentDb = ODatabaseRecordThreadLocal.instance().getIfDefined();
            def currentDbNew = ODatabaseRecordThreadLocal.instance().getIfDefined();
            EcoreUtil.resolveAll(resourceSet)
            Connection jdbcConnection = null;
            ResultSet resultSet = null;
            NamedParameterStatement ps = null;
            try {
                try {
                    try {

                        jdbcConnection = (connection as JdbcConnectionExt).connect()
                        resultSet = getResultSet(jdbcConnection, false, null as EList<QueryParameter>, ps)
                        currentDbNew = ODatabaseRecordThreadLocal.instance().getIfDefined();
                        if (currentDb != null && currentDbNew != null && currentDbNew.getURL() != currentDb.getURL()) {
                            ODatabaseRecordThreadLocal.instance().set(currentDb);
                        }
                        def jdbcDatasetRef = Context.current.store.getRef(resourceSet.resources.get(0))
                        def jdbcDataset = resourceSet.resources.get(0).contents.get(0) as JdbcDataset

                        def columnCount = resultSet.metaData.columnCount
                        if (columnCount > 0) {
                            for (int i = 1; i <= columnCount; ++i) {
                                def object = resultSet.metaData.getColumnName(i)
                                def columnType = resultSet.metaData.getColumnTypeName(i)
                                def datasetColumn = DatasetFactory.eINSTANCE.createDatasetColumn()
                                datasetColumn.rdbmsDataType = columnType == null ? 'String' : columnType.toString()
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
                            return JsonOutput.toJson("Columns in entity " + jdbcDataset.name + " were created")
                        }
                    } finally {
                        (resultSet) ? resultSet.close() : null
                    }
                } finally {
                    (ps) ? ps.close() : null
                }
            } finally {
                if (currentDb != null && currentDbNew != null && currentDbNew.getURL() == currentDb.getURL()) {
                    (jdbcConnection) ? jdbcConnection.close() : null
                }
                ODatabaseRecordThreadLocal.instance().set(currentDb);
            }
        }
    }

    @Override
    String deleteAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resourceSet = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: this.name])
                        .execute().resourceSet
                if (!resourceSet.resources.empty) {
                    def jdbcDatasetRef = Context.current.store.getRef(resourceSet.resources.get(0))
                    def jdbcDataset = resourceSet.resources.get(0).contents.get(0) as JdbcDataset
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
        Connection jdbcConnection = null;
        ResultSet resultSet = null;
        NamedParameterStatement ps = null;
        def rowData = null
        try {
            try {
                try {
                    jdbcConnection = (connection as JdbcConnectionExt).connect()
                    resultSet = getResultSet(jdbcConnection, true, null as EList<QueryParameter>, ps)
                    rowData = JdbcConnectionExt.readResultSet(resultSet)
                } finally {
                    (resultSet) ? resultSet.close() : null
                }
            } finally {
                (ps) ? ps.close() : null
            }
        } finally {
            (jdbcConnection) ? jdbcConnection.close() : null
        }
        return JsonOutput.toJson(rowData)
    }

    ResultSet getResultSet(Connection jdbcConnection, boolean showAllTables, EList<QueryParameter> parameters, NamedParameterStatement ps) {
        /*Execute query*/
        String currentQuery = ""
        String currentQueryPostgresql = ""
        if (showAllTables) {
            currentQuery = "SELECT table_schema, table_name FROM information_schema.tables ORDER BY table_schema, table_name ASC"
        }
        else {
            if (queryType == QueryType.USE_TABLE_NAME) {
                currentQuery = "SELECT * FROM ${schemaName}.${tableName}"
            }
            else if (queryType == QueryType.USE_QUERY && parameters == null) {
                //Replace namedParameters
                currentQuery = "SELECT * FROM (${query.replaceAll(/:[а-яА-ЯA-Za-z0-9_]+/, "null")})"
                currentQueryPostgresql = "SELECT * FROM (${query.replaceAll(/:[а-яА-ЯA-Za-z0-9_]+/, "null")}) t"
            } else {
                currentQuery = "SELECT * FROM (${query})"
                currentQueryPostgresql = "SELECT * FROM (${query}) t"
            }
        }

        try {
            ps = new NamedParameterStatement(jdbcConnection, currentQuery);
            if (parameters && parameters.size() > 0 && currentQuery) {
                ps = JdbcUtils.getNamedParameterStatement(parameters, ps, currentQuery)
            }
            logger.info(currentQuery)
            return ps.executeQuery()
        } catch (e) {
            ps = new NamedParameterStatement(jdbcConnection, currentQueryPostgresql);
            if (parameters && parameters.size() > 0 && currentQueryPostgresql) {
                ps = JdbcUtils.getNamedParameterStatement(parameters, ps, currentQueryPostgresql)
            }
            logger.info(currentQueryPostgresql)
            return ps.executeQuery()
        }
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
