package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.JdbcDataset

class JdbcDatasetInit {
    static def findOrCreateEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateJdbcDatasetInit(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def jdbcDataset = DatasetFactory.eINSTANCE.createJdbcDataset()
            jdbcDataset.name = name
            jdbcDataset.query = "SELECT * FROM public.sse_workspace"
            jdbcDataset.tableName = "sse_workspace"
            jdbcDataset.schemaName = "public"
            def connection = findOrCreateEObject(DatasetPackage.Literals.JDBC_CONNECTION, "JdbcConnectionPostgresqlTest")
            jdbcDataset.setConnection(connection)
            rs.resources.add(Context.current.store.createEObject(jdbcDataset))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDataset
    }

    static def loadAllColumnsJdbcDatasetInit(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DATASET, [name: name])
                .execute().resourceSet
        if (!rs.resources.empty) {
            def jdbcDataset = rs.resources.get(0).contents.get(0) as JdbcDataset
            if(jdbcDataset.connection && jdbcDataset.datasetColumn.size() == 0) {
                jdbcDataset.loadAllColumns()
            }
        }
    }

    {
        recreateJdbcDatasetInit("JdbcDatasetTest")
        //loadAllColumnsJdbcDatasetInit("JdbcDatasetTest")
    }

    JdbcDatasetInit() {}
}
