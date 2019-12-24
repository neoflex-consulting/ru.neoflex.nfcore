package ru.neoflex.nfcore.dataset.impl

import ru.neoflex.nfcore.dataset.DatasetGrid
//import ru.neoflex.nfcore.dataset.DatasetPivot
//import ru.neoflex.nfcore.dataset.DatasetDiagram
import ru.neoflex.nfcore.dataset.JdbcDataset

class DatasetFactoryExt extends DatasetFactoryImpl {

    @Override
    JdbcDataset createJdbcDataset() {
        return new JdbcDatasetExt()
    }

    @Override
    DatasetGrid createDatasetGrid() {
        return new DatasetGridExt()
    }

//    @Override
//    DatasetPivot createDatasetPivot() {
//        return new DatasetPivotExt()
//    }
//
//    @Override
//    DatasetDiagram createDatasetDiagram() {
//        return new DatasetDiagramExt()
//    }
}
