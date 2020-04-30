package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.ecore.EClass
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.QueryType

class JdbcDatasetInit {

    private static final Logger logger = LoggerFactory.getLogger(DatasetPackageInit.class);

    static def findOrCreateEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def createJdbcDatasetInit(String name, String tableName, String schemaName, String connectionName) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def jdbcDataset = DatasetFactory.eINSTANCE.createJdbcDataset()
            jdbcDataset.name = name
            jdbcDataset.query = "SELECT * FROM " + schemaName + "." + tableName
            jdbcDataset.tableName = tableName
            jdbcDataset.schemaName = schemaName
            def connection = findOrCreateEObject(DatasetPackage.Literals.JDBC_CONNECTION, connectionName)
            jdbcDataset.setConnection(connection)
            rs.resources.add(Context.current.store.createEObject(jdbcDataset))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDataset
    }

    static def createJdbcDatasetQueryInit(String name, String tableName, String schemaName, String Query, String connectionName) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def jdbcDataset = DatasetFactory.eINSTANCE.createJdbcDataset()
            jdbcDataset.name = name
            jdbcDataset.query = Query
            jdbcDataset.tableName = tableName
            jdbcDataset.schemaName = schemaName
            def connection = findOrCreateEObject(DatasetPackage.Literals.JDBC_CONNECTION, connectionName)
            jdbcDataset.setConnection(connection)
            rs.resources.add(Context.current.store.createEObject(jdbcDataset))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDataset
    }

    static def createJdbcDatasetQueryTypeInit(String name, String Query, String connectionName) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def jdbcDataset = DatasetFactory.eINSTANCE.createJdbcDataset()
            jdbcDataset.name = name
            jdbcDataset.query = Query
            jdbcDataset.queryType = QueryType.USE_QUERY
            def connection = findOrCreateEObject(DatasetPackage.Literals.JDBC_CONNECTION, connectionName)
            jdbcDataset.setConnection(connection)
            rs.resources.add(Context.current.store.createEObject(jdbcDataset))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDataset
    }

    static def loadAllColumnsJdbcDatasetInit(String name) {
        try {
            def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                    .execute().resourceSet
            if (!rs.resources.empty) {
                def jdbcDataset = rs.resources.get(0).contents.get(0) as JdbcDataset
                if(jdbcDataset.connection && jdbcDataset.datasetColumn.size() == 0) {
                    print(jdbcDataset.connection.toString())
                    jdbcDataset.loadAllColumns()
                }
            }
        }
        catch (Throwable e) {
            logger.error("Can`t load all columns from JDBC Dataset ${name}: ${e.getMessage()}")
        }

    }

    JdbcDatasetInit() {}
}
