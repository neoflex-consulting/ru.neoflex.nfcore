import React, {createRef} from 'react';
import {AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import {ConfigProvider} from 'antd';
import {withTranslation} from 'react-i18next';
import Ecore from 'ecore';
import {docxElementExportType, docxExportObject} from "../../../utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "../../../utils/excelExportUtils";
import _ from 'lodash';
import {IServerQueryParam} from "../../../MainContext";
import Paginator from "../Paginator";
import {
    agGridColumnTypes,
    appTypes,
    dmlOperation, grantType,
} from "../../../utils/consts";
import DateEditor from "./gridComponents/DateEditor";
import {switchAntdLocale} from "../../../utils/antdLocalization";
import GridMenu from "./gridComponents/Menu";
import DeleteButton from "./gridComponents/DeleteButton";
//CSS
import '../../../styles/DatasetGrid.css';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import './../../../styles/GridEdit.css';
import {
    ColumnResizedEvent,
    DisplayedColumnsChangedEvent,
    GridOptions,
    GridReadyEvent, SuppressKeyboardEventParams,
    ValueFormatterParams
} from "ag-grid-community";
import {CellChangedEvent} from "ag-grid-community/dist/lib/entities/rowNode";
import Expand from "./gridComponents/Expand";
import {ViewRegistry} from "../../../ViewRegistry";
import {getStringValuesFromEnum} from "../../../utils/enumUtils";
import {AntdFactoryClasses} from "../../../AntdFactory";
import {TFunction} from "i18next";

const minHeaderHeight = 48;
const backgroundColor = "#fdfdfd";

interface Props {
    hidden?: boolean,
    highlights?: IServerQueryParam[];
    currentDatasetComponent?: Ecore.Resource,
    rowData: {[key: string]: unknown}[],
    columnDefs: Map<String, unknown>[],
    leafColumnDefs: Map<String, unknown>[],
    paginationPageSize?: number,
    isEditMode?: boolean;
    showEditDeleteButton?: boolean;
    showMenuCopyButton?: boolean;
    aggregatedRows?: {[key: string]: unknown}[];
    height?: number;
    width?: number;
    highlightClassFunction?: (params: any) => string | string[];
    valueFormatter?: (params: ValueFormatterParams)=>string|undefined;
    excelCellMask?: (params: ValueFormatterParams)=>string|undefined;
    className?: string;
    hidePagination?: boolean;
    i18n: any;
    t: TFunction;
    viewObject: Ecore.EObject;
    context: any;
}

class AntdFactoryWrapper extends React.Component<any, {}> {
    private componentRef = createRef<any>();
    private viewFactory = ViewRegistry.INSTANCE.get('antd');

    getValue = () => {
        return this.componentRef.current
            && this.componentRef.current.getValue
            && this.componentRef.current.getValue()
    };

    render() {
        return this.viewFactory.createView(this.props.viewObject, this.props, this.componentRef)
    }
}

class DatasetGrid extends React.Component<Props, any> {

    private grid: React.RefObject<any>;
    private gridOptions: GridOptions;
    private buffer: {[key: string]: unknown}[];

    constructor(props: any) {
        super(props);

        this.state = {
            hidden: false,
            themes: [],
            operations: [],
            paginationPageSize: this.props.paginationPageSize ? this.props.paginationPageSize : 10,
            isGridReady: false,
            columnDefs: this.colDefsToObject(this.props.columnDefs),
            rowData: this.props.rowData,
            highlights: [],
            locale: switchAntdLocale(this.props.i18n, this.props.t),
            gridOptions: {
                frameworkComponents: {
                    DateEditor: DateEditor,
                    deleteButton: DeleteButton,
                    menu: GridMenu,
                    expand: Expand,
                    antdFactory: AntdFactoryWrapper
                },
                defaultColDef: {
                    resizable: true
                }
            },
            cellStyle: {},
            overlayNoRowsTemplate: `<span>${this.props.t("no rows to show")}</span>`
        };
        this.grid = React.createRef();
        this.buffer = [];
        this.gridOptions = {};
    }

    onGridReady = (event: GridReadyEvent) => {
        if (this.grid.current !== null) {
            this.grid.current.api = event.api;
            this.grid.current.columnApi = event.columnApi;
            if (this.props.highlightClassFunction) {
                this.gridOptions.getRowClass = this.props.highlightClassFunction
            }
            this.gridOptions.isExternalFilterPresent = () => {return true;};
            this.gridOptions.doesExternalFilterPass = (node) => {
                return node.data.isVisible__ !== undefined ? node.data.isVisible__ : true
            };
            this.gridOptions.api!.onFilterChanged();
            this.gridOptions.onColumnResized = this.handleResize;
            this.gridOptions.onDisplayedColumnsChanged = this.handleResize;
            this.gridOptions.onVirtualColumnsChanged = this.handleResize;
            this.gridOptions.suppressKeyboardEvent = this.suppressKeyboardEvent;
        }
    };

    //suppress edit keys (enter, backspace) in normal mode
    suppressKeyboardEvent = (params: SuppressKeyboardEventParams) => {
        return !this.props.isEditMode;
    };

    onFilterChanged = () => {
        this.gridOptions.api!.onFilterChanged()
    };

    onPaginationChanged = () => {
        if(this.grid.current !== null) {
            this.setState({
                paginationCurrentPage: this.grid.current.api.paginationGetCurrentPage() + 1,
                paginationTotalPage: this.grid.current.api.paginationGetTotalPages(),
                isGridReady: true
            });
        }
    };

    calcExportSpans(columnDefs:any[]) {
        function findDepth(node:{children:any[]}){
            let maxDepth=0;
            if (node.children !== undefined){
                let depth =0;
                node.children.forEach((child:any) => {
                    depth = findDepth(child) + 1;
                    maxDepth = depth > maxDepth ? depth: maxDepth;
                })
            }
            return maxDepth;
        }
        let headerArr = [];
        let headerRow = [];
        let childrenToVisit = columnDefs.map(c=>c);
        let levelSize = columnDefs.length;
        let index = 0;
        let maxDepth = 0;
        childrenToVisit.forEach(ch=>{
            maxDepth = (findDepth(ch) + 1 > maxDepth) ? findDepth(ch) + 1 : maxDepth
        });
        while (childrenToVisit.length !== 0) {
            const current = childrenToVisit.shift();
            if (!current.hide) {
                if ((current.children && this.getLeafColumns(current.children).filter(c=>!c.hide).length > 0)
                    || !current.children) {
                    headerRow.push({
                        headerName: current.headerName,
                        columnSpan: current.children ? this.getLeafColumns(current.children).filter(c=>!c.hide).length : 1,
                        rowSpan: current.children
                            ? maxDepth - findDepth(current)
                            : (maxDepth - headerArr.length) > 0
                                ? maxDepth - headerArr.length
                                : 1
                    });
                }
            }
            if (current.children) {
                childrenToVisit = childrenToVisit.concat(current.children)
            }
            index += 1;
            if (index >= levelSize) {
                levelSize += childrenToVisit.length;
                headerArr.push(headerRow);
                headerRow = [];
            }
        }
        return headerArr;
    }

    private getDocxData() : docxExportObject {
        let header = [];
        const visible = [];
        let gridHeader = this.calcExportSpans(this.state.columnDefs);
        for (const elem of this.getLeafColumns(this.state.columnDefs)) {
            if (!elem.hide) {
                header.push({name: elem.headerName, filterButton: true});
                visible.push(elem.field)
            }
        }
        let data = [];
        for (const [index, elem] of this.state.rowData.entries()) {
            let objectRow = [];
            for (const el of visible) {
                let params = {
                    value: elem[el],
                    data: elem,
                    colDef: this.getLeafColumns(this.gridOptions.columnDefs!).find((c:any)=>c.field === el),
                    node: this.gridOptions.api?.getRowNode(index)
                };
                const rowStyle = this.gridOptions.getRowStyle && this.gridOptions.getRowStyle(params);
                const cellStyle = params.colDef.cellStyle(params);
                objectRow.push({
                    value: this.props.valueFormatter ? this.props.valueFormatter(params as ValueFormatterParams) : elem[el],
                    highlight: {
                        background: (cellStyle && cellStyle.background) || (rowStyle && rowStyle.background),
                        color: (cellStyle && cellStyle.color) || (rowStyle && rowStyle.color)
                    }
                });
            }
            data.push(objectRow);
        }
        return  {
            hidden: this.props.hidden!,
            docxComponentType : docxElementExportType.grid,
            gridHeader:(gridHeader.length === 0) ? [] : gridHeader,
            gridData: data
        };
    }

    private getExcelData() : excelExportObject {
        let header = [];
        const visible = [];
        let gridHeader = this.calcExportSpans(this.state.columnDefs);
        for (const elem of this.getLeafColumns(this.state.columnDefs)) {
            if (!elem.hide) {
                header.push({
                    name: elem.headerName,
                    filterButton: gridHeader.length <= 1
                });
                visible.push(elem.field)
            }
        }
        let data = [];
        for (const [index, elem] of this.state.rowData.entries()) {
            let objectRow = [];
            for (const el of visible) {
                const params = {
                    value: elem[el],
                    data: elem,
                    colDef: this.getLeafColumns(this.gridOptions.columnDefs!).find((c:any)=>c.field === el),
                    node: this.gridOptions.api?.getRowNode(index)
                };
                let dateTZ = undefined;
                if ([appTypes.Date,appTypes.Timestamp].includes(params.colDef.type)) {
                    dateTZ = new Date(params.value);
                }
                const rowStyle = this.gridOptions.getRowStyle && this.gridOptions.getRowStyle(params);
                const cellStyle = params.colDef.cellStyle(params);
                const mask = this.props.excelCellMask && this.props.excelCellMask(params as ValueFormatterParams);
                objectRow.push({
                    value: params.value
                            ? params.colDef.type === appTypes.String ? params.value
                                : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type) ? Number(params.value)
                                : [appTypes.Date,appTypes.Timestamp].includes(params.colDef.type) && dateTZ ? new Date( Date.UTC( dateTZ.getFullYear(), dateTZ.getMonth(), dateTZ.getDate(), dateTZ.getHours(), dateTZ.getMinutes(), dateTZ.getSeconds() ) )
                                : params.value
                            : null,
                    mask: params.colDef.type === appTypes.Timestamp && !mask
                        ? "dd.mm.yyyy hh:mm:ss"
                        : params.colDef.type === appTypes.Date && !mask
                            ? "dd.mm.yyyy"
                            : mask || "",
                    highlight: {
                        background: (cellStyle && cellStyle.background) || (rowStyle && rowStyle.background),
                        color: (cellStyle && cellStyle.color) || (rowStyle && rowStyle.color)
                    }
                })
            }
            data.push(objectRow);
        }
        return  {
            hidden: this.props.hidden!,
            excelComponentType : gridHeader.length > 1 ? excelElementExportType.complexGrid : excelElementExportType.grid,
            gridData: {
                tableName: this.props.viewObject.get('name') || "",
                columns: header,
                data: data
            },
            gridHeader:(gridHeader.length === 0) ? [[]] : gridHeader
        };
    }

    getLeafColumns(columnDefs: any[], leafColumnDefs: any[] = []) {
        columnDefs.forEach( (c: any) => {
            if (c.children) {
                this.getLeafColumns(c.children, leafColumnDefs)
            } else {
                leafColumnDefs.push(c)
            }
        });
        return leafColumnDefs;
    }
    
    componentDidMount(): void {
        if (this.props.context) {
            this.props.context.addDocxHandler(this.getDocxData.bind(this));
            this.props.context.addExcelHandler(this.getExcelData.bind(this));
        }
    }

    componentWillUnmount(): void {
        if (this.props.context) {
            this.props.context.removeDocxHandler();
            this.props.context.removeExcelHandler();
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.highlights && !_.isEqual(this.state.highlights, this.props.highlights)) {
            this.changeHighlight();
        }
        if (JSON.stringify(this.state.rowData) !== JSON.stringify(this.props.rowData)) {
            this.setState({rowData: this.props.rowData})
        }
        if (!_.isEqual(prevProps.columnDefs, this.props.columnDefs)) {
            this.setState({
                columnDefs: this.colDefsToObject(this.props.columnDefs)
            }, ()=> {
                //Для вычисляемых выражений type и mask не отслеживаются ag-grid
                //Поэтому при их смене приходится вызывать вручную redraw
                this.props.columnDefs.forEach((cd:any)=>{
                    const found = prevProps.columnDefs.find((c:any)=> c.get('field') === cd.get('field'))
                    if (found && (found.get('mask') !== cd.get('mask') || found.get('type') !== cd.get('type')))
                        this.grid.current.api.redrawRows()
                });
            })
        }
        if (prevProps.t !== this.props.t) {
            this.setState({
                    locale:switchAntdLocale(this.props.i18n.language, this.props.t),
                    overlayNoRowsTemplate: `<span>${this.props.t("no rows to show")}</span>`
                },()=> !this.state.rowData || this.state.rowData.length === 0 ? this.grid.current.api.showNoRowsOverlay() : undefined
            )
        }
        if (this.props.aggregatedRows && this.props.aggregatedRows.length > 0 && this.props.highlightClassFunction){
            this.gridOptions.getRowClass = this.props.highlightClassFunction
        }
    }

    private changeHighlight() {
        const {gridOptions} = this.state;
        this.setState({highlights: this.props.highlights});
        const newCellStyle = (params: any) => {
            const columnDef = this.props.leafColumnDefs.find((c:any) => c.get('field') === params.colDef.field);
            const textAlign = columnDef && columnDef.get('textAlign')
                ? columnDef.get('textAlign')
                : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type)
                    ? "right"
                    : undefined;
            let returnObject = {
                textAlign: textAlign,
                justifyContent: textAlign === "right" ? "flex-end" : textAlign === "left" ? "flex-start" : textAlign
            };
            let highlights: IServerQueryParam[] = (this.props.highlights as IServerQueryParam[]).filter(value => value.enable && value.datasetColumn);
            if (highlights.length !== 0) {
                const cellHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Cell' || h['highlightType'] === null);
                const temp: any = cellHighlights.find((h: any) => { // eslint-disable-line

                    const type = h['type'];
                    const columnName = h['datasetColumn'];
                    const operation = h['operation'];
                    const value = h['value'];
                    const backgroundColor = h['backgroundColor'];
                    const color = h['color'];

                    let columnValue;
                    let filterValue;
                    if (h['datasetColumn'] === params.colDef.field) {


                        if (type === appTypes.Integer || type === appTypes.Decimal) {
                            columnValue = Number(params.value);
                            filterValue = Number(value)
                        } else if (type === appTypes.Date || type === appTypes.Timestamp) {
                            columnValue = new Date(params.value);
                            filterValue = new Date(value)
                        } else if (type === appTypes.String || type === appTypes.Boolean) {
                            columnValue = params.value;
                            filterValue = value
                        }

                        if (operation === 'EqualTo') {
                            if (columnValue === filterValue) {
                                return {...returnObject, background: backgroundColor, color: color}
                            }
                        } else if (operation === 'NotEqual') {
                            if (columnValue !== filterValue) {
                                return {...returnObject, backgroundColor, color: color}
                            }
                        } else if (operation === 'LessThan') {
                            if (columnValue < filterValue) {
                                return {...returnObject, backgroundColor, color: color}
                            }
                        } else if (operation === 'LessThenOrEqualTo') {
                            if (columnValue <= filterValue) {
                                return {...returnObject, background: backgroundColor, color: color}
                            }
                        } else if (operation === 'GreaterThan') {
                            if (columnValue > filterValue) {
                                return {...returnObject, background: backgroundColor, color: color}
                            }
                        } else if (operation === 'GreaterThanOrEqualTo') {
                            if (columnValue >= filterValue) {
                                return {...returnObject, background: backgroundColor, color: color}
                            }
                        } else if (params.data[columnName] !== null) {
                            if (operation === 'IsNotEmpty') {
                                return {...returnObject, background: backgroundColor, color: color}
                            } else if (operation === 'IncludeIn') {
                                if (params.data[columnName].includes(value)) {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            } else if (operation === 'NotIncludeIn') {
                                if (!params.data[columnName].includes(value)) {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            } else if (operation === 'StartWith') {
                                if (params.data[columnName].split(value)[0] === "") {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            } else if (operation === 'NotStartWith') {
                                if (params.data[columnName].split(value)[0] !== "") {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            } else if (operation === 'EndOn') {
                                if (params.data[columnName].split(value)[1] === "") {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            } else if (operation === 'NotEndOn') {
                                if (params.data[columnName].split(value)[1] !== "") {
                                    return {...returnObject, background: backgroundColor, color: color}
                                }
                            }
                        } else if (params.data[columnName] === null) {
                            if (operation === 'IsEmpty' ||
                                operation === 'NotIncludeIn' ||
                                operation === 'NotEndOn' ||
                                operation === 'NotStartWith') {
                                return {...returnObject, background: backgroundColor, color: color}
                            }
                        }
                    }
                });
                if (temp !== undefined) {
                    return {...returnObject, background: temp['backgroundColor'], color: temp['color']}
                }
                else {
                    const columnHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Column');
                    const temp: any = columnHighlights.find((h: any) => { // eslint-disable-line
                        const columnName = h['datasetColumn'];
                        const backgroundColor = h['backgroundColor'];
                        const color = h['color'];
                        if (params.data[columnName] === params.value) {
                            return {...returnObject, background: backgroundColor, color: color}
                        }
                    });
                    if (temp !== undefined) {
                        return {...returnObject, background: temp['backgroundColor'], color: temp['color']}
                    }
                }
            }
            return returnObject
        };
        const rowStyle = (params: any) => {
            let highlights: IServerQueryParam[] = (this.props.highlights as IServerQueryParam[]).filter(value => value.enable && value.datasetColumn);
            if (highlights.length !== 0) {
                const rowHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Row');
                const temp: any = rowHighlights.find((h: any) => { // eslint-disable-line

                    const type = h['type'];
                    const columnName = h['datasetColumn'];
                    const operation = h['operation'];
                    const value = h['value'];
                    const backgroundColor = h['backgroundColor'];
                    const color = h['color'];

                    let columnValue;
                    let filterValue;
                    if (type === appTypes.Integer || type === appTypes.Decimal) {
                        columnValue = Number(params.data[columnName]);
                        filterValue = Number(value)
                    }
                    else if (type === appTypes.Date || type === appTypes.Timestamp) {
                        columnValue = new Date(params.data[columnName]);
                        filterValue = new Date(value)
                    }
                    else if (type === appTypes.String || type === appTypes.Boolean) {
                        columnValue = params.data[columnName];
                        filterValue = value
                    }

                    if (operation === 'EqualTo') {
                        if (columnValue === filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (operation === 'NotEqual') {
                        if (columnValue !== filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (operation === 'LessThan') {
                        if (columnValue < filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (operation === 'LessThenOrEqualTo') {
                        if (columnValue <= filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (operation === 'GreaterThan') {
                        if (columnValue > filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (operation === 'GreaterThanOrEqualTo') {
                        if (columnValue >= filterValue) {
                            return {background: backgroundColor, color: color}
                        }
                    } else if (params.data[columnName] !== null) {
                        if (operation === 'IsNotEmpty') {
                            return {background: backgroundColor, color: color}
                        } else if (operation === 'IncludeIn') {
                            if (params.data[columnName].includes(value)) {
                                return {background: backgroundColor, color: color}
                            }
                        } else if (operation === 'NotIncludeIn') {
                            if (!params.data[columnName].includes(value)) {
                                return {background: backgroundColor, color: color}
                            }
                        } else if (operation === 'StartWith') {
                            if (params.data[columnName].split(value)[0] === "") {
                                return {background: backgroundColor, color: color}
                            }
                        } else if (operation === 'NotStartWith') {
                            if (params.data[columnName].split(value)[0] !== "") {
                                return {background: backgroundColor, color: color}
                            }
                        } else if (operation === 'EndOn') {
                            if (params.data[columnName].split(value)[1] === "") {
                                return {background: backgroundColor, color: color}
                            }
                        } else if (operation === 'NotEndOn') {
                            if (params.data[columnName].split(value)[1] !== "") {
                                return {background: backgroundColor, color: color}
                            }
                        }
                    }
                    else if (params.data[columnName] === null) {
                        if (operation === 'IsEmpty' ||
                            operation === 'NotIncludeIn' ||
                            operation === 'NotEndOn' ||
                            operation === 'NotStartWith') {
                            return {background: backgroundColor, color: color}
                        }
                    }
                });
                return temp !== undefined ? {background: temp['backgroundColor'], color: temp['color']} : undefined
            } else {
                return {background: undefined, color: undefined}
            }
        };

        if (this.grid.current === null) {
            gridOptions.getRowStyle = rowStyle;
            this.setState({cellStyle: newCellStyle})
        } else {
            this.gridOptions.getRowStyle = rowStyle;
            this.setState({cellStyle: newCellStyle});
            this.grid.current.api.redrawRows()
        }
    }

    getGridComponent = (component: Ecore.EObject|string) => {
        if (typeof component === "string") {
            return component
        } else if (component && getStringValuesFromEnum(AntdFactoryClasses).includes(component.eClass.eURI()) && component.get('grantType') !== grantType.denied) {
            return 'antdFactory'
        }
        return "";
    };

    getBuffer = () => {
        return this.buffer
    };


    resetBuffer = () => {
        this.grid.current.api.applyTransaction({ remove: this.buffer
                .filter(el => el.operationMark__ === dmlOperation.insert ) });
        this.disableSelection();
        this.grid.current.api.setQuickFilter(undefined);
        this.buffer = [];
    };

    stopEditing = () => {
        this.grid.current.api.stopEditing();
    };

    whichEdited = () => {
        return this.grid.current.api.getEditingCells()
    };

    onEdit = () => {
        if (this.props.isEditMode) {
            this.gridOptions.getRowClass = (params: any): string => {
                if (this.buffer.includes(params.data) && params.data.operationMark__ === dmlOperation.delete)
                    return 'line-through';
                if (this.buffer.includes(params.data) && params.data.operationMark__ === dmlOperation.insert)
                    return 'grid-insert-highlight';
                if (this.buffer.includes(params.data) && params.data.operationMark__ === dmlOperation.update)
                    return 'grid-update-highlight';
                return ""
            };
            let newColumnDefs:any[] = [];
            newColumnDefs.push({
                field: this.props.t('data menu'),
                headerName: this.props.t('data menu'),
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: this.props.isEditMode,
                cellRenderer: 'menu',
                cellStyle: this.state ? this.state.cellStyle : undefined,
                cellRendererParams: {
                    t: this.props.t,
                    onDelete: this.onDelete,
                    editGrid: this,
                    showMenuCopyButton: this.props.showMenuCopyButton,
                }
            });
            newColumnDefs = newColumnDefs.concat(this.state.columnDefs.map((c:any)=>c));
            if (this.props.showEditDeleteButton) {
                newColumnDefs.push({
                    field: this.props.t('delete row'),
                    headerName: this.props.t('delete row'),
                    cellRenderer: 'deleteButton',
                    cellStyle: {
                        textAlign: 'center',
                        marginTop: 'auto',
                        marginBottom: 'auto'
                    },
                    cellRendererParams: {
                        t: this.props.t,
                        onDelete: this.onDelete,
                        editGrid: this,
                        showMenuCopyButton: this.props.showMenuCopyButton,
                    }
                });
            }
            this.setState({columnDefs : newColumnDefs},()=>{
                this.grid.current.columnApi.moveColumn(this.props.t('data menu'),0);
                this.grid.current.api.redrawRows();
            });
        } else {
            let newColumnDefs = this.state.columnDefs.filter((c:any) => c.field !== this.props.t('data menu') && c.field !== this.props.t('delete row'));
            this.gridOptions.getRowClass = undefined;
            this.grid.current.api.setQuickFilter(undefined);
            this.disableSelection();
            this.setState({columnDefs : newColumnDefs},()=>{
                this.grid.current.api.redrawRows();
            })
        }
    };

    removeRowsFromGrid = () => {
        this.grid.current.api.applyTransaction({ remove: this.buffer
                .filter((el:any) => el.operationMark__ === dmlOperation.delete ) });
    };

    onQuickFilterChanged = () => {
        //@ts-ignore
        this.grid.current.api.setQuickFilter(document.getElementById('quickFilter')!.value);
    };

    onDeleteSelected = () => {
        const selected = this.grid.current.api.getSelectedNodes().map((sn:any) => sn.data);
        this.onDelete(selected)
    };

    disableSelection = () => {
        this.grid.current.api.getSelectedNodes().forEach((n:any) => {
            n.setSelected(false)
        })
    };

    isDataSelected = () => {
        return this.grid.current && this.grid.current.api && !!this.grid.current.api.getSelectedNodes().length
    };

    markDeleted = (data: {[key: string]: unknown}) => {
        //Если до этого была обновлена
        if (this.buffer.includes(data) && data.operationMark__ === dmlOperation.delete && data.prevOperationMark__ === dmlOperation.update) {
            this.buffer.forEach((el:any)=>{
                if (Object.is(el, data)) {
                    data.operationMark__ = dmlOperation.update;
                    data.prevOperationMark__ = undefined;
                }
            })
            //Если отмечена как удалённая
        } else if (this.buffer.includes(data) && data.operationMark__ === dmlOperation.delete) {
            this.buffer = this.buffer.filter(el => !Object.is(el, data));
            data.operationMark__ = undefined;
            //Если новая вставленная запись удаляем
        } else if (data.operationMark__ === dmlOperation.insert) {
            this.buffer = this.buffer.filter(el => !Object.is(el, data));
            this.grid.current.api.applyTransaction({remove: [data]})
            //Если это существующая запись которая была обновлена и её нет в буфере
        } else if (data.operationMark__ === dmlOperation.update) {
            data.operationMark__ = dmlOperation.delete;
            data.prevOperationMark__ = dmlOperation.update;
            //Если это существующая запись но не отмечена как удалённая
        } else {
            data.operationMark__ = dmlOperation.delete;
            this.buffer.push(data)
        }
    };

    onDelete = (data:{[key: string]: unknown}|{[key: string]: unknown}[]) => {
        if (Array.isArray(data)) {
            data.forEach(d => {
                this.markDeleted(d)
            });
        } else {
            this.markDeleted(data)
        }
        this.grid.current.api.redrawRows(this.grid.current.api.getRowNode(this.buffer));
    };

    onInsert = (data:{[key: string]: unknown}[] = [], position = 0) => {
        this.buffer = this.buffer.map(el => el).concat(
            this.grid.current.api
                .applyTransaction({ addIndex: position, add: data.length > 0 ? data : [{operationMark__:dmlOperation.insert}] })
                .add
                .map((a:any)=>{
                    return a.data
                }));
        this.grid.current.api.redrawRows(this.grid.current.api.getRowNode(this.buffer));
    };

    onUpdate = (params:CellChangedEvent) => {
        if (params.oldValue !== params.newValue
            //Частный случай когда ячейка не заполнена
            && !(params.newValue === undefined && params.oldValue === null)) {
            if (params.node.data.operationMark__ !== dmlOperation.insert) {
                //Если ниразу не записывали в историю
                if (params.node.data[`${params.column.getColDef().field}__`] === undefined)
                    params.node.data[`${params.column.getColDef().field}__`] = params.oldValue ? params.oldValue : null;
                params.node.data.operationMark__ = dmlOperation.update;
                if (!this.buffer.find(el=> Object.is(el, params.node.data)))
                    this.buffer.push(params.node.data)
            }
            this.grid.current.api.redrawRows(this.grid.current.api.getRowNode(this.buffer));
        }
    };

    copy = (data: {[key: string]: unknown}[], position: number = 0) => {
        this.onInsert(data, position);
    };

    copySelected = () => {
        if (this.isDataSelected()) {
            let position = 0;
            const selected = this.grid.current.api.getSelectedNodes().map((sn:any) => {
                position = sn.childIndex + 1;
                return {
                    ...sn.data,
                    operationMark__ : dmlOperation.insert
                }
            });
            this.copy(selected, position);
        }
    };

    undoChanges = (data: {[key: string]: unknown}) => {
        if (data.operationMark__ === dmlOperation.insert) {
            this.onDelete(data)
        } else if (data.operationMark__ === dmlOperation.delete) {
            this.onDelete(data)
        } else if (data.operationMark__ === dmlOperation.update) {
            for (const [old_key, old_value] of Object.entries(data)) {
                for (const [new_key] of Object.entries(data)) {
                    if (old_key === `${new_key}__` && old_key !== new_key && old_key !== "operationMark__")
                        data[new_key] = old_value
                }
            }
            data.operationMark__ = undefined;
            this.buffer = this.buffer.filter(d => !Object.is(d,data));
            this.grid.current.api.redrawRows(this.grid.current.api.getRowNode(data))
        }
    };

    redraw = () => {
        this.grid.current.api.redrawRows()
    };

    handleResize = (event: DisplayedColumnsChangedEvent|ColumnResizedEvent|undefined) => {

        const headerCells = document.querySelectorAll(`#datasetGrid${this.props.viewObject ? this.props.viewObject.eURI().split('#')[0] : ""} .ag-header-cell-text`);
        let minHeight = minHeaderHeight;
        headerCells.forEach(cell => {
            minHeight = Math.max(minHeight, cell.scrollHeight);
        });
        this.gridOptions.api?.setHeaderHeight(minHeight)
    };

    colDefsToObject = (colDefs: Map<String,any>[], newColDef: {}[] = []) => {
        for (const colDef of colDefs) {
            if (colDef.get('children')) {
                newColDef.push({
                    headerName: colDef.get('headerName'),
                    children: this.colDefsToObject(colDef.get('children')),
                    hide: colDef.get('hide') || false
                })
            } else {
                newColDef.push({
                    onCellValueChanged: this.onUpdate,
                    onCellClicked: colDef.get('onCellDoubleClicked'),
                    width: colDef.get('width'),
                    type: colDef.get('type'),
                    field: colDef.get('field'),
                    headerName:  colDef.get('headerName').toString().substring(0, 1).toUpperCase() + colDef.get('headerName').toString().substring(1),
                    headerTooltip: colDef.get('headerTooltip'),
                    hide: colDef.get('hide') || false,
                    editable: colDef.get('editable') || false,
                    pinned: colDef.get('pinned') === 'Left' ? 'left' : colDef.get('pinned') === 'Right' ? 'right' : false,
                    resizable: colDef.get('resizable') || false,
                    cellStyle: this.state ? this.state.cellStyle : undefined,
                    cellRendererParams: (colDef.get('component')) ? {
                        ...this.props,
                        viewObject: colDef.get('component'),
                        componentRenderCondition: colDef.get('componentRenderCondition'),
                        onDelete: this.onDelete,
                        editGrid: this,
                        showMenuCopyButton: this.props.showMenuCopyButton,
                        isAgComponent: true
                    } : undefined,
                    cellRenderer: (colDef.get('component')) ? this.getGridComponent(colDef.get('component')) : function (params: any) {
                        return params.valueFormatted? params.valueFormatted : params.value;
                    },
                    cellEditor: (colDef.get('editComponent'))
                        ? this.getGridComponent(colDef.get('editComponent'))
                        : [appTypes.Date,appTypes.Timestamp].includes(colDef.get('type'))
                            ? 'DateEditor'
                            : undefined,
                    cellEditorParams: (colDef.get('editComponent'))
                        ? {
                            ...this.props,
                            viewObject: colDef.get('editComponent'),
                            isAgComponent: true,
                            isAgEdit: true,
                            colData: colDef.get('field')
                        }
                        : [appTypes.Date,appTypes.Timestamp].includes(colDef.get('type'))
                            ? {mask: colDef.get('mask'), type: colDef.get('type')}
                            : undefined,
                    valueFormatter: colDef.get('valueFormatter'),
                    tooltipField: colDef.get('tooltipField'),
                });
            }
        }
        return newColDef;
    };

    render() {
        const {gridOptions} = this.state;
        return (
            <div id="datasetGrid"
                 hidden={this.props.hidden}
                 style={{
                     boxSizing: 'border-box',
                     // height: '100%',
                     backgroundColor: backgroundColor}}
                 className={'ag-theme-material'}
            >
                <div id={`datasetGrid${this.props.viewObject ? this.props.viewObject.eURI().split('#')[0] : ""}`}
                    className={this.props.className}
                    style={{
                        height: this.props.height ? this.props.height : 460 ,
                        width: this.props.width ? this.props.width : "99,5%",
                        minWidth: "375px"}}>
                    {this.state.columnDefs !== undefined && this.state.columnDefs.length !== 0 &&
                    <ConfigProvider locale={this.state.locale}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            columnTypes={agGridColumnTypes}
                            ref={this.grid}
                            rowData={this.state.rowData}
                            editType={'fullRow'}
                            modules={AllCommunityModules}
                            rowSelection='multiple' //выделение строки
                            onGridReady={this.onGridReady} //инициализация грида
                            //Выполняет глубокую проверку значений старых и новых данных и подгружает обновленные
                            //rowDataChangeDetectionStrategy={'DeepValueCheck' as ChangeDetectionStrategyType}
                            suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                            allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                            headerHeight={48} //высота header в px (25 по умолчанию)
                            rowHeight={40} //высота row в px
                            suppressRowClickSelection //строки не выделяются при нажатии на них
                            pagination={true}
                            suppressPaginationPanel={true}
                            /*domLayout='autoHeight'*/
                            paginationPageSize={this.state.paginationPageSize}
                            onPaginationChanged={this.onPaginationChanged.bind(this)}
                            suppressClickEdit={true}
                            gridOptions={this.gridOptions}
                            /*stopEditingWhenGridLosesFocus={true}*/
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            tooltipShowDelay = {1000}
                            {...gridOptions}
                        />
                    </ConfigProvider>
                    }
                    {!this.props.hidePagination && <div id="datasetPaginator"
                         style={{float: "right", opacity: this.state.isGridReady ? 1 : 0, width: "100%", minWidth: "375px", backgroundColor: "#E6E6E6"}}>
                        <Paginator
                            {...this.props}
                            currentPage = {this.state.paginationCurrentPage}
                            totalNumberOfPage = {this.state.paginationTotalPage}
                            paginationPageSize = {this.state.paginationPageSize}
                            totalNumberOfRows = {this.state.rowData.filter((r:{[key: string]: unknown})=>!(r.isVisible__ === false)).length}
                            onPageChange={(page)=>this.grid.current.api.paginationGoToPage(page - 1)}
                            onPageSizeChange = {(size)=>{this.grid.current.api.paginationSetPageSize(size)}}
                            grid = {this.grid}
                        />
                    </div>}
                </div>
            </div>
        )
    }
}
export default withTranslation('common', { withRef: true })(DatasetGrid)