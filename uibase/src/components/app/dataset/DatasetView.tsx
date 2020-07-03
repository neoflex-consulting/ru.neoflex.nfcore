import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {Button, Drawer, Modal, Select, Menu, Dropdown} from 'antd';
import {IServerNamedParam, IServerQueryParam} from '../../../MainContext';
import '../../../styles/AggregateHighlight.css';
import ServerFilter from './ServerFilter';
import ServerGroupBy from "./ServerGroupBy";
import ServerAggregate from './ServerAggregate';
import ServerSort from './ServerSort';
import Highlight from "./Highlight";
import Calculator from "./Calculator";
import DatasetGrid from "./DatasetGrid";
import {getNamedParams} from "../../../utils/namedParamsUtils";
import DrawerDiagram from "./DrawerDiagram";
import DatasetDiagram from "./DatasetDiagram";
import SaveDatasetComponent from "./SaveDatasetComponent";
import {handleExportExcel} from "../../../utils/excelExportUtils";
import {handleExportDocx} from "../../../utils/docxExportUtils";
import {saveAs} from "file-saver";
import Fullscreen from "react-full-screen";
import {actionType, eventType, grantType} from "../../../utils/consts";

//icons
import filterIcon from "../../../icons/filterIcon.svg";
import {faExpandArrowsAlt, faCompressArrowsAlt} from "@fortawesome/free-solid-svg-icons";
import groupIcon from "../../../icons/groupIcon.svg";
import orderIcon from "../../../icons/orderIcon.svg";
import calculatorIcon from "../../../icons/calculatorIcon.svg";
import diagramIcon from "../../../icons/diagramIcon.svg";
import plusIcon from "../../../icons/plusIcon.svg";
import penIcon from "../../../icons/penIcon.svg";
import flagIcon from "../../../icons/flagIcon.svg";
import trashcanIcon from "../../../icons/trashcanIcon.svg";
import downloadIcon from "../../../icons/downloadIcon.svg";
import printIcon from "../../../icons/printIcon.svg";
import questionMarkIcon from "../../../icons/questionMarkIcon.svg";
import aggregationGroupsIcon from "../../../icons/aggregationGroupsIcon.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ServerGroupByColumn from "./ServerGroupByColumn";
import DeleteDatasetComponent from "./DeleteDatasetComponent";



const { Option, OptGroup } = Select;

export enum paramType {
    filter="serverFilters",
    aggregate="serverAggregates",
    sort="serverSorts",
    group="serverGroupBy",
    groupByColumn="groupByColumn",
    highlights="highlights",
    calculations="serverCalculatedExpression",
    diagrams="diagrams",
    diagramsAdd="diagramsAdd"
}

interface Props {
}

export interface IDiagram {
    id: number,
    keyColumn: string,
    valueColumn: string,
    diagramName: string,
    diagramLegend: string,
    legendAnchorPosition: string,
    axisXPosition: string,
    axisXLegend: string,
    axisYPosition: string,
    axisYLegend: string,
    diagramType: string,
    colorSchema: string
    isSingle: boolean
}

interface State {
    allDatasetComponents: any[];
    currentDatasetComponent: Ecore.Resource;
    currentDiagram?: IDiagram;
    columnDefs: any[];
    defaultColumnDefs: any[];
    fullScreenOn: boolean;
    rowData: any[];
    highlights: IServerQueryParam[];
    calculations: any[];
    diagrams: IDiagram[];
    serverFilters: IServerQueryParam[];
    serverAggregates: IServerQueryParam[];
    serverSorts: IServerQueryParam[];
    serverGroupBy: IServerQueryParam[];
    groupByColumn: IServerQueryParam[];
    serverCalculatedExpression: IServerQueryParam[];
    queryParams: IServerNamedParam[]
    useServerFilter: boolean;
    filtersMenuVisible: boolean;
    aggregatesMenuVisible: boolean;
    aggregatesGroupsMenuVisible: boolean;
    sortsMenuVisible: boolean;
    calculationsMenuVisible: boolean;
    diagramAddMenuVisible: boolean;
    diagramEditMenuVisible: boolean;
    saveMenuVisible: boolean;
    deleteMenuVisible: boolean;
    allOperations: Array<EObject>;
    allAggregates: Array<EObject>;
    allSorts: Array<EObject>;
    allHighlightType: any[];
    allAxisXPosition: Array<EObject>;
    allAxisYPosition: Array<EObject>;
    allLegendPosition: Array<EObject>;
    currentTheme: string;
    showUniqRow: boolean;
    isHighlightsUpdated: boolean;
    isHidden: boolean;
    isDisabled: boolean;
    isReadOnly: boolean;
}

const defaultComponentValues = {
    serverFilter:"EqualTo",
    highlight:"EqualTo",
    serverAggregation: "Average",
    serverGroupBy: "Average",
    serverSort: "FromAtoZ",
    serverCalculatedExpression: "",
    groupByColumn: ""
};


class DatasetView extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            allDatasetComponents: [],
            currentDatasetComponent: {} as Ecore.Resource,
            currentDiagram: undefined,
            columnDefs: [],
            defaultColumnDefs: [],
            deleteMenuVisible: false,
            rowData: [],
            highlights: [],
            calculations: [],
            diagrams: [],
            serverFilters: [],
            serverAggregates: [],
            serverSorts: [],
            serverGroupBy: [],
            groupByColumn: [],
            serverCalculatedExpression: [],
            queryParams: [],
            useServerFilter: false,
            filtersMenuVisible: false,
            fullScreenOn: false,
            aggregatesMenuVisible: false,
            aggregatesGroupsMenuVisible: false,
            sortsMenuVisible: false,
            diagramAddMenuVisible: false,
            diagramEditMenuVisible: false,
            calculationsMenuVisible: false,
            saveMenuVisible: false,
            allOperations: [],
            allAggregates: [],
            allSorts: [],
            allHighlightType: [],
            allAxisXPosition: [],
            allAxisYPosition: [],
            allLegendPosition: [],
            currentTheme: 'material',
            showUniqRow: this.props.viewObject.get('showUniqRow') || false,
            isHighlightsUpdated: true,
            isHidden: this.props.hidden,
            isDisabled: this.props.disabled,
            isReadOnly: this.props.grantType === grantType.read || this.props.disabled || this.props.isParentDisabled,
        }
    }

    //TODO нужна оптимизация
    getAllDatasetComponents(findColumn: boolean) {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c.eURI() === 'ru.neoflex.nfcore.dataset#//DatasetComponent');
            let allDatasetComponents: any[] = [];
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((result: Ecore.Resource[]) => {
                        const userComponentName = this.props.context.userProfile.get('params').array()
                            .filter( (p: any) => p.get('key') === this.props.viewObject.eURI());
                        let currentDatasetComponent = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
                            result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'))
                            : result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === JSON.parse(userComponentName[0].get('value'))['name']);
                        if (currentDatasetComponent === undefined) {
                            currentDatasetComponent = result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'));
                            this.props.context.changeUserProfile(this.props.viewObject.eURI(), undefined)
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

    getAllEnumValues(ePackageName:string, enumName:string, paramName:string) {
        API.instance().findEnum(ePackageName, enumName)
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
            rowData.set('type',
                c.get('datasetColumn') !== null ? c.get('datasetColumn').get('convertDataType') : null);
            rowData.set('component', c.get('component'));
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
        function getDiagramsFromUserProfile (userProfileParams: any): IDiagram[]{
            let diagrams: IDiagram[] = [];
            if (userProfileParams !== undefined) {
                userProfileParams.forEach((f: IDiagram) => {
                        if (f.diagramName !== undefined) {
                            diagrams.push({
                                id: diagrams.length,
                                diagramName: f.diagramName,
                                diagramType: f.diagramType,
                                axisXLegend: f.axisXLegend,
                                axisYLegend: f.axisYLegend,
                                axisXPosition: f.axisXPosition,
                                axisYPosition: f.axisYPosition,
                                colorSchema: f.colorSchema,
                                diagramLegend: f.diagramLegend,
                                isSingle: f.isSingle,
                                keyColumn: f.keyColumn,
                                legendAnchorPosition: f.legendAnchorPosition,
                                valueColumn: f.valueColumn
                            })
                        }
                    }
                )
            }
            return diagrams
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
        function getDiagramsFromComponent (resource: Ecore.EObject, componentName: string): IDiagram[] {
            let diagrams: IDiagram[] = [];
            if (componentName) {
                resource.eContents()[0].get(componentName).array().forEach( (f: Ecore.Resource) => {
                    diagrams.push({
                        id: diagrams.length,
                        diagramName: f.get('diagramName'),
                        diagramType: (f.get('diagramType') !== null ? f.get('diagramType') : "Line"),
                        axisXLegend: f.get('axisXLegend'),
                        axisYLegend: f.get('axisYLegend'),
                        axisXPosition: (f.get('axisXPosition') !== null ? f.get('axisXPosition') : "Top"),
                        axisYPosition: (f.get('axisYPosition') !== null ? f.get('axisYPosition') : "Left"),
                        legendAnchorPosition: (f.get('legendAnchorPosition') !== null ? f.get('legendAnchorPosition') : "TopLeft"),
                        colorSchema: "accent",
                        diagramLegend: f.get('diagramLegend'),
                        isSingle: true,
                        keyColumn: f.get('keyColumn'),
                        valueColumn: f.get('valueColumn'),
                    })
                });
            }
            return diagrams
        }
        function getParamsFromURL (params: any[], columnDefs: any[]): IServerQueryParam[] {
            let serverParam: IServerQueryParam[] = [];
            if (params !== undefined && params.length !== 0) {
                params.forEach((f: any) => {
                    if (f.datasetColumn) {
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
        let groupByColumn: IServerQueryParam[] = [];
        let highlights: IServerQueryParam[] = [];
        let serverCalculatedExpression: IServerQueryParam[] = [];
        let diagrams: IDiagram[] = [];
        const userProfileValue = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === resource.eContents()[0].eURI());
        if (userProfileValue.length !== 0) {
            serverFilters = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverFilters);
            serverAggregates = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverAggregates);
            serverSorts = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverSorts);
            serverGroupBy = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverGroupBy);
            groupByColumn = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).groupByColumn);
            highlights = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).highlights);
            serverCalculatedExpression = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).serverCalculatedExpression);
            diagrams = getDiagramsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).diagrams);
        }
        else if (resource !== undefined) {
            serverFilters = getParamsFromComponent(resource, 'serverFilter');
            serverAggregates = getParamsFromComponent(resource, 'serverAggregation');
            serverSorts = getParamsFromComponent(resource, 'serverSort');
            serverGroupBy = getParamsFromComponent(resource, 'serverGroupBy');
            groupByColumn = getParamsFromComponent(resource, 'groupByColumn');
            highlights = getParamsFromComponent(resource, 'highlight');
            diagrams = getDiagramsFromComponent(resource, 'diagram');
        }
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            serverFilters.concat(getParamsFromURL(this.props.pathFull[this.props.pathFull.length - 1].params, columnDefs));
        }
        addEmpty(serverFilters);
        addEmpty(serverAggregates);
        addEmpty(serverSorts);
        addEmpty(serverGroupBy);
        addEmpty(groupByColumn);
        addEmpty(highlights);
        addEmpty(serverCalculatedExpression);
        this.setState({ serverFilters, serverAggregates, serverSorts, serverGroupBy, groupByColumn, highlights, serverCalculatedExpression, diagrams, useServerFilter: (resource) ? resource.eContents()[0].get('useServerFilter') : false});
        this.prepParamsAndRun(resource, serverFilters, serverAggregates, serverSorts, serverGroupBy, serverCalculatedExpression, groupByColumn);
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

    getColumnDefGroupBy = (rowDataShow: any) => {
        let columnDefs: any[] = [];
        this.state.defaultColumnDefs.forEach((c:any) => {
            if (rowDataShow[0][c.get('field')] !== undefined) {
                let rowData = new Map();
                let newHeaderName = this.state.serverGroupBy
                    .find((s: any) => s['datasetColumn'] === c.get('field'))
                rowData.set('field', c.get('field'));
                rowData.set('headerName', newHeaderName && newHeaderName.value ? newHeaderName.value : c.get('headerName'));
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
                rowData.set('type', c.get('type'));
                rowData.set('component', c.get('component'));
                columnDefs.push(rowData);
            } else {
                let rowData = new Map();
                rowData.set('field', c.get('field'));
                rowData.set('headerName', c.get('headerName'));
                rowData.set('headerTooltip', c.get('headerTooltip'));
                rowData.set('hide', true);
                rowData.set('pinned', c.get('pinned'));
                rowData.set('filter', c.get('filter'));
                rowData.set('sort', c.get('sort'));
                rowData.set('editable', c.get('editable'));
                rowData.set('checkboxSelection', c.get('checkboxSelection'));
                rowData.set('sortable', c.get('sortable'));
                rowData.set('suppressMenu', c.get('suppressMenu'));
                rowData.set('resizable', c.get('resizable'));
                rowData.set('type', c.get('type'));
                rowData.set('component', c.get('component'));
                columnDefs.push(rowData);
            }
        });
        return columnDefs
    };

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

    translateExpression(calculatedExpression: IServerQueryParam[]) {
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

    private prepParamsAndRun(
        resource: Ecore.Resource,
        filterParams: IServerQueryParam[],
        aggregationParams: IServerQueryParam[],
        sortParams: IServerQueryParam[],
        groupByParams: IServerQueryParam[],
        calculatedExpressions: IServerQueryParam[],
        groupByColumnParams: IServerQueryParam[],
    ) {
        const datasetComponentName = resource.eContents()[0].get('name');
        const calculatedExpression = this.translateExpression(calculatedExpressions);
        const newQueryParams = getNamedParams(this.props.viewObject.get('valueItems')
                                            , this.props.context.contextItemValues
                                            , this.props.pathFull[this.props.pathFull.length - 1].params);

        this.props.context.runQuery(resource
            , newQueryParams
            , filterParams.filter((f: any) => f.enable)
            , []
            , sortParams.filter((f: any) => f.enable)
            , groupByParams.filter((f: any) => f.enable)
            , calculatedExpression.filter((f: any) => f.enable)
            , groupByColumnParams.filter((f: any) => f.enable)
        ).then((json: string) => {
                let result: Object[] = JSON.parse(json);
                let newColumnDef: any[];
                if (groupByParams.length !== 0 && result.length !== 0) {
                    newColumnDef = this.getColumnDefGroupBy(result)
                } else {
                    newColumnDef = this.getNewColumnDef(calculatedExpression);
                }
                aggregationParams = aggregationParams.filter((f: any) => f.datasetColumn && f.enable);
                if (aggregationParams.length !== 0) {
                    this.props.context.runQuery(resource
                        , newQueryParams
                        , filterParams.filter((f: any) => f.enable)
                        , aggregationParams.filter((f: any) => f.enable)
                        , sortParams.filter((f: any) => f.enable)
                        , groupByParams.filter((f: any) => f.enable)
                        , calculatedExpression.filter((f: any) => f.enable)
                        , groupByColumnParams.filter((f: any) => f.enable))
                        .then((aggJson: string) => {
                        result = result.concat(JSON.parse(aggJson));
                        /*this.getAllDatasetComponents(true);*/
                        this.setState({rowData: result, columnDefs: newColumnDef});
                        this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)})
                } else {
                    this.setState({rowData: result, columnDefs: newColumnDef});
                    this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)
                }
            }
        )

    }

    refresh(): void {
        if (this.state.currentDatasetComponent.eResource) {
            this.prepParamsAndRun(this.state.currentDatasetComponent.eResource(),
                this.state.serverFilters,
                this.state.serverAggregates,
                this.state.serverSorts,
                this.state.serverGroupBy,
                this.state.serverCalculatedExpression,
                this.state.groupByColumn
            );
        }
    }

    componentDidMount(): void {
        if (this.state.allDatasetComponents.length === 0) {this.getAllDatasetComponents(true)}
        if (this.state.allOperations.length === 0) {this.getAllEnumValues("dataset","Operations", "allOperations")}
        if (this.state.allAggregates.length === 0) {this.getAllEnumValues("dataset","Aggregate", "allAggregates")}
        if (this.state.allSorts.length === 0) {this.getAllEnumValues("dataset","Sort", "allSorts")}
        if (this.state.allHighlightType.length === 0) {this.getAllEnumValues("dataset","HighlightType", "allHighlightType")}
        if (this.state.allAxisXPosition.length === 0) {this.getAllEnumValues("dataset","AxisXPositionType", "allAxisXPosition")}
        if (this.state.allAxisYPosition.length === 0) {this.getAllEnumValues("dataset","AxisYPositionType", "allAxisYPosition")}
        if (this.state.allLegendPosition.length === 0) {this.getAllEnumValues("dataset","LegendAnchorPositionType", "allLegendPosition")}

        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
            actions: [
                {actionType: actionType.execute,callback: this.refresh.bind(this)},
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount() {
        this.props.context.removeEventAction()
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

    handleChange(e: any): void {
        let params: any = {name: e};
        this.props.context.changeUserProfile(this.props.viewObject.eURI(), params);
        let currentDatasetComponent: Ecore.Resource[] = this.state.allDatasetComponents
            .filter((c: any) => c.eContents()[0].get('name') === e);
        this.setState({currentDatasetComponent: currentDatasetComponent[0]});
        this.findColumnDefs(currentDatasetComponent[0]);
    }


    handleDrawerVisibility = (p: paramType, v:boolean) => {
        this.setState({
            filtersMenuVisible: (p === paramType.filter || p === paramType.highlights) ? v : false
            , aggregatesGroupsMenuVisible : (p === paramType.group) ? v : false
            , aggregatesMenuVisible: (p === paramType.aggregate) ? v : false
            , sortsMenuVisible: (p === paramType.sort) ? v : false
            , calculationsMenuVisible: (p === paramType.calculations) ? v : false
            , diagramAddMenuVisible: (p === paramType.diagramsAdd) ? v : false
            , diagramEditMenuVisible: (p === paramType.diagrams) ? v : false});
    };

    datasetViewChangeUserProfile(datasetComponentId: string, paramName: paramType, param: any): any {
        const filterParam = (arr: any[]): any[] => {return arr.filter((f: any) => f.datasetColumn)};
        return this.props.context.changeUserProfile(datasetComponentId, {
            serverFilters: (paramName === paramType.filter)? param: filterParam(this.state.serverFilters),
            serverAggregates: (paramName === paramType.aggregate)? param: filterParam(this.state.serverAggregates),
            serverSorts:  (paramName === paramType.sort)? param: filterParam(this.state.serverSorts),
            serverGroupBy:  (paramName === paramType.group)? param: filterParam(this.state.serverGroupBy),
            groupByColumn: (paramName === paramType.groupByColumn)? param: filterParam(this.state.groupByColumn),
            highlights: (paramName === paramType.highlights)? param: filterParam(this.state.highlights),
            serverCalculatedExpression: (paramName === paramType.calculations)? param: filterParam(this.state.serverCalculatedExpression),
            diagrams: (paramName === paramType.diagrams)? param: this.state.diagrams,
        });
    }

    //Меняем фильтры, выполняем запрос и пишем в userProfile

    onChangeParams = (newServerParam: any[], paramName: paramType): void => {
        const filterParam = (arr: any[]): any[] => {return arr.filter((f: any) => f.datasetColumn)};
        const serverFilter = filterParam(this.state.serverFilters);
        const serverAggregates = filterParam(this.state.serverAggregates);
        const serverSorts = filterParam(this.state.serverSorts);
        const serverGroupBy = filterParam(this.state.serverGroupBy);
        const groupByColumn = filterParam(this.state.groupByColumn);
        const serverCalculatedExpression = filterParam(this.state.serverCalculatedExpression);
        const datasetComponentId = this.state.currentDatasetComponent.eContents()[0].eURI();

        if (newServerParam !== undefined) {
            const serverParam = filterParam(newServerParam);
            const datasetComponentId = this.state.currentDatasetComponent.eContents()[0].eURI();

            this.setState<never>({[paramName]: newServerParam, isHighlightsUpdated: (paramName === paramType.highlights)});
            if ([paramType.filter, paramType.aggregate, paramType.sort, paramType.group, paramType.groupByColumn, paramType.calculations].includes(paramName)) {
                this.prepParamsAndRun(this.state.currentDatasetComponent,
                    (paramName === paramType.filter)? serverParam: serverFilter,
                    (paramName === paramType.aggregate)? serverParam: serverAggregates,
                    (paramName === paramType.sort)? serverParam: serverSorts,
                    (paramName === paramType.group)? serverParam: serverGroupBy,
                    (paramName === paramType.calculations)? serverParam: serverCalculatedExpression,
                    (paramName === paramType.groupByColumn)? serverParam: groupByColumn,
                );
            }
            this.datasetViewChangeUserProfile(datasetComponentId, paramName, serverParam);
        }
        else {
            this.datasetViewChangeUserProfile(datasetComponentId, paramName, []).then(()=>
                this.findParams(this.state.currentDatasetComponent, this.state.columnDefs)
            )
        }
    };

    changeDatasetViewState = (newParam: any, paramName: string): void => {
        this.setState<never>({[paramName]: newParam});
    };

    handleDiagramChange = (action: string, newDiagram?: IDiagram): void => {
        let newDiagrams:IDiagram[] = [];
        if (action === "add" && newDiagram) {
            newDiagrams = this.state.diagrams.concat(newDiagram);
            this.setState({
                currentDiagram: newDiagram,
                diagrams: newDiagrams
            });
        } else if (action === "edit" && newDiagram) {
            newDiagrams = this.state.diagrams.map(value => {
                return (value.id === newDiagram.id)? newDiagram : value
            });
            this.setState({
                currentDiagram: newDiagram,
                diagrams: newDiagrams
            });
        } else {
            if (this.state.diagrams.length > 1) {
                newDiagrams = this.state.diagrams.filter(value => {
                    return value.diagramName !== this.state.currentDiagram?.diagramName
                });
                this.setState({
                    currentDiagram: newDiagrams[0],
                    diagrams: newDiagrams
                })
            } else {
                newDiagrams = [];
                this.handleDrawerVisibility(paramType.diagrams,false);
                this.handleDrawerVisibility(paramType.diagramsAdd,false);
                this.setState({
                    currentDiagram: undefined,
                    diagrams: []
                })
            }
        }
        this.datasetViewChangeUserProfile(this.state.currentDatasetComponent.eContents()[0].eURI()
            , paramType.diagrams
            , newDiagrams);
    };

    onActionMenu(e : any) {
        if (e.key === 'exportToDocx') {
            handleExportDocx(this.props.context.getDocxHandlers()).then(blob => {
                saveAs(new Blob([blob]), "example.docx");
                console.log("Document created successfully");
            });
        }
        if (e.key === 'exportToExcel') {
            handleExportExcel(this.props.context.getExcelHandlers()).then((blob) => {
                    saveAs(new Blob([blob]), 'example.xlsx');
                    console.log("Document created successfully");
                }
            );
        }
    }

    getGridPanel = () => {
        const { t } = this.props;
        const menu = (<Menu
            key='actionMenu'
            onClick={(e: any) => this.onActionMenu(e)}
            style={{width: '150px'}}
        >
            <Menu.Item key='exportToDocx'>
                exportToDocx
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                exportToExcel
            </Menu.Item>
        </Menu>)
        return <div>
            <Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}
            >
                <img style={{width: '24px', height: '24px'}} src={filterIcon} alt="filterIcon" />
            </Button>
            <Button title={t('sorts')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}
            >
                <img style={{width: '24px', height: '24px'}} src={orderIcon} alt="orderIcon" />
            </Button>
            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            <Button title={t('calculator')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}
            >
                <img style={{width: '24px', height: '24px'}} src={calculatorIcon} alt="calculatorIcon" />
            </Button>
            <Button title={t('aggregations')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}
            >
                <img style={{width: '24px', height: '24px'}} src={groupIcon} alt="groupIcon" />
            </Button>
            <Button title={t('diagram')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        (this.state.diagrams.length > 0)
                            ? this.setState({currentDiagram: this.state.diagrams[0]})
                            : this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible)}
                    }
            >
                <img style={{width: '24px', height: '24px'}} src={diagramIcon} alt="diagramIcon" />
            </Button>
            <Button title={t('grouping')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDrawerVisibility(paramType.group,!this.state.aggregatesGroupsMenuVisible)}}
            >
                <img style={{width: '24px', height: '24px'}} src={aggregationGroupsIcon} alt="aggregationGroups" />
            </Button>


            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>

            <Button title={t('save')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.setState({saveMenuVisible:!this.state.saveMenuVisible})}}
            >
                <img style={{width: '24px', height: '24px'}} src={flagIcon} alt="flagIcon" />
            </Button>

            {
                 this.state.currentDatasetComponent.rev !== undefined &&
                 this.state.currentDatasetComponent.eContents()[0].get( 'access') !== 'Default' &&
                <Button title={t('delete')} style={{color: 'rgb(151, 151, 151)'}}
                >
                    <img style={{width: '24px', height: '24px'}} src={trashcanIcon} alt="trashcanIcon"
                         onClick={()=>{this.setState({deleteMenuVisible:!this.state.deleteMenuVisible})}}/>
                </Button>
            }

            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            {this.state.allDatasetComponents.length !== 0
            && this.state.currentDatasetComponent !== undefined
            &&
            <div id="selectsInFullScreen" style={{display: 'inline-block'}}>
                <Select
                    getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}
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

            <Dropdown overlay={menu} placement="bottomLeft">
                <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}>
                    <img style={{width: '24px', height: '24px'}} src={downloadIcon} alt="downloadIcon" />
                </Button>
            </Dropdown>


            <Button title={t('print')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{}}
            >
                <img style={{width: '24px', height: '24px'}} src={printIcon} alt="printIcon" />
            </Button>
            <Button
                className="buttonFullScreen"
                type="link"
                ghost
                style={{
                    marginRight: '10px',
                    width: '32px',
                    height: '32px',
                    color: 'rgb(151, 151, 151)'
                }}
                onClick={this.onFullScreen}
            >
                {this.state.fullScreenOn  ?
                    <FontAwesomeIcon icon={faCompressArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>
                    :
                    <FontAwesomeIcon icon={faExpandArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>}
            </Button>
        </div>
    };

    getDiagramPanel = () => {
        const { t } = this.props;
        return <div id="selectInGetDiagramPanel">
            <Button title={t('back')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagrams,false);
                        this.handleDrawerVisibility(paramType.diagramsAdd,false);
                        this.setState({currentDiagram:undefined})
                    }}
            >
                Вернуться к таблице
            </Button>
            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            <Button title={t('add')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible);
                    }}
            >
                <img style={{width: '24px', height: '24px'}} src={plusIcon} alt="addIcon" />
            </Button>
            <Button title={t('edit')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagrams,!this.state.diagramEditMenuVisible);
                    }}
            >
                <img style={{width: '24px', height: '24px'}} src={penIcon} alt="penIcon" />
            </Button>
            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            <Button title={t('flag')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.setState({saveMenuVisible:!this.state.saveMenuVisible})}}
            >
                <img style={{width: '24px', height: '24px'}} src={flagIcon} alt="flagIcon" />
            </Button>
            <Button title={t('delete')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.handleDiagramChange("delete")}}
            >
                <img style={{width: '24px', height: '24px'}} src={trashcanIcon} alt="trashcanIcon" />
            </Button>
            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            <div style={{display: 'inline-block'}}>
                <Select
                    getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                    style={{ width: '250px'}}
                    showSearch={true}
                    allowClear={true}
                    value={this.state.currentDiagram?.diagramName}
                    onChange={(e: string) => {
                        this.setState({
                            currentDiagram: this.state.diagrams.find(function(el) {
                                return el.diagramName === e
                            })
                        });
                    }}
                >
                    {
                        this.state.diagrams.map((c: IDiagram) =>
                            <Option
                                key={c.diagramName}
                                value={c.diagramName}>
                                {c.diagramName}
                            </Option>)
                    }
                </Select>
            </div>
            <div style={{display: 'inline-block', height: '30px',
                borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
            <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        handleExportExcel(this.props.context.excelHandlers).then((blob) => {
                                saveAs(new Blob([blob]), 'example.xlsx');
                                console.log("Document created successfully");
                            }
                        );
                    }}
            >
                <img style={{width: '24px', height: '24px'}} src={downloadIcon} alt="downloadIcon" />
            </Button>
            <Button title={t('print')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{}}
            >
                <img style={{width: '24px', height: '24px'}} src={printIcon} alt="printIcon" />
            </Button>
            <Button title={t('about')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{}}
            >
                <img style={{width: '24px', height: '24px'}} src={questionMarkIcon} alt="questionMarkIcon" />
            </Button>
            <Button
                className="buttonFullScreen"
                type="link"
                ghost
                style={{
                    marginRight: '10px',
                    width: '32px',
                    height: '32px',
                    color: 'rgb(151, 151, 151)'
                }}
                onClick={this.onFullScreen}
            >
                {this.state.fullScreenOn  ?
                    <FontAwesomeIcon icon={faCompressArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>
                    :
                    <FontAwesomeIcon icon={faExpandArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>}
            </Button>

        </div>
    };

    handleSaveMenu = () => {
        this.state.saveMenuVisible ? this.setState({ saveMenuVisible: false }) : this.setState({ saveMenuVisible: true })
    };

    handleDeleteMenu = () => {
       this.handleDeleteMenuForCancel()
        if(this.state.deleteMenuVisible) {
            for (let i = 0; i < this.state.allDatasetComponents.length; i++) {
                if (this.state.allDatasetComponents[i].eContents()[0].get('access') === 'Default') {
                    this.handleChange(this.state.allDatasetComponents[i].eContents()[0].get('name'))
                    this.getAllDatasetComponents(true)

                }
            }
        }
    };

    handleDeleteMenuForCancel = () => {
        this.state.deleteMenuVisible ? this.setState({ deleteMenuVisible: false }) : this.setState({ deleteMenuVisible: true })

    };

    onFullScreen = () => {
        if (this.state.fullScreenOn){
            this.setState({ fullScreenOn: false});
        }
        else{
            this.setState({ fullScreenOn: true});
        }
    };

    render() {
        const { t } = this.props;
        return (
        <div hidden={this.state.isHidden}>
        <Fullscreen
        enabled={this.state.fullScreenOn}
        onChange={fullScreenOn => this.setState({ fullScreenOn })}>
            <div>
                {(this.state.currentDiagram)? this.getDiagramPanel(): this.getGridPanel()}
                {(this.state.currentDiagram)
                    ?
                    <DatasetDiagram
                        {...this.props}
                        rowData={this.state.rowData}
                        diagramParams={this.state.currentDiagram}
                    />
                    :
                    <DatasetGrid
                        {...this.props}
                        isAggregatesHighlighted = {(this.state.serverAggregates.filter((f)=>{return f.enable && f.datasetColumn}).length !== 0)}
                        highlights = {this.state.highlights}
                        currentDatasetComponent = {this.state.currentDatasetComponent}
                        rowData = {this.state.rowData}
                        columnDefs = {this.state.columnDefs}
                        currentTheme = {this.state.currentTheme}
                        showUniqRow = {this.state.showUniqRow}
                        isHighlightsUpdated = {this.state.isHighlightsUpdated}
                        saveChanges = {this.changeDatasetViewState}
                    />
                }
                <div id="filterButton">
                <Drawer

                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    placement='right'
                    title={t('filters')}
                    width={'720px'}
                    visible={this.state.filtersMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}
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
                </div>
                <div id="aggregationButton">
                <Drawer
                    getContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                    placement='right'
                    title={t('aggregations')}
                    width={'700px'}
                    visible={this.state.aggregatesMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}
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
                </Drawer>
                    </div>
                <div id="aggregationGroupsButton">
                    <Drawer
                        getContainer={() => document.getElementById ('aggregationGroupsButton') as HTMLElement}
                        placement='right'
                        title={t('grouping')}
                        width={'700px'}
                        visible={this.state.aggregatesGroupsMenuVisible}
                        onClose={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesGroupsMenuVisible)}}
                        mask={false}
                        maskClosable={false}
                    >
                        {
                            this.state.groupByColumn
                                ?
                                <ServerGroupByColumn
                                    {...this.props}
                                    parametersArray={this.state.groupByColumn}
                                    columnDefs={this.state.columnDefs}
                                    allAggregates={this.state.allAggregates}
                                    onChangeParameters={this.onChangeParams}
                                    saveChanges={this.changeDatasetViewState}
                                    isVisible={this.state.aggregatesGroupsMenuVisible}
                                    componentType={paramType.groupByColumn}
                                />
                                :
                                <ServerGroupByColumn/>
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
                                    isVisible={this.state.aggregatesGroupsMenuVisible}
                                    componentType={paramType.group}
                                />
                                :
                                <ServerGroupBy/>
                        }
                    </Drawer>
                </div>
                <div id="sortButton">
                <Drawer
                    getContainer={() => document.getElementById ('sortButton') as HTMLElement}
                    placement='right'
                    title={t('sorts')}
                    width={'700px'}
                    visible={this.state.sortsMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}
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
                </div>
                <div id="calculatableexpressionsButton">
                <Drawer
                    getContainer={() => document.getElementById ('calculatableexpressionsButton') as HTMLElement}
                    placement='right'
                    title={t('calculator')}
                    width={'700px'}
                    visible={this.state.calculationsMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}
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
                <div id="diagramButton">
                <Drawer
                    getContainer={() => document.getElementById ('diagramButton') as HTMLElement}
                    placement='right'
                    title={t('diagram')}
                    width={'700px'}
                    visible={this.state.diagramAddMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible)}}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        <DrawerDiagram
                            {...this.props}
                            columnDefs={this.state.columnDefs}
                            allAxisXPosition={this.state.allAxisXPosition}
                            allAxisYPosition={this.state.allAxisYPosition}
                            allLegendPosition={this.state.allLegendPosition}
                            allSorts={this.state.allSorts}
                            allAggregates={this.state.allAggregates}
                            saveChanges={this.handleDiagramChange}
                            action={"add"}
                            currentDiagram={undefined}
                            id={this.state.diagrams.length}
                        />
                    }
                </Drawer>
                </div>
                <div id="diagram">
                <Drawer
                    getContainer={() => document.getElementById ('diagram') as HTMLElement}
                    placement='right'
                    title={t('diagram')}
                    width={'700px'}
                    visible={this.state.diagramEditMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.diagrams,!this.state.diagramEditMenuVisible)}}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        <DrawerDiagram
                            {...this.props}
                            columnDefs={this.state.columnDefs}
                            allAxisXPosition={this.state.allAxisXPosition}
                            allAxisYPosition={this.state.allAxisYPosition}
                            allLegendPosition={this.state.allLegendPosition}
                            allSorts={this.state.allSorts}
                            allAggregates={this.state.allAggregates}
                            saveChanges={this.handleDiagramChange}
                            action={"edit"}
                            currentDiagram={this.state.currentDiagram}
                            id={(this.state.currentDiagram)? this.state.currentDiagram.id: 0}
                        />
                    }
                </Drawer>
                </div>
                <div id="delete_menuButton">
                    <Modal
                        getContainer={() => document.getElementById ('delete_menuButton') as HTMLElement}
                        key="save_menu"
                        width={'250px'}
                        title={t('delete report')}
                        visible={this.state.deleteMenuVisible}
                        footer={null}
                        onCancel={this.handleDeleteMenuForCancel}
                    >
                        <DeleteDatasetComponent
                            {...this.props}
                            closeModal={this.handleDeleteMenu}
                            handleDeleteMenuForCancel={this.handleDeleteMenuForCancel}
                            allDatasetComponent={this.state.allDatasetComponents}
                            currentDatasetComponent={this.state.currentDatasetComponent}

                        />
                    </Modal>
                </div>
                <div id="save_menuButton">
                    <Modal
                        getContainer={() => document.getElementById ('save_menuButton') as HTMLElement}
                        key="save_menu"
                        width={'500px'}
                        title={t('saveReport')}
                        visible={this.state.saveMenuVisible}
                        footer={null}
                        onCancel={this.handleSaveMenu}
                    >
                        <SaveDatasetComponent
                            {...this.props}
                            currentDatasetComponent={this.state.currentDatasetComponent}
                            closeModal={this.handleSaveMenu}
                        />
                    </Modal>
                </div>
            </div>
        </Fullscreen>
        </div>
        )
    }
}

export default withTranslation()(DatasetView)
