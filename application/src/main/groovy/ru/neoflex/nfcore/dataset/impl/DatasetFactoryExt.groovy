package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetComponent
import ru.neoflex.nfcore.dataset.JdbcConnection
import ru.neoflex.nfcore.dataset.JdbcDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
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
