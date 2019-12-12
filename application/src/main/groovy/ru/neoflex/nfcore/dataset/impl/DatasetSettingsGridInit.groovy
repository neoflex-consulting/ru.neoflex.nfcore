package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DatasetSettingsGrid

class DatasetSettingsGridInit {
//    static def findEObject(EClass eClass, String name) {
//        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
//                .execute().resourceSet
//        return resources.resources.get(0).contents.get(0)
//    }

    static def recreateDatasetSettingsGrid(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def datasetSettingsGrid = DatasetFactory.eINSTANCE.createDatasetSettingsGrid()
            datasetSettingsGrid.name = name
//            def dataset = findEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDataset")
//            datasetSettingsGrid.setDataset(dataset)
            rs.resources.add(Context.current.store.createEObject(datasetSettingsGrid))
        }
        return rs.resources.get(0).contents.get(0) as DatasetSettingsGrid
    }

    {
        recreateDatasetSettingsGrid("DatasetSettingsGridTest")
    }

    DatasetSettingsGridInit() {}

}
