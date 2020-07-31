package ru.neoflex.nfcore.dataset.impl

import com.sun.jmx.remote.util.ClassLogger
import groovy.json.JsonOutput
import org.eclipse.emf.common.util.EList
import org.eclipse.emf.ecore.resource.ResourceSet
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.services.providers.StoreSPI
import ru.neoflex.nfcore.base.services.providers.TransactionSPI
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.dataset.impl.adapters.CalculatorAdapter
import ru.neoflex.nfcore.jdbcLoader.NamedParameterStatement
import ru.neoflex.nfcore.dataset.*

import java.sql.Connection
import java.sql.Date
import java.sql.ResultSet
import java.sql.Timestamp
import java.time.LocalDate
import java.time.LocalDateTime

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
    String runQuery(
            EList<QueryParameter> parameters,
            EList<QueryFilterDTO> filters,
            EList<QueryConditionDTO> aggregations,
            EList<QueryConditionDTO> sorts,
            EList<QueryFilterDTO> groupBy,
            EList<QueryConditionDTO> calculatedExpression,
            EList<QueryConditionDTO> groupByColumn
    ) {
        if (column) {
            def resource = DocFinder.create(Context.current.store, DatasetPackage.Literals.DATASET_COMPONENT, [name: this.name])
                    .execute().resourceSet
            if (!resource.resources.empty &&
                    resource.resources[0].contents[0].dataset.class.name == "ru.neoflex.nfcore.dataset.impl.GroovyDatasetExt"
            ) {
                def groovyScript = resource.resources[0].contents[0].dataset.runQueryGroovyCode
                Object[] rowData = []
                try {
                    rowData = Context.current.groovy.eval(groovyScript, [:])
                } catch (Exception e) {
                    logger.info("invalid script runQueryGroovyCode in dataset ", resource.resources[0].contents[0].dataset.name)
                }
                return JsonOutput.toJson(rowData)
            }
            else {
                return JsonOutput.toJson(connectionToDB(parameters, filters, aggregations, sorts, groupBy, calculatedExpression, groupByColumn, resource))
            }
        }
        else {
            throw new IllegalArgumentException("Please created columns in this object.")
        }
    }

    List<Map> connectionToDB(EList<QueryParameter> parameters, EList<QueryFilterDTO> filters, EList<QueryConditionDTO> aggregations, EList<QueryConditionDTO> sorts, EList<QueryFilterDTO> groupBy, EList<QueryConditionDTO> calculatedExpression, EList<QueryConditionDTO> groupByColumn, ResourceSet resource) {
        NamedParameterStatement p;
        ResultSet rs;
        def rowData = []
        def jdbcDataset = dataset as JdbcDataset
        def numberOfLines = 0;

        Connection jdbcConnection = (jdbcDataset.connection as JdbcConnectionExt).connect()
        try {
            /*Execute query*/
            def queryColumns = []
            def serverFilters = []
            def serverAggregations = []
            def serverGroupByAggregation = []
            def serverGroupBy = []
            def serverGroupByColumn = []
            def serverSorts = []
            def serverCalculatedExpression = []
            def namesOfOperationsInServerAggregations = []

            if (column != []) {
                for (int i = 0; i <= column.size() - 1; ++i) {
                    if (column[i].class.toString().toLowerCase().contains('rdbms')) {
                        if (queryColumns.size() != 0 && queryColumns.contains("${column[i].name}")) {
                            throw new IllegalArgumentException("Please, change your query in Dataset. It has similar column`s name")
                        } else {
                            queryColumns.add("t.\"${column[i].name}\"")
                        }
                    } else {
                        def valueCustomColumn
                        def customColumn = column[i] as CustomColumn
                        if (customColumn.customColumnExpression == null || customColumn.customColumnExpression == "" && column[i].defaultValue != null && column[i].defaultValue != "") {
                            valueCustomColumn = column[i].defaultValue
                        } else if (customColumn.customColumnExpression == null || customColumn.customColumnExpression == "" && column[i].defaultValue == null || column[i].defaultValue == "") {
                            valueCustomColumn = null
                        } else {
                            valueCustomColumn = customColumn.customColumnExpression
                        }

                        if (queryColumns.contains(" \"${column[i].headerName.name}\"")) {
                            throw new IllegalArgumentException("Please, change headerNames in this object. It has similar names")
                        } else {
                            queryColumns.add(valueCustomColumn + " \"${column[i].headerName.name}\"")
                        }
                    }
                }
            }

            List<String> allColumns

            if (groupByColumn) {
                serverGroupByColumn = groupByColumn.datasetColumn
            }

            if (groupBy && serverGroupByColumn) {
                allColumns = groupBy.datasetColumn
                for (int i = 0; i < serverGroupByColumn.size(); i++) {
                    if (!allColumns.contains(serverGroupByColumn[i])) {
                        allColumns.add(serverGroupByColumn[i])
                    }
                }
            } else {
                def calcColumns =  (calculatedExpression ? calculatedExpression.datasetColumn : [])
                allColumns = column.name  + calcColumns
            }

            //Filter
            if (filters) {
                for (int i = 0; i <= filters.size() - 1; ++i) {
                    if (allColumns.contains(filters[i].datasetColumn) && filters[i].enable) {
                        def currentColumn = column.find { column -> column.name.toLowerCase() == filters[i].datasetColumn.toLowerCase() }
                        def type;
                        //TODO добавить определение типа для вычисляемых полей
                        if (currentColumn) {
                            type = currentColumn.datasetColumn.convertDataType
                        }

                        if (type == DataType.DATE || type == DataType.TIMESTAMP) {
                            def map = [:]
                            map["column"] = currentColumn.datasetColumn.name
                            map["select"] = "(EXTRACT(DAY FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(DAY FROM CAST('${filters[i].value}' AS DATE)) AND " +
                                    "EXTRACT(MONTH FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(MONTH FROM CAST('${filters[i].value}' AS DATE)) AND " +
                                    "EXTRACT(YEAR FROM CAST(t.\"${currentColumn.datasetColumn.name}\" AS DATE)) = EXTRACT(YEAR FROM CAST('${filters[i].value}' AS DATE)))"
                            serverFilters.add(map)
                        } else {
                            def map = [:]
                            map["column"] = filters[i].datasetColumn
                            def operator = getConvertOperator(filters[i].operation.toString().toLowerCase())
                            if (operator == 'LIKE') {
                                map["select"] = "(LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('${filters[i].value}') OR " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('%${filters[i].value}') OR " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('${filters[i].value}%') OR " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('%${filters[i].value}%'))"
                            } else if (operator == 'NOT LIKE') {
                                map["select"] = "(LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('${filters[i].value}') AND " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('%${filters[i].value}') AND " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('${filters[i].value}%') AND " +
                                        "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) ${operator} LOWER('%${filters[i].value}%'))"
                            } else if (operator == 'IS NULL' || operator == 'IS NOT NULL') {
                                map["select"] = "t.${filters[i].datasetColumn} ${operator}"
                            } else if (operator == 'LIKE_START') {
                                map["select"] = "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) LIKE LOWER('${filters[i].value}%')"
                            } else if (operator == 'LIKE_NOT_START') {
                                map["select"] = "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) NOT LIKE LOWER('${filters[i].value}%')"
                            } else if (operator == 'LIKE_END') {
                                map["select"] = "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) LIKE LOWER('%${filters[i].value}')"
                            } else if (operator == 'LIKE_NOT_END') {
                                map["select"] = "LOWER(CAST(t.${filters[i].datasetColumn} AS VARCHAR(256))) NOT LIKE LOWER('%${filters[i].value}')"
                            } else {
                                map["select"] = "t.${filters[i].datasetColumn} ${operator} '${filters[i].value}'"
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
                    if (allColumns.contains(groupBy[i].datasetColumn) && groupBy[i].enable) {
                        def map = [:]
                        map["column"] = groupBy[i].datasetColumn
                            def operator = getConvertAggregate(groupBy[i].operation.toString().toLowerCase())
                        if (operator == 'AVG') {
                            map["select"] = "AVG(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                        }
                        if (operator == 'COUNT') {
                            map["select"] = "COUNT(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                        }
                        if (operator == 'COUNT_DISTINCT') {
                            map["select"] = "COUNT(DISTINCT t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                        }
                        if (operator == 'MAX') {
                            map["select"] = "MAX(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                        }
                        if (operator == 'MIN') {
                            map["select"] = "MIN(t.\"${groupBy[i].datasetColumn}\") as \"${groupBy[i].datasetColumn}\""
                        }
                        if (operator == 'SUM') {
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
                for (int i = 0; i < allColumns.size(); i++) {
                    def sameDatasetColumn = 0;
                    for (int j = 0; j < aggregations.size(); j++) {
                        if (allColumns[i] == aggregations[j].datasetColumn && aggregations[j].enable) {
                            sameDatasetColumn++;
                        }
                    }
                    if (numberOfLines < sameDatasetColumn) {
                        numberOfLines = sameDatasetColumn
                    }

                }
                for (int g = 0; g < numberOfLines; g++){
                    for (int i = 0; i <= allColumns.size() - 1; ++i) {
                        def isExcluded = true;
                        //Итого и столбец под одним столбцом
                        for (int j = 0; j <= aggregations.size() - 1; ++j) {
                            if (allColumns[i] == aggregations[j].datasetColumn && aggregations[j].enable) {
                                aggregations[j].enable = false
                                def map = [:]
                                map["column"] = aggregations[j].datasetColumn
                                def operator = getConvertAggregate(aggregations[j].operation.toString().toLowerCase())
                                if (operator == 'AVG') {
                                    map["select"] = "AVG(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Среднее:")
                                }
                                if (operator == 'COUNT') {
                                    map["select"] = "COUNT(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Счетчик:")
                                }
                                if (operator == 'COUNT_DISTINCT') {
                                    map["select"] = "COUNT(DISTINCT t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Счетчик уникальных:")
                                }
                                if (operator == 'MAX') {
                                    map["select"] = "MAX(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Максимум:")
                                }
                                if (operator == 'MIN') {
                                    map["select"] = "MIN(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Минимум:")
                                }
                                if (operator == 'SUM') {
                                    map["select"] = "SUM(t.\"${aggregations[j].datasetColumn}\") as \"${aggregations[j].datasetColumn}\""
                                    namesOfOperationsInServerAggregations.add("Сумма:")
                                }
                                if (!serverAggregations.contains(map)) {
                                    serverAggregations.add(map)
                                }
                                isExcluded = false
                                j = aggregations.size() + 1
                            }
                        }
                        if (isExcluded) {
                            def map = [:]
                            map["column"] = allColumns[i]
                            map["select"] = "NULL as \"${allColumns[i]}\""
                            if (map) {
                                serverAggregations.add(map)
                            }
                        }
                    }
            }
            }

            //Order by
            if (sorts) {
                for (int i = 0; i <= sorts.size() - 1; ++i) {
                    if (allColumns.contains(sorts[i].datasetColumn) && sorts[i].enable) {
                        def map = [:]
                        map["column"] = sorts[i].datasetColumn
                        def operator = getConvertSort(sorts[i].operation.toString().toLowerCase())
                        if (operator == 'ASC') {
                            map["select"] = "t.\"${sorts[i].datasetColumn}\" ASC"
                        }
                        if (operator == 'DESC') {
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
                def calculatorAdapter = CalculatorAdapter.getDBAdapter(jdbcDataset.connection.driver.driverClassName)
                for (int i = 0; i <= calculatedExpression.size() - 1; ++i) {
                    def map = [:]
                    map["column"] = calculatedExpression[i].datasetColumn
                    map["select"] = "${replaceCalculatorFunctions(calculatedExpression[i].operation,calculatorAdapter)} as \"${calculatedExpression[i].datasetColumn}\""
                    if (!serverCalculatedExpression.contains(map)) {
                        serverCalculatedExpression.add(map)
                    }
                }
            }



            String currentQuery
            if ((dataset as JdbcDatasetExt).queryType == QueryType.USE_QUERY) {
                currentQuery = "\nSELECT ${queryColumns.join(', ')} \n  FROM (${jdbcDataset.query}) t"
            } else {
                currentQuery = "\nSELECT ${queryColumns.join(', ')} \n  FROM ${jdbcDataset.schemaName}.${jdbcDataset.tableName} t"
            }
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
                if (serverAggregations){
                currentQuery = " \nSELECT ${serverAggregations.select.join(' , ')}" +
                        "\n  FROM (${currentQuery}) t"
            }

            logger.info("connectionToDB", "Starting query = " + currentQuery)
            logger.info("connectionToDB", "parameters = " + parameters)
            //Add Named Parameters
            p = new NamedParameterStatement(jdbcConnection, currentQuery);
            try {
                if (parameters) {
                    p = getNamedParameterStatement(parameters, p)
                }
                try {
                    rs = p.executeQuery();
                    def columnCount = rs.metaData.columnCount
                    if (numberOfLines > 1){
                        while (rs.next()) {
                            int g = 0;
                            for (int j = 0; j < numberOfLines; j++) {
                                def map = [:]
                                String key
                                String value
                                def object
                                for (int i = 1; i <= allColumns.size(); ++i) {
                                    int index = i + (j*allColumns.size())
                                    object = rs.getObject(index)
                                    value = (object == null ? null : object.toString())
                                    if (value != null){
                                        value = namesOfOperationsInServerAggregations[g] + value
                                        g++
                                    }
                                    key = "${rs.metaData.getColumnName(index)}"
                                    map[key] = value
                                }
                                rowData.add(map)
                            }
                        }
                    }
                    else{
                        int g = 0;
                    while (rs.next()) {
                        def map = [:]
                        String key
                        String value
                        def object
                        for (int i = 1; i <= columnCount; ++i) {
                            object = rs.getObject(i)
                            value = (object == null ? null : object.toString())
                            if (value != null && numberOfLines > 0){
                                value = namesOfOperationsInServerAggregations[g] + value
                                g++
                            }
                            key = "${rs.metaData.getColumnName(i)}"
                            map[key] = value
                        }
                        rowData.add(map)
                    }}
                } finally {
                    (rs) ? rs.close() : null
                }
            } finally {
                (p) ? p.close() : null
            }
        } finally {
            (jdbcConnection) ? jdbcConnection.close() : null
        }
        return rowData
    }

    @Override
    void executeInsert(EList<QueryParameter> parameters) {
        executeDML(parameters, DMLQueryType.INSERT, this.insertQuery)
    }

    @Override
    void executeUpdate(EList<QueryParameter> parameters) {
        executeDML(parameters, DMLQueryType.UPDATE, this.updateQuery)
    }

    @Override
    void executeDelete(EList<QueryParameter> parameters) {
        executeDML(parameters, DMLQueryType.DELETE, this.deleteQuery)
    }

    void executeDML(EList<QueryParameter> parameters, DMLQueryType queryType, DMLQuery dmlQuery) {
        logger.info("execute${queryType}", "execute${queryType} parameters = " + parameters)
        String query;
        def jdbcDataset = this.dataset as JdbcDataset
        if (dmlQuery && dmlQuery.generateFromModel) {
            if (jdbcDataset.schemaName == "" || !jdbcDataset.schemaName)
                throw new IllegalArgumentException("jdbcDataset schema is not specified")
            if (jdbcDataset.tableName == "" || !jdbcDataset.tableName)
                throw new IllegalArgumentException("jdbcDataset table is not specified")

            String primaryKey = parameters.findAll{ qp -> qp.isPrimaryKey }.collect{qp -> return "${qp.parameterName} = ${qp.parameterValue}"}.join(" and \n")
            if (primaryKey == "" || !primaryKey)
                throw new IllegalArgumentException("primaryKey column is not specified")
            String values = parameters
                    .findAll{ qp -> !qp.isPrimaryKey }
                    .collect{qp -> return qp.parameterDataType == DataType.DATE.getName()
                            ? "${qp.parameterName} = to_date('${qp.parameterValue.substring(0,10)}','${qp.parameterDateFormat}')"
                            : qp.parameterDataType == DataType.TIMESTAMP.getName()
                            ? "${qp.parameterName} = to_timestamp('${qp.parameterValue.substring(0,19)}','${qp.parameterTimestampFormat}')"
                            : qp.parameterDataType == DataType.STRING.getName()
                            ? "${qp.parameterName} = '${qp.parameterValue}'"
                            : "${qp.parameterName} = ${qp.parameterValue}"}.join(", \n")
            if (values == "" || !values)
                throw new IllegalArgumentException("values is empty")

            switch (queryType) {
                case DMLQueryType.UPDATE:
                    query = """
                    update ${jdbcDataset.schemaName}.${jdbcDataset.tableName}
                       set ${values}
                     where ${primaryKey}
                    """; break;
                case DMLQueryType.DELETE:
                    query = """
                    delete
                      from ${jdbcDataset.schemaName}.${jdbcDataset.tableName}
                     where ${primaryKey}
                    """; break;
                case DMLQueryType.INSERT:
                    values = parameters.findAll{ qp -> !qp.isPrimaryKey }
                            .collect{qp -> return qp.parameterDataType == DataType.DATE.getName()
                                    ? "to_date('${qp.parameterValue.substring(0,10)}','${qp.parameterDateFormat}')"
                                    : qp.parameterDataType == DataType.TIMESTAMP.getName()
                                    ? "${qp.parameterName} = to_timestamp('${qp.parameterValue.substring(0,19)}','${qp.parameterTimestampFormat}')"
                                    : qp.parameterDataType == DataType.STRING.getName()
                                    ? "'${qp.parameterValue}'"
                                    : "${qp.parameterValue}"}.join(", ")
                    String columnDef = parameters.findAll{ qp -> !qp.isPrimaryKey }.collect{qp -> return "${qp.parameterName}"}.join(", ")
                    query = """
                    insert into ${jdbcDataset.schemaName}.${jdbcDataset.tableName} (${columnDef})
                    values (${values})
                    """; break;
                default:
                    query = ""; break;
            }

        } else if (dmlQuery && !dmlQuery.generateFromModel) {
            if (dmlQuery.queryText == "" || !dmlQuery.queryText)
                throw new IllegalArgumentException("${queryType} query is not specified")
            query = dmlQuery.queryText
            parameters = parameters.each{qp -> return qp.setParameterValue(
                      qp.parameterDataType == DataType.DATE.getName()
                    ? qp.parameterValue.substring(0,10)
                    : qp.parameterDataType == DataType.TIMESTAMP.getName()
                    ? qp.parameterValue.substring(0,19)
                    : qp.parameterValue)} as EList<QueryParameter>
        } else {
            throw new NoSuchMethodException("${queryType} is not supported")
        }
        Connection jdbcConnection = (jdbcDataset.connection as JdbcConnectionExt).connect()
        try {
            NamedParameterStatement p = new NamedParameterStatement(jdbcConnection, query);
            logger.info("execute${queryType}", "execute${queryType} = " + query)
            if (parameters && parameters.size() > 0 && dmlQuery && !dmlQuery.generateFromModel) {
                for (int i = 0; i <= parameters.size() - 1; ++i) {
                    p = getNamedParameterStatement(parameters, p)
                }
            }
            try {
                p.execute()
            } finally {
                (p) ? p.close() : null
            }
        } finally {
            (jdbcConnection) ? jdbcConnection.close() : null
        }
    }

    NamedParameterStatement getNamedParameterStatement(EList<QueryParameter> parameters, NamedParameterStatement p) {
        for (int i = 0; i <= parameters.size() - 1; ++i) {
            if (!parameters[i].parameterValue) {
                p.setString(parameters[i].parameterName, null)
            }
            if (parameters[i].parameterValue == null) {
                p.setObject(parameters[i].parameterName, null)
            } else if (parameters[i].parameterDataType == "Date") {
                p.setDate(parameters[i].parameterName, Date.valueOf(LocalDate.parse(parameters[i].parameterValue, parameters[i].parameterDateFormat)))
            } else if (parameters[i].parameterDataType == "Timestamp") {
                p.setTimestamp(parameters[i].parameterName, Timestamp.valueOf(LocalDateTime.parse(parameters[i].parameterValue, parameters[i].parameterTimestampFormat)))
            } else if (parameters[i].parameterDataType == "Integer") {
                p.setInt(parameters[i].parameterName, parameters[i].parameterValue.toInteger())
            } else {
                p.setString(parameters[i].parameterName, parameters[i].parameterValue)
            }
        }
        return p
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
        else if (aggregate == Aggregate.MINIMUM.toString().toLowerCase()) {return 'MIN'}
        else if (aggregate == Aggregate.SUM.toString().toLowerCase()) {return 'SUM'}
    }

    String getConvertSort(String sort) {
        if (sort == Sort.FROM_ATO_Z.toString().toLowerCase()) {return 'ASC'}
        else if (sort == Sort.FROM_ZTO_A.toString().toLowerCase()) {return 'DESC'}
    }

    String replaceCalculatorFunctions(String expression, CalculatorAdapter calculatorAdapter) {
        def pattern = /[a-zA-Z0-9_]+\([a-zA-Z0-9_,."']*\)/
        List<String> result = (expression =~ pattern ).findAll()
        if (result.size() > 0) {
            for (func in result) {
                List<String> args = (func =~ /[a-zA-Z0-9._"']+/).findAll()
                switch (args[0]) {
                    case CalculatorFunction.SUBSTRING.getName():
                        expression = expression.replace(func, calculatorAdapter.substring(args[1], args[2], args[3])); break;
                    case CalculatorFunction.UPPER.getName():
                        expression = expression.replace(func, calculatorAdapter.upper(args[1])); break;
                    case CalculatorFunction.LOWER.getName():
                        expression = expression.replace(func, calculatorAdapter.lower(args[1])); break;
                    case CalculatorFunction.LENGTH.getName():
                        expression = expression.replace(func, calculatorAdapter.length(args[1])); break;
                    case CalculatorFunction.PI.getName():
                        expression = expression.replace(func, calculatorAdapter.pi()); break;
                    case CalculatorFunction.LOG10.getName():
                        expression = expression.replace(func, calculatorAdapter.log10(args[1])); break;
                    case CalculatorFunction.CEILING.getName():
                        expression = expression.replace(func, calculatorAdapter.ceiling(args[1])); break;
                    case CalculatorFunction.CURDATE.getName():
                        expression = expression.replace(func, calculatorAdapter.curdate()); break;
                    case CalculatorFunction.CURTIME.getName():
                        expression = expression.replace(func, calculatorAdapter.curtime()); break;
                    case CalculatorFunction.YEAR.getName():
                        expression = expression.replace(func, calculatorAdapter.year(args[1])); break;
                    case CalculatorFunction.MONTH.getName():
                        expression = expression.replace(func, calculatorAdapter.month(args[1])); break;
                    case CalculatorFunction.DAY.getName():
                        expression = expression.replace(func, calculatorAdapter.day(args[1])); break;
                    case CalculatorFunction.HOUR.getName():
                        expression = expression.replace(func, calculatorAdapter.hour(args[1])); break;
                    case CalculatorFunction.MINUTE.getName():
                        expression = expression.replace(func, calculatorAdapter.minute(args[1])); break;
                    case CalculatorFunction.SECOND.getName():
                        expression = expression.replace(func, calculatorAdapter.second(args[1])); break;
                    default:
                        break;
                }
            }
        }
        return expression
    }

    private static final ClassLogger logger =
            new ClassLogger("javax.management.remote.misc", "EnvHelp")
}
