package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetComponent
import ru.neoflex.nfcore.dataset.JdbcConnection
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.MetaDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    MetaDataset createMetaDataset() {
        return new MetaDatasetExt()
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
