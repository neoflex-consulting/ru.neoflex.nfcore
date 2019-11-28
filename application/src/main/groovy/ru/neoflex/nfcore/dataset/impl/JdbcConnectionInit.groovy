package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.JdbcConnection

class JdbcConnectionInit {
    static def findOrCreateEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateJdbcConnection(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def jdbcConnection = DatasetFactory.eINSTANCE.createJdbcConnection()
            jdbcConnection.name = name
            jdbcConnection.url = "jdbc:postgresql://cloud.neoflex.ru:5432/test"
            jdbcConnection.userName = "postgres"
            jdbcConnection.password = "ne0f1ex"

            def jdbcDriver = findOrCreateEObject(DatasetPackage.Literals.JDBC_DRIVER, "JdbcDriverPostgresqlTest")
            jdbcConnection.setDriver(jdbcDriver)

            rs.resources.add(Context.current.store.createEObject(jdbcConnection))
        }
        return rs.resources.get(0).contents.get(0) as JdbcConnection
    }

    {
        recreateJdbcConnection("JdbcConnectionPostgresqlTest")
    }

    JdbcConnectionInit() {}
}
