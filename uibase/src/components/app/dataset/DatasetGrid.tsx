import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import {ConfigProvider, Modal} from 'antd';
import {withTranslation} from 'react-i18next';
import Ecore from 'ecore';
import SaveDatasetComponent from "./SaveDatasetComponent";
import {docxExportObject, docxElementExportType} from "../../../utils/docxExportUtils";
import {excelExportObject, excelElementExportType} from "../../../utils/excelExportUtils";
import _ from 'lodash';
import {IServerQueryParam} from "../../../MainContext";
import {Button_, Href_} from '../../../AntdFactory';
import Paginator from "../Paginator";
import {
    agGridColumnTypes, appTypes,
    defaultDateFormat,
    defaultDecimalFormat,
    defaultIntegerFormat,
    defaultTimestampFormat
} from "../../../utils/consts";
import DateEditor from "./DateEditor";
import {switchAntdLocale} from "../../../utils/antdLocalization";
import moment from "moment";
import format from "number-format.js";
import './../../../styles/RichGrid.css';

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
    isAnyAggregations: boolean;
    saveChanges?: (newParam: any, paramName: string) => void;
    serverAggregates: any[],
    numberOfNewLines: boolean
}

class DatasetGrid extends React.Component<Props & any, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            themes: [],
            operations: [],
            showUniqRow: this.props.showUniqRow,
            numberOfNewLines: this.props.numberOfNewLines,
            paginationPageSize: 10,
            isGridReady: false,
            isAnyAggregations: true,
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
                },
                defaultColDef: {
                    resizable: true,
                    sortable: true,
                }
            },
            cellStyle: {},
        };
        this.grid = React.createRef();
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
    }



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
        if (this.state.numberOfNewLines !== this.props.numberOfNewLines && this.state.rowData.length !== 0) {
            this.setState({numberOfNewLines: this.props.numberOfNewLines})
            this.highlightAggregate();
        }
        if (!_.isEqual(this.state.highlights, this.props.highlights)
            && this.props.isHighlightsUpdated) {
            this.changeHighlight();
        }
        if (JSON.stringify(this.state.rowData) !== JSON.stringify(this.props.rowData)) {
            this.setState({rowData: this.props.rowData})
        }
        if (!_.isEqual(this.state.columnDefs, this.props.columnDefs)) {
            this.setState({columnDefs: this.props.columnDefs})
        }
        if (prevProps.t !== this.props.t) {
            this.setState({locale:switchAntdLocale(this.props.i18n.language, this.props.t)})
        }
    }

    private highlightAggregate() {
        let numberOfLinesInAggregations = 0
            for (let i = 0; i < this.state.columnDefs.length; i++) {
                let sameDatasetColumn = 0;
                for (let j = 0; j < this.props.serverAggregates.length; j++) {
                    if (this.state.columnDefs[i].get("field") == this.props.serverAggregates[j].datasetColumn && this.props.serverAggregates[j].enable) {
                        sameDatasetColumn++;
                    }
                }
                if (numberOfLinesInAggregations < sameDatasetColumn) {
                    numberOfLinesInAggregations = sameDatasetColumn
                }

            }
            if (this.grid.current) {
                if (this.props.isAggregatesHighlighted && this.state.rowData.length > 0) {
                    let lastLines = this.props.rowData.length - numberOfLinesInAggregations - 1
                    this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = function (params: any) {
                        if (lastLines < params.node.childIndex) {
                            return 'aggregate-highlight';
                        }
                    }
                } else {
                    this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = null;
                }
                this.grid.current.api.refreshCells();
            }

    }



    private changeHighlight() {
        const {gridOptions} = this.state;
        this.setState({highlights: this.props.highlights});
        this.props.saveChanges(false, "isHighlightsUpdated");
        const newCellStyle = (params: any) => {
            let returnObject = {textAlign: [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type) ? "right": undefined};
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
        }
        return 'none'
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
                        stopEditingWhenGridLosesFocus={true}
                        {...gridOptions}
                    >
                        {this.state.columnDefs.map((col: any) =>
                            <AgGridColumn
                                onCellValueChanged={col.get('updateCallback')}
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
                                checkboxSelection={col.get('checkboxSelection') || false}
                                resizable={col.get('resizable') || false}
                                sortable={col.get('sortable') || false}
                                suppressMenu={col.get('suppressMenu') || false}
                                cellStyle = {this.state.cellStyle}
                                cellRendererParams = {(col.get('component')) ? {
                                    ...this.props,
                                    viewObject: col.get('component'),
                                } : undefined}
                                cellRenderer = {
                                    (col.get('component')) ? this.getComponent(col.get('component').eClass._id) : function (params: any) {
                                        return params.valueFormatted? params.valueFormatted : params.value;
                                    }
                                }
                                cellEditor = {[appTypes.Date,appTypes.Timestamp].includes(col.get('type')) ? 'DateEditor' : undefined }
                                cellEditorParams = {[appTypes.Date,appTypes.Timestamp].includes(col.get('type')) ? {mask: col.get('mask'), type: col.get('type')} : undefined}
                                valueFormatter = {(params) : string => {
                                    return params.colDef.type === appTypes.Date && col.get('mask')
                                        ? moment(params.value, defaultDateFormat).format(col.get('mask'))
                                        : params.colDef.type === appTypes.Timestamp && col.get('mask')
                                            ? moment(params.value, defaultTimestampFormat).format(col.get('mask'))
                                            : [appTypes.Integer,appTypes.Decimal].includes(params.colDef.type as appTypes) && col.get('mask')
                                                ? format(col.get('mask'), params.value)
                                                : [appTypes.Decimal].includes(params.colDef.type as appTypes)
                                                    ? format(defaultDecimalFormat, params.value)
                                                    : [appTypes.Integer].includes(params.colDef.type as appTypes)
                                                        ? format(defaultIntegerFormat, params.value)
                                                        : params.value
                                }}
                            />
                        )}
                    </AgGridReact>
                    </ConfigProvider>
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
export default withTranslation()(DatasetGrid)
