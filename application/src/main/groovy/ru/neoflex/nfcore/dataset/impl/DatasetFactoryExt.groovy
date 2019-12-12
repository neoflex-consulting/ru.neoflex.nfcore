package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetSettingsGrid
import ru.neoflex.nfcore.dataset.JdbcDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    DatasetSettingsGrid createDatasetSettingsGrid() {
        return new DatasetSettingsGridExt()
    }
}
