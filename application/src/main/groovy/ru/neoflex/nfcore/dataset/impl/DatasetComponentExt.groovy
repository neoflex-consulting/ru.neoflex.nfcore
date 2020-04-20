package ru.neoflex.nfcore.dataset.impl

import com.sun.jmx.remote.util.ClassLogger
import groovy.json.JsonOutput
import org.eclipse.emf.common.util.EList
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.*

import java.sql.Connection
import java.sql.ResultSet
import java.sql.Statement

class DatasetComponentExt extends DatasetComponentImpl {

    @Override
    String createAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_COMPONENT, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def datasetComponentRef = Context.current.store.getRef(resource.resources[0])
                    def datasetComponent = resource.resources.get(0).contents.get(0) as DatasetComponent
                    if (datasetComponent.dataset.datasetColumn != null) {
                        def columns = datasetComponent.dataset.datasetColumn
                        if (columns != []) {
                            for (int i = 0; i <= columns.size() - 1; ++i) {
                                def rdbmsColumn = DatasetFactory.eINSTANCE.createRdbmsColumn()
                                rdbmsColumn.name = columns[i].name
                                rdbmsColumn.datasetColumn = columns[i]
                                def typography = ApplicationFactory.eINSTANCE.createTypography()
                                typography.name = columns[i].name
                                rdbmsColumn.headerName = typography
                                rdbmsColumn.headerTooltip = "type: " + columns[i].convertDataType
                                rdbmsColumn.sortable = true
                                rdbmsColumn.resizable = true
                                rdbmsColumn.filter = columns[i].convertDataType == DataType.DATE || columns[i].convertDataType == DataType.TIMESTAMP
                                        ? Filter.DATE_COLUMN_FILTER :
                                        columns[i].convertDataType == DataType.INTEGER || columns[i].convertDataType == DataType.DECIMAL
                                                ? Filter.NUMBER_COLUMN_FILTER : Filter.TEXT_COLUMN_FILTER
                                datasetComponent.column.each { c->
                                    if (c.name == columns[i].name.toString()) {
                                        throw new IllegalArgumentException("Please modify your query in the 'dataset'. Has a similar column name")
                                    }
                                }
                                datasetComponent.column.add(rdbmsColumn)
                            }
                            Context.current.store.updateEObject(datasetComponentRef, datasetComponent)
                            Context.current.store.commit("Entity was updated " + datasetComponentRef)
                            return JsonOutput.toJson("Columns in entity " + datasetComponent.name + " were created")
                        }
                    }
                    return JsonOutput.toJson("The 'dataset' parameter is not specified OR the 'dataset' object does not contain columns")
                }
            }
        })
    }

    @Override
    String deleteAllColumns() {
        return Context.current.store.inTransaction(false, new StoreSPI.TransactionalFunction() {
            @Override
            Object call(TransactionSPI tx) throws Exception {
                def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_COMPONENT, [name: this.name])
                        .execute().resourceSet
                if (!resource.resources.empty) {
                    def datasetComponentRef = Context.current.store.getRef(resource.resources.get(0))
                    def datasetComponent = resource.resources.get(0).contents.get(0) as DatasetComponent
                    datasetComponent.column.clear()
                    Context.current.store.updateEObject(datasetComponentRef, datasetComponent)
                    Context.current.store.commit("Entity was updated " + datasetComponentRef)
                    return JsonOutput.toJson("Columns in entity " + datasetComponent.name + " were deleted")
                }
            }
        })
    }

    @Override
    String runQuery(EList<QueryFilterDTO> conditions, EList<QueryConditionDTO> aggregations, EList<QueryConditionDTO> sorts, EList<QueryConditionDTO> groupBy, EList<QueryConditionDTO> calculatedExpression) {
        if (column) {
            ResultSet rs = connectionToDB(conditions, aggregations, sorts, groupBy,calculatedExpression)
            def columnCount = rs.metaData.columnCount
            def rowData = []
            while (rs.next()) {
                def map = [:]
                for (int i = 1; i <= columnCount; ++i) {
                    def object = rs.getObject(i)
                    map["${rs.metaData.getColumnName(i)}"] = (object == null ? null : object.toString())
                }
                rowData.add(map)
            }
            return JsonOutput.toJson(rowData)
        }
        else {
            throw new IllegalArgumentException("Please created columns in this object.")
        }
    }

    ResultSet connectionToDB(EList<QueryFilterDTO> conditions, EList<QueryConditionDTO> aggregations, EList<QueryConditionDTO> sorts, EList<QueryConditionDTO> groupBy, EList<QueryConditionDTO> calculatedExpression) {
        Connection jdbcConnection = (dataset.connection as JdbcConnectionExt).connect()

        /*Execute query*/
        def queryColumns = []
        def serverFilters = []
        def serverAggregations = []
        def serverGroupByAggregation = []
        def serverGroupBy = []
        def serverSorts = []
        def serverCalculatedExpression = []

        if (column != []) {
            for (int i = 0; i <= column.size() - 1; ++i) {
                if (column[i].class.toString().toLowerCase().contains('rdbms')) {
                    if (queryColumns.contains("${column[i].datasetColumn.name}")) {
                        throw new IllegalArgumentException("Please, change your query in Dataset. It has similar column`s name")
                    } else {
                        queryColumns.add("t.\"${column[i].datasetColumn.name}\"")
                    }
                } else {
                    def valueCustomColumn
                    if (column[i].customColumnExpression == null || column[i].customColumnExpression == "" && column[i].defaultValue != null && column[i].defaultValue != "") {
                        valueCustomColumn = column[i].defaultValue
                    } else if (column[i].customColumnExpression == null || column[i].customColumnExpression == "" && column[i].defaultValue == null ||  column[i].defaultValue == "") {
                        valueCustomColumn = null
                    } else {
                        valueCustomColumn = column[i].customColumnExpression
                    }

                    if (queryColumns.contains(" \"${column[i].headerName.name}\"")) {
                        throw new IllegalArgumentException("Please, change headerNames in this object. It has similar names")
                    } else {
                        queryColumns.add(valueCustomColumn + " \"${column[i].headerName.name}\"")
                    }
                }
            }
        }

        def allColumns = column.name + calculatedExpression.datasetColumn

        //Filter
        if (conditions) {
            for (int i = 0; i <= conditions.size() - 1; ++i) {
                if (allColumns.contains(conditions[i].datasetColumn) && conditions[i].enable == true) {
                    def currentColumn = column.find{ column -> column.name.toLowerCase() == conditions[i].datasetColumn.toLowerCase() }
                    def type;
                    //TODO добавить определение типа для вычисляемых полей
                    if (currentColumn) {
                        type = currentColumn.datasetColumn.convertDataType
                    }

                    if (type == DataType.DATE || type == DataType.TIMESTAMP) {
                        def map = [:]
                        map["column"] = currentColumn.datasetColumn.name
                        map["select"] = "(EXTRACT(DAY FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(DAY FROM CAST('${conditions[i].value}' AS DATE)) AND " +
                                "EXTRACT(MONTH FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(MONTH FROM CAST('${conditions[i].value}' AS DATE)) AND " +
                                "EXTRACT(YEAR FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(YEAR FROM CAST('${conditions[i].value}' AS DATE)))"
                        serverFilters.add(map)
                    }
                    else {
                        def map = [:]
                        map["column"] = conditions[i].datasetColumn
                        def operator = getConvertOperator(conditions[i].operation.toString().toLowerCase())
                        if (operator == 'LIKE') {
                            map["select"] = "(LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('${conditions[i].value}') OR " +
                                "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('%${conditions[i].value}') OR " +
                                "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('${conditions[i].value}%') OR " +
                                "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('%${conditions[i].value}%'))"
                        }
                        else if (operator == 'NOT LIKE') {
                            map["select"] = "(LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('${conditions[i].value}') AND " +
                                    "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('%${conditions[i].value}') AND " +
                                    "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('${conditions[i].value}%') AND " +
                                    "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) ${operator} LOWER('%${conditions[i].value}%'))"
                        }
                        else if (operator == 'IS NULL' || operator == 'IS NOT NULL') {
                            map["select"] = "t.${conditions[i].datasetColumn} ${operator}"
                        }
                        else if (operator == 'LIKE_START' ) {
                            map["select"] = "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) LIKE LOWER('${conditions[i].value}%')"
                        }
                        else if (operator == 'LIKE_NOT_START' ) {
                            map["select"] = "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) NOT LIKE LOWER('${conditions[i].value}%')"
                        }
                        else if (operator == 'LIKE_END' ) {
                            map["select"] = "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) LIKE LOWER('%${conditions[i].value}')"
                        }
                        else if (operator == 'LIKE_NOT_END' ) {
                            map["select"] = "LOWER(CAST(t.${conditions[i].datasetColumn} AS TEXT)) NOT LIKE LOWER('%${conditions[i].value}')"
                        }
                        else {
                            map["select"] = "t.${conditions[i].datasetColumn} ${operator} '${conditions[i].value}'"
                        }
                        if (!serverFilters.contains(map)) {
                            serverFilters.add(map)
                        }
                    }
                }
            }
        }

        //Group by
        if (groupBy) {
            for (int i = 0; i <= groupBy.size() - 1; ++i) {
                if (allColumns.contains(groupBy[i].datasetColumn) && groupBy[i].enable == true) {
                    def map = [:]
                    map["column"] = groupBy[i].datasetColumn
                    def operator = getConvertAggregate(groupBy[i].operation.toString().toLowerCase())
                    if (operator == 'AVG' ) {
                        map["select"] = "AVG(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (operator == 'COUNT' ) {
                        map["select"] = "COUNT(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (operator == 'COUNT_DISTINCT' ) {
                        map["select"] = "COUNT(DISTINCT t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (operator == 'MAX' ) {
                        map["select"] = "MAX(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (operator == 'MEDIAN' ) {
                        //TODO
                    }
                    if (operator == 'MIN' ) {
                        map["select"] = "MIN(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (operator == 'SUM' ) {
                        map["select"] = "SUM(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                    }
                    if (!serverGroupByAggregation.contains(map)) {
                        serverGroupByAggregation.add(map)
                    }
                }
            }
            for (int i = 0; i <= allColumns.size() - 1; ++i) {
                def map = [:]
                if (!serverGroupByAggregation.column.contains(allColumns[i])) {
                    map["select"] = "t.\"${allColumns[i]}\""
                    if (!serverGroupBy.contains(map)) {
                        serverGroupBy.add(map)
                    }
                }
            }
        }

        //Aggregation overall
        if (aggregations) {
            for (int i = 0; i <= allColumns.size() - 1; ++i) {
                def isExcluded = true;
                //Итого и столбец под одним столбцом
                for (int j = 0; j <= aggregations.size() - 1; ++j) {
                    if (allColumns[i] == aggregations[j].datasetColumn && aggregations[j].enable == true) {
                        def map = [:]
                        map["column"] = aggregations[j].datasetColumn
                        def operator = getConvertAggregate(aggregations[j].operation.toString().toLowerCase())
                        if (operator == 'AVG' ) {
                            map["select"] = "AVG(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (operator == 'COUNT' ) {
                            map["select"] = "COUNT(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (operator == 'COUNT_DISTINCT' ) {
                            map["select"] = "COUNT(DISTINCT t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (operator == 'MAX' ) {
                            map["select"] = "MAX(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (operator == 'MEDIAN' ) {
                            //TODO
                        }
                        if (operator == 'MIN' ) {
                            map["select"] = "MIN(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (operator == 'SUM' ) {
                            map["select"] = "SUM(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                        }
                        if (!serverAggregations.contains(map)) {
                            serverAggregations.add(map)
                        }
                        isExcluded = false
                    }
                }
                if (isExcluded == true) {
                    def map = [:]
                    map["column"] = allColumns[i]
                    map["select"] = "NULL as \"${allColumns[i]}\""
                    if (!serverAggregations.contains(map) && map) {
                        serverAggregations.add(map)
                    }
                }
            }
        }

        //Order by
        if (sorts) {
            for (int i = 0; i <= sorts.size() - 1; ++i) {
                if (allColumns.contains(sorts[i].datasetColumn) && sorts[i].enable == true) {
                    def map = [:]
                    map["column"] = sorts[i].datasetColumn
                    def operator = getConvertSort(sorts[i].operation.toString().toLowerCase())
                    if (operator == 'ASC' ) {
                        map["select"] = "t.\"${sorts[i].datasetColumn}\" ASC"
                    }
                    if (operator == 'DESC' ) {
                        map["select"] = "t.\"${sorts[i].datasetColumn}\" DESC"
                    }
                    if (!serverSorts.contains(map)) {
                        serverSorts.add(map)
                    }
                }
            }
        }

        //Calculated expressions
        if (calculatedExpression) {
            for (int i = 0; i <= calculatedExpression.size() - 1; ++i) {
                def map = [:]
                map["column"] = calculatedExpression[i].datasetColumn
                map["select"] = "${calculatedExpression[i].operation} as \"${calculatedExpression[i].datasetColumn}\""
                if (!serverCalculatedExpression.contains(map)) {
                    serverCalculatedExpression.add(map)
                }
            }
        }

        String currentQuery
        currentQuery = "\nSELECT ${queryColumns.join(', ')} \n  FROM (${dataset.query}) t"
        if (calculatedExpression) {
            currentQuery = "\nSELECT ${queryColumns.join(', ')}, ${serverCalculatedExpression.select.join(', ')}" +
                    "\n  FROM (${currentQuery}) t"
        }
        if (serverFilters) {
            currentQuery = "\nSELECT * \n  FROM (${currentQuery}) t" +
                    "\n WHERE ${serverFilters.select.join(' AND ')}"
        }
        if (serverGroupByAggregation) {
            if (serverGroupBy) {
                currentQuery = "\nSELECT ${serverGroupBy.select.join(' , ')} , " + " ${serverGroupByAggregation.select.join(' , ')}" +
                        "\n  FROM (${currentQuery}) t" +
                        "\n GROUP BY ${serverGroupBy.select.join(' , ')}"
            } else {
                currentQuery = "\nSELECT ${serverGroupByAggregation.select.join(' , ')}" +
                        "\n  FROM (${currentQuery}) t"
            }
        }
        if (serverSorts && !serverAggregations) {
            currentQuery = "\nSELECT *" +
                    "\n  FROM (${currentQuery}) t" +
                    "\n ORDER BY ${serverSorts.select.join(' , ')}"
        }
        if (serverAggregations) {
            currentQuery = " \nSELECT ${serverAggregations.select.join(' , ')}" +
                    "\n  FROM (${currentQuery}) t"
        }

        logger.info("connectionToDB", "Starting query = " + currentQuery)

        Statement st = jdbcConnection.createStatement()
        ResultSet rs = st.executeQuery(currentQuery)
        return rs
    }

    String getConvertOperator(String operator) {
        if (operator == Operations.LESS_THAN.toString().toLowerCase()) {return '<'}
        else if (operator == Operations.LESS_THEN_OR_EQUAL_TO.toString().toLowerCase()) {return '<='}
        else if (operator == Operations.EQUAL_TO.toString().toLowerCase()) {return '='}
        else if (operator == Operations.GREATER_THAN.toString().toLowerCase()) {return '>'}
        else if (operator == Operations.GREATER_THAN_OR_EQUAL_TO.toString().toLowerCase()) {return '>='}
        else if (operator == Operations.NOT_EQUAL.toString().toLowerCase()) {return '!='}
        else if (operator == Operations.INCLUDE_IN.toString().toLowerCase()) {return 'LIKE'}
        else if (operator == Operations.NOT_INCLUDE_IN.toString().toLowerCase()) {return 'NOT LIKE'}
        else if (operator == Operations.IS_EMPTY.toString().toLowerCase()) {return 'IS NULL'}
        else if (operator == Operations.IS_NOT_EMPTY.toString().toLowerCase()) {return 'IS NOT NULL'}
        else if (operator == Operations.START_WITH.toString().toLowerCase()) {return 'LIKE_START'}
        else if (operator == Operations.NOT_START_WITH.toString().toLowerCase()) {return 'LIKE_NOT_START'}
        else if (operator == Operations.END_ON.toString().toLowerCase()) {return 'LIKE_END'}
        else if (operator == Operations.NOT_END_ON.toString().toLowerCase()) {return 'LIKE_NOT_END'}
    }

    String getConvertAggregate(String aggregate) {
        if (aggregate == Aggregate.AVERAGE.toString().toLowerCase()) {return 'AVG'}
        else if (aggregate == Aggregate.COUNT.toString().toLowerCase()) {return 'COUNT'}
        else if (aggregate == Aggregate.COUNT_DISTINCT.toString().toLowerCase()) {return 'COUNT_DISTINCT'}
        else if (aggregate == Aggregate.MAXIMUM.toString().toLowerCase()) {return 'MAX'}
        else if (aggregate == Aggregate.MEDIAN.toString().toLowerCase()) {return 'MEDIAN'}
        else if (aggregate == Aggregate.MINIMUM.toString().toLowerCase()) {return 'MIN'}
        else if (aggregate == Aggregate.SUM.toString().toLowerCase()) {return 'SUM'}
    }

    String getConvertSort(String sort) {
        if (sort == Sort.FROM_ATO_Z.toString().toLowerCase()) {return 'ASC'}
        else if (sort == Sort.FROM_ZTO_A.toString().toLowerCase()) {return 'DESC'}
    }

    private static final ClassLogger logger =
            new ClassLogger("javax.management.remote.misc", "EnvHelp")
}
