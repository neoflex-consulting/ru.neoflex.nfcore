import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilter, faArrowsAltV, faObjectGroup} from '@fortawesome/free-solid-svg-icons';
import {Button, Drawer, Select} from 'antd';
import {IServerNamedParam, IServerQueryParam} from '../../../MainContext';
import '../../../styles/AggregateHighlight.css';
import ServerFilter from './ServerFilter';
import ServerGroupBy from "./ServerGroupBy";
import ServerAggregate from './ServerAggregate';
import ServerSort from './ServerSort';
import Highlight from "./Highlight";
import Calculator from "./Calculator";
import {faCalculator} from "@fortawesome/free-solid-svg-icons/faCalculator";

const { Option, OptGroup } = Select;

export enum paramType {
    //Название совпадает со state параметрами
    filter="serverFilters",
    aggregate="serverAggregates",
    sort="serverSorts",
    group="serverGroupBy",
    highlights="highlights",
    calculations="serverCalculatedExpression"
}

interface Props {
}

interface State {
    allDatasetComponents: any[];
    currentDatasetComponent: Ecore.Resource;
    columnDefs: any[];
    defaultColumnDefs: any[];
    rowData: any[];
    serverFilters: IServerQueryParam[];
    highlights: IServerQueryParam[];
    serverAggregates: IServerQueryParam[];
    serverSorts: IServerQueryParam[];
    serverGroupBy: IServerQueryParam[];
    serverCalculatedExpression: IServerQueryParam[];
    useServerFilter: boolean;
    datasetComponentsData: any;
    allOperations: any[];
    allAggregates: any[];
    allSorts: any[];
    updateData: boolean;
    filtersMenuVisible: boolean;
    aggregatesMenuVisible: boolean;
    sortsMenuVisible: boolean;
    allHighlightType: any[];
    calculations: any[];
    calculationsMenuVisible: boolean;
}

const defaultComponentValues = {
    serverFilter:"EqualTo",
    highlights:"EqualTo",
    serverAggregation: "Average",
    serverGroupBy: "Average",
    serverSort: "FromAtoZ",
    serverCalculatedExpression: ""
};

class DatasetView extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            allDatasetComponents: [],
            currentDatasetComponent: {} as Ecore.Resource,
            columnDefs: [],
            defaultColumnDefs: [],
            rowData: [],
            serverFilters: [],
            highlights: [],
            serverAggregates: [],
            serverSorts: [],
            serverGroupBy: [],
            serverCalculatedExpression: [],
            useServerFilter: false,
            datasetComponentsData: undefined,
            allOperations: [],
            allAggregates: [],
            allSorts: [],
            updateData: false,
            filtersMenuVisible: false,
            aggregatesMenuVisible: false,
            sortsMenuVisible: false,
            allHighlightType: [],
            calculations: [],
            calculationsMenuVisible: false
        }
    }

    getAllDatasetComponents(findColumn: boolean) {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === '//DatasetComponent');
            let allDatasetComponents: any[] = [];
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((result: Ecore.Resource[]) => {
                        const userComponentName = this.props.context.userProfile.get('params').array()
                            .filter( (p: any) => p.get('key') === this.props.viewObject._id);
                        let currentDatasetComponent = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
                            result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'))
                            : result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === JSON.parse(userComponentName[0].get('value'))['name']);
                        if (currentDatasetComponent === undefined) {
                            currentDatasetComponent = result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'));
                            this.props.context.changeUserProfile(this.props.viewObject._id, undefined)
                        }
                        if (currentDatasetComponent) {
                            this.setState({currentDatasetComponent});
                            if (findColumn) {this.findColumnDefs(currentDatasetComponent)}
                        }
                        result.forEach( (d: Ecore.Resource) => {
                            if (d.eContents()[0].get('dataset')) {
                                if (d.eContents()[0].get('dataset').get('name') === this.props.viewObject.get('dataset').get('name')) {
                                    if (this.props.context.userProfile.get('userName') === 'admin' || this.props.context.userProfile.get('userName') === 'anna') {
                                        allDatasetComponents.push(d)
                                    }
                                    else if (this.props.context.userProfile.get('userName') === this.props.viewObject.get('datasetComponent').get('owner').get('name')) {
                                        allDatasetComponents.push(d)
                                    }
                                    else if (this.props.viewObject.get('datasetComponent').get('access') === 'Default' || this.props.viewObject.get('datasetComponent').get('access') === null) {
                                        allDatasetComponents.push(d)
                                    }
                                }
                            }
                        });
                        if (allDatasetComponents.length !== 0) {
                            this.setState({allDatasetComponents})
                        }
                    })
            }
        })
    };

    getAllEnumValues(enumName:string, paramName:string) {
        API.instance().findEnum('dataset', enumName)
            .then((result: EObject[]) => {
                const paramValue = result.map( (o: any) => {return o});
                this.setState<never>({
                    [paramName]: paramValue
                })
            })
    };

    findColumnDefs(resource: Ecore.Resource){
        let columnDefs: any = [];
        resource.eContents()[0].get('column')._internal.forEach( (c: Ecore.Resource) => {
            let rowData = new Map();
            rowData.set('field', c.get('name'));
            rowData.set('headerName', c.get('headerName').get('name'));
            rowData.set('headerTooltip', c.get('headerTooltip'));
            rowData.set('hide', c.get('hide'));
            rowData.set('pinned', c.get('pinned'));
            rowData.set('filter', c.get('filter'));
            rowData.set('sort', c.get('sort'));
            rowData.set('editable', c.get('editable'));
            rowData.set('checkboxSelection', c.get('checkboxSelection'));
            rowData.set('sortable', c.get('sortable'));
            rowData.set('suppressMenu', c.get('suppressMenu'));
            rowData.set('resizable', c.get('resizable'));
            rowData.set('type', c.get('datasetColumn').get('convertDataType'));
            columnDefs.push(rowData);
        });
        this.setState({columnDefs: columnDefs, defaultColumnDefs: columnDefs});
        this.findParams(resource as Ecore.Resource, columnDefs);
        this.updatedDatasetComponents(columnDefs, undefined, resource.eContents()[0].get('name'))
    }

    //Поиск сохранённых фильтров по id компоненты
    findParams(resource: Ecore.Resource, columnDefs: Object[]){
        function addEmpty(params: IServerQueryParam[]) {
            params.push(
                {index: params.length + 1,
                    datasetColumn: undefined,
                    operation: undefined,
                    value: undefined,
                    enable: true,
                    type: undefined,
                    highlightType: undefined,
                    backgroundColor: undefined,
                    color: undefined});
        }
        function getParamsFromUserProfile (userProfileParams: any): IServerQueryParam[]{
            let serverParam: IServerQueryParam[] = [];
            if (userProfileParams !== undefined) {
                userProfileParams.forEach((f: any) => {
                        if (f.datasetColumn !== undefined) {
                            serverParam.push({
                                index: serverParam.length + 1,
                                datasetColumn: f.datasetColumn,
                                operation: f.operation,
                                value: f.value,
                                enable: (f.enable !== null ? f.enable : false),
                                type: f.type,
                                highlightType: (f.highlightType !== null ? f.highlightType : 'Cell'),
                                backgroundColor: f.backgroundColor,
                                color: f.color
                            })
                        }
                    }
                )
            }
            return serverParam
        }
        function getParamsFromComponent (resource: Ecore.EObject, componentName: string): IServerQueryParam[] {
            function isValidComponentName(value: string): value is keyof typeof defaultComponentValues {
                return value in defaultComponentValues;
            }
            let serverParam: IServerQueryParam[] = [];
            if (isValidComponentName(componentName)) {
                resource.eContents()[0].get(componentName).array().forEach( (f: Ecore.Resource) => {
                    if (serverParam.filter( (filter: any) =>
                        filter['datasetColumn'] === f.get('datasetColumn') &&
                        filter['operation'] === f.get('operation') &&
                        filter['value'] === f.get('value') &&
                        filter['enable'] === (f.get('enable') !== null ? f.get('enable') : false) &&
                        filter['highlightType'] === (f.get('highlightType') !== null ? f.get('highlightType') : 'Cell') &&
                        filter['backgroundColor'] === f.get('backgroundColor') &&
                        filter['color'] === f.get('color')
                    ).length === 0) {
                        serverParam.push({
                            index: serverParam.length + 1,
                            datasetColumn: f.get('datasetColumn'),
                            operation: f.get('operation') || defaultComponentValues[componentName],
                            value: f.get('value'),
                            enable: (f.get('enable') !== null ? f.get('enable') : false),
                            type: f.get('datasetColumn'),
                            highlightType: (f.get('highlightType') !== null ? f.get('highlightType') : 'Cell'),
                            backgroundColor: f.get('backgroundColor'),
                            color: f.get('color')
                        })
                    }
                });
            }
            return serverParam
        }
        function getParamsFromURL (params: any[], columnDefs: any[]): IServerQueryParam[] {
            let serverParam: IServerQueryParam[] = [];
            if (params !== undefined && params.length !== 0) {
                params.forEach((f: any) => {
                    if (f) {
                        columnDefs.forEach((c: any) => {
                            if (c.get('field').toLowerCase() === f.datasetColumn.toLowerCase()) {
                                serverParam.push({
                                    index: serverParam.length + 1,
                                    datasetColumn: f.datasetColumn,
                                    operation: f.operation,
                                    value: f.value,
                                    enable: (f.enable !== null ? f.enable : false),
                                    type: f.type,
                                    highlightType: (f.highlightType !== null ? f.highlightType : 'Cell'),
                                    backgroundColor: f.backgroundColor,
                                    color: f.color
                                })
                            }
                        })
                    }
                })
            }
            return serverParam
        }
        let serverFilters: IServerQueryParam[] = [];
        let serverAggregates: IServerQueryParam[] = [];
        let serverSorts: IServerQueryParam[] = [];
        let serverGroupBy: IServerQueryParam[] = [];
        let highlights: IServerQueryParam[] = [];
        let serverCalculatedExpression: IServerQueryParam[] = [];
        const userProfileValue = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === resource.eContents()[0]._id);
        if (userProfileValue.length !== 0) {
            serverFilters = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverFilters);
            serverAggregates = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverAggregates);
            serverSorts = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverSorts);
            serverGroupBy = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverGroupBy);
            highlights = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).highlights);
            serverCalculatedExpression = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverCalculatedExpression);
        }
        else if (resource !== undefined) {
            serverFilters = getParamsFromComponent(resource, 'serverFilter');
            serverAggregates = getParamsFromComponent(resource, 'serverAggregation');
            serverSorts = getParamsFromComponent(resource, 'serverSort');
            serverGroupBy = getParamsFromComponent(resource, 'serverGroupBy');
            highlights = getParamsFromComponent(resource, 'highlight');
            serverCalculatedExpression = getParamsFromComponent(resource, 'serverCalculatedExpression');
        }
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            serverFilters.concat(getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs));
            /*serverAggregates = getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs);
            serverSorts = getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs);
            serverGroupBy = getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs);
            highlights = getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs);
            serverCalculatedExpression = getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs);*/
        }
        addEmpty(serverFilters);
        addEmpty(serverAggregates);
        addEmpty(serverSorts);
        addEmpty(serverGroupBy);
        addEmpty(highlights);
        addEmpty(serverCalculatedExpression);
        this.setState({serverFilters, serverAggregates, serverSorts, serverGroupBy, highlights, serverCalculatedExpression, useServerFilter: (resource) ? resource.eContents()[0].get('useServerFilter') : false});
        this.runQuery(resource, serverFilters, serverAggregates, serverSorts, serverGroupBy, serverCalculatedExpression);
    }

    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.state.currentDatasetComponent.rev !== undefined) {
            let refresh = this.props.context.userProfile.eResource().to().params !== undefined ?
                this.props.context.userProfile.eResource().to().params
                .find( (p: any) => JSON.parse(p.value).name === this.state.currentDatasetComponent.eResource().to().name)
                : undefined;
            if (prevProps.location.pathname !== this.props.location.pathname) {
                this.findParams(this.state.currentDatasetComponent, this.state.columnDefs);
            }
            else if ((refresh === undefined || refresh.length === 0) &&
                this.props.viewObject.get('datasetComponent').get('name') !== this.state.currentDatasetComponent.eContents()[0].get('name') &&
                this.props.context.userProfile.eResource().to().params !== undefined) {
                this.getAllDatasetComponents(false)
            }
            else if (prevState.allDatasetComponents.length !== 0 &&
                this.props.viewObject.get('datasetComponent').get('name') === this.state.currentDatasetComponent.eContents()[0].get('name')
                && JSON.stringify(this.props.viewObject.get('datasetComponent').eResource().to()) !== JSON.stringify(this.state.currentDatasetComponent.to())
            ) {
                this.getAllDatasetComponents(false)
            }
        }
    }

    getNewColumnDef = (parametersArray: IServerQueryParam[]) => {
        let columnDefs = this.state.defaultColumnDefs.map((e:any)=> e);
        parametersArray.forEach(element => {
            if (element.enable && element.datasetColumn) {
                let rowData = new Map();
                rowData.set('field', element.datasetColumn);
                rowData.set('headerName', element.datasetColumn);
                rowData.set('headerTooltip', "type : String");
                rowData.set('hide', false);
                rowData.set('pinned', false);
                rowData.set('filter', true);
                rowData.set('sort', true);
                rowData.set('editable', false);
                rowData.set('checkboxSelection', false);
                rowData.set('sortable', true);
                rowData.set('suppressMenu', false);
                rowData.set('resizable', false);
                rowData.set('type', "String");
                if (!columnDefs.some((col: any) => {
                    return col.get('field')?.toLocaleLowerCase() === element.datasetColumn?.toLocaleLowerCase()
                })) {
                    columnDefs.push(rowData);
                }
            }
        });
        return columnDefs
    };

    translateExpression = (calculatedExpression: IServerQueryParam[]) => {
        let sortMap = this.state.columnDefs.map(colDef => {
            return {
                fieldName : colDef.get("field"),
                fieldHeader : colDef.get("headerName")
            }
        }).sort((a, b) => {
            if (a.fieldHeader > b.fieldHeader) {
                return 1
            } else if (a.fieldHeader === b.fieldHeader){
                return 0
            }
            return -1
        });
        return calculatedExpression.map(expr => {
            let translatedOperation = expr.operation;
            sortMap.forEach(colDef => {
                if (translatedOperation?.includes(colDef.fieldHeader)) {
                    translatedOperation = translatedOperation?.replace(new RegExp(colDef.fieldHeader, 'g'), colDef.fieldName);
                }
            });
            return {
                ...expr,
                operation: translatedOperation
            }
        })
    };

    getQueryNamedParams = () => {
        if (this.props.viewObject.get('SelectToSubmit')) {
            const parameterName = this.props.viewObject.get('SelectToSubmit').get('name');
            const parameterValue = this.props.viewObject.get('SelectToSubmit').get('value');
            return [{parameterName: parameterName, parameterValue: parameterValue} as IServerNamedParam];
        }
        return []
    }

    private runQuery(resource: Ecore.Resource, filterParams: IServerQueryParam[], aggregationParams: IServerQueryParam[], sortParams: IServerQueryParam[], groupByParams: IServerQueryParam[], calculatedExpressions: IServerQueryParam[]) {
        const datasetComponentName = resource.eContents()[0].get('name');
        const calculatedExpression = this.translateExpression(calculatedExpressions);
        const queryParams = this.getQueryNamedParams();

        this.props.context.runQuery(resource, filterParams.filter((f: any) => f.enable)
                                            ,[]
                                            , sortParams.filter((f: any) => f.enable)
                                            , groupByParams.filter((f: any) => f.enable)
                                            , calculatedExpression.filter((f: any) => f.enable)
                                            , queryParams).then((json: string) => {
                let result: Object[] = JSON.parse(json);
                let newColumnDef: any[] = this.getNewColumnDef(calculatedExpression);
                aggregationParams = aggregationParams.filter((f: any) => f.datasetColumn && f.enable);
                if (aggregationParams.length !== 0) {
                    this.props.context.runQuery(resource, filterParams.filter((f: any) => f.enable)
                                                        , aggregationParams.filter((f: any) => f.enable)
                                                        , sortParams.filter((f: any) => f.enable)
                                                        , groupByParams.filter((f: any) => f.enable)
                                                        , calculatedExpression.filter((f: any) => f.enable)
                                                        , queryParams).then((aggJson: string) => {
                        result = result.concat(JSON.parse(aggJson));
                        this.setState({rowData: result, columnDefs: newColumnDef});
                        this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)
                    })
                } else {
                    this.setState({rowData: result, columnDefs: newColumnDef});
                    this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)
                }
            }
        )

    }

    componentDidMount(): void {
        if (this.state.allDatasetComponents.length === 0) {this.getAllDatasetComponents(true)}
        if (this.state.allOperations.length === 0) {this.getAllEnumValues("Operations", "allOperations")}
        if (this.state.allAggregates.length === 0) {this.getAllEnumValues("Aggregate", "allAggregates")}
        if (this.state.allSorts.length === 0) {this.getAllEnumValues("Sort", "allSorts")}
        if (this.state.allHighlightType.length === 0) {this.getAllEnumValues("HighlightType", "allHighlightType")}
    }

    componentWillUnmount() {
        this.props.context.updateContext({datasetComponents: undefined})
    }

    onChangeColumnDefs(columnDefs: any) {
        this.updatedDatasetComponents(columnDefs, undefined, this.state.currentDatasetComponent.eContents()[0].get('name'));
        this.setState({columnDefs: columnDefs});
    }

    updatedDatasetComponents(columnDefs: any, rowData: any, datasetComponentName: string){
        let currentDataset = {
            [datasetComponentName] : {
                columnDefs: columnDefs ? columnDefs : this.state.columnDefs.length !== 0 ? this.state.columnDefs : [],
                rowData: rowData ? rowData : this.state.rowData.length !== 0 ? this.state.rowData : []
            }
        };
        if (this.props.context.datasetComponents) {
            let datasetComponents = this.props.context.datasetComponents;
            datasetComponents[datasetComponentName] = {
                columnDefs: columnDefs ? columnDefs : this.state.columnDefs.length !== 0 ? this.state.columnDefs : [],
                rowData: rowData ? rowData : this.state.rowData.length !== 0 ? this.state.rowData : []
            };
                this.props.context.updateContext({datasetComponents: datasetComponents})

        } else {
            this.props.context.updateContext({datasetComponents: currentDataset})
        }
    }

    handleFiltersMenu = () => {
        this.state.filtersMenuVisible ? this.setState({ filtersMenuVisible: false
            , aggregatesMenuVisible: false
            , sortsMenuVisible: false
            , calculationsMenuVisible: false})
            : this.setState({ filtersMenuVisible: true
            , aggregatesMenuVisible: false
            , sortsMenuVisible: false
            , calculationsMenuVisible: false});
    };

    handleAggregatesMenu = () => {
        this.state.aggregatesMenuVisible ? this.setState({ aggregatesMenuVisible: false
            , filtersMenuVisible: false
            , sortsMenuVisible: false
            , calculationsMenuVisible: false})
            : this.setState({ aggregatesMenuVisible: true
            , filtersMenuVisible: false
            , sortsMenuVisible: false
            , calculationsMenuVisible: false});
    };

    handleSortsMenu = () => {
        this.state.sortsMenuVisible ? this.setState({ sortsMenuVisible: false
            , filtersMenuVisible: false
            , aggregatesMenuVisible: false
            , calculationsMenuVisible: false})
            : this.setState({ sortsMenuVisible: true
            , filtersMenuVisible: false
            , aggregatesMenuVisible: false
            , calculationsMenuVisible: false});
    };

    handleCalculationsMenu = () => {
        this.state.calculationsMenuVisible ? this.setState({ sortsMenuVisible: false
                , filtersMenuVisible: false
                , aggregatesMenuVisible: false
                , calculationsMenuVisible: false})
            : this.setState({ calculationsMenuVisible: true
                , filtersMenuVisible: false
                , aggregatesMenuVisible: false
                , sortsMenuVisible: false});
    };

    //Меняем фильтры, выполняем запрос и пишем в userProfile
    onChangeParams = (newServerParam: any[], paramName: paramType): void => {
        const filterParam = (arr: any[]): any[] => {return arr.filter((f: any) => f.datasetColumn)};
        const serverFilter = filterParam(this.state.serverFilters);
        const serverAggregates = filterParam(this.state.serverAggregates);
        const serverSorts = filterParam(this.state.serverSorts);
        const serverGroupBy = filterParam(this.state.serverGroupBy);
        const highlights = filterParam(this.state.highlights);
        const serverCalculatedExpression = filterParam(this.state.serverCalculatedExpression);
        const datasetComponentId = this.state.currentDatasetComponent.eContents()[0]._id;
        if (newServerParam !== undefined) {
            const serverParam = filterParam(newServerParam);
            const datasetComponentId = this.state.currentDatasetComponent.eContents()[0]._id;

            this.setState<never>({[paramName]: newServerParam});
            if ([paramType.filter, paramType.aggregate, paramType.sort, paramType.group, paramType.calculations].includes(paramName)) {
                this.runQuery(this.state.currentDatasetComponent,
                              (paramName === paramType.filter)? serverParam: serverFilter,
                              (paramName === paramType.aggregate)? serverParam: serverAggregates,
                                    (paramName === paramType.sort)? serverParam: serverSorts,
                                (paramName === paramType.group)? serverParam: serverGroupBy,
                             (paramName === paramType.calculations)? serverParam: serverCalculatedExpression,
                             );
            }
            this.props.context.changeUserProfile(datasetComponentId, {
                serverFilters: (paramName === paramType.filter)? serverParam: serverFilter,
                serverAggregates: (paramName === paramType.aggregate)? serverParam: serverAggregates,
                serverSorts:  (paramName === paramType.sort)? serverParam: serverSorts,
                serverGroupBy:  (paramName === paramType.group)? serverParam: serverGroupBy,
                highlights: (paramName === paramType.highlights)? serverParam: highlights,
                serverCalculatedExpression: (paramName === paramType.calculations)? serverParam: serverCalculatedExpression
            });
        }
        else {
            this.props.context.changeUserProfile(datasetComponentId, {
                serverFilters: (paramName === paramType.filter)? []: serverFilter,
                serverAggregates: (paramName === paramType.aggregate)? []: serverAggregates,
                serverSorts:  (paramName === paramType.sort)? []: serverSorts,
                serverGroupBy:  (paramName === paramType.group)? []: serverGroupBy,
                highlights: (paramName === paramType.highlights)? []: highlights,
                serverCalculatedExpression: (paramName === paramType.calculations)? []: serverCalculatedExpression
            }).then(()=>
                this.findParams(this.state.currentDatasetComponent, this.state.columnDefs)
            )
        }
    };

    changeDatasetViewState = (newServerParam: any[], paramName: paramType): void => {
        this.setState<never>({[paramName]: newServerParam});
    };

    handleChange(e: any): void {
        let params: any = {name: e};
        this.props.context.changeUserProfile(this.props.viewObject._id, params);
        let currentDatasetComponent: Ecore.Resource[] = this.state.allDatasetComponents
            .filter((c: any) => c.eContents()[0].get('name') === e);
        this.setState({currentDatasetComponent: currentDatasetComponent[0]});
        this.findColumnDefs(currentDatasetComponent[0]);
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                {this.state.allDatasetComponents.length !== 0 && this.state.currentDatasetComponent !== undefined &&
                    <div style={{display: 'inline-block'}}>
                        <Select
                            style={{ width: '250px'}}
                            showSearch={true}
                            allowClear={true}
                            value={this.state.currentDatasetComponent.eContents()[0].get('name')}
                            onChange={(e: any) => {
                                this.handleChange(e)
                            }}
                        >
                            <OptGroup
                                label='Default'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') === 'Default')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                            <OptGroup label='Private'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') === 'Private')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                            <OptGroup label='Public'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') !== 'Private' && c.eContents()[0].get('access') !== 'Default')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                        </Select>
                    </div>
                }
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                <Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}
                        onClick={this.handleFiltersMenu}
                >
                    <FontAwesomeIcon icon={faFilter} size='xs'/>
                </Button>
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                <Button title={t('aggregations')} style={{color: 'rgb(151, 151, 151)'}}
                        onClick={this.handleAggregatesMenu}
                >
                    <FontAwesomeIcon icon={faObjectGroup} size='xs'/>
                </Button>
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                <Button title={t('sorts')} style={{color: 'rgb(151, 151, 151)'}}
                        onClick={this.handleSortsMenu}
                >
                    <FontAwesomeIcon icon={faArrowsAltV} size='xs'/>
                </Button>
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                <Button title={t('calculable expressions')} style={{color: 'rgb(151, 151, 151)'}}
                        onClick={this.handleCalculationsMenu}
                >
                    <FontAwesomeIcon icon={faCalculator} size='xs'/>
                </Button>
                <Drawer
                    placement='right'
                    title={t('filters')}
                    width={'720px'}
                    visible={this.state.filtersMenuVisible}
                    onClose={this.handleFiltersMenu}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        this.state.serverFilters
                            ?
                            <ServerFilter
                                {...this.props}
                                parametersArray={this.state.serverFilters}
                                columnDefs={this.state.columnDefs}
                                allOperations={this.state.allOperations}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.filtersMenuVisible}
                                componentType={paramType.filter}
                            />
                            :
                            <ServerFilter/>
                    }
                    {
                        this.state.highlights && this.state.allHighlightType
                            ?
                            <Highlight
                                {...this.props}
                                parametersArray={this.state.highlights}
                                columnDefs={this.state.columnDefs}
                                allOperations={this.state.allOperations}
                                allHighlightType={this.state.allHighlightType}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.filtersMenuVisible}
                                componentType={paramType.highlights}
                            />
                            :
                            <Highlight/>
                    }
                </Drawer>
                <Drawer
                    placement='right'
                    title={t('aggregations')}
                    width={'700px'}
                    visible={this.state.aggregatesMenuVisible}
                    onClose={this.handleAggregatesMenu}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        this.state.serverAggregates
                            ?
                            <ServerAggregate
                                {...this.props}
                                parametersArray={this.state.serverAggregates}
                                columnDefs={this.state.columnDefs}
                                allAggregates={this.state.allAggregates}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.aggregatesMenuVisible}
                                componentType={paramType.aggregate}
                            />
                            :
                            <ServerAggregate/>
                    }
                    {
                        this.state.serverGroupBy
                            ?
                            <ServerGroupBy
                                {...this.props}
                                parametersArray={this.state.serverGroupBy}
                                columnDefs={this.state.columnDefs}
                                allAggregates={this.state.allAggregates}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.aggregatesMenuVisible}
                                componentType={paramType.group}
                            />
                            :
                            <ServerGroupBy/>
                    }
                </Drawer>
                <Drawer
                    placement='right'
                    title={t('sorts')}
                    width={'700px'}
                    visible={this.state.sortsMenuVisible}
                    onClose={this.handleSortsMenu}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        this.state.serverSorts
                            ?
                            <ServerSort
                                {...this.props}
                                parametersArray={this.state.serverSorts}
                                columnDefs={this.state.columnDefs}
                                allSorts={this.state.allSorts}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.sortsMenuVisible}
                                componentType={paramType.sort}
                            />
                            :
                            <ServerSort/>
                    }
                </Drawer>
                <Drawer
                    placement='right'
                    title={t('calculatable expressions')}
                    width={'700px'}
                    visible={this.state.calculationsMenuVisible}
                    onClose={this.handleCalculationsMenu}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        this.state.serverCalculatedExpression
                            ?
                            <Calculator
                                {...this.props}
                                parametersArray={this.state.serverCalculatedExpression}
                                columnDefs={this.state.columnDefs}
                                allCalculatorOperations={[]} /*TODO*/
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.calculationsMenuVisible}
                                componentType={paramType.calculations}
                                onChangeColumnDefs={this.onChangeColumnDefs.bind(this)}
                                defaultColumnDefs={this.state.defaultColumnDefs}
                            />
                            :
                            <Calculator/>
                    }
                </Drawer>

            </div>
        )
    }
}

export default withTranslation()(DatasetView)
