package ru.neoflex.nfcore.dataset.impl

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DataType
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.GroovyDataset

class GroovyDatasetExt extends GroovyDatasetImpl {
    private static final Logger logger = LoggerFactory.getLogger(GroovyDatasetExt.class);

//    @Override
//    String loadAllColumns() {
//        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.GROOVY_DATASET, [name: this.name])
//                .execute().resourceSet
//        if (!resource.resources.empty) {
//
//            Object[] resultSet = metaEClass.eAllStructuralFeatures.name
//
//            def metaDatasetRef = Context.current.store.getRef(resource.resources.get(0))
//            def metaDataset = resource.resources.get(0).contents.get(0) as GroovyDataset
//            if (resultSet != null) {
//                for (int i = 0; i < resultSet.length; ++i) {
//
//                    def datasetColumn = DatasetFactory.eINSTANCE.createDatasetColumn()
//                    datasetColumn.rdbmsDataType = DataType.STRING
//                    datasetColumn.convertDataType = DataType.STRING
//                    datasetColumn.name = resultSet[i]
//                    metaDataset.datasetColumn.each { c->
//                        if (c.name == resultSet[i]) {
//                            throw new IllegalArgumentException("Column " + resultSet[i] + " already exists")
//                        }
//                    }
//                    metaDataset.datasetColumn.add(datasetColumn)
//                }
//                Context.current.store.updateEObject(metaDatasetRef, metaDataset)
//            }
//        }
//    }
    @Override
    String loadAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.GROOVY_DATASET, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {

        }
    }
}
