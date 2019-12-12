package ru.neoflex.nfcore.dataset.impl

import groovy.json.JsonOutput
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DatasetSettingsGrid

class DatasetSettingsGridExt extends DatasetSettingsGridImpl {

    @Override
    String createAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources)
                    def datasetSettingsGrid = resource.resources.get(0).contents.get(0) as DatasetSettingsGrid
                    if (datasetSettingsGrid.dataset.datasetColumn != null) {
                        def columns = datasetSettingsGrid.dataset.datasetColumn
                        if (columns != []) {
                            for (int i = 0; i <= columns.size() - 1; ++i) {
                                def rdbmsColumn = DatasetFactory.eINSTANCE.createRdbmsColumn()
                                rdbmsColumn.name = columns[i].name
                                rdbmsColumn.datasetColumn = columns[i]
                                def typography = ApplicationFactory.eINSTANCE.createTypography()
                                typography.name = columns[i].name
                                rdbmsColumn.headerName = typography
                                datasetSettingsGrid.column.add(rdbmsColumn)
                            }
                            Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                            Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                            return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were created")
                        }
                    }
                    return JsonOutput.toJson("Settings 'dataset' don`t specified OR settings 'dataset' contain any columns")
                }
            })
        }
    }

    @Override
    String deleteAllColumns() {
        def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: this.name])
                .execute().resourceSet
        if (!resource.resources.empty) {
            Context.current.store.inTransaction(false, new StoreSPI.Transactional() {
                @Override
                Object call(TransactionSPI tx) throws Exception {
                    def datasetSettingsGridRef = Context.current.store.getRef(resource.resources)
                    def datasetSettingsGrid = resource.resources.get(0).contents.get(0) as DatasetSettingsGrid
                    datasetSettingsGrid.column.clear()
                    Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
                    Context.current.store.commit("Entity was updated " + datasetSettingsGridRef)
                    return JsonOutput.toJson("Columns in entity " + datasetSettingsGrid.name + " were deleted")
                }
            })
        }
    }
}
