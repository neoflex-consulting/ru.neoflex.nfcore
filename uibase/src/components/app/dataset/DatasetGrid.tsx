import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import {ConfigProvider, Modal} from 'antd';
import {withTranslation} from 'react-i18next';
import Ecore from 'ecore';
import SaveDatasetComponent from "./SaveDatasetComponent";
import {docxElementExportType, docxExportObject} from "../../../utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "../../../utils/excelExportUtils";
import _ from 'lodash';
import {IServerQueryParam} from "../../../MainContext";
import {Button_, Href_} from '../../../AntdFactory';
import Paginator from "../Paginator";
import {agGridColumnTypes, appTypes, dmlOperation} from "../../../utils/consts";
import DateEditor from "./gridComponents/DateEditor";
import {switchAntdLocale} from "../../../utils/antdLocalization";
import GridMenu from "./gridComponents/Menu";
import DeleteButton from "./gridComponents/DeleteButton";
//CSS
import './../../../styles/RichGrid.css';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';

const backgroundColor = "#fdfdfd";

interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    activeReportDateField: boolean,
    currentDatasetComponent: Ecore.Resource,
    isAggregatesHighlighted: boolean,
    rowData: any[],
    columnDefs: any[],
    paginationCurrentPage: number,
    paginationTotalPage: number,
    paginationPageSize: number,
    isGridReady: boolean,
    showUniqRow: boolean,
    isHighlightsUpdated: boolean,
    isAggregations: boolean;
    saveChanges?: (newParam: any, paramName: string) => void;
    serverAggregates: any[],
    numberOfNewLines: boolean,
    onApplyEditChanges: (buffer: any[]) => void;
}

function isFirstColumn (params:any) {
    let displayedColumns = params.columnApi.getAllDisplayedColumns();
    return displayedColumns[0].colId === params.column.colId;
}

class DatasetGrid extends React.Component<Props & any, any> {

    private grid: React.RefObject<any>;
    private buffer: any[];
    
    constructor(props: any) {
        super(props);

        this.state = {
            themes: [],
            operations: [],
            showUniqRow: this.props.showUniqRow,
            numberOfNewLines: this.props.numberOfNewLines,
            paginationPageSize: 10,
            isGridReady: false,
            isAggregations: true,
            columnDefs: [],
            rowData: [],
            highlights: [],
            saveMenuVisible: false,
            locale: switchAntdLocale(this.props.i18n, this.props.t),
            gridOptions: {
                frameworkComponents: {
                    buttonComponent: Button_,
                    hrefComponent: Href_,
                    DateEditor: DateEditor,
                    deleteButton: DeleteButton,
                    menu: GridMenu,
                },
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                }
            },
            cellStyle: {}
        };
        this.grid = React.createRef();
        this.buffer = [];
    }

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
            this.highlightAggregate();
        }
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
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (!_.isEqual(this.state.highlights, this.props.highlights)
            && this.props.isHighlightsUpdated) {
            this.changeHighlight();
        }
        if (JSON.stringify(this.state.rowData) !== JSON.stringify(this.props.rowData)) {
            this.setState({rowData: this.props.rowData})
        }
        if (!_.isEqual(this.state.columnDefs, this.props.columnDefs)
            && !this.props.isEditMode) {
            this.setState({columnDefs: this.props.columnDefs})
        }
        if (prevProps.t !== this.props.t) {
            this.setState({locale:switchAntdLocale(this.props.i18n.language, this.props.t)})
        }
        if(this.state.isAggregatesHighlighted){
            this.highlightAggregate();
        }
    }

    private highlightAggregateAfterChangingPage() {
        let datasetOperations = [];
        for (let g = 0; g < this.props.serverAggregates.length; g++) {
            if (this.props.serverAggregates[g].enable === true) {
                let isInArray = false;
                if (datasetOperations.length == 0) {
                    datasetOperations.push(this.props.serverAggregates[g].operation)
                } else {
                    for (let i = 0; i < datasetOperations.length; i++) {
                        if (datasetOperations[i] == this.props.serverAggregates[g].operation) {
                            isInArray = true
                        }
                    }
                    if (!isInArray && this.props.serverAggregates[g].datasetColumn !== undefined) {
                        datasetOperations.push(this.props.serverAggregates[g].operation)
                    }

                }
            }
        }
        if (this.state.rowData.length !== datasetOperations.length)   {
            this.highlightAggregate();
        }
    }

    private highlightAggregate() {
        let datasetOperations = [];
        for (let g = 0; g < this.props.serverAggregates.length; g++){
            if (this.props.serverAggregates[g].enable === true) {
                let isInArray = false;
                if (datasetOperations.length == 0) {
                    datasetOperations.push(this.props.serverAggregates[g].operation)
                } else {
                    for (let i = 0; i < datasetOperations.length; i++) {
                        if (datasetOperations[i] == this.props.serverAggregates[g].operation) {
                            isInArray = true
                        }
                    }
                    if (!isInArray && this.props.serverAggregates[g].datasetColumn !== undefined) {
                        datasetOperations.push(this.props.serverAggregates[g].operation)
                    }

                }
            }
        }
        if (this.state.rowData.length !== datasetOperations.length) {
            let numberOfLinesInAggregations = datasetOperations.length;
            if (this.grid.current && !this.props.isEditMode) {
                if (this.props.isAggregatesHighlighted && this.state.rowData.length > 0) {
                    let lastLines = this.props.rowData.length - numberOfLinesInAggregations - 1;
                    this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = function (params: any) {
                        if (lastLines < params.node.childIndex) {
                            return 'aggregate-highlight';
                        }
                    }
                } else if (this.props.isEditMode) {
                    this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = null;
                }
                this.grid.current.api.refreshCells();
            }
        }
    }

    private changeHighlight() {
        const {gridOptions} = this.state;
        this.setState({highlights: this.props.highlights});
        this.props.saveChanges(false, "isHighlightsUpdated");
        const newCellStyle = (params: any) => {
            const columnDef = this.props.columnDefs.find((c:any) => c.get('field') === params.colDef.field);
            let returnObject = {
                textAlign: columnDef && columnDef.get('textAlign')
                    ? columnDef.get('textAlign')
                    : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type)
                        ? "right"
                        : undefined,
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
            this.grid.current.api.gridOptionsWrapper.gridOptions.getRowStyle = rowStyle;
            this.setState({cellStyle: newCellStyle});
            this.grid.current.api.redrawRows()
        }
    }

    handleSaveMenu = () => {
        this.state.saveMenuVisible ? this.setState({ saveMenuVisible: false }) : this.setState({ saveMenuVisible: true })
    };

    getComponent = (className: string) => {
        if (className === "//Href") {
            return 'hrefComponent'
        } else if (className === "//Button") {
            return 'buttonComponent'
        } else {
            return className
        }
    };

    getBuffer = () => {
        return this.buffer
    };

    onEdit = () => {
        if (this.props.isEditMode) {
            this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = (params: any) => {
                if (this.buffer.includes(params.data) && params.data.operationMark__ === dmlOperation.delete)
                    return 'line-through'
            };
            let newColumnDefs:any = [];
            let rowData;
            newColumnDefs = newColumnDefs.concat(this.state.columnDefs);
            rowData = new Map();
            rowData.set('field', this.props.t('delete row'));
            rowData.set('headerName', this.props.t('delete row'));
            rowData.set('headerTooltip', 'type : String');
            rowData.set('component','deleteButton');
            rowData.set('textAlign','center');
            newColumnDefs.push(rowData);
            //TODO пока не понятно что писать в меню
            /*rowData = new Map();
            rowData.set('field', 'dataMenu');
            rowData.set('headerName', 'dataMenu');
            rowData.set('headerTooltip', 'type : String');
            rowData.set('component','menu');
            newColumnDefs.push(rowData);*/
            this.setState({columnDefs : newColumnDefs},()=>{
                /*this.grid.current.columnApi.moveColumn("dataMenu",1);*/
                this.grid.current.api.redrawRows();
            });
        } else {
            let newColumnDefs = this.state.columnDefs.filter((c:any) => c.get('field') !== 'dataMenu' && c.get('field') !== 'deleteRow');
            this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = null;
            this.setState({columnDefs : newColumnDefs},()=>{
                this.grid.current.api.redrawRows();
            })
        }
    };

    onApplyChanges = () => {
        this.grid.current.api.applyTransaction({ remove: this.buffer
                .filter((el:any) => el.operationMark__ === dmlOperation.delete ) });
        this.props.onApplyEditChanges(this.buffer);
    };

    onQuickFilterChanged = () => {
        //@ts-ignore
        this.grid.current.api.setQuickFilter(document.getElementById('quickFilter')!.value);
    };

    onDeleteSelected = () => {
        let selected = this.grid.current.api.getSelectedNodes().map((sn:any) => sn.data);
        this.onDelete(selected)
    };

    markDeleted = (data: any, buffer: any[]) => {
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
            this.buffer = this.buffer.filter((el:any) => !Object.is(el, data));
            data.operationMark__ = undefined;
        //Если новая вставленная запись удаляем
        } else if (data.operationMark__ === dmlOperation.insert) {
            this.buffer = this.buffer.filter((el:any) => !Object.is(el, data));
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

    onDelete = (data:any|any[]) => {
        if (Array.isArray(data)) {
            data.forEach(d => {
                this.markDeleted(d, this.buffer)
            });
        } else {
            this.markDeleted(data, this.buffer)
        }
        this.grid.current.api.redrawRows(this.buffer);
    };

    onInsert = () => {
        this.buffer = this.buffer.map((el:any) => el).concat(
            this.grid.current.api.applyTransaction({ addIndex: 0, add: [{operationMark__:dmlOperation.insert}] })
            .add
            .map((a:any)=>{
                return a.data
            }))
    };

    onUpdate = (params:any) => {
        let foundObject = this.buffer.find((el:any)=> Object.is(el, params.data));
        if (!foundObject && params.data.operationMark__ !== dmlOperation.insert) {
            params.data.operationMark__ = dmlOperation.update;
            this.buffer.push(params.data)
        }
    };

    render() {
        const { t } = this.props;
        const {gridOptions} = this.state;
        return (
            <div id="menuButton"
                 style={{boxSizing: 'border-box', height: '100%', backgroundColor: backgroundColor}}
                 className={'ag-theme-material'}
            >
                <div style={{ marginTop: '30px', height: 750, width: "99,5%"}}>
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
                            headerHeight={40} //высота header в px (25 по умолчанию)
                            suppressRowClickSelection //строки не выделяются при нажатии на них
                            pagination={true}
                            suppressPaginationPanel={true}
                            /*domLayout='autoHeight'*/
                            paginationPageSize={this.state.paginationPageSize}
                            onPaginationChanged={this.onPaginationChanged.bind(this)}
                            suppressClickEdit={true}
                            /*stopEditingWhenGridLosesFocus={true}*/
                            {...gridOptions}
                        >
                            {this.state.columnDefs.map((col: any) =>
                                <AgGridColumn
                                    onCellValueChanged={this.props.isEditMode ? this.onUpdate : col.get('updateCallback')}
                                    onCellDoubleClicked={col.get('onCellDoubleClicked')}
                                    type={col.get('type')}
                                    key={col.get('field')}
                                    field={col.get('field')}
                                    headerName={col.get('headerName').toString().substring(0, 1).toUpperCase() + col.get('headerName').toString().substring(1)}
                                    headerTooltip={col.get('headerTooltip')}
                                    hide={col.get('hide') || false}
                                    editable={col.get('editable') || false}
                                    pinned={col.get('pinned') === 'Left' ? 'left' : col.get('pinned') === 'Right' ? 'right' : false}
                                    // filter={col.get('filter') === 'NumberColumnFilter'
                                    //     ? 'agNumberColumnFilter' : col.get('filter') === 'DateColumnFilter' ?
                                    //         'agDateColumnFilter' : 'agTextColumnFilter'}
                                    checkboxSelection={this.props.isEditMode ? isFirstColumn : false}
                                    headerCheckboxSelection={this.props.isEditMode ? isFirstColumn : false}
                                    headerCheckboxSelectionFilteredOnly={this.state.manual}
                                    resizable={col.get('resizable') || false}
                                    sortable={col.get('sortable') || false}
                                    suppressMenu={col.get('suppressMenu') || false}
                                    cellStyle = {this.state.cellStyle}
                                    cellRendererParams = {(col.get('component')) ? {
                                        ...this.props,
                                        viewObject: col.get('component'),
                                        componentRenderCondition: col.get('componentRenderCondition'),
                                        onDelete: this.onDelete
                                    } : undefined}
                                    cellRenderer = {
                                        (col.get('component')) ? this.getComponent(col.get('component').eClass ? col.get('component').eClass._id : col.get('component')) : function (params: any) {
                                            return params.valueFormatted? params.valueFormatted : params.value;
                                        }
                                    }
                                    cellEditor = {[appTypes.Date,appTypes.Timestamp].includes(col.get('type')) ? 'DateEditor' : undefined }
                                    cellEditorParams = {[appTypes.Date,appTypes.Timestamp].includes(col.get('type')) ? {mask: col.get('mask'), type: col.get('type')} : undefined}
                                    valueFormatter = {col.get('valueFormatter')}
                                />
                            )}
                        </AgGridReact>
                    </ConfigProvider>
                    }
                    {
                        this.highlightAggregateAfterChangingPage()
                    }
                    <div style={{float: "right", opacity: this.state.isGridReady ? 1 : 0}}>
                        <Paginator
                            {...this.props}
                            currentPage = {this.state.paginationCurrentPage}
                            totalNumberOfPage = {this.state.paginationTotalPage}
                            paginationPageSize = {this.state.paginationPageSize}
                            grid = {this.grid}
                        />
                    </div>
                </div>
                <Modal
                    key="save_menu"
                    width={'500px'}
                    title={t('saveReport')}
                    visible={this.state.saveMenuVisible}
                    footer={null}
                    onCancel={this.handleSaveMenu}
                >
                    <SaveDatasetComponent
                        closeModal={this.handleSaveMenu}
                        {...this.props}
                    />
                </Modal>
            </div>
        )
    }
}
export default withTranslation('common', { withRef: true })(DatasetGrid)
