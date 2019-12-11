package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetSettingsGrid
import ru.neoflex.nfcore.dataset.JdbcDataset
import ru.neoflex.nfcore.dataset.HiveDataset
import ru.neoflex.nfcore.dataset.OdbcDataset
import ru.neoflex.nfcore.dataset.ImpalaDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    OdbcDataset createOdbcDataset() {
        return new OdbcDatasetExt()
    }

    @Override
    HiveDataset createHiveDataset() {
        return new HiveDatasetExt()
    }

    @Override
    ImpalaDataset createImpalaDataset() {
        return new ImpalaDatasetExt()
    }

    @Override
    DatasetSettingsGrid createDatasetSettingsGrid() {
        return new DatasetSettingsGridExt()
    }
}
