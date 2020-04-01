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

    static def createConnection(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def сonnection = DatasetFactory.eINSTANCE.createJdbcConnection()
            сonnection.name = name
            сonnection.url = "jdbc:postgresql://cloud.neoflex.ru:5432/teneodev"
            сonnection.userName = "postgres"
            сonnection.password = "ne0f1ex"

            def driver = findOrCreateEObject(DatasetPackage.Literals.JDBC_DRIVER, "JdbcDriverPostgresqlTest")
            сonnection.setDriver(driver)

            rs.resources.add(Context.current.store.createEObject(сonnection))
        }
        return rs.resources.get(0).contents.get(0) as JdbcConnection
    }

    static def createConnectionLine(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_CONNECTION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def сonnection = DatasetFactory.eINSTANCE.createJdbcConnection()
            сonnection.name = name
            сonnection.url = "jdbc:postgresql://cloud.neoflex.ru:5432/neoflexCore"
            сonnection.userName = "postgres"
            сonnection.password = "ne0f1ex"

            def driver = findOrCreateEObject(DatasetPackage.Literals.JDBC_DRIVER, "JdbcDriverPostgresqlTest")
            сonnection.setDriver(driver)

            rs.resources.add(Context.current.store.createEObject(сonnection))
        }
        return rs.resources.get(0).contents.get(0) as JdbcConnection
    }
    JdbcConnectionInit() {}
}
