import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import '@ag-grid-community/core/dist/styles/ag-theme-fresh.css';
import '@ag-grid-community/core/dist/styles/ag-theme-blue.css';
import '@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css';
import {Button, Dropdown, Menu, Modal} from 'antd';
import {withTranslation} from 'react-i18next';
import './../../../styles/RichGrid.css';
import Ecore from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {API} from '../../../modules/api';
import {rowPerPageMapper} from '../../../utils/consts';
import SaveDatasetComponent from "./SaveDatasetComponent";
import {handleExportDocx, docxExportObject, docxElementExportType} from "../../../utils/docxExportUtils";
import {handleExportExcel, excelExportObject, excelElementExportType} from "../../../utils/excelExportUtils";
import {saveAs} from "file-saver";
import _ from 'lodash';
import {IServerQueryParam} from "../../../MainContext";

const backgroundColor = "#fdfdfd";
const rowPerPageMapper_: any = rowPerPageMapper;

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
    currentTheme: string,
    paginationPageSize: string,
    showUniqRow: boolean,
    isHighlightsUpdated: boolean,
    saveChanges?: (newParam: any, paramName: string) => void;
}

class DatasetGrid extends React.Component<any, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            themes: [],
            currentTheme: this.props.currentTheme,
            rowPerPages: [],
            paginationPageSize: this.props.paginationPageSize,
            operations: [],
            showUniqRow: this.props.showUniqRow,
            columnDefs: [],
            rowData: [],
            highlights: [],
            saveMenuVisible: false,
            gridOptions: {
                defaultColDef: {
                    resizable: true,
                    filter: true,
                    sortable: true,
                }
            },
            cellStyle: {}
        };
        this.grid = React.createRef();
    }

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    };

    onPageSizeChanged(newPageSize: any) {
        this.grid.current.api.paginationSetPageSize(Number(rowPerPageMapper_[newPageSize]));
    }

    onActionMenu(e : any) {
        if (e.key.split('.').includes('theme')) {
            this.setSelectedKeys(e.key.split('.')[1])
        }
        if (e.key.split('.').includes('rowPerPage')) {
            this.setSelectedKeys(e.key.split('.')[1]);
            this.onPageSizeChanged(e.key.split('.')[1]);
        }
        if (e.key === 'saveReport') {
            this.handleSaveMenu()
        }
        if (e.key === 'exportToDocx') {
            handleExportDocx(this.props.context.docxHandlers).then(blob => {
                saveAs(blob, "example.docx");
                console.log("Document created successfully");
            });
        }
        if (e.key === 'exportToExcel') {
            handleExportExcel(this.props.context.excelHandlers).then((blob) => {
                    saveAs(new Blob([blob]), 'example.xlsx');
                    console.log("Document created successfully");
                }
            );
        }
    }

    private setSelectedKeys(parameter?: string) {
        let selectedKeys: string[] = [];
        if (this.state.themes.length !== 0) {
            if (parameter && this.state.themes.includes(parameter)) {
                selectedKeys.push(`theme.${parameter}`);
                this.setState({currentTheme: parameter});
                this.props.viewObject.set('theme', parameter);
            }
            else if (this.state.currentTheme === null) {
                selectedKeys.push(`theme.${this.state.themes[0]}`);
                this.setState({currentTheme: this.state.themes[0]});
                this.props.viewObject.set('theme', this.state.themes[0]);
            }
            else {
                selectedKeys.push(`theme.${this.state.currentTheme}`)
            }
        }
        if (this.state.rowPerPages.length !== 0) {
            if (parameter && this.state.rowPerPages.includes(parameter)) {
                selectedKeys.push(`rowPerPage.${parameter}`);
                this.setState({paginationPageSize: parameter});
                this.props.viewObject.set('rowPerPage', parameter);
            }
            else if (this.state.paginationPageSize === null) {
                selectedKeys.push(`rowPerPage.${this.state.rowPerPages[0]}`);
                this.setState({paginationPageSize: this.state.rowPerPages[0]});
                this.props.viewObject.set('rowPerPage', this.state.rowPerPages[0]);
            }
            else {
                selectedKeys.push(`rowPerPage.${this.state.paginationPageSize}`)
            }
        }
        return selectedKeys;
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
            excelComponentType : excelElementExportType.grid,
            gridData: {
                tableName: this.props.viewObject.get('name'),
                columns: header,
                rows: (tableData.length === 0) ? [[]] : tableData
            }
        };
    }

    getAllThemes() {
        API.instance().findEnum('application', 'Theme')
            .then((result: Ecore.EObject[]) => {
                let themes = result.map( (t: any) => {
                    return t.get('name').toLowerCase()
                });
                this.setState({themes})
            })
    };

    getAllRowPerPage() {
        API.instance().findEnum('application', 'RowPerPage')
            .then((result: Ecore.EObject[]) => {
                let rowPerPages = result.map( (t: any) => {
                    return t.get('name')
                });
                this.setState({rowPerPages})
            })
    };

    componentDidMount(): void {
        if (this.props.context.docxHandlers !== undefined) {
            this.props.context.docxHandlers.push(this.getDocxData.bind(this))
        }
        if (this.props.context.excelHandlers !== undefined) {
            this.props.context.excelHandlers.push(this.getExcelData.bind(this))
        }
        if (this.state.themes.length === 0) {
            this.getAllThemes()
        }
        if (this.state.rowPerPages.length === 0) {
            this.getAllRowPerPage()
        }
    }

    componentWillUnmount(): void {
        if (this.props.context.docxHandlers !== undefined && this.props.context.docxHandlers.length > 0) {
            this.props.context.docxHandlers.pop()
        }
        if (this.props.context.excelHandlers !== undefined && this.props.context.excelHandlers.length > 0) {
            this.props.context.excelHandlers.pop()
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        this.highlightAggregate();
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
    }

    private highlightAggregate() {
        if (this.grid.current) {
            if (this.props.isAggregatesHighlighted) {
                this.grid.current.api.gridOptionsWrapper.gridOptions.getRowClass = function(params: any) {
                    if (params.node.lastChild) {
                        return 'aggregate-highlight';
                    }
                }
            }
            else {
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
            let highlights: IServerQueryParam[] = (this.props.highlights as IServerQueryParam[]).filter(value => value.enable && value.datasetColumn);
            if (highlights.length !== 0) {
                const cellHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Cell' || h['highlightType'] === null);
                const temp: any = cellHighlights.find((h: any) => {

                    const type = h['type'];
                    const columnName = h['datasetColumn'];
                    const operation = h['operation'];
                    const value = h['value'];
                    const backgroundColor = h['backgroundColor'];
                    const color = h['color'];

                    let columnValue;
                    let filterValue;
                    if (type === 'Integer' || type === 'Decimal') {
                        columnValue = Number(params.value);
                        filterValue = Number(value)
                    }
                    else if (type === 'Date' || type === 'Timestamp') {
                        columnValue = new Date(params.value);
                        filterValue = new Date(value)
                    }
                    else if (type === 'String' || type === 'Boolean') {
                        columnValue = params.value;
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
                if (temp !== undefined) {
                    return {background: temp['backgroundColor'], color: temp['color']}
                }
                else {
                    const columnHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Column');
                    const temp: any = columnHighlights.find((h: any) => {
                        const columnName = h['datasetColumn'];
                        const backgroundColor = h['backgroundColor'];
                        const color = h['color'];
                        if (params.data[columnName] === params.value) {
                            return {background: backgroundColor, color: color}
                        }
                    });
                    if (temp !== undefined) {
                        return {background: temp['backgroundColor'], color: temp['color']}
                    }
                }
            }
            else {
                return {background: undefined, color: undefined}
            }
        };
        const rowStyle = (params: any) => {
            let highlights: IServerQueryParam[] = (this.props.highlights as IServerQueryParam[]).filter(value => value.enable && value.datasetColumn);
            if (highlights.length !== 0) {
                const rowHighlights: any = highlights.filter((h: any) => h['highlightType'] === 'Row');
                const temp: any = rowHighlights.find((h: any) => {

                    const type = h['type'];
                    const columnName = h['datasetColumn'];
                    const operation = h['operation'];
                    const value = h['value'];
                    const backgroundColor = h['backgroundColor'];
                    const color = h['color'];

                    let columnValue;
                    let filterValue;
                    if (type === 'Integer' || type === 'Decimal') {
                        columnValue = Number(params.data[columnName]);
                        filterValue = Number(value)
                    }
                    else if (type === 'Date' || type === 'Timestamp') {
                        columnValue = new Date(params.data[columnName]);
                        filterValue = new Date(value)
                    }
                    else if (type === 'String' || type === 'Boolean') {
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

    render() {
        const { t } = this.props;
        const {gridOptions} = this.state;
        let selectedKeys = this.setSelectedKeys();
        const menu = (
            <Menu
                key='actionMenu'
                onClick={(e) => this.onActionMenu(e)}
                selectedKeys={selectedKeys}
                style={{width: '150px'}}
            >
                <Menu.Item key='selectColumns'>
                    Select Columns
                </Menu.Item>
                <Menu.SubMenu title={'Rows Per Page'}>
                    {this.state.rowPerPages.map((p: string) =>
                        <Menu.Item key={`rowPerPage.${p}`} style={{width: '65px'}}>
                            {rowPerPageMapper_[p]}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item key='format'>
                    Format
                </Menu.Item>
                <Menu.Item key='saveReport'>
                    Save Report
                </Menu.Item>
                <Menu.Item key='reset'>
                    Reset
                </Menu.Item>
                <Menu.SubMenu title={'Theme'}>
                    {this.state.themes.map((theme: string) =>
                        <Menu.Item key={`theme.${theme}`} style={{width: '100px'}}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item key='help'>
                    Help
                </Menu.Item>
                <Menu.Item key='download'>
                    Download
                </Menu.Item>
                <Menu.Item key='exportToDocx'>
                    exportToDocx
                </Menu.Item>
                <Menu.Item key='exportToExcel'>
                    exportToExcel
                </Menu.Item>
            </Menu>
        );
        return (
            <div
                style={{boxSizing: 'border-box', height: '100%', backgroundColor: backgroundColor }}
                className={'ag-theme-' + this.state.currentTheme}
            >
                <Dropdown overlay={menu} placement='bottomLeft'>
                    <Button style={{color: 'rgb(151, 151, 151)'}}> {t('action')}
                        <FontAwesomeIcon icon={faChevronDown} size='xs'
                                         style={{marginLeft: '5px'}}/>
                    </Button>
                </Dropdown>
                <div style={{ marginTop: '30px'}}>
                    {this.state.columnDefs !== undefined && this.state.columnDefs.length !== 0 && <AgGridReact
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
                        domLayout='autoHeight'
                        paginationPageSize={Number(rowPerPageMapper_[this.state.paginationPageSize])}
                        {...gridOptions}
                    >
                        {this.state.columnDefs.map((col: any) =>
                            <AgGridColumn
                                key={col.get('field')}
                                field={col.get('field')}
                                headerName={col.get('headerName').toString().substring(0, 1).toUpperCase() + col.get('headerName').toString().substring(1)}
                                headerTooltip={col.get('headerTooltip')}
                                hide={col.get('hide') || false}
                                editable={col.get('editable') || false}
                                pinned={col.get('pinned') === 'Left' ? 'left' : col.get('pinned') === 'Right' ? 'right' : false}
                                filter={col.get('filter') === 'NumberColumnFilter'
                                    ? 'agNumberColumnFilter' : col.get('filter') === 'DateColumnFilter' ?
                                        'agDateColumnFilter' : 'agTextColumnFilter'}
                                checkboxSelection={col.get('checkboxSelection') || false}
                                resizable={col.get('resizable') || false}
                                sortable={col.get('sortable') || false}
                                suppressMenu={col.get('suppressMenu') || false}
                                cellStyle = {this.state.cellStyle}
                            />
                        )}
                    </AgGridReact>
                    }
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
