import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {Dropdown, Menu, Modal, Select} from 'antd';
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
import {replaceAllCollisionless} from "../../../utils/replacer";
import {
    actionType,
    appTypes,
    calculatorFunctionTranslator,
    defaultDateFormat,
    defaultDecimalFormat,
    defaultIntegerFormat,
    defaultTimestampFormat,
    dmlOperation,
    eventType,
    grantType,
    textAlignMap
} from "../../../utils/consts";
import {ValueFormatterParams} from "ag-grid-community";
import _ from "lodash";
import './../../../styles/AggregateHighlight.css';

import {NeoButton, NeoColor, NeoDrawer, NeoInput, NeoModal, NeoSelect, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

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
    leafColumnDefs: Map<String,any>[];
    defaultColumnDefs: Map<String,any>[];
    defaultLeafColumnDefs: Map<String,any>[];
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
    isDropdownVisible: boolean
    isDropdownVisibleForDiagramm: boolean
    aggregatedRows: {[key: string]: unknown}[];
    isGroovyDataset: boolean;
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
            leafColumnDefs: [],
            defaultColumnDefs: [],
            defaultLeafColumnDefs: [],
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
            isDropdownVisible: false,
            isDropdownVisibleForDiagramm: false,
            aggregatedRows: [],
            isGroovyDataset: false
        };
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

    getAllDatasetComponents(findColumn: boolean, datasetComponentName: string|undefined = undefined) {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c.eURI() === 'ru.neoflex.nfcore.dataset#//DatasetComponent');
            let allDatasetComponents: any[] = [];
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((result: Ecore.Resource[]) => {
                        this.props.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
                            const userComponentName = userProfile.eContents()[0].get('params').array()
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
                                this.setState({allDatasetComponents}, () => {
                                    if (datasetComponentName) {
                                        this.onChangeDatasetComponent(datasetComponentName);
                                        this.saveDatasetComponentToUrl(datasetComponentName);
                                    } else {
                                        const found = this.props.pathFull[this.props.pathFull.length - 1].params
                                            ? this.props.pathFull[this.props.pathFull.length - 1].params.find((p:any)=>p.parameterName === this.props.viewObject.get('name')+this.props.viewObject.eURI())
                                            : undefined;
                                        //TODO нужна проверка на private версию данных, чтобы не отображать приватную
                                        if (found && allDatasetComponents.find(obj => {
                                                return obj.eContents()[0].get('name') === found.parameterValue}
                                            )) {
                                            this.onChangeDatasetComponent(found.parameterValue);
                                        }
                                    }
                                })
                            }
                            if (currentDatasetComponent && currentDatasetComponent.eContents()[0].get('dataset').eClass.get('name') === "GroovyDataset") {
                                this.setState({isGroovyDataset: true})
                            }

                        });
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

    getChildrenColumns(column: any, resource: Ecore.Resource) {
        let columnDefs:any[] = [];
        column.each( (c: Ecore.EObject) => {
            if (c.get('column')) {
                let rowData = new Map();
                rowData.set('headerName', c.get('headerName') ? c.get('headerName').get('name') : c.get('name'));
                rowData.set('children', this.getChildrenColumns(c.get('column'), resource));
                columnDefs.push(rowData);
            } else {
                let rowData = new Map();
                const isEditGridComponent = c.get('component') ? c.get('component').get('isEditGridComponent') : false;
                const type = c.get('datasetColumn') !== null ? c.get('datasetColumn').get('convertDataType') : null;
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
                rowData.set('componentRenderCondition', c.get('componentRenderCondition'));
                rowData.set('textAlign', textAlignMap_[c.get('textAlign') || "Undefined"]);
                rowData.set('formatMask', c.get('formatMask'));
                rowData.set('excelFormatMask', c.get('excelFormatMask'));
                rowData.set('mask', this.evalMask(c.get('formatMask')));
                rowData.set('excelMask', this.evalMask(c.get('excelFormatMask')));
                rowData.set('onCellDoubleClicked', (params: any) => {
                    if (params.colDef.editable && this.state.isEditMode) {
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
                rowData.set('tooltipField', c.get('showTooltipField') ? c.get('name') : undefined);
                rowData.set('convertDataType', c.get('datasetColumn') ? c.get('datasetColumn').get('convertDataType') : undefined)
                columnDefs.push(rowData);
            }
        });
        return columnDefs;
    }

    getLeafColumns(column: Map<String,any>[], columnDefs:Map<String,any>[] = []) {
        column.forEach( (c) => {
            if (c.get('children')) {
                this.getLeafColumns(c.get('children'), columnDefs)
            } else {
                columnDefs.push(c)
            }
        });
        return columnDefs
    }

    hideLeafColumns(hiddenColumns: IServerQueryParam[], columnDefs:Map<String,any>[]) {
        columnDefs.forEach(c=>{
            if (c.get('children')) {
                this.hideLeafColumns(hiddenColumns, c.get('children'))
            } else {
                hiddenColumns.forEach(hc=>{
                    if (hc.datasetColumn === c.get('field'))
                        c.set('hide', hc ? !hc.enable : c.get('hide'))
                });
            }
        })
    }

    replaceComponentRenderCondition(columnDefs:Map<String,any>[], leafColumnDefs:Map<String,any>[]) {
        columnDefs.forEach(c=>{
            if (c.get('children')) {
                this.replaceComponentRenderCondition(c.get('children'), leafColumnDefs)
            } else {
                if (c.get('componentRenderCondition')) {
                    const repArr = leafColumnDefs.map((cn) => {
                        const regxType = cn.get('convertDataType') !== null ? cn.get('convertDataType') : null;
                        return {
                            name: cn.get('field'),
                            replacement: (regxType === appTypes.Integer)
                                ? `parseInt(this.props.data.${cn.get('field')})`
                                : (regxType === appTypes.Decimal)
                                    ? `parseFloat(this.props.data.${cn.get('field')})`
                                    : `this.props.data.${cn.get('field')}`
                        }
                    });
                    c.set('componentRenderCondition', replaceAllCollisionless(c.get('componentRenderCondition'), repArr));
                }
            }
        })
    }

    deepCloneColumnDefs(columnDefs:Map<String,any>[], evalMasks = false, newColumnDefs:Map<String,any>[] = []) {
        columnDefs.forEach(cd=>{
            if (cd.get('children')) {
                let rowData = new Map();
                cd.forEach((value, key) => {
                    if (key !== 'children')
                        rowData.set(key,value)
                });
                rowData.set('children', this.deepCloneColumnDefs(cd.get('children'), evalMasks));
                newColumnDefs.push(rowData);
            } else {
                let rowData = new Map();
                cd.forEach((value, key) => {
                    if (key === 'mask' && evalMasks)
                        rowData.set(key, this.evalMask(cd.get('formatMask')));
                    else if (key === 'excelMask' && evalMasks)
                        rowData.set(key, this.evalMask(cd.get('excelFormatMask')));
                    else
                        rowData.set(key,value)
                });
                newColumnDefs.push(rowData);
            }
        });
        return newColumnDefs;
    }

    findColumnDefs(resource: Ecore.Resource){
        let columnDefs = this.getChildrenColumns(resource.eContents()[0].get('column'), resource);
        const leafColumnDefs = this.getLeafColumns(columnDefs);
        this.replaceComponentRenderCondition(columnDefs, leafColumnDefs);
        this.setState({
            columnDefs: columnDefs,
            defaultColumnDefs: this.deepCloneColumnDefs(columnDefs),
            leafColumnDefs: leafColumnDefs,
            defaultLeafColumnDefs: this.deepCloneColumnDefs(leafColumnDefs),
        },()=>{
            this.setState({
                isUpdateAllowed: this.props.viewObject.get('datasetComponent').get('updateQuery') ? !this.validateEditOptions('updateQuery') : false,
                isInsertAllowed: this.props.viewObject.get('datasetComponent').get('insertQuery') ? !this.validateEditOptions('insertQuery') : false,
                isDeleteAllowed: this.props.viewObject.get('datasetComponent').get('deleteQuery') ? !this.validateEditOptions('deleteQuery') : false,
            });
        });
        this.findParams(resource as Ecore.Resource, leafColumnDefs);
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
        this.props.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
            const userProfileValue = userProfile.eContents()[0].get('params').array()
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
            hiddenColumns = hiddenColumns.length > 0 ? hiddenColumns : this.getLeafColumns(columnDefs)
                //Если поле hide в developer'е то оно никак не должно отображаться в UI пользователя
                .filter(c=> !c.get('hide'))
                .map(c => {
                return {
                    datasetColumn: c.get('field'),
                    enable: true
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
        });
    }

    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.state.currentDatasetComponent.rev !== undefined) {
            if (prevProps.location.pathname !== this.props.location.pathname) {
                this.findParams(this.state.currentDatasetComponent, this.state.leafColumnDefs);
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
            let columnDefs = this.deepCloneColumnDefs(this.state.columnDefs);
            this.hideLeafColumns(this.state.hiddenColumns, columnDefs);
            this.setState({
                columnDefs: columnDefs,
                leafColumnDefs: this.getLeafColumns(columnDefs)
            })
        }
    }

    getColumnDefGroupBy = () => {
        let newColumnDefs: any[] = [];
        const newColumns = this.state.groupByColumn.concat(this.state.serverGroupBy).filter(c=>c.enable && c.datasetColumn)
        for (const obj of newColumns) {
                let aggByColumn = this.state.serverGroupBy
                    .find((s: any) => s.value === obj.value);
                let colDef = this.state.defaultLeafColumnDefs
                    .find((s: any) => s.get('field') === obj.datasetColumn || s.get('field') === (aggByColumn ? aggByColumn.datasetColumn : ""))!;
                let rowData = new Map();
                rowData.set('field', aggByColumn && aggByColumn.value ? aggByColumn.value : colDef.get('field'));
                rowData.set('headerName', aggByColumn && aggByColumn.operation ? `${this.props.t(aggByColumn.operation)}: ${aggByColumn.value}` : colDef.get('headerName'));
                rowData.set('headerTooltip', colDef.get('headerTooltip'));
                rowData.set('hide', colDef.get('hide'));
                rowData.set('pinned', colDef.get('pinned'));
                rowData.set('filter', colDef.get('filter'));
                rowData.set('sort', colDef.get('sort'));
                rowData.set('editable', this.state.isReadOnly ? false : colDef.get('editable'));
                rowData.set('checkboxSelection', colDef.get('checkboxSelection'));
                rowData.set('sortable', colDef.get('sortable'));
                rowData.set('suppressMenu', colDef.get('suppressMenu'));
                rowData.set('resizable', colDef.get('resizable'));
                rowData.set('type', colDef.get('type'));
                rowData.set('onCellDoubleClicked', colDef.get('onCellDoubleClicked'));
                rowData.set('updateCallback', colDef.get('updateCallback'));
                rowData.set('component', colDef.get('component'));
                rowData.set('editComponent', colDef.get('editComponent'));
                rowData.set('componentRenderCondition', colDef.get('componentRenderCondition'));
                rowData.set('textAlign', colDef.get('textAlign'));
                rowData.set('isPrimaryKey', colDef.get('isPrimaryKey'));
                rowData.set('formatMask', colDef.get('formatMask'));
                rowData.set('valueFormatter', colDef.get('valueFormatter'));
                rowData.set('tooltipField', colDef.get('tooltipField'));
                newColumnDefs.push(rowData);
        }
        return newColumnDefs
    };

    getNewColumnDef = (parametersArray: IServerQueryParam[]) => {
        let columnDefs = this.deepCloneColumnDefs(this.state.defaultColumnDefs, true);
        parametersArray.forEach(element => {
            if (element.enable && element.datasetColumn) {
                let rowData = new Map();
                rowData.set('field', element.datasetColumn);
                rowData.set('headerName', element.datasetColumn);
                rowData.set('headerTooltip', element.datasetColumn);
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

    getExcelMask = (params: ValueFormatterParams) => {
        const found = this.state.leafColumnDefs.find(c=> params.colDef.field === c.get('field'));
        let mask = found ? found.get('excelMask') : undefined;
        if (mask && this.state.leafColumnDefs.find(c => mask.includes(c.get('field')))) {
            try {
                // eslint-disable-next-line
                mask = eval(replaceAllCollisionless(mask, this.state.leafColumnDefs.map(c=>{
                    return {
                        name: c.get('field'),
                        replacement: `params.data.${c.get('field')}`
                    }
                })))
            } catch (e) {
                this.props.context.notification("ExcelFormatMask",
                    this.props.t("exception while evaluating") + ` ${mask}`,
                    "warning")
            }
        }
        return mask
    };

    valueFormatter = (params: ValueFormatterParams) => {
        const found = this.state.leafColumnDefs.find(c=> params.colDef.field === c.get('field'));
        let mask = found ? found.get('mask') : undefined;
        let formattedParam, splitted;
        if (this.state.aggregatedRows.length > 0
            && params.value
            && params.node.rowIndex >= this.state.rowData.length - this.state.aggregatedRows.length) {
            splitted = params.value.split(":");
            params.value = splitted[1];
        }

        if (mask && this.state.leafColumnDefs.find(c => mask.includes(c.get('field')))) {
            try {
                // eslint-disable-next-line
                mask = eval(replaceAllCollisionless(mask, this.state.leafColumnDefs.map(c=>{
                    return {
                        name: c.get('field'),
                        replacement: `params.data.${c.get('field')}`
                    }
                })))
            } catch (e) {
                this.props.context.notification("FormatMask",
                    this.props.t("exception while evaluating") + ` ${mask}`,
                    "warning")
            }
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
            && params.node.rowIndex >= this.state.rowData.length - this.state.aggregatedRows.length) {
            splitted[1] = formattedParam;
            formattedParam = splitted.join(":")
        }
        return formattedParam
    };

    translateExpression(calculatedExpression: IServerQueryParam[]) {
        let sortMap = this.state.defaultLeafColumnDefs
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
                if (filter(groupByParams).length !== 0) {
                    newColumnDef = this.getColumnDefGroupBy()
                }
                //Отфильтровать столбцы которые hide в developer'е
                const hiddenColumns = this.getNewHiddenColumns(this.getLeafColumns(newColumnDef)
                    .filter(cn=> {
                        let isReturned = true;
                        this.state.defaultLeafColumnDefs.forEach(dl=>{
                            if (dl.get('field') === cn.get('field') && dl.get('hide')) {
                                isReturned = false;
                            }
                        });
                        return isReturned
                    })
                );
                //Восстанавливем признак скрытой если она отмечена в hiddenColumns
                this.hideLeafColumns(hiddenColumns, newColumnDef);
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
                                leafColumnDefs: this.getLeafColumns(newColumnDef),
                                isAggregations: true,
                                aggregatedRows: this.getAggregatedRows(aggregationParams, result),
                                hiddenColumns: hiddenColumns},callback);
                            this.updatedDatasetComponents(newColumnDef, result, datasetComponentName)});
                            this.props.context.notifyAllEventHandlers({
                                type:eventType.change,
                                itemId:this.props.viewObject.get('name')+this.props.viewObject._id
                            })
                } else {
                    this.setState({
                        rowData: result,
                        columnDefs: newColumnDef,
                        leafColumnDefs: this.getLeafColumns(newColumnDef),
                        isAggregations: false,
                        aggregatedRows: [],
                        hiddenColumns: hiddenColumns},callback);
                    this.updatedDatasetComponents(newColumnDef, result, datasetComponentName);
                    this.props.context.notifyAllEventHandlers({
                        type:eventType.change,
                        itemId:this.props.viewObject.get('name')+this.props.viewObject._id
                    })
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

    onChangeDatasetComponent(e: any): void {
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

    //Меняем фильтры, выполняем запрос и пишем в userProfilePromise

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

            this.setState<never>({[paramName]: newServerParam});
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
            this.datasetViewChangeUserProfile(datasetComponentId, paramName, []);
            this.findParams(this.state.currentDatasetComponent, this.state.columnDefs, paramName)
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
        if (!this.state.leafColumnDefs.find(cd => cd.get('isPrimaryKey'))) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('primary key column is not specified') ,"error")
        }
        if (this.props.viewObject.get('datasetComponent').get(operationType)
            && this.props.viewObject.get('datasetComponent').get(operationType).get('generateFromModel')
            && !this.props.viewObject.get('datasetComponent').get('dataset').get('schemaName')) {
            restrictOperation = true;
            this.props.context.notification(this.props.t('celleditorvalidation'), operationType + " " + this.props.t('jdbcdataset schema is not specified') ,"error")
        }
        if (this.props.viewObject.get('datasetComponent').get(operationType)
            && this.props.viewObject.get('datasetComponent').get(operationType).get('generateFromModel')
            && !this.props.viewObject.get('datasetComponent').get('dataset').get('tableName')) {
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

    saveDatasetComponentToUrl = (datasetComponentName: string) => {
        const urlParams = this.props.pathFull[this.props.pathFull.length - 1];
        const found = urlParams.params.find((p:any)=>p.parameterName === this.props.viewObject.get('name')+this.props.viewObject.eURI())
        if (found) {
            found.parameterValue = datasetComponentName
        } else {
            urlParams.params = urlParams.params.concat({
                parameterName: this.props.viewObject.get('name')+this.props.viewObject.eURI(),
                parameterValue: datasetComponentName
            })
        }
        this.props.context.changeURL(urlParams.appModule,
            urlParams.useParentReferenceTree,
            undefined,
            urlParams.params);
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
                    <NeoInput
                        style={{width:'184px', height: "32px", marginTop: "4px"}}
                        type="search"
                        onChange={() => this.gridRef.onQuickFilterChanged()}
                        id={"quickFilter"}
                        placeholder={t("quick filter")}
                    />
                    <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>
                        <NeoButton type={'link'} title={t('filters')}
                                   style={{marginTop:'7px', marginLeft: "16px"}}
                                   onClick={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}>
                            <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                        {!this.state.isGroovyDataset ? <NeoButton type={'link'} title={t('sorts')} style={{marginTop:'7px', marginLeft: "11px"}}
                                                                 onClick={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}>
                            <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>
                        </NeoButton> : null}
                    <div className='verticalLine'  style={{height: '40px', marginLeft: "16px"}}/>
                        {!this.state.isGroovyDataset ? <NeoButton type={'link'} title={t('calculator')}
                                                                  style={{marginLeft:'16px', marginTop:'7px'}}
                                                                  onClick={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}>
                            <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>
                        </NeoButton> : null}
                        {!this.state.isGroovyDataset ? <NeoButton type={'link'} title={t('aggregations')}
                                                                  style={{marginLeft:'8px', marginTop:'7px'}}
                                                                  onClick={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}>
                            <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>
                        </NeoButton> : null}
                        <NeoButton type={'link'} title={t('diagram')}
                                   style={{marginLeft:'8px', marginTop:'7px'}}
                                   onClick={()=> {
                                       this.DiagramButton()
                                   }}>
                            <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                        {!this.state.isGroovyDataset ? <NeoButton type={'link'} title={t('grouping')}
                                                                  style={{marginLeft:'8px', marginTop:'7px'}}
                                                                  onClick={()=>{this.handleDrawerVisibility(paramType.group,!this.state.aggregatesGroupsMenuVisible)}}>
                            <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>
                        </NeoButton> : null}
                    <NeoButton type={'link'} title={t('hiddencolumns')}
                               style={{color: 'rgb(151, 151, 151)', marginLeft:'8px', marginTop:'7px'}}
                               onClick={()=>{this.handleDrawerVisibility(paramType.hiddenColumns,!this.state.hiddenColumnsMenuVisible)}}
                    >
                        <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                    </NeoButton>

                    <div className='verticalLine'  style={{marginLeft:'16px', height: '40px'}}/>
                        <NeoButton type={'link'} title={t('save')}  style={{marginLeft:'16px', marginTop:'7px'}}
                                   onClick={()=>{this.setState({saveMenuVisible:!this.state.saveMenuVisible})}}>
                            <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                    {this.state.allDatasetComponents.length !== 0
                    && this.state.currentDatasetComponent !== undefined
                    && this.state.currentDatasetComponent.eContents()[0].get('access') !== "Default"
                        &&
                        <div>
                        <NeoButton type={'link'} title={t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
                               onClick={()=>{this.setState({deleteMenuVisible:!this.state.deleteMenuVisible})}}>

                        <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                        </div>
                        }
                    <div className='verticalLine' style={{marginLeft:'16px', height: '40px'}}/>
                    {(this.state.isUpdateAllowed || this.state.isDeleteAllowed || this.state.isInsertAllowed) ?
                        <NeoButton
                            type={'link'}
                            title={t('edit')}
                            style={{color: 'rgb(151, 151, 151)', background: '#F2F2F2', marginTop:'7px', marginLeft: "20px"}}
                            onClick={() => {
                                if (this.state.groupByColumn.filter(c => c.enable && c.datasetColumn).length > 0
                                    || this.state.serverGroupBy.filter(c => c.enable && c.datasetColumn).length > 0
                                    || this.state.serverAggregates.filter(c => c.enable && c.datasetColumn).length > 0
                                    || this.state.serverCalculatedExpression.filter(c => c.enable && c.datasetColumn).length > 0) {
                                    this.refresh(true);
                                } else {
                                    this.setState({isEditMode: !this.state.isEditMode}, () => {
                                        this.gridRef.onEdit()
                                    })
                                }
                            }}
                        >
                            <NeoIcon icon={"edit"} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                        :
                        null
                    }

                </div>

            <div className='block'>
                <span className='caption'>{t("version")}</span>
            {this.state.allDatasetComponents.length !== 0
            && this.state.currentDatasetComponent !== undefined
            &&
            <div id="selectsInFullScreen" style={{display: 'inline-block'}}>
                <NeoSelect
                         getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}
                         width={'184px'}
                         allowClear={this.state.currentDatasetComponent.eContents()[0].get('access') !== "Default"}
                         style={{marginTop:'6px'}}
                         value={this.state.currentDatasetComponent.eContents()[0].get('name')}
                         onChange={(e: any) => {
                             if (e) {
                                 this.onChangeDatasetComponent(e);
                                 this.saveDatasetComponentToUrl(e);
                             } else {
                                 this.setState({deleteMenuVisible:true})
                             }
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
                <div className='verticalLine' style={{height: '40px', marginLeft: "17px"}}/>

                 <Dropdown overlay={menu} placement="bottomRight"
                           getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}>
                     <div>
                         <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginLeft: "16px", marginTop:'8px'}}/>
                     </div>
                 </Dropdown>
                <NeoButton
                    title={t('fullscreen')}
                    type={'link'} style={{marginLeft: "10px", marginTop:'7px'}}
                           onClick={this.onFullScreen}>
                    {this.state.fullScreenOn  ?
                        <NeoIcon icon={'fullScreenUnDo'} color={'#5E6785'} size={'m'}/>
                             :
                        <NeoIcon icon={'fullScreen'} color={'#5E6785'} size={'m'}/>
                    }
                </NeoButton>
            </div>
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
        return (
        <div className="functionalBar__header">
            <div className='block' style={{marginLeft: "17.33px", display: "flex", marginRight: "40px"}}>
                <NeoButton
                    type={'link'}
                    title={t("back to table")}
                    style={{background: '#F2F2F2', color: NeoColor.grey_9, marginTop: "4px"}}
                    suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagrams,false);
                        this.handleDrawerVisibility(paramType.diagramsAdd,false);
                        this.setState({currentDiagram:undefined, isDownloadFromDiagramPanel: !this.state.isDownloadFromDiagramPanel });
                    }}
                >
                    <span style={{marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal"}}>{t("back to table")}</span>
                </NeoButton>
            <div className='verticalLine' style={{height: '40px', marginLeft: "40px"}}/>
            <NeoButton type={'link'} title={t('add')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'16px'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible);
                    }}
            >
                <NeoIcon icon={"plus"} size={"m"} color={'#5E6785'}/>
            </NeoButton>
            <NeoButton type={'link'} title={t('edit')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'10px'}}
                    onClick={()=>{
                        this.handleDrawerVisibility(paramType.diagrams,!this.state.diagramEditMenuVisible);
                    }}
            >
                <NeoIcon icon={"edit"} size={"m"} color={'#5E6785'}/>
            </NeoButton>
                <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>

            <NeoButton type={'link'} title={t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
                    onClick={()=>{this.setState({deleteMenuVisible:!this.state.deleteMenuVisible, IsGrid:!this.state.IsGrid})}}
            >
                <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
            </NeoButton>
                <div className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>
            </div>

            <div className='block'>


                <div id="selectInGetDiagramPanel" style={{display: 'inline-block', marginTop: "5px"}}>
                <NeoSelect
                    getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                    style={{ width: '192x'}}
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
                </NeoSelect>
            </div>
                <div id={"dropdownInGridPanel"}   className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>


                <span className={"checkboxDiagram"} style={{marginTop: "10px", marginLeft: "16px"}}>
                    <NeoInput type={'checkbox'} onChange={this.withTable.bind(this)} style={{marginTop: "6px", background: '#F2F2F2'}}/>
                  <span style={{display: 'inline-block', marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal", marginLeft: "30px"}}>{t("download with table")}</span>
                </span>


                <Dropdown overlay={menu} placement="bottomLeft"
                          getPopupContainer={() => document.getElementById ("dropdownInGridPanel") as HTMLElement}>
                    <div style={{marginRight: "5px"}}>
                        <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginTop: "7px", marginLeft: "16px"}}/>
                    </div>
                </Dropdown>

                <div id={"dropdownInGridPanel"}   className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>


            <NeoButton
                title={t('fullscreen')}
                className="buttonFullScreen"
                type="link"
                style={{
                    float: "right",
                    marginLeft: '16px',
                    color: 'rgb(151, 151, 151)',
                    marginTop: "6px",
                    background: '#F2F2F2'
                }}
                onClick={this.onFullScreen}
            >
                {this.state.fullScreenOn  ?
                   <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={'#5E6785'}/>
                    :
                    <NeoIcon icon={"fullScreen"} size={"m"} color={'#5E6785'}/>}
            </NeoButton>
            </div>

        </div>
        )
    };

    getEditPanel = () => {
        const { t } = this.props;
        return <div className="functionalBar__header">
            <div className='block' style={{margin: "auto 16px", display: "flex"}}>
            <NeoButton
                type={'link'}
                title={t('edit')}
                style={{color: NeoColor.grey_9, marginTop: "4px"}}
                suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
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
                <span><NeoTypography style={{color: NeoColor.grey_9}} type={'body-regular'}>{t("exitFromEditMode")}</NeoTypography></span>
            </NeoButton>
            <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>
            <NeoButton
                type={'link'}
                hidden={!this.state.isEditMode || !this.state.isInsertAllowed}
                title={t("add row")}
                style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                onClick={() => this.gridRef.onInsert()}
            >
                <NeoIcon icon={"plus"}  size={'m'}/>
            </NeoButton>
            <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>
                <NeoButton
                    type={'link'}
                    hidden={!this.state.isEditMode}
                    title={t("apply changes")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                    onClick={() => {
                        //Убрал т.к. есть подсветки
                        /*this.gridRef.removeRowsFromGrid();*/
                        if (this.gridRef.whichEdited().length === 0) {
                            this.onApplyEditChanges(this.gridRef.getBuffer());
                        } else {
                            this.gridRef.stopEditing()
                        }
                    }}
                >
                    <NeoIcon icon={"mark"} size={'m'}/>
                </NeoButton>
                <NeoButton
                    type={'link'}
                    hidden={!this.state.isEditMode || !this.state.isDeleteAllowed}
                    title={t("delete selected")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "8px"}}
                    onClick={() => this.gridRef.onDeleteSelected()}
                >
                    <NeoIcon icon={"rubbish"} size={'m'}/>
                </NeoButton>
            <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>
            <NeoButton
                type={'link'}
                hidden={!this.state.isEditMode || !this.state.isInsertAllowed}
                title={t("copy selected")}
                style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                onClick={() => {
                    this.gridRef.copySelected();
                }}
            >
                <NeoIcon icon={"duplicate"} size={'m'}/>
            </NeoButton>
            </div>
            <div className='block' style={{margin: "auto 16px", display: "flex"}}>
            <NeoInput
                hidden={!this.state.isEditMode}
                style={{width:'184px', height: "32px", marginTop: "5px"}}
                type={"search"}
                onChange={() => this.gridRef.onQuickFilterChanged()}
                id={"quickFilter"}
                placeholder={t("quick filter")}
            />
            <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>

                <NeoButton
                    title={t('fullscreen')}
                    className="buttonFullScreen"
                    type="link"
                    style={{
                        float: "right",
                        marginLeft: '16px',
                        color: 'rgb(151, 151, 151)',
                        marginTop: "6px",
                        background: '#F2F2F2'
                    }}
                    onClick={this.onFullScreen}
                >
                    {this.state.fullScreenOn  ?
                        <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={'#5E6785'}/>
                        :
                        <NeoIcon icon={"fullScreen"} size={"m"} color={'#5E6785'}/>}
                </NeoButton>
            </div>
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
                    this.onChangeDatasetComponent(this.state.allDatasetComponents[i].eContents()[0].get('name'));
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
            const primaryKey = this.state.leafColumnDefs
                .filter(c => c.get('isPrimaryKey'))
                .map(c => {
                    return {
                        parameterName: d.operationMark__ === dmlOperation.update
                            && !this.props.viewObject.get('datasetComponent').get("updateQuery").get('generateFromModel') ? `${c.get('field')}_pk` : c.get('field'),
                        parameterValue: d.operationMark__ === dmlOperation.update && d[`${c.get('field')}__`] !== undefined ? d[`${c.get('field')}__`] : d[c.get('field')],
                        parameterDataType: c.get('type'),
                        isPrimaryKey: true
                    }
                });
            const values = this.state.leafColumnDefs
                .filter(c => c.get('editable') || c.get('isPrimaryKey'))
                .map(c => {
                    return {
                        parameterName: c.get('field'),
                        parameterValue: d[c.get('field')],
                        parameterDataType: c.get('type'),
                        isPrimaryKey: false
                    }
                });
            const params = primaryKey.concat(values);
            this.props.context.executeDMLOperation(this.state.currentDatasetComponent, d.operationMark__, params).then(()=>{

                }
            ).catch(()=>{
                    //Выходим из редактора, чтобы не ловить ошибки ag-grid
                    this.setState({isEditMode:false},() => {
                        //Восстанавливаем значение в случае ошибки
                        this.gridRef.resetBuffer();
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
            <div style={{margin:'16px'}} className={this.props.className}>
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
                    highlights = {this.state.highlights}
                    currentDatasetComponent = {this.state.currentDatasetComponent}
                    rowData = {this.state.rowData}
                    columnDefs = {this.state.columnDefs}
                    leafColumnDefs = {this.state.leafColumnDefs}
                    currentTheme = {this.state.currentTheme}
                    showUniqRow = {this.state.showUniqRow}
                    saveChanges = {this.changeDatasetViewState}
                    onApplyEditChanges = {this.onApplyEditChanges}
                    isEditMode = {this.state.isEditMode}
                    showEditDeleteButton = {this.state.isDeleteAllowed}
                    showMenuCopyButton = {this.state.isInsertAllowed}
                    aggregatedRows = {this.state.aggregatedRows}
                    highlightClassFunction = {(params: any) => {
                        if (params.node.rowIndex >= this.state.rowData.length - this.state.aggregatedRows.length
                            && (params.node.rowIndex - (this.state.rowData.length - this.state.aggregatedRows.length)) % 2 === 0) {
                            return 'aggregate-highlight-even';
                        }
                        if (params.node.rowIndex >= this.state.rowData.length - this.state.aggregatedRows.length
                            && (params.node.rowIndex - (this.state.rowData.length - this.state.aggregatedRows.length)) % 2 !== 0) {
                            return 'aggregate-highlight-odd';
                        }
                        return ""
                    }}
                    valueFormatter={this.valueFormatter}
                    excelCellMask={this.getExcelMask}
                    className={this.props.className}
                    {...this.props}
                />
                <div id="filterButton">
                <NeoDrawer
                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    title={t('filters')}
                    width={'711px'}
                    visible={this.state.filtersMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.filter,!this.state.filtersMenuVisible)}}
                    mask={false}
                >
                    {

                        this.state.serverFilters && !this.state.isGroovyDataset
                            ?
                            <ServerFilter
                                {...this.props}
                                parametersArray={this.state.serverFilters}
                                columnDefs={this.state.leafColumnDefs}
                                allOperations={this.state.allOperations}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.filtersMenuVisible}
                                componentType={paramType.filter}
                                handleDrawerVisability={this.handleDrawerVisibility}
                            />
                            :
                            null
                    }
                    {
                        this.state.highlights && this.state.allHighlightType
                            ?
                            <Highlight
                                {...this.props}
                                parametersArray={this.state.highlights}
                                columnDefs={this.state.leafColumnDefs}
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
                </NeoDrawer>
                </div>
                <div id="aggregationButton">
                <NeoDrawer
                    getContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                    title={t('aggregations')}
                    width={'711px'}
                    visible={this.state.aggregatesMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesMenuVisible)}}
                    mask={false}
                >
                    {
                        this.state.serverAggregates
                            ?
                            <ServerAggregate
                                {...this.props}
                                parametersArray={this.state.serverAggregates}
                                columnDefs={this.state.leafColumnDefs}
                                allAggregates={this.state.allAggregates}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.aggregatesMenuVisible}
                                componentType={paramType.aggregate}
                                handleDrawerVisability={this.handleDrawerVisibility}
                            />
                            :
                            <ServerAggregate/>
                    }
                </NeoDrawer>
                    </div>
                <div id="aggregationGroupsButton">
                    <NeoDrawer
                        getContainer={() => document.getElementById ('aggregationGroupsButton') as HTMLElement}
                        title={t('grouping')}
                        width={'700px'}
                        visible={this.state.aggregatesGroupsMenuVisible}
                        onClose={()=>{this.handleDrawerVisibility(paramType.aggregate,!this.state.aggregatesGroupsMenuVisible)}}
                        mask={false}
                    >
                        {
                            this.state.groupByColumn
                                ?
                                <ServerGroupByColumn
                                    {...this.props}
                                    parametersArray={this.state.groupByColumn}
                                    columnDefs={this.state.defaultLeafColumnDefs}
                                    allAggregates={this.state.allAggregates}
                                    onChangeParameters={this.onChangeParams}
                                    saveChanges={this.changeDatasetViewState}
                                    isVisible={this.state.aggregatesGroupsMenuVisible}
                                    componentType={paramType.groupByColumn}
                                    handleDrawerVisability={this.handleDrawerVisibility}
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
                                    columnDefs={this.state.defaultLeafColumnDefs}
                                    allAggregates={this.state.allAggregates}
                                    onChangeParameters={this.onChangeParams}
                                    saveChanges={this.changeDatasetViewState}
                                    isVisible={this.state.aggregatesGroupsMenuVisible}
                                    componentType={paramType.group}
                                    handleDrawerVisability={this.handleDrawerVisibility}
                                />
                                :
                                <ServerGroupBy/>
                        }
                    </NeoDrawer>
                </div>
                <div id="sortButton">
                <NeoDrawer
                    getContainer={() => document.getElementById ('sortButton') as HTMLElement}
                    title={t('sorts')}
                    width={'720px'}
                    visible={this.state.sortsMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.sort,!this.state.sortsMenuVisible)}}
                    mask={false}
                >
                    {
                        this.state.serverSorts
                            ?
                            <ServerSort
                                {...this.props}
                                parametersArray={this.state.serverSorts}
                                columnDefs={this.state.leafColumnDefs}
                                allSorts={this.state.allSorts}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.sortsMenuVisible}
                                componentType={paramType.sort}
                                handleDrawerVisability={this.handleDrawerVisibility}
                            />
                            :
                            <ServerSort/>
                    }
                </NeoDrawer>
                </div>
                <div id="hiddenColumnsButton">
                    <NeoDrawer
                        getContainer={() => document.getElementById ('hiddenColumnsButton') as HTMLElement}
                        title={t('hiddencolumns')}
                        width={'700px'}
                        visible={this.state.hiddenColumnsMenuVisible}
                        onClose={()=>{this.handleDrawerVisibility(paramType.hiddenColumns,!this.state.hiddenColumnsMenuVisible)}}
                        mask={false}
                    >
                        {
                            this.state.hiddenColumns
                                ?
                                <HiddenColumn
                                    {...this.props}
                                    parametersArray={this.state.hiddenColumns}
                                    columnDefs={this.state.leafColumnDefs}
                                    onChangeParameters={this.onChangeParams}
                                    saveChanges={this.changeDatasetViewState}
                                    isVisible={this.state.hiddenColumnsMenuVisible}
                                    componentType={paramType.hiddenColumns}
                                    handleDrawerVisability={this.handleDrawerVisibility}
                                />
                                :
                                <HiddenColumn/>
                        }
                    </NeoDrawer>
                </div>
                <div id="calculatableexpressionsButton">
                <NeoDrawer
                    getContainer={() => document.getElementById ('calculatableexpressionsButton') as HTMLElement}
                    title={t('calculator')}
                    width={'712px'}
                    visible={this.state.calculationsMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.calculations,!this.state.calculationsMenuVisible)}}
                    mask={false}
                >
                    {
                        this.state.serverCalculatedExpression
                            ?
                            <Calculator
                                {...this.props}
                                parametersArray={this.state.serverCalculatedExpression}
                                //Можно в зависимости от видимости columnDef регулировать видимость стольцов
                                //но тогда нужна доработка для трансляции выражений
                                columnDefs={this.state.defaultLeafColumnDefs}
                                onChangeParameters={this.onChangeParams}
                                saveChanges={this.changeDatasetViewState}
                                isVisible={this.state.calculationsMenuVisible}
                                componentType={paramType.calculations}
                                onChangeColumnDefs={this.onChangeColumnDefs.bind(this)}
                                defaultColumnDefs={this.state.defaultLeafColumnDefs}
                                formatMasks={this.state.formatMasks}
                                handleDrawerVisability={this.handleDrawerVisibility}
                            />
                            :
                            <Calculator/>
                    }
                </NeoDrawer>
                </div>
                <div id="diagramButton">
                <NeoDrawer
                    getContainer={() => document.getElementById ('diagramButton') as HTMLElement}
                    title={t('diagram')}
                    width={'700px'}
                    visible={this.state.diagramAddMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.diagramsAdd,!this.state.diagramAddMenuVisible)}}
                    mask={false}
                    className={'diagram'}
                >
                    {
                        <DrawerDiagram
                            {...this.props}
                            columnDefs={this.state.leafColumnDefs}
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
                </NeoDrawer>
                </div>
                <div id="diagram">
                <NeoDrawer
                    getContainer={() => document.getElementById ('diagram') as HTMLElement}
                    title={t('diagram')}
                    width={'700px'}
                    visible={this.state.diagramEditMenuVisible}
                    onClose={()=>{this.handleDrawerVisibility(paramType.diagrams,!this.state.diagramEditMenuVisible)}}
                    mask={false}
                >
                    {
                        <DrawerDiagram
                            {...this.props}
                            columnDefs={this.state.leafColumnDefs}
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
                </NeoDrawer>
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
                    <NeoModal  onCancel={()=>{
                        this.setState({
                            isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible
                        })
                    }} closable={true} type={'edit'}
                               title={t('saveChanges')}
                               content={t("warningForEditMode")}
                               visible={this.state.isCheckEditBufferVisible}
                               onLeftButtonClick={()=>{
                        this.gridRef.resetBuffer();
                        this.setState({isEditMode:false
                            , isCheckEditBufferVisible: !this.state.isCheckEditBufferVisible},()=>{
                            this.gridRef.onEdit();
                            this.refresh()
                        })
                    }}
                               onRightButtonClick={()=>{
                                   this.gridRef.removeRowsFromGrid();
                                   this.onApplyEditChanges(this.gridRef.getBuffer());
                                   this.setState({
                                       isEditMode:!this.state.isEditMode,
                                       isCheckEditBufferVisible:!this.state.isCheckEditBufferVisible
                                   },()=>{
                                       this.gridRef.onEdit();
                                   })
                               }}
                               textOfLeftButton={t("delete")}
                               textOfRightButton={t("save")}
                    >
                    </NeoModal>


                    <Modal
                        getContainer={() => document.getElementById ('edit_applyChangesButton') as HTMLElement}
                        key="save_menu"
                        width={'500px'}
                        title={t('saveReport')}
                        visible={this.state.saveMenuVisible}
                        footer={null}
                        onCancel={this.handleSaveMenu}
                    >
                        <SaveDatasetComponent
                            closeModal={this.handleSaveMenu}
                            onSave={(name:string)=>{
                                this.getAllDatasetComponents(false, name);
                            }}
                            currentDatasetComponent={this.state.currentDatasetComponent}
                            {...this.props}
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
