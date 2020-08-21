import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {Button, Checkbox, Drawer, Dropdown, Input, Menu, Modal, Select} from 'antd';
import {IServerNamedParam, IServerQueryParam} from '../../../MainContext';
import ServerFilter from './ServerFilter';
import ServerGroupBy from "./ServerGroupBy";
import ServerAggregate from './ServerAggregate';
import ServerSort from './ServerSort';
import Highlight from "./Highlight";
import Calculator, {encode, hash} from "./Calculator";
import DatasetGrid from "./DatasetGrid";
import {getNamedParamByName, getNamedParams, replaceNamedParam} from "../../../utils/namedParamsUtils";
import DrawerDiagram from "./DrawerDiagram";
import DatasetDiagram from "./DatasetDiagram";
import SaveDatasetComponent from "./SaveDatasetComponent";
import {handleExportExcel} from "../../../utils/excelExportUtils";
import {handleExportDocx} from "../../../utils/docxExportUtils";
import {saveAs} from "file-saver";
import Fullscreen from "react-full-screen";
import ServerGroupByColumn from "./ServerGroupByColumn";
import DeleteDatasetComponent from "./DeleteDatasetComponent";
import moment from "moment";
import format from "number-format.js";
import HiddenColumn from "./HiddenColumn";
import {
    actionType, appTypes,
    calculatorFunctionTranslator, defaultDateFormat,
    defaultDecimalFormat, defaultIntegerFormat, defaultTimestampFormat,
    dmlOperation,
    eventType,
    grantType, textAlignMap
} from "../../../utils/consts";
import {ValueFormatterParams} from "ag-grid-community";
import _ from "lodash";
//icons
import filterIcon from "../../../icons/filterIcon.svg";
import {faCompressArrowsAlt, faExpandArrowsAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
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
import aggregationGroupsIcon from "../../../icons/aggregationGroupsIcon.svg";
import hiddenColumnIcon from "../../../icons/hide.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import {NeoIcon, NeoInput, NeoSelect, NeoButton} from "neo-design/lib";

const { Option, OptGroup } = Select;
const textAlignMap_: any = textAlignMap;

export enum paramType {
    filter="serverFilters",
    aggregate="serverAggregates",
    sort="serverSorts",
    group="serverGroupBy",
    groupByColumn="groupByColumn",
    highlights="highlights",
    calculations="serverCalculatedExpression",
    diagrams="diagrams",
    diagramsAdd="diagramsAdd",
    hiddenColumns="hiddenColumns"
}

export interface IDiagram {
    id: number,
    keyColumn: string,
    valueColumn: string,
    diagramName: string,
    diagramLegend: string,
    legendAnchorPosition: string,
    axisXPosition: string|undefined,
    axisXLegend: string,
    axisYPosition: string|undefined,
    axisYLegend: string,
    diagramType: string,
    colorSchema: string
    isSingle: boolean
}

interface State {
    allDatasetComponents: any[];
    currentDatasetComponent: Ecore.Resource;
    currentDiagram?: IDiagram;
    columnDefs: Map<String,any>[];
    defaultColumnDefs: Map<String,any>[];
    fullScreenOn: boolean;
    rowData: {[key: string]: unknown}[];
    highlights: IServerQueryParam[];
    diagrams: IDiagram[];
    serverFilters: IServerQueryParam[];
    serverAggregates: IServerQueryParam[];
    serverSorts: IServerQueryParam[];
    serverGroupBy: IServerQueryParam[];
    groupByColumn: IServerQueryParam[];
    serverCalculatedExpression: IServerQueryParam[];
    hiddenColumns: IServerQueryParam[];
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
    hiddenColumnsMenuVisible: boolean;
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
    IsGrid: boolean;
    isWithTable: boolean;
    isDownloadFromDiagramPanel: boolean;
    isAggregations: boolean;
    formatMasks: {key:string,value:string}[];
    isEditMode: boolean;
    isInsertAllowed: boolean;
    isDeleteAllowed: boolean;
    isUpdateAllowed: boolean;
    isCheckEditBufferVisible: boolean;
    aggregatedRows: {[key: string]: unknown}[];
}

const defaultComponentValues = {
    serverFilter:"EqualTo",
    highlight:"EqualTo",
    serverAggregation: "Average",
    serverGroupBy: "Average",
    serverSort: "FromAtoZ",
    serverCalculatedExpression: "",
    groupByColumn: "",
    hiddenColumn: ""
};


class DatasetView extends React.Component<any, State> {

    gridRef:any;

    constructor(props: any) {
        super(props);
        this.state = {
            allDatasetComponents: [],
            currentDatasetComponent: {} as Ecore.Resource,
            currentDiagram: undefined,
            columnDefs: [],
            defaultColumnDefs: [],
            deleteMenuVisible: false,
            hiddenColumnsMenuVisible: false,
            rowData: [],
            highlights: [],
            diagrams: [],
            serverFilters: [],
            serverAggregates: [],
            serverSorts: [],
            serverGroupBy: [],
            groupByColumn: [],
            serverCalculatedExpression: [],
            queryParams: [],
            hiddenColumns: [],
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
            IsGrid: false,
            isWithTable: false,
            isDownloadFromDiagramPanel: false,
            isAggregations: false,
            formatMasks: [],
            isEditMode: false,
            isInsertAllowed: false,
            isUpdateAllowed: false,
            isDeleteAllowed: false,
            isCheckEditBufferVisible: false,
            aggregatedRows: []
        }
        this.gridRef = React.createRef();
    }

    getAllFormatMasks() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c.eURI() === 'ru.neoflex.nfcore.dataset#//FormatMask');
            if (temp !== undefined) {
                API.instance().findByKind(temp, {contents: {eClass: temp.eURI()}}).then((result: Ecore.Resource[]) => {
                    this.setState({formatMasks:result
                            .filter(eObject => !eObject.eContents()[0].get('isDynamic'))
                            .map(eObject => {
                            return {
                                key: eObject.eContents()[0].get('name'),
                                value: eObject.eContents()[0].get('value')
                            }
                    })})
                })
            }
        });

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
                                if (d.eContents()[0].get('dataset').get('name') === this.props.viewObject.get('datasetComponent').get('dataset').get('name')) {
                                    allDatasetComponents.push(d);
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

    evalMask(formatMask:EObject) {
        let mask:string|undefined;
        if (formatMask) {
            if (formatMask.get('isDynamic')) {
                const paramNames:string[] = formatMask.get('value').match(/:[_а-яa-z0-9]+/gi);
                const namedParams = paramNames.map(paramName => {
                    return getNamedParamByName(paramName.replace(":",""),this.props.context.contextItemValues)
                });
                try{
                    // eslint-disable-next-line
                    mask = eval(replaceNamedParam(formatMask.get('value'),namedParams))
                } catch (e) {
                    this.props.context.notification("FormatMask.value",
                        this.props.t("exception while evaluating") + ` ${replaceNamedParam(formatMask.get('value'),namedParams)}`,
                        "warning")
                }
            } else {
                mask = formatMask.get('value');
            }
        }
        return mask;
    }

    findColumnDefs(resource: Ecore.Resource){
        let columnDefs: any = [];
        resource.eContents()[0].get('column')._internal.forEach( (c: Ecore.Resource) => {
            let rowData = new Map();
            const isEditGridComponent = c.get('component') ? c.get('component').get('isEditGridComponent') : false;
            const type = c.get('datasetColumn') !== null ? c.get('datasetColumn').get('convertDataType') : null;
            let componentRenderCondition = c.get('componentRenderCondition');
            if (componentRenderCondition)
                resource.eContents()[0].get('column')._internal.forEach( (cn: Ecore.Resource) => {
                    const regxType = cn.get('datasetColumn') !== null ? cn.get('datasetColumn').get('convertDataType') : null;
                    componentRenderCondition = (regxType === appTypes.Integer)
                        ? componentRenderCondition.replace(new RegExp(cn.get('name'), 'g'), `parseInt(this.props.data.${cn.get('name')})`)
                        : (regxType === appTypes.Decimal)
                            ? componentRenderCondition.replace(new RegExp(cn.get('name'), 'g'), `parseFloat(this.props.data.${cn.get('name')})`)
                            : componentRenderCondition.replace(new RegExp(cn.get('name'), 'g'), "this.props.data."+cn.get('name'))
                });
            rowData.set('field', c.get('name'));
            rowData.set('headerName', c.get('headerName').get('name'));
            rowData.set('headerTooltip', c.get('headerTooltip'));
            rowData.set('hide', c.get('hide'));
            rowData.set('pinned', c.get('pinned'));
            rowData.set('filter', c.get('filter'));
            rowData.set('sort', c.get('sort'));
            rowData.set('editable', this.state.isReadOnly ? false : c.get('editable'));
            rowData.set('checkboxSelection', c.get('checkboxSelection'));
            rowData.set('sortable', false);
            rowData.set('suppressMenu', c.get('suppressMenu'));
            rowData.set('resizable', c.get('resizable'));
            rowData.set('isPrimaryKey', c.get('isPrimaryKey'));
            rowData.set('type', type);
            rowData.set('component', !isEditGridComponent ? c.get('component') : undefined);
            rowData.set('editComponent', isEditGridComponent ? c.get('component') : undefined);
            rowData.set('componentRenderCondition', componentRenderCondition);
            rowData.set('textAlign', textAlignMap_[c.get('textAlign')||"Undefined"]);
            rowData.set('formatMask', c.get('formatMask'));
            rowData.set('mask', this.evalMask(c.get('formatMask')));
            rowData.set('onCellDoubleClicked', (params:any)=>{
                if (params.colDef.editable) {
                    if (params.data.operationMark__ === dmlOperation.insert || !this.validateEditOptions('updateQuery')) {
                        const startEditingParams = {
                            rowIndex: params.rowIndex,
                            colKey: params.column.getId(),
                        };
                        params.api.startEditingCell(startEditingParams);
                    }
                }
            });
            rowData.set('valueFormatter', this.valueFormatter);
            columnDefs.push(rowData);
        });
        this.setState({columnDefs: columnDefs, defaultColumnDefs: columnDefs},()=>{
            this.setState({
                isUpdateAllowed: this.props.viewObject.get('datasetComponent').get('updateQuery') ? !this.validateEditOptions('updateQuery') : false,
                isInsertAllowed: this.props.viewObject.get('datasetComponent').get('insertQuery') ? !this.validateEditOptions('insertQuery') : false,
                isDeleteAllowed: this.props.viewObject.get('datasetComponent').get('deleteQuery') ? !this.validateEditOptions('deleteQuery') : false,
            });
        });
        this.findParams(resource as Ecore.Resource, columnDefs);
        this.updatedDatasetComponents(columnDefs, undefined, resource.eContents()[0].get('name'))
    }

    //Поиск сохранённых фильтров по id компоненты
    findParams(resource: Ecore.Resource, columnDefs: Map<String,any>[], parameterName: paramType|undefined = undefined){
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
                                color: f.color,
                                mask: f.mask
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
                            type: getColumnType(columnDefs, f.get('datasetColumn')) || f.get('dataType') || undefined,
                            mask: f.get('mask') || undefined,
                            highlightType: (f.get('highlightType') !== null ? f.get('highlightType') : 'Cell'),
                            backgroundColor: f.get('backgroundColor'),
                            color: f.get('color')
                        })
                    }
                });
            }
            return serverParam
        }
        function getColumnType (columnDefs: Map<String,any>[], datasetColumn: string): string | undefined {
            if (columnDefs.length !== 0) {
                const column = columnDefs.filter((column:any) => column.get("field") === datasetColumn);
                if (column !== null) {
                    const type = column.map((column:any) => column.get('type'));
                    if (type.length !== 0) {
                        return type[0]
                    }
                }
            }
            else {
                return 'String'
            }
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
        function getParamsFromURL (params: any[], columnDefs: Map<String,any>[]): IServerQueryParam[] {
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
        let hiddenColumns: IServerQueryParam[] = [];
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
            hiddenColumns = getParamsFromUserProfile(JSON.parse(userProfileValue[0].get('value')).hiddenColumns);
        }
        else if (resource !== undefined) {
            serverFilters = getParamsFromComponent(resource, 'serverFilter');
            serverAggregates = getParamsFromComponent(resource, 'serverAggregation');
            serverSorts = getParamsFromComponent(resource, 'serverSort');
            serverGroupBy = getParamsFromComponent(resource, 'serverGroupBy');
            groupByColumn = getParamsFromComponent(resource, 'groupByColumn');
            highlights = getParamsFromComponent(resource, 'highlight');
            serverCalculatedExpression = getParamsFromComponent(resource, 'serverCalculatedExpression');
            diagrams = getDiagramsFromComponent(resource, 'diagram');
            hiddenColumns = getParamsFromComponent(resource, 'hiddenColumn');
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
        hiddenColumns = hiddenColumns.length > 0 ? hiddenColumns : this.state.columnDefs.map(c => {
            return {
                datasetColumn: c.get('field'),
                enable: c.get('hide') ? !c.get('hide') : true
            } as IServerQueryParam
        }).concat(serverCalculatedExpression).map((c,index)=>{
            return {
                index: index + 1,
                datasetColumn: c.datasetColumn,
                enable: c.enable
            }
        });
        this.setState({
            serverFilters: (parameterName === paramType.filter || parameterName === undefined) ? serverFilters : this.state.serverFilters,
            serverAggregates: (parameterName === paramType.aggregate || parameterName === undefined) ? serverAggregates : this.state.serverAggregates,
            serverSorts: (parameterName === paramType.sort || parameterName === undefined) ? serverSorts : this.state.serverSorts,
            serverGroupBy: (parameterName === paramType.group || parameterName === undefined) ? serverGroupBy : this.state.serverGroupBy,
            groupByColumn: (parameterName === paramType.groupByColumn || parameterName === undefined) ? groupByColumn : this.state.groupByColumn,
            highlights: (parameterName === paramType.highlights || parameterName === undefined) ? highlights : this.state.highlights,
            serverCalculatedExpression: (parameterName === paramType.calculations || parameterName === undefined) ? serverCalculatedExpression : this.state.serverCalculatedExpression,
            diagrams,
            hiddenColumns,
            useServerFilter: (resource) ? resource.eContents()[0].get('useServerFilter') : false});
        this.prepParamsAndRun(resource,
            serverFilters,
            serverAggregates,
            serverSorts,
            serverGroupBy,
            serverCalculatedExpression,
            groupByColumn);
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
        if (prevProps.t !== this.props.t && this.state.serverCalculatedExpression) {
            this.setState({serverCalculatedExpression: this.state.serverCalculatedExpression.map(expr => {
                    let translatedOperation = expr.operation;
                    calculatorFunctionTranslator.forEach(translation => {
                        let regex = new RegExp( translation.key, "i");
                        if (regex.test(translatedOperation!)) {
                            translatedOperation = translatedOperation?.replace(new RegExp(translation.key, 'gi'), this.props.t(translation.value));
                        }
                    });
                    return {
                        ...expr,
                        operation: translatedOperation
                    }
                })})
        }
        if (JSON.stringify(prevState.hiddenColumns) !== JSON.stringify(this.state.hiddenColumns)
            && this.state.hiddenColumns.length > 0) {
            let columnDefs = this.state.columnDefs.map(c => {
                const rowData = new Map();
                c.forEach((value, key) => {
                    rowData.set(key,value)
                });
                return rowData
            });
            columnDefs.forEach(c=>{
                const hiddenColumn = this.state.hiddenColumns.find(hc => hc.datasetColumn === c.get('field'));
                c.set('hide', hiddenColumn ? !hiddenColumn.enable : c.get('hide'))
            });
            this.setState({columnDefs: columnDefs})
        }
    }

    getColumnDefGroupBy = (rowDataShow: any, columnDefs: Map<String,any>[]) => {
        let newColumnDefs: any[] = [];
        columnDefs.forEach((c:any) => {
            if (rowDataShow[0][c.get('field')] !== undefined) {
                let rowData = new Map();
                let newHeaderName = this.state.serverGroupBy
                    .find((s: any) => s['datasetColumn'] === c.get('field'));
                rowData.set('field', c.get('field'));
                rowData.set('headerName', newHeaderName && newHeaderName.value ? newHeaderName.value : c.get('headerName'));
                rowData.set('headerTooltip', c.get('headerTooltip'));
                rowData.set('hide', c.get('hide'));
                rowData.set('pinned', c.get('pinned'));
                rowData.set('filter', c.get('filter'));
                rowData.set('sort', c.get('sort'));
                rowData.set('editable', this.state.isReadOnly ? false : c.get('editable'));
                rowData.set('checkboxSelection', c.get('checkboxSelection'));
                rowData.set('sortable', c.get('sortable'));
                rowData.set('suppressMenu', c.get('suppressMenu'));
                rowData.set('resizable', c.get('resizable'));
                rowData.set('type', c.get('type'));
                rowData.set('onCellDoubleClicked',c.get('onCellDoubleClicked'));
                rowData.set('updateCallback',c.get('updateCallback'));
                rowData.set('component', c.get('component'));
                rowData.set('editComponent', c.get('editComponent'));
                rowData.set('componentRenderCondition', c.get('componentRenderCondition'));
                rowData.set('textAlign', c.get('textAlign'));
                rowData.set('isPrimaryKey', c.get('isPrimaryKey'));
                rowData.set('formatMask', c.get('formatMask'));
                rowData.set('mask', this.evalMask(c.get('formatMask')));
                rowData.set('valueFormatter', c.get('valueFormatter'));
                newColumnDefs.push(rowData);
            } else {
                let rowData = new Map();
                rowData.set('field', c.get('field'));
                rowData.set('headerName', c.get('headerName'));
                rowData.set('headerTooltip', c.get('headerTooltip'));
                rowData.set('hide', true);
                rowData.set('pinned', c.get('pinned'));
                rowData.set('filter', c.get('filter'));
                rowData.set('sort', c.get('sort'));
                rowData.set('editable', this.state.isReadOnly ? false : c.get('editable'));
                rowData.set('checkboxSelection', c.get('checkboxSelection'));
                rowData.set('sortable', c.get('sortable'));
                rowData.set('suppressMenu', c.get('suppressMenu'));
                rowData.set('resizable', c.get('resizable'));
                rowData.set('type', c.get('type'));
                rowData.set('onCellDoubleClicked',c.get('onCellDoubleClicked'));
                rowData.set('updateCallback',c.get('updateCallback'));
                rowData.set('component', c.get('component'));
                rowData.set('editComponent', c.get('editComponent'));
                rowData.set('componentRenderCondition', c.get('componentRenderCondition'));
                rowData.set('textAlign', c.get('textAlign'));
                rowData.set('isPrimaryKey', c.get('isPrimaryKey'));
                rowData.set('formatMask', c.get('formatMask'));
                rowData.set('mask', this.evalMask(c.get('formatMask')));
                rowData.set('formatMask',c.get('formatMask'));
                rowData.set('valueFormatter', c.get('valueFormatter'));
                newColumnDefs.push(rowData);
            }
        });
        return newColumnDefs
    };

    getNewColumnDef = (parametersArray: IServerQueryParam[]) => {
        let columnDefs = this.state.defaultColumnDefs.map(c => {
            const rowData = new Map();
            const mask = this.evalMask(c.get('formatMask'));
            c.forEach((value, key) => {
                key === 'mask' ? rowData.set(key, mask) : rowData.set(key,value)
            });
            return rowData
        });
        parametersArray.forEach(element => {
            if (element.enable && element.datasetColumn) {
                let rowData = new Map();
                rowData.set('field', element.datasetColumn);
                rowData.set('headerName', element.datasetColumn);
                //workaround иначе при смене маски (без смены типа)
                //ag-grid не видит изменений и не форматирует
                rowData.set('headerTooltip', `type : String, mask :${element.mask}`);
                rowData.set('hide', false);
                rowData.set('pinned', false);
                rowData.set('filter', true);
                rowData.set('sort', true);
                rowData.set('editable', false);
                rowData.set('checkboxSelection', false);
                rowData.set('sortable', true);
                rowData.set('suppressMenu', false);
                rowData.set('resizable', false);
                rowData.set('type', element.type);
                rowData.set('valueFormatter',this.valueFormatter);
                rowData.set('mask', element.mask);
                if (!columnDefs.some((col: any) => {
                    return col.get('field')?.toLocaleLowerCase() === element.datasetColumn?.toLocaleLowerCase()
                })) {
                    columnDefs.push(rowData);
                }
            }
        });
        return columnDefs
    };

    valueFormatter = (params: ValueFormatterParams) => {
        const found = this.state.columnDefs.find(c=>params.colDef.field === c.get('field'));
        const mask = found ? found.get('mask') : undefined;
        let formattedParam, splitted;
        if (this.state.aggregatedRows.length > 0
            && params.value
            && this.state.aggregatedRows.find(a => Object.is(a,params.data))) {
            splitted = params.value.split(":");
            params.value = splitted[1];
        }

        if (params.value)
            formattedParam = params.colDef.type === appTypes.Date && mask
                ? moment(params.value, defaultDateFormat).format(mask)
                : params.colDef.type === appTypes.Timestamp && mask
                    ? moment(params.value, defaultTimestampFormat).format(mask)
                    : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type as appTypes) && mask
                        ? format(mask, params.value)
                        : [appTypes.Decimal].includes(params.colDef.type as appTypes)
                            ? format(defaultDecimalFormat, params.value)
                            : [appTypes.Integer].includes(params.colDef.type as appTypes)
                                ? format(defaultIntegerFormat, params.value)
                                : [appTypes.Date].includes(params.colDef.type as appTypes)
                                    ?  moment(params.value, defaultDateFormat).format(defaultDateFormat)
                                    : [appTypes.Timestamp].includes(params.colDef.type as appTypes)
                                        ?  moment(params.value, defaultTimestampFormat).format(defaultTimestampFormat)
                                        : params.value;
        else
            formattedParam = params.value;
        if (this.state.aggregatedRows.length > 0
            && params.value
            && this.state.aggregatedRows.find(a => Object.is(a,params.data))) {
            splitted[1] = formattedParam;
            formattedParam = splitted.join(":")
        }
        return formattedParam
    };

    translateExpression(calculatedExpression: IServerQueryParam[]) {
        let sortMap = this.state.defaultColumnDefs
            .filter((def:any) => !def.get("hide"))
            .map((colDef, index) => {
            return {
                fieldName : colDef.get("field"),
                fieldHeader : colDef.get("headerName"),
                fieldCode: encode(index),
                fieldHash: hash(encode(index))
            }
        }).reverse();
        return calculatedExpression.map(expr => {
            let translatedOperation = expr.operation;
            calculatorFunctionTranslator.forEach(translation => {
                let regex = new RegExp( translation.key, "i");
                if (regex.test(translatedOperation!)) {
                    translatedOperation = translatedOperation?.replace(new RegExp(translation.key, 'gi'), translation.value);
                }
            });
            sortMap.forEach(colDef => {
                if (translatedOperation?.includes(colDef.fieldCode)) {
                    translatedOperation = translatedOperation?.replace(new RegExp(colDef.fieldCode, 'g'), colDef.fieldHash);
                }
            });
            sortMap.forEach(colDef => {
                if (translatedOperation?.includes(colDef.fieldHash)) {
                    translatedOperation = translatedOperation?.replace(new RegExp(colDef.fieldHash, 'g'), `"${colDef.fieldName}"`);
                }
            });
            return {
                ...expr,
                operation: translatedOperation
            }
        })
    };

    getNewHiddenColumns(newColumnDef: Map<String, any>[]) {
        newColumnDef = newColumnDef.filter(c => !c.get('hide'));
        let newHiddenColumns = this.state.hiddenColumns.map((e)=> e);
        //Удаляем
        this.state.hiddenColumns.forEach(c => {
            const isFound = newColumnDef.find(cd => cd.get('field') === c.datasetColumn);
            if (!isFound) {
                newHiddenColumns = newHiddenColumns.filter(cd => cd.datasetColumn !== c.datasetColumn)
            }
        });
        //Добавляем
        newColumnDef.forEach(c => {
            const isFound = newHiddenColumns.find(cd => cd.datasetColumn === c.get('field'));
            if (!isFound) {
                newHiddenColumns.push({
                    index: 0,
                    datasetColumn: c.get('field'),
                    enable: true
                })
            }
        });
        newHiddenColumns = newHiddenColumns.map((value, index) => {
            return {
                ...value,
                index: index + 1
            }
        });
        return newHiddenColumns
    }

    prepParamsAndRun(
        resource: Ecore.Resource,
        filterParams: IServerQueryParam[],
        aggregationParams: IServerQueryParam[],
        sortParams: IServerQueryParam[],
        groupByParams: IServerQueryParam[],
        calculatedExpressions: IServerQueryParam[],
        groupByColumnParams: IServerQueryParam[],
        callback: ()=>void = ()=>{}
    ) {
        const filter = (arr:any[]) => arr.filter(f => f.enable && f.datasetColumn);
        const datasetComponentName = resource.eContents()[0].get('name');
        const calculatedExpression = this.translateExpression(calculatedExpressions);
        const newQueryParams = getNamedParams(this.props.viewObject.get('valueItems')
                                            , this.props.context.contextItemValues
                                            , this.props.pathFull[this.props.pathFull.length - 1].params);

        this.props.context.runQuery(resource
            , newQueryParams
            , filter(filterParams)
            , []
            , filter(sortParams)
            , filter(groupByParams)
            , filter(calculatedExpression)
            , filter(groupByColumnParams)
        ).then((json: string) => {
                let result: {[key: string]: unknown}[] = JSON.parse(json);
                let newColumnDef: any[];
                newColumnDef = this.getNewColumnDef(calculatedExpression);
                if (filter(groupByParams).length !== 0 && result.length !== 0) {
                    newColumnDef = this.getColumnDefGroupBy(result, newColumnDef)
                }
                const hiddenColumns = this.getNewHiddenColumns(newColumnDef);
                //Восстанавливем признак скрытой если она отмечена в hiddenColumns
                newColumnDef.forEach(c =>{
                    const column = hiddenColumns.find(hc => c.get('field') === hc.datasetColumn);
                    if (column)
                        c.set('hide', !column.enable)
                });
                aggregationParams = aggregationParams.filter((f: any) => f.datasetColumn && f.enable);
                if (aggregationParams.length !== 0 && this.state.columnDefs.length > 0 && result.length !== 0) {
                    this.props.context.runQuery(resource
                        , newQueryParams
                        , filter(filterParams)
                        , filter(aggregationParams)
                        , filter(sortParams)
                        , filter(groupByParams)
                        , filter(calculatedExpression)
                        , filter(groupByColumnParams))
                        .then((aggJson: string) => {
                        result = result.concat(JSON.parse(aggJson));
                            this.setState({
                                rowData: result,
                                columnDefs: newColumnDef,
                                isAggregations: true,
                                //Если не проверять то при одинаковых данных, ag-grid не подставляет новые в грид
                                //Поэтому проверка ссылки на новые записи при выполнении valueFormatter будет давать false
                                aggregatedRows: _.isEqual(result,this.state.rowData) ? this.state.aggregatedRows : this.getAggregatedRows(aggregationParams, result),
                                hiddenColumns: hiddenColumns},callback);
                            this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)})
                } else {
                    this.setState({rowData: result, columnDefs: newColumnDef , isAggregations: false, aggregatedRows: [], hiddenColumns: hiddenColumns},callback);
                    this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)
                }
            }
        )
    }

    getAggregatedRows(aggregationParams: IServerQueryParam[], rowData: {[key: string]: unknown}[]) {
        const numAggRows = _(aggregationParams)
            .countBy('operation')
            .map((count, name) => ({ name, count }))
            .value().length;
        return rowData.slice(rowData.length - numAggRows, rowData.length)
    }

    refresh(resetGrouping:boolean = false): void {
        if (this.state.currentDatasetComponent.eResource && !resetGrouping) {
            this.prepParamsAndRun(this.state.currentDatasetComponent.eResource(),
                this.state.serverFilters,
                this.state.serverAggregates,
                this.state.serverSorts,
                this.state.serverGroupBy,
                this.state.serverCalculatedExpression,
                this.state.groupByColumn,
                ()=>{
                    if (this.state.isEditMode)
                        this.setState({isEditMode:!this.state.isEditMode},()=>{
                            this.gridRef.onEdit()
                        })
                }
            );
        } else if (this.state.currentDatasetComponent.eResource) {
            this.prepParamsAndRun(this.state.currentDatasetComponent.eResource(),
                this.state.serverFilters,
                [],
                this.state.serverSorts,
                [],
                [],
                [],
                ()=>{
                    if (!this.state.isEditMode)
                        this.setState({isEditMode:!this.state.isEditMode},()=>{
                            this.gridRef.onEdit()
                        })
                })
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
        if (this.state.formatMasks.length === 0) {this.getAllFormatMasks()}
        this.props.context.addEventAction({
            itemId:this.props.viewObject.get('name')+this.props.viewObject._id,
            actions: [
                {actionType: actionType.execute,callback: ()=>this.refresh()},
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.get('name')+this.props.viewObject._id
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
                rowData: rowData ? rowData : this.state.rowData.length !== 0 ? this.state.rowData : [],
                getBuffer: this.gridRef ? this.gridRef.getBuffer : () => {return []},
                showModal: () => {this.setState({isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible})}
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
            , diagramEditMenuVisible: (p === paramType.diagrams) ? v : false
            , hiddenColumnsMenuVisible: (p === paramType.hiddenColumns) ? v : false});
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
            hiddenColumns: (paramName === paramType.hiddenColumns)? param: this.state.hiddenColumns,
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
                this.findParams(this.state.currentDatasetComponent, this.state.columnDefs, paramName)
            )
        }
    };

    changeDatasetViewState = (newParam: any, paramName: string): void => {
        this.setState<never>({[paramName]: newParam});
    };

    handleDiagramChange = (action: string, newDiagram?: IDiagram): void => {
        let newDiagrams:IDiagram[];
        if (action === "add" && newDiagram) {
            newDiagrams = this.state.diagrams.concat(newDiagram);
            this.setState({
                currentDiagram: newDiagram,
                diagrams: newDiagrams
            });
            this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible)
        } else if (action === "edit" && newDiagram) {
            newDiagrams = this.state.diagrams.map(value => {
                return (value.id === newDiagram.id)? newDiagram : value
            });
            this.setState({
                currentDiagram: newDiagram,
                diagrams: newDiagrams
            });
            this.handleDrawerVisibility(paramType.diagrams,!this.state.diagramEditMenuVisible)
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
            handleExportDocx(this.props.context.getDocxHandlers(), this.state.isWithTable, this.state.isDownloadFromDiagramPanel).then(blob => {
                saveAs(new Blob([blob]), "example.docx");
                console.log("Document created successfully");
            });
        }
        if (e.key === 'exportToExcel') {
            handleExportExcel(this.props.context.getExcelHandlers(), this.state.isWithTable, this.state.isDownloadFromDiagramPanel).then((blob) => {
                    saveAs(new Blob([blob]), 'example.xlsx');
                    console.log("Document created successfully");
                }
            );
        }

    }
    DiagramButton = () => {
        this.setState({isDownloadFromDiagramPanel: !this.state.isDownloadFromDiagramPanel});
        if (this.state.diagrams.length > 0)
            this.setState({currentDiagram: this.state.diagrams[0]});
        else
            this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible)
    };

    withTable(e: any) {
        let ee: any = e.target.checked;
        this.setState({isWithTable: ee})
    }

    validateEditOptions = (operationType:"updateQuery"|"insertQuery"|"deleteQuery") => {
        let restrictOperation = false;
        if (!this.props.viewObject.get('datasetComponent').get(operationType)) {
            restrictOperation = true;
            if (operationType === "updateQuery") {
                this.props.context.notification(this.props.t('celleditorvalidation'), this.props.t('edit is prohibited'), "error")
            } else {
                this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('query is not specified'), "error")
            }
        }
        if (!this.state.columnDefs.find(cd => cd.get('isPrimaryKey'))) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('primary key column is not specified') ,"error")
        }
        if (this.props.viewObject.get('datasetComponent').get(operationType)
            && this.props.viewObject.get('datasetComponent').get(operationType).get('generateFromModel')
            && !this.props.viewObject.get('dataset').get('schemaName')) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('jdbcdataset schema is not specified') ,"error")
        }
        if (this.props.viewObject.get('datasetComponent').get(operationType)
            && this.props.viewObject.get('datasetComponent').get(operationType).get('generateFromModel')
            && !this.props.viewObject.get('dataset').get('tableName')) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('jdbcdataset table is not specified') ,"error")
        }
        if (this.props.viewObject.get('datasetComponent').get(operationType)
            && !this.props.viewObject.get('datasetComponent').get(operationType).get('generateFromModel')
            && !this.props.viewObject.get('datasetComponent').get(operationType).get('queryText')) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('querytext is not specified') ,"error")
        }
        return restrictOperation
    };

    getGridPanel = () => {
        const { t } = this.props;
        const menu = (<Menu
            key='actionMenu'
            onClick={(e: any) => this.onActionMenu(e)}
            style={{width: '150px'}}
        >
            <Menu.Item key='exportToDocx'>
                {t("export to docx")}
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                {t("export to excel")}
            </Menu.Item>
        </Menu>);
        return <div className='functionalBar__header'>

                <div className='block'>
                    <NeoInput type={'search'} width='192px' />
                    <div className='verticalLine' />
                        <NeoButton type={'link'} title={t('filters')}
                                   style={{marginRight:'5px'}}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}>
                            <NeoIcon icon={'filter'} color={'#5E6785'}/>
                        </NeoButton>
                        <NeoButton type={'link'} title={t('sorts')}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}>
                            <NeoIcon icon={'sort'} color={'#5E6785'}/>
                        </NeoButton>
                    <div className='verticalLine' />
                        <NeoButton type={'link'} title={t('calculator')}
                                   style={{marginRight:'5px'}}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}>
                            <NeoIcon icon={'calculator'} color={'#5E6785'}/>
                        </NeoButton>
                        <NeoButton type={'link'} title={t('aggregations')}
                                   style={{marginRight:'5px'}}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}>
                            <NeoIcon icon={'plusBlock'} color={'#5E6785'}/>
                        </NeoButton>
                        <NeoButton type={'link'} title={t('diagram')}
                                   style={{marginRight:'5px'}}
                                   onClick={()=> {
                                       this.DiagramButton()
                                   }}>
                            <NeoIcon icon={'barChart'} color={'#5E6785'}/>
                        </NeoButton>
                        <NeoButton type={'link'} title={t('grouping')}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.group,!this.state.aggregatesGroupsMenuVisible)}}>
                            <NeoIcon icon={'add'} color={'#5E6785'}/>
                        </NeoButton>
                    <NeoButton type={'link'} title={t('hiddencolumns')}
                               style={{color: 'rgb(151, 151, 151)', margin: 'auto'}}
                               onClick={()=>{this.handleDrawerVisibility(paramType.hiddenColumns,!this.state.hiddenColumnsMenuVisible)}}
                    >
                        <img style={{width: '24px', height: '24px'}} src={hiddenColumnIcon} alt="hiddenColumns" />
                    </NeoButton>
                    <Button
                        hidden={!(this.state.isUpdateAllowed || this.state.isDeleteAllowed || this.state.isInsertAllowed)}
                        title={t('edit')}
                        style={{color: 'rgb(151, 151, 151)'}}
                        onClick={() => {
                            if (this.state.groupByColumn.filter(c=>c.enable && c.datasetColumn).length > 0
                                || this.state.serverGroupBy.filter(c=>c.enable && c.datasetColumn).length > 0
                                || this.state.serverAggregates.filter(c=>c.enable && c.datasetColumn).length > 0
                                || this.state.serverCalculatedExpression.filter(c=>c.enable && c.datasetColumn).length > 0) {
                                this.refresh(true);
                            } else {
                                this.setState({isEditMode:!this.state.isEditMode},()=>{
                                    this.gridRef.onEdit()
                                })
                            }
                        }}
                    >
                        <img style={{width: '24px', height: '24px'}} src={penIcon} alt="penIcon" />
                    </Button>
                    <div className='verticalLine' />
                        <NeoButton type={'link'} title={t('save')}
                                   onClick={()=>{this.setState({saveMenuVisible:!this.state.saveMenuVisible})}}>
                            <NeoIcon icon={'mark'} color={'#5E6785'}/>
                        </NeoButton>
                    <div className='verticalLine' />
                </div>

            <div className='block'>
                <span className='caption'>Версия</span>
            {this.state.allDatasetComponents.length !== 0
            && this.state.currentDatasetComponent !== undefined
            &&
            <div id="selectsInFullScreen" style={{display: 'inline-block'}}>
                <NeoSelect
                         getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}
                         width={'250px'}
                         defaultValue={this.state.currentDatasetComponent.eContents()[0].get('name')}
                         onChange={(e: any) => {
                             this.handleChange(e)
                         }}
                     >
                    <OptGroup
                        label='Default'>
                        {
                            this.state.allDatasetComponents
                                .filter((c: any) => c.eContents()[0].get('access') === 'Default')
                                .map((c: any) =>
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
                                .map((c: any) =>
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
                                .map((c: any) =>
                                    <Option
                                        key={c.eContents()[0].get('name')}
                                        value={c.eContents()[0].get('name')}>
                                        {c.eContents()[0].get('name')}
                                    </Option>)
                        }
                    </OptGroup>
                </NeoSelect>
            </div>
            }
                <div className='verticalLine'/>
                {/*<Dropdown overlay={menu} placement="bottomLeft">*/}
                {/*    <NeoButton type={'link'} title={t('download')}*/}
                {/*    style={{marginRight:'5px'}}>*/}
                {/*        <NeoIcon icon={'download'} color={'#5E6785'}/>*/}
                {/*    </NeoButton>*/}
                {/*</Dropdown>*/}
                 <Dropdown overlay={menu} placement="bottomLeft">
                     <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}>
                         <img style={{width: '24px', height: '24px'}} src={downloadIcon} alt="downloadIcon" />
                     </Button>
                 </Dropdown>
                <NeoButton type={'link'} title={t('grouping')}
                           style={{marginRight:'5px'}}
                           onClick={()=>{}}>
                    <NeoIcon icon={'print'} color={'#5E6785'}/>
                </NeoButton>
                <NeoButton type={'link'}
                           onClick={this.onFullScreen}>
                    {this.state.fullScreenOn  ?
                        <NeoIcon icon={'fullScreen'} color={'#5E6785'}/>
                             :
                        <NeoIcon icon={'fullScreen'} color={'#5E6785'}/>
                    }
                </NeoButton>
            </div>

            {/*<Button*/}
            {/*    hidden={!(this.state.isUpdateAllowed || this.state.isDeleteAllowed || this.state.isInsertAllowed)}*/}
            {/*    title={t('edit')}*/}
            {/*    style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*    onClick={() => {*/}
            {/*        if (this.state.groupByColumn.filter(c=>c.enable && c.datasetColumn).length > 0*/}
            {/*            || this.state.serverGroupBy.filter(c=>c.enable && c.datasetColumn).length > 0*/}
            {/*            || this.state.serverAggregates.filter(c=>c.enable && c.datasetColumn).length > 0*/}
            {/*            || this.state.serverCalculatedExpression.filter(c=>c.enable && c.datasetColumn).length > 0) {*/}
            {/*            this.refresh(true);*/}
            {/*        } else {*/}
            {/*            this.setState({isEditMode:!this.state.isEditMode},()=>{*/}
            {/*                this.gridRef.onEdit()*/}
            {/*            })*/}
            {/*        }*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={penIcon} alt="penIcon" />*/}
            {/*</Button>*/}
            {/*<Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={filterIcon} alt="filterIcon" />*/}
            {/*</Button>*/}
            {/*<Button title={t('sorts')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={orderIcon} alt="orderIcon" />*/}
            {/*</Button>*/}
            {/*<div style={{display: 'inline-block', height: '30px',*/}
            {/*    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',*/}
            {/*    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>*/}
            {/*<Button title={t('calculator')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={calculatorIcon} alt="calculatorIcon" />*/}
            {/*</Button>*/}
            {/*<Button title={t('aggregations')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={groupIcon} alt="groupIcon" />*/}
            {/*</Button>*/}
            {/*<Button title={t('diagram')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{*/}
            {/*            this.DiagramButton()*/}
            {/*        }*/}
            {/*        }*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={diagramIcon} alt="diagramIcon" />*/}
            {/*</Button>*/}
            {/*<Button title={t('grouping')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.group,!this.state.aggregatesGroupsMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={aggregationGroupsIcon} alt="aggregationGroups" />*/}
            {/*</Button>*/}
            {/*<Button title={t('hiddencolumns')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*        onClick={()=>{this.handleDrawerVisibility(paramType.hiddenColumns,!this.state.hiddenColumnsMenuVisible)}}*/}
            {/*>*/}
            {/*    <img style={{width: '24px', height: '24px'}} src={hiddenColumnIcon} alt="hiddenColumns" />*/}
            {/*</Button>*/}
            {/*<div style={{display: 'inline-block', height: '30px',*/}
            {/*    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',*/}
            {/*     borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>*/}

            {/* <Button title={t('save')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*         onClick={()=>{this.setState({saveMenuVisible:!this.state.saveMenuVisible})}}*/}
            {/* >*/}
            {/*     <img style={{width: '24px', height: '24px'}} src={flagIcon} alt="flagIcon" />*/}
            {/* </Button>*/}

            {/*{*/}
            {/*      this.state.currentDatasetComponent.rev !== undefined &&*/}
            {/*      this.state.currentDatasetComponent.eContents()[0].get( 'access') !== 'Default' &&*/}
            {/*     <Button title={t('delete')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*     >*/}
            {/*         <img style={{width: '24px', height: '24px'}} src={trashcanIcon} alt="trashcanIcon"*/}
            {/*              onClick={()=>{this.setState({deleteMenuVisible:!this.state.deleteMenuVisible})}}/>*/}
            {/*     </Button>*/}
            {/* }*/}

            {/* <div style={{display: 'inline-block', height: '30px',*/}
            {/*     borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',*/}
            {/*     borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>*/}
            {/* {this.state.allDatasetComponents.length !== 0*/}
            {/* && this.state.currentDatasetComponent !== undefined*/}
            {/* &&*/}
            {/* <div id="selectsInFullScreen" style={{display: 'inline-block'}}>*/}
            {/*     <Select*/}
            {/*         getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}*/}
            {/*         style={{ width: '250px'}}*/}
            {/*         showSearch={true}*/}
            {/*         value={this.state.currentDatasetComponent.eContents()[0].get('name')}*/}
            {/*         onChange={(e: any) => {*/}
            {/*             this.handleChange(e)*/}
            {/*         }}*/}
            {/*     >*/}
            {/*         <OptGroup*/}
            {/*             label='Default'>*/}
            {/*             {*/}
            {/*                 this.state.allDatasetComponents*/}
            {/*                     .filter((c: any) => c.eContents()[0].get('access') === 'Default')*/}
            {/*                     .map( (c: any) =>*/}
            {/*                         <Option*/}
            {/*                             key={c.eContents()[0].get('name')}*/}
            {/*                             value={c.eContents()[0].get('name')}>*/}
            {/*                             {c.eContents()[0].get('name')}*/}
            {/*                         </Option>)*/}
            {/*             }*/}
            {/*         </OptGroup>*/}
            {/*         <OptGroup label='Private'>*/}
            {/*             {*/}
            {/*                 this.state.allDatasetComponents*/}
            {/*                     .filter((c: any) => c.eContents()[0].get('access') === 'Private')*/}
            {/*                     .map( (c: any) =>*/}
            {/*                         <Option*/}
            {/*                             key={c.eContents()[0].get('name')}*/}
            {/*                             value={c.eContents()[0].get('name')}>*/}
            {/*                             {c.eContents()[0].get('name')}*/}
            {/*                         </Option>)*/}
            {/*             }*/}
            {/*         </OptGroup>*/}
            {/*         <OptGroup label='Public'>*/}
            {/*             {*/}
            {/*                 this.state.allDatasetComponents*/}
            {/*                     .filter((c: any) => c.eContents()[0].get('access') !== 'Private' && c.eContents()[0].get('access') !== 'Default')*/}
            {/*                     .map( (c: any) =>*/}
            {/*                         <Option*/}
            {/*                             key={c.eContents()[0].get('name')}*/}
            {/*                             value={c.eContents()[0].get('name')}>*/}
            {/*                             {c.eContents()[0].get('name')}*/}
            {/*                         </Option>)*/}
            {/*             }*/}
            {/*         </OptGroup>*/}
            {/*     </Select>*/}
            {/* </div>*/}
            {/* }*/}
            {/* <div style={{display: 'inline-block', height: '30px',*/}
            {/*     borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',*/}
            {/*     borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>*/}

            {/* <Dropdown overlay={menu} placement="bottomLeft">*/}
            {/*     <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}>*/}
            {/*         <img style={{width: '24px', height: '24px'}} src={downloadIcon} alt="downloadIcon" />*/}
            {/*     </Button>*/}
            {/* </Dropdown>*/}


            {/* <Button title={t('print')} style={{color: 'rgb(151, 151, 151)'}}*/}
            {/*         onClick={()=>{}}*/}
            {/* >*/}
            {/*     <img style={{width: '24px', height: '24px'}} src={printIcon} alt="printIcon" />*/}
            {/* </Button>*/}
            {/* <Button*/}
            {/*     className="buttonFullScreen"*/}
            {/*     type="link"*/}
            {/*     ghost*/}
            {/*     style={{*/}
            {/*         marginRight: '10px',*/}
            {/*         width: '32px',*/}
            {/*         height: '32px',*/}
            {/*         color: 'rgb(151, 151, 151)'*/}
            {/*     }}*/}
            {/*     onClick={this.onFullScreen}*/}
            {/* >*/}
            {/*     {this.state.fullScreenOn  ?*/}
            {/*         <FontAwesomeIcon icon={faCompressArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>*/}
            {/*         :*/}
            {/*         <FontAwesomeIcon icon={faExpandArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>}*/}
            {/* </Button>*/}
        </div>
    };

    getDiagramPanel = () => {
        const { t } = this.props;
        const menu = (<Menu
            key='actionMenu'
            onClick={(e: any) => this.onActionMenu(e)}
            style={{width: '150px'}}
        >
            <Menu.Item key='exportToDocx'>
                {t("export to docx")}
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                {t("export to excel")}
            </Menu.Item>
        </Menu>);
        return <div id="selectInGetDiagramPanel">
            <Button title={t("back to table")} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagrams,false);
                        this.handleDrawerVisibility(paramType.diagramsAdd,false);
                        this.setState({currentDiagram:undefined, isDownloadFromDiagramPanel: !this.state.isDownloadFromDiagramPanel });
                    }}
            >
                {t("back to table")}
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

            <Button title={t('delete')} style={{color: 'rgb(151, 151, 151)'}}
                    onClick={()=>{this.setState({deleteMenuVisible:!this.state.deleteMenuVisible, IsGrid:!this.state.IsGrid})}}
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

            <Dropdown overlay={menu} placement="bottomLeft">
                <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}>
                    <img style={{width: '24px', height: '24px'}} src={downloadIcon} alt="downloadIcon" />
                </Button>
            </Dropdown>
            <Checkbox onChange={this.withTable.bind(this)}>{t("download with table")}</Checkbox>

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

    getEditPanel = () => {
        const { t } = this.props;
        return <div id="editPanel">
            <Button
                title={t('edit')}
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={() => {
                    if (this.state.isEditMode && this.gridRef.getBuffer().length > 0) {
                        this.setState({isCheckEditBufferVisible: true})
                    } else if (this.state.groupByColumn.filter(c=>c.enable && c.datasetColumn).length > 0
                        || this.state.serverGroupBy.filter(c=>c.enable && c.datasetColumn).length > 0
                        || this.state.serverAggregates.filter(c=>c.enable && c.datasetColumn).length > 0
                        || this.state.serverCalculatedExpression.filter(c=>c.enable && c.datasetColumn).length > 0) {
                        this.refresh()
                    } else if (this.gridRef.whichEdited().length === 0) {
                        this.setState({isEditMode:!this.state.isEditMode},()=>{
                            this.gridRef.onEdit()
                        });
                    } else {
                        this.gridRef.stopEditing()
                    }
                }}
            >
                <img style={{width: '24px', height: '24px'}} src={penIcon} alt="penIcon" />
            </Button>
            <Button
                hidden={!this.state.isEditMode || !this.state.isInsertAllowed}
                title={t("add row")}
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={() => this.gridRef.onInsert()}
            >
                <FontAwesomeIcon icon={faPlus} size='lg' color="#7b7979"/>
            </Button>
            <Button
                hidden={!this.state.isEditMode || !this.state.isDeleteAllowed}
                title={t("delete selected")}
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={() => this.gridRef.onDeleteSelected()}
            >
                <FontAwesomeIcon icon={faTrash} size='lg' color="#7b7979"/>
            </Button>
            <Button
                hidden={!this.state.isEditMode}
                title={t("apply changes")}
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={() => {
                    //Убрал т.к. есть подсветки
                    /*this.gridRef.removeRowsFromGrid();*/
                    this.onApplyEditChanges(this.gridRef.getBuffer());
                }}
            >
                <img style={{width: '24px', height: '24px'}} src={flagIcon} alt="flagIcon" />
            </Button>
            <Button
                hidden={!this.state.isEditMode || !this.state.isInsertAllowed}
                title={t("copy selected")}
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={() => {
                    this.gridRef.copySelected();
                }}
            >
                {t("copy selected")}
            </Button>
            <Input
                hidden={!this.state.isEditMode}
                style={{width:'250px'}}
                type="text"
                onInput={() => this.gridRef.onQuickFilterChanged()}
                id={"quickFilter"}
                placeholder={t("quick filter")}
            />
        </div>
    };

    handleSaveMenu = () => {
        this.setState({saveMenuVisible:!this.state.saveMenuVisible, IsGrid:!this.state.IsGrid})
    };

    handleDeleteMenu = () => {
       this.handleDeleteMenuForCancel();
        if(this.state.deleteMenuVisible) {
            for (let i = 0; i < this.state.allDatasetComponents.length; i++) {
                if (this.state.allDatasetComponents[i].eContents()[0].get('access') === 'Default') {
                    this.handleChange(this.state.allDatasetComponents[i].eContents()[0].get('name'));
                    this.getAllDatasetComponents(true)

                }
            }
        }
    };

    handleDeleteGridMenu = () => {
        this.handleDiagramChange("delete");
        this.setState({deleteMenuVisible:!this.state.deleteMenuVisible, IsGrid:!this.state.IsGrid})
    };

    handleDeleteMenuForCancel = () => {
        this.setState({deleteMenuVisible:!this.state.deleteMenuVisible, IsGrid:!this.state.IsGrid})

    };

    onFullScreen = () => {
        if (this.state.fullScreenOn){
            this.setState({ fullScreenOn: false});
        }
        else{
            this.setState({ fullScreenOn: true});
        }
    };

    onApplyEditChanges = (buffer:any[]) => {
        buffer.sort(function compare(a:any,b:any) {
            if (a.operationMark__ === dmlOperation.delete && b.operationMark__ !== dmlOperation.delete)
                return -1;
            if (a.operationMark__ === dmlOperation.insert && b.operationMark__ !== dmlOperation.insert)
                return 1;
            if (a.operationMark__ === dmlOperation.update && b.operationMark__ === dmlOperation.insert)
                return -1;
            if (a.operationMark__ === dmlOperation.update && b.operationMark__ === dmlOperation.delete)
                return 1;
            return 0
        });
        buffer.forEach(d => {
            const primaryKey = this.state.columnDefs
                .filter(c => c.get('isPrimaryKey'))
                .map(c => {
                    return {
                        parameterName: c.get('field'),
                        parameterValue: d.operationMark__ === dmlOperation.update ? d[`${c.get('field')}__`] : d[c.get('field')],
                        parameterDataType: c.get('type'),
                        isPrimaryKey: true
                    }
                });
            const values = this.state.columnDefs
                .filter(c => c.get('editable'))
                .map(c => {
                    return {
                        parameterName: c.get('field'),
                        parameterValue: d[c.get('field')],
                        parameterDataType: c.get('type'),
                        isPrimaryKey: c.get('isPrimaryKey')
                    }
                });
            const params = primaryKey.concat(values);
            this.props.context.executeDMLOperation(this.state.currentDatasetComponent, d.operationMark__, params).then(()=>{

                }
            ).catch(()=>{
                    //Выходим из редактора, что на ловить ошибки ag-grid
                    this.setState({isEditMode:false},() => {
                        //Восстанавливаем значение в случае ошибки
                        this.refresh()
                    });
                }
            ).finally(()=>{
                d.operationMark__ = undefined;
                d.prevOperationMark__ = undefined;
                buffer.shift();
                if (buffer.length === 0) {
                    this.refresh(true)
                }
            })
        });
    };

    render() {
        const { t } = this.props;
        return (
        <div hidden={this.state.isHidden}>
        <Fullscreen
        enabled={this.state.fullScreenOn}
        onChange={fullScreenOn => this.setState({ fullScreenOn })}>
            <div style={{padding:'16px'}}>
                {(this.state.isEditMode) ? this.getEditPanel() : (this.state.currentDiagram)? this.getDiagramPanel(): this.getGridPanel()}
                <DatasetDiagram
                    {...this.props}
                    hide={!this.state.currentDiagram}
                    rowData={this.state.rowData.filter(r=>!this.state.aggregatedRows.includes(r))}
                    diagramParams={this.state.currentDiagram}
                />
                <DatasetGrid
                    hide={!!this.state.currentDiagram}
                    ref={(g:any) => {
                        this.gridRef = g
                    }}
                    serverAggregates = {this.state.serverAggregates}
                    isAggregations = {this.state.isAggregations}
                    highlights = {this.state.highlights}
                    currentDatasetComponent = {this.state.currentDatasetComponent}
                    rowData = {this.state.rowData}
                    columnDefs = {this.state.columnDefs}
                    currentTheme = {this.state.currentTheme}
                    showUniqRow = {this.state.showUniqRow}
                    isHighlightsUpdated = {this.state.isHighlightsUpdated}
                    saveChanges = {this.changeDatasetViewState}
                    onApplyEditChanges = {this.onApplyEditChanges}
                    isEditMode = {this.state.isEditMode}
                    showEditDeleteButton = {this.state.isDeleteAllowed}
                    showMenuCopyButton = {this.state.isInsertAllowed}
                    aggregatedRows = {this.state.aggregatedRows}
                    {...this.props}
                />
                <div id="filterButton">
                <Drawer
                    style={{marginTop: '80px'}}
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
                    style={{marginTop: '80px'}}
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
                        style={{marginTop: '80px'}}
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
                    style={{marginTop: '80px'}}
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
                <div id="hiddenColumnsButton">
                    <Drawer
                        getContainer={() => document.getElementById ('hiddenColumnsButton') as HTMLElement}
                        placement='right'
                        title={t('hiddencolumns')}
                        width={'700px'}
                        visible={this.state.hiddenColumnsMenuVisible}
                        onClose={()=>{this.handleDrawerVisibility(paramType.hiddenColumns,!this.state.hiddenColumnsMenuVisible)}}
                        mask={false}
                        maskClosable={false}
                    >
                        {
                            this.state.hiddenColumns
                                ?
                                <HiddenColumn
                                    {...this.props}
                                    parametersArray={this.state.hiddenColumns}
                                    columnDefs={this.state.columnDefs}
                                    onChangeParameters={this.onChangeParams}
                                    saveChanges={this.changeDatasetViewState}
                                    isVisible={this.state.hiddenColumnsMenuVisible}
                                    componentType={paramType.hiddenColumns}
                                />
                                :
                                <HiddenColumn/>
                        }
                    </Drawer>
                </div>
                <div id="calculatableexpressionsButton">
                <Drawer
                    style={{marginTop: '80px'}}
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
                                formatMasks={this.state.formatMasks}
                            />
                            :
                            <Calculator/>
                    }
                </Drawer>
                </div>
                <div id="diagramButton">
                <Drawer
                    style={{marginTop: '80px'}}
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
                    style={{marginTop: '80px'}}
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
                        key="delete_menu"
                        width={'250px'}
                        title={t('delete report')}
                        visible={this.state.deleteMenuVisible}
                        footer={null}
                        onCancel={this.handleDeleteMenuForCancel}
                    >
                        <DeleteDatasetComponent
                            {...this.props}
                            closeModal={this.handleDeleteMenu}
                            closeModalGrid={this.handleDeleteGridMenu}
                            handleDeleteMenuForCancel={this.handleDeleteMenuForCancel}
                            allDatasetComponent={this.state.allDatasetComponents}
                            currentDatasetComponent={this.state.currentDatasetComponent}
                            IsGrid = {this.state.IsGrid}

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
                <div id="edit_applyChangesButton">
                    <Modal
                        getContainer={() => document.getElementById ('edit_applyChangesButton') as HTMLElement}
                        key="check_edit_buffer"
                        width={'500px'}
                        title={t('edit buffer')}
                        visible={this.state.isCheckEditBufferVisible}
                        footer={null}
                        onCancel={()=>{
                            this.setState({isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible})
                        }}
                    >
                        <div style={{textAlign:"center"}}>
                            <b>{t("unresolved changes left")}</b>
                            <br/>
                            <br/>
                            <div>
                                <Button
                                    onClick={()=>{
                                        this.gridRef.removeRowsFromGrid();
                                        this.onApplyEditChanges(this.gridRef.getBuffer());
                                        this.setState({
                                            isEditMode:!this.state.isEditMode,
                                            isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible
                                            },()=>{
                                            this.gridRef.onEdit();
                                        })
                                    }}
                                >
                                    {t("apply and quit")}
                                </Button>
                                <Button
                                    onClick={()=>{
                                        this.setState({
                                            isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible
                                        })
                                    }}
                                >
                                    {t("back to edit")}
                                </Button>
                                <Button
                                    onClick={()=>{
                                        this.gridRef.resetBuffer();
                                        this.setState({isEditMode:false
                                            , isCheckEditBufferVisible: !this.state.isCheckEditBufferVisible},()=>{
                                            this.gridRef.onEdit();
                                            this.refresh()
                                        })
                                    }}
                                >
                                    {t("reset changes")}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </Fullscreen>
        </div>
        )
    }
}

export default withTranslation()(DatasetView)