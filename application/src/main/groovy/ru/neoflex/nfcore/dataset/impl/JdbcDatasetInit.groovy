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
            jdbcDataset.query = "SELECT * FROM public.person"
            def jdbcConnection = findOrCreateEObject(DatasetPackage.Literals.JDBC_CONNECTION, "JdbcConnectionPostgresqlTest")
            jdbcDataset.setConnection(jdbcConnection)
            rs.resources.add(Context.current.store.createEObject(jdbcDataset))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDataset
    }

    {
        recreateJdbcDatasetInit("JdbcDatasetTest")
    }

    JdbcDatasetInit() {}
}
