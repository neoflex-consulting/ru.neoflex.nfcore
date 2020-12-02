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
import ru.neoflex.nfcore.dataset.impl.adapters.JdbcDatasetAdapter
import ru.neoflex.nfcore.jdbcLoader.NamedParameterStatement
import ru.neoflex.nfcore.utils.JdbcUtils
import org.eclipse.emf.common.util.ECollections

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
                        resultSet = getResultSet(jdbcConnection, parameters, ps)
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
                        resultSet = getResultSet(jdbcConnection, null as EList<QueryParameter>, ps)
                        currentDbNew = ODatabaseRecordThreadLocal.instance().getIfDefined();
                        if (currentDb != null && currentDbNew != null && currentDbNew.getURL() != currentDb.getURL()) {
                            ODatabaseRecordThreadLocal.instance().set(currentDb);
                        }
                        def resource = resourceSet.resources.get(0);
                        def jdbcDataset = resource.contents.get(0) as JdbcDataset
                        def labels = []
                        def skippedColumns = ""
                        if (resultSet.metaData.columnCount > 0) {
                            for (int i = 1; i <= resultSet.metaData.columnCount; ++i) {
                                def columnName = resultSet.metaData.getColumnLabel(i).toString()
                                labels.push(columnName)
                                if (jdbcDataset.datasetColumn.find{c-> c.name == columnName} != null) {
                                    skippedColumns += "\nExisting column ${columnName} skipped"
                                } else {
                                    def columnType = resultSet.metaData.getColumnTypeName(i)
                                    def datasetColumn = DatasetFactory.eINSTANCE.createDatasetColumn()
                                    datasetColumn.rdbmsDataType = columnType == null ? 'String' : columnType.toString()
                                    datasetColumn.convertDataType = getConvertDataType(columnType.toString().toLowerCase())
                                    datasetColumn.name = columnName
                                    jdbcDataset.datasetColumn.add(datasetColumn)
                                }
                            }
                            //remove all non-query columns
                            jdbcDataset.datasetColumn.removeAll(jdbcDataset.datasetColumn
                                    .stream()
                                    .filter({ c -> (labels.find { l -> l == c.name} == null) })
                                    .findAll())
                            //Sort as query field order
                            ECollections.sort(jdbcDataset.datasetColumn, Comparator.comparing{obj-> labels.reverse().indexOf((obj as DatasetColumnImpl).name)})
                            //saving resource to prevent missing ref in datasetComponent
                            Context.current.store.saveResource(resource)
                            return JsonOutput.toJson("Columns in entity " + jdbcDataset.name + " were created${skippedColumns != "" ? skippedColumns : ""}")
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
        def currentDb = ODatabaseRecordThreadLocal.instance().getIfDefined();
        Connection jdbcConnection = (connection as JdbcConnectionExt).connect()
        //change to current thread
        ODatabaseRecordThreadLocal.instance().set(ODatabaseRecordThreadLocal.instance().getIfDefined());
        def rowData = null
        try {
            def stmt = jdbcConnection.createStatement()
            try {
                def resultSet = jdbcConnection.createStatement().executeQuery(JdbcDatasetAdapter.getDBAdapter(connection.getDriver().getDriverClassName()).showAllTables())
                logger.info(JdbcDatasetAdapter.getDBAdapter(connection.getDriver().getDriverClassName()).showAllTables())
                try {
                    rowData = JdbcConnectionExt.readResultSet(resultSet)
                } finally {
                    resultSet.close()
                }
            } finally {
                stmt.close()
            }
        } finally {
            jdbcConnection.close()
            //restore db
            ODatabaseRecordThreadLocal.instance().set(currentDb);
        }
        return JsonOutput.toJson(rowData)
    }

    ResultSet getResultSet(Connection jdbcConnection, EList<QueryParameter> parameters, NamedParameterStatement ps) {
        /*Execute query*/
        String currentQuery = ""
        if (queryType == QueryType.USE_TABLE_NAME) {
            currentQuery = "SELECT * FROM ${schemaName == "" ? tableName : schemaName+"."+tableName}"
        }
        else if (queryType == QueryType.USE_QUERY && parameters == null) {
            //Replace namedParameters
            currentQuery = "${query.replaceAll(/:[а-яА-ЯA-Za-z0-9_]+/, "null")}"
        } else {
            currentQuery = "${query}"
        }
        ps = new NamedParameterStatement(jdbcConnection, currentQuery);
        if (parameters && parameters.size() > 0 && currentQuery) {
            ps = JdbcUtils.getNamedParameterStatement(parameters, ps, currentQuery)
        }
        logger.info(currentQuery)
        return ps.executeQuery()
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
