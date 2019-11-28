package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.QueryDataset

class DatasetFactoryExt extends DatasetFactoryImpl{
    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    QueryDataset createQueryDataset() {
        return new QueryDatasetExt()
    }

}
