package ru.neoflex.nfcore.dataset.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.GroovyDataset

class GroovyDatasetExt extends GroovyDatasetImpl {

    @Override
    String loadAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.GROOVY_DATASET, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def metaDataset = resource.resources.get(0).contents.get(0) as GroovyDataset
                    if (metaDataset.loadAllColumnGroovyCode != null && metaDataset.loadAllColumnGroovyCode != "") {
                        Context.current.groovy.eval(metaDataset.loadAllColumnGroovyCode, [:])

                        def resource_ = DocFinder.create(Context.current.store, DatasetPackage.Literals.GROOVY_DATASET, [name: this.name])
                                .execute().resourceSet
                        def metaDataset_ = resource_.resources.get(0).contents.get(0) as GroovyDataset
                        return JsonOutput.toJson("created columns, count: " + metaDataset_.datasetColumn.size())
                    }
                }
                return null
            }
        })
    }


    @Override
    String deleteAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.GROOVY_DATASET, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def datasetRef = Context.current.store.getRef(resource.resources.get(0))
                    def dataset = resource.resources.get(0).contents.get(0) as GroovyDataset
                    dataset.datasetColumn.clear()
                    Context.current.store.updateEObject(datasetRef, dataset)
                    Context.current.store.commit("Entity was updated " + datasetRef)
                    return JsonOutput.toJson("Columns in entity " + dataset.name + " were deleted")
                }
                return null
            }
        })
    }

}
