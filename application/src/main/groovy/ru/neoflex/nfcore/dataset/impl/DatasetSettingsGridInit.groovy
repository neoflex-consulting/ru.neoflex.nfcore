package ru.neoflex.nfcore.dataset.impl

import org.eclipse.emf.ecore.EClass
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.DataType
import ru.neoflex.nfcore.dataset.DatasetFactory
import ru.neoflex.nfcore.dataset.DatasetPackage
import ru.neoflex.nfcore.dataset.DatasetSettingsGrid
import ru.neoflex.nfcore.dataset.Filter

class DatasetSettingsGridInit {
    static def findOrCreateEObject(EClass eClass, String name) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def recreateDatasetSettingsGrid(String name) {
        def rs = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_SETTINGS_GRID, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def datasetSettingsGrid = DatasetFactory.eINSTANCE.createDatasetSettingsGrid()
            datasetSettingsGrid.name = name
            def dataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetTest")
            if (dataset) {
                datasetSettingsGrid.setDataset(dataset)
            }
            rs.resources.add(Context.current.store.createEObject(datasetSettingsGrid))
            return rs.resources.get(0).contents.get(0) as DatasetSettingsGrid
        }
        else if ((rs.resources.get(0).contents.get(0) as DatasetSettingsGrid).dataset == null) {
            def datasetSettingsGridRef = Context.current.store.getRef(rs.resources.get(0))
            def datasetSettingsGrid = rs.resources.get(0).contents.get(0) as DatasetSettingsGrid
            def dataset = findOrCreateEObject(DatasetPackage.Literals.JDBC_DATASET, "JdbcDatasetTest")
            if (dataset) {
                datasetSettingsGrid.setDataset(dataset)
                if (datasetSettingsGrid.dataset.datasetColumn.size() != 0) {
                    def columns = datasetSettingsGrid.dataset.datasetColumn
                    for (int i = 0; i <= columns.size() - 1; ++i) {
                        def rdbmsColumn = DatasetFactory.eINSTANCE.createRdbmsColumn()
                        rdbmsColumn.name = columns[i].name
                        rdbmsColumn.datasetColumn = columns[i]
                        def typography = ApplicationFactory.eINSTANCE.createTypography()
                        typography.name = columns[i].name
                        rdbmsColumn.headerName = typography
                        rdbmsColumn.headerTooltip = "type: " + columns[i].convertDataType
                        rdbmsColumn.filter = columns[i].convertDataType == DataType.DATE || columns[i].convertDataType == DataType.TIMESTAMP
                                ? Filter.DATE_COLUMN_FILTER :
                                columns[i].convertDataType == DataType.INTEGER || columns[i].convertDataType == DataType.DECIMAL
                                        ? Filter.NUMBER_COLUMN_FILTER : Filter.TEXT_COLUMN_FILTER
                        datasetSettingsGrid.column.each { c->
                            if (c.name == columns[i].name.toString()) {
                                throw new IllegalArgumentException("Please, change your query in Dataset. It has similar column`s name")
                            }
                        }
                        datasetSettingsGrid.column.add(rdbmsColumn)
                    }
                }
            }
            Context.current.store.updateEObject(datasetSettingsGridRef, datasetSettingsGrid)
        }
    }

    {
        recreateDatasetSettingsGrid("DatasetSettingsGridTest")
    }

    DatasetSettingsGridInit() {}

}
