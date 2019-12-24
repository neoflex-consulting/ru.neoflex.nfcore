package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.JdbcDriver

class JdbcDriverInit {
    static def recreateDriver(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.JDBC_DRIVER, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def driver = DatasetFactory.eINSTANCE.createJdbcDriver()
            driver.name = name
            driver.driverClassName = "org.postgresql.Driver"
            rs.resources.add(Context.current.store.createEObject(driver))
        }
        return rs.resources.get(0).contents.get(0) as JdbcDriver
    }

    JdbcDriverInit() {}
}
