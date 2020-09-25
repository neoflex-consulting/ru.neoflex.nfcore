import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import {ConfigProvider} from 'antd';
import {withTranslation} from 'react-i18next';
import Ecore from 'ecore';
import {docxElementExportType, docxExportObject} from "../../../utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "../../../utils/excelExportUtils";
import _ from 'lodash';
import {IServerQueryParam} from "../../../MainContext";
import {Button_, Checkbox_, Href_, Select_} from '../../../AntdFactory';
import Paginator from "../Paginator";
import {agGridColumnTypes, appTypes, dmlOperation} from "../../../utils/consts";
import DateEditor from "./gridComponents/DateEditor";
import {switchAntdLocale} from "../../../utils/antdLocalization";
import GridMenu from "./gridComponents/Menu";
import DeleteButton from "./gridComponents/DeleteButton";
//CSS
import '../../../styles/DatasetGrid.css';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import './../../../styles/GridEdit.css';
import {ColumnResizedEvent, GridOptions, GridReadyEvent, ValueGetterParams} from "ag-grid-community";
import {CellChangedEvent} from "ag-grid-community/dist/lib/entities/rowNode";
import Expand from "./gridComponents/Expand";

const minHeaderHeight = 48;
const backgroundColor = "#fdfdfd";

interface Props {
    hide?: boolean,
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    highlights?: {[key: string]: unknown}[];
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    activeReportDateField: boolean,
    currentDatasetComponent?: Ecore.Resource,
    rowData: {[key: string]: unknown}[],
    columnDefs: Map<String,any>[],
    paginationCurrentPage?: number,
    paginationTotalPage?: number,
    paginationPageSize?: number,
    showUniqRow?: boolean,
    saveChanges?: (newParam: any, paramName: string) => void;
    numberOfNewLines: boolean,
    onApplyEditChanges?: (buffer: any[]) => void;
    isEditMode?: boolean;
    showEditDeleteButton?: boolean;
    showMenuCopyButton?: boolean;
    aggregatedRows?: {[key: string]: unknown}[];
    height?: number;
    width?: number;
    highlightClassFunction?: ()=>{};
}

function isFirstColumn (params:ValueGetterParams) {
    let displayedColumns = params.columnApi!.getAllDisplayedColumns();
    return displayedColumns[0].getColId() === params.column.getColId();
}

class DatasetGrid extends React.Component<Props & any, any> {

    private grid: React.RefObject<any>;
    private gridOptions: GridOptions;
    private buffer: {[key: string]: unknown}[];

    constructor(props: any) {
        super(props);

        this.state = {
            hidden: false,
            themes: [],
            operations: [],
            showUniqRow: this.props.showUniqRow,
            numberOfNewLines: this.props.numberOfNewLines,
            paginationPageSize: 10,
            isGridReady: false,
            columnDefs: this.props.columnDefs,
            rowData: this.props.rowData,
            highlights: [],
            locale: switchAntdLocale(this.props.i18n, this.props.t),
            gridOptions: {
                frameworkComponents: {
                    selectComponent: Select_,
                    buttonComponent: Button_,
                    hrefComponent: Href_,
                    checkboxComponent: Checkbox_,
                    DateEditor: DateEditor,
                    deleteButton: DeleteButton,
                    menu: GridMenu,
                    expand: Expand,
                },
                defaultColDef: {
                    resizable: true,
                    sortable: true,
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
            this.gridOptions.onColumnResized = this.handleResize
        }
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

    private getDocxData() : docxExportObject {
        let header = [];
        for (const elem of this.state.columnDefs) {
            header.push(elem.get("headerName"))
        }
        let tableData = [];
        tableData.push(header);
        for (const elem of this.state.rowData) {
            let dataRow = [];
            for (const prop in elem) {
                dataRow.push(elem[prop])
            }
            tableData.push(dataRow)
        }
        return  {
            hidden: this.props.hidden,
            docxComponentType : docxElementExportType.grid,
            gridData:(tableData.length === 0) ? [[]] : tableData
        };
    }

    private getExcelData() : excelExportObject {
        let header = [];
        for (const elem of this.state.columnDefs) {
            header.push({name: elem.get("headerName"), filterButton: true})
        }
        let tableData = [];
        for (const elem of this.state.rowData) {
            let dataRow = [];
            for (const prop in elem) {
                dataRow.push(elem[prop])
            }
            tableData.push(dataRow)
        }
        return  {
            hidden: this.props.hidden,
            excelComponentType : excelElementExportType.grid,
            gridData: {
                tableName: this.props.viewObject.get('name'),
                columns: header,
                rows: (tableData.length === 0) ? [[]] : tableData
            }
        };
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
        if (!_.isEqual(this.state.columnDefs, this.props.columnDefs)
            && !this.props.isEditMode) {
            this.setState({columnDefs: this.props.columnDefs}, ()=>{
                this.handleResize(undefined)
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
            const columnDef = this.state.columnDefs.find((c:any) => c.get('field') === params.colDef.field);
            const textAlign = columnDef && columnDef.get('textAlign')
                ? columnDef.get('textAlign')
                : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type)
                    ? "right"
                    : undefined;
            let returnObject = {
                textAlign: textAlign,
                justifyContent: textAlign == "right" ? "flex-end" : textAlign == "left" ? "flex-start" : textAlign
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

    getComponent = (className: string) => {
        if (className === "//Href") {
            return 'hrefComponent'
        } else if (className === "//Button") {
            return 'buttonComponent'
        } else if (className === "//Select") {
            return 'selectComponent'
        } else if (className === "//Checkbox") {
            return 'checkboxComponent'
        } else {
            return className
        }
    };

    getBuffer = () => {
        return this.buffer
    };

    /*getGridOptions = () => {
        return this.gridOptions
    };*/

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
            let rowData;
            let newColumnDefs:any[] = [];
            rowData = new Map();
            rowData.set('field', this.props.t('data menu'));
            rowData.set('headerName', this.props.t('data menu'));
            rowData.set('headerTooltip', 'type : String');
            rowData.set('component','menu');
            newColumnDefs.push(rowData);
            newColumnDefs = newColumnDefs.concat(this.state.columnDefs);
            if (this.props.showEditDeleteButton) {
                rowData = new Map();
                rowData.set('field', this.props.t('delete row'));
                rowData.set('headerName', this.props.t('delete row'));
                rowData.set('headerTooltip', 'type : String');
                rowData.set('component','deleteButton');
                rowData.set('textAlign','center');
                newColumnDefs.push(rowData);
            }
            this.setState({columnDefs : newColumnDefs},()=>{
                this.grid.current.api.redrawRows();
            });
        } else {
            let newColumnDefs = this.state.columnDefs.filter((c:any) => c.get('field') !== this.props.t('data menu') && c.get('field') !== this.props.t('delete row'));
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
        let position = 0;
        const selected = this.grid.current.api.getSelectedNodes().map((sn:any) => {
            position = sn.childIndex + 1;
            return {
                ...sn.data,
                operationMark__ : dmlOperation.insert
            }
        });
        this.copy(selected, position);
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

    handleResize = (event: ColumnResizedEvent|undefined) => {
        const headerCells = document.querySelectorAll(`#${this.props.viewObject.get('name')} .ag-header-cell-text`);
        let minHeight = minHeaderHeight;
        headerCells.forEach(cell => {
            minHeight = Math.max(minHeight, cell.scrollHeight);
        });
        this.gridOptions.api?.setHeaderHeight(minHeight)
    };

    render() {
        const {gridOptions} = this.state;
        return (
            <div id="datasetGrid"
                 hidden={this.props.hide}
                 style={{boxSizing: 'border-box', height: '100%', backgroundColor: backgroundColor}}
                 className={'ag-theme-material'}
            >
                <div id={this.props.viewObject.get('name')}
                    style={{
                    height: this.props.height ? this.props.height : 750,
                    width: this.props.width ? this.props.width : "99,5%",
                    minWidth: this.props.minWidth ? this.props.minWidth : "unset"}}>
                    {this.state.columnDefs !== undefined && this.state.columnDefs.length !== 0 &&
                    <ConfigProvider locale={this.state.locale}>
                        <AgGridReact
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
                            suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                            allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                            /*headerHeight={48} //высота header в px (25 по умолчанию)
                            rowHeight={40} //высота row в px*/
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
                        >
                            {this.state.columnDefs.map((col: any) =>
                                <AgGridColumn
                                    onCellValueChanged={this.props.isEditMode ? this.onUpdate : undefined}
                                    onCellClicked={this.props.isEditMode ? col.get('onCellDoubleClicked') : undefined}
                                    /*width={col.get('width')}*/
                                    type={col.get('type')}
                                    key={col.get('field')}
                                    field={col.get('field')}
                                    headerName={col.get('headerName').toString().substring(0, 1).toUpperCase() + col.get('headerName').toString().substring(1)}
                                    headerTooltip={col.get('headerName').toString().substring(0, 1).toUpperCase() + col.get('headerName').toString().substring(1)}
                                    hide={col.get('hide') || false}
                                    editable={col.get('editable') || false}
                                    pinned={col.get('pinned') === 'Left' ? 'left' : col.get('pinned') === 'Right' ? 'right' : false}
                                    // filter={col.get('filter') === 'NumberColumnFilter'
                                    //     ? 'agNumberColumnFilter' : col.get('filter') === 'DateColumnFilter' ?
                                    //         'agDateColumnFilter' : 'agTextColumnFilter'}
                                    checkboxSelection={this.props.isEditMode ? isFirstColumn : false}
                                    headerCheckboxSelection={this.props.isEditMode ? isFirstColumn : false}
                                    headerCheckboxSelectionFilteredOnly={this.props.isEditMode}
                                    resizable={col.get('resizable') || false}
                                    sortable={col.get('sortable') || false}
                                    suppressMenu={col.get('suppressMenu') || false}
                                    cellStyle = {this.state.cellStyle}
                                    cellRendererParams = {(col.get('component')) ? {
                                        ...this.props,
                                        viewObject: col.get('component'),
                                        componentRenderCondition: col.get('componentRenderCondition'),
                                        onDelete: this.onDelete,
                                        editGrid: this,
                                        showMenuCopyButton: this.props.showMenuCopyButton,
                                        isAgComponent: true
                                    } : undefined}
                                    cellRenderer = {
                                        (col.get('component')) ? this.getComponent(col.get('component').eClass ? col.get('component').eClass._id : col.get('component')) : function (params: any) {
                                            return params.valueFormatted? params.valueFormatted : params.value;
                                        }
                                    }
                                    cellEditor = {(col.get('editComponent')) ? this.getComponent(col.get('editComponent').eClass ? col.get('editComponent').eClass._id : col.get('editComponent')) : [appTypes.Date,appTypes.Timestamp].includes(col.get('type')) ? 'DateEditor' : undefined }
                                    cellEditorParams = {(col.get('editComponent'))
                                        ? {
                                        ...this.props,
                                        viewObject: col.get('editComponent'),
                                        isAgComponent: true,
                                        isAgEdit: true,
                                        colData: col.get('field')
                                        }
                                        : [appTypes.Date,appTypes.Timestamp].includes(col.get('type'))
                                            ? {mask: col.get('mask'), type: col.get('type')}
                                            : undefined}
                                    valueFormatter = {col.get('valueFormatter')}
                                    tooltipField = {col.get('tooltipField')}
                                />
                            )}
                        </AgGridReact>
                    </ConfigProvider>
                    }
                    <div id="datasetPaginator"
                         style={{float: "right", opacity: this.state.isGridReady ? 1 : 0, width: "100%", backgroundColor: "#E6E6E6"}}>
                        <Paginator
                            {...this.props}
                            currentPage = {this.state.paginationCurrentPage}
                            totalNumberOfPage = {this.state.paginationTotalPage}
                            paginationPageSize = {this.state.paginationPageSize}
                            grid = {this.grid}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
export default withTranslation('common', { withRef: true })(DatasetGrid)
