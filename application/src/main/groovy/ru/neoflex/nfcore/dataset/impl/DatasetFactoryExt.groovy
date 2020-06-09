package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetComponent
import ru.neoflex.nfcore.dataset.JdbcConnection
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.GroovyDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    GroovyDataset createGroovyDataset() {
        return new GroovyDatasetExt()
    }

    @Override
    DatasetComponent createDatasetComponent() {
        return new DatasetComponentExt()
    }

    @Override
    public JdbcConnection createJdbcConnection() {
        JdbcConnectionImpl jdbcConnection = new JdbcConnectionExt();
        return jdbcConnection;
    }
}
