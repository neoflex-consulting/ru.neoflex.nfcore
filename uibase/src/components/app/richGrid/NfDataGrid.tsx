import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";
import "@ag-grid-community/core/dist/styles/ag-theme-material.css";
import "@ag-grid-community/core/dist/styles/ag-theme-fresh.css";
import "@ag-grid-community/core/dist/styles/ag-theme-blue.css";
import "@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css";
import { copyIntoClipboard } from '../../../utils/clipboard';
import {Button, DatePicker, Dropdown, Menu, Modal, Select} from "antd";
import {withTranslation} from "react-i18next";
import './../../../styles/RichGrid.css';
import Ecore, {EObject} from "ecore";
import moment from 'moment';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {API} from "../../../modules/api";
import rowPerPageMapper from "../../../utils/consts";

interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    columnDefs?: Array<any>,
    rowData?: Array<any>,
    gridOptions?: { [ key:string ]: any },
    serverFilters:  Array<EObject>,
    useServerFilter: boolean,
    reportDate: any
}

class NfDataGrid extends React.Component<any, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            themes: [],
            currentTheme: this.props.viewObject.get('defaultDatasetGrid').get('theme'),
            rowPerPages: [],
            paginationPageSize: this.props.viewObject.get('defaultDatasetGrid').get('rowPerPage'),
            selectedServerFilters: [],
            modalResourceVisible: false
        };

        this.grid = React.createRef();
        this.exportToCSV = this.exportToCSV.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleKeyDown(event: { [key:string]: any }) {
        const { onCtrlA, onCtrlShiftA } = this.props
        const rowData = this.grid.current.api.getSelectedRows()
        const focusedCell = this.grid.current.api.getFocusedCell()
        const row = this.grid.current.api.getDisplayedRowAtIndex(focusedCell.rowIndex);

        let charCode = String.fromCharCode(event.which).toLowerCase()
        if (rowData.length > 0 && focusedCell) {
            const cellData = row.data[focusedCell.column.colId]
            if (event.ctrlKey && charCode === 'c') {
                copyIntoClipboard!(cellData)
                event.preventDefault()
            }
            // For MAC
            if (event.metaKey && charCode === 'c') {
                copyIntoClipboard!(cellData)
                event.preventDefault()
            }
        }
        if (this.props.onCtrlA) {
            if (event.ctrlKey && charCode === 'a') {
                onCtrlA!(event)
                event.preventDefault()
            }
        }
        if (this.props.onCtrlShiftA) {
            if (event.ctrlKey && event.shiftKey && charCode === 'a') {
                onCtrlShiftA!(event)
                event.preventDefault()
            }
        }
    }

    exportToCSV(name: string) {
        this.grid.current.api.exportDataAsCsv({ fileName: name })
    }

    onGridReady = (params: any) => {
        this.grid.current.api = params.api;
        this.grid.current.columnApi = params.columnApi;
    };

    onPageSizeChanged(newPageSize: any) {
        this.grid.current.api.paginationSetPageSize(Number(newPageSize));
    }

    handleResourceModalCancel = () => {
        this.setState({ modalResourceVisible: false })
    }

    updateTableData(e: any): void  {
        if (e !== null) {
            this.props.context.changeURL!(this.props.appModule, undefined, e._d)
        }
    }

    onActionMenu(e : any) {
        if (e.key.split('.').includes('theme')) {
            this.setSelectedKeys(e.key.split('.')[1])
        }
        if (e.key.split('.').includes('rowPerPage')) {
            this.setSelectedKeys(e.key.split('.')[1])
            this.onPageSizeChanged(e.key.split('.')[1])
        }
    }

    private setSelectedKeys(parameter?: string) {
        let selectedKeys: string[] = [];
        if (this.state.themes.length !== 0) {
            if (parameter && this.state.themes.includes(parameter)) {
                selectedKeys.push(`theme.${parameter}`)
                this.setState({currentTheme: parameter})
            }
            else if (this.state.currentTheme === null) {
                selectedKeys.push(`theme.${this.state.themes[0]}`)
                this.setState({currentTheme: this.state.themes[0]})
            }
            else {
                selectedKeys.push(`theme.${this.state.currentTheme}`)
            }
        }
        if (this.state.rowPerPages.length !== 0) {
            if (parameter && this.state.rowPerPages.includes(parameter)) {
                selectedKeys.push(`rowPerPage.${parameter}`)
                this.setState({paginationPageSize: parameter})
            }
            else if (this.state.paginationPageSize === null) {
                selectedKeys.push(`rowPerPage.${this.state.rowPerPages[0]}`)
                this.setState({paginationPageSize: this.state.rowPerPages[0]})
            }
            else {
                selectedKeys.push(`rowPerPage.${this.state.paginationPageSize}`)
            }
        }
        return selectedKeys;
    }

    getAllThemes() {
        API.instance().findEnum('dataset', 'Theme')
            .then((result: Ecore.EObject[]) => {
                let themes = result.map( (t: any) => {
                    return t.get('name').toLowerCase()
                });
                this.setState({themes})
            })
    };

    getAllRowPerPage() {
        API.instance().findEnum('dataset', 'RowPerPage')
            .then((result: Ecore.EObject[]) => {
                const rowPerPageMapper_: any = rowPerPageMapper;
                let rowPerPages = result.map( (t: any) => {
                    return rowPerPageMapper_[t.get('name')]
                });
                this.setState({rowPerPages})
            })

    };

    componentDidMount(): void {
        if (this.state.themes.length === 0) {
            this.getAllThemes()
        }
        if (this.state.rowPerPages.length === 0) {
            this.getAllRowPerPage()
        }
    }

    render() {
        const { columnDefs, rowData, gridOptions, t, serverFilters } = this.props
        let defaultFilter: any[] = [];
        if (serverFilters !== undefined) {
            defaultFilter = serverFilters
                .filter((f: EObject) => f.get('enable') === true)
                .map((f: EObject) =>
                    `${f.get('datasetColumn').get('name')} ${f.get('operation')} ${f.get('value')}`
                )
        }
        let selectedKeys = this.setSelectedKeys();
        const menu = (
            <Menu
                onClick={(e) => this.onActionMenu(e)}
                selectedKeys={selectedKeys}
            >
                <Menu.Item>
                    Select Columns
                </Menu.Item>
                <Menu.Item>
                    Filter
                </Menu.Item>
                <Menu.SubMenu title={"Rows Per Page"}>
                    {this.state.rowPerPages.map((rowPerPage: string) =>
                        <Menu.Item key={`rowPerPage.${rowPerPage.toLowerCase()}`}>
                            {rowPerPage}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>

                <Menu.Item>
                    Format
                </Menu.Item>
                <Menu.Item>
                    Save Report
                </Menu.Item>
                <Menu.Item>
                    Reset
                </Menu.Item>
                <Menu.SubMenu title={"Theme"}>
                    {this.state.themes.map((theme: string) =>
                        <Menu.Item key={`theme.${theme}`}>
                            {theme}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item>
                    Help
                </Menu.Item>
                <Menu.Item>
                    Download
                </Menu.Item>
            </Menu>
        );
        return (
            <div
                onKeyDown={this.handleKeyDown}
                style={{boxSizing: 'border-box', height: '100%', marginLeft: '20px', marginRight: '20px' }}
                className={"ag-theme-" + this.state.currentTheme}
            >
                <Dropdown overlay={menu} placement="bottomLeft">
                    <Button style={{color: "rgb(151, 151, 151)"}}> Actions{/*{t('actions')}*/}
                        <FontAwesomeIcon icon={faChevronDown} size="xs"
                                         style={{marginLeft: "5px"}}/>
                    </Button>
                </Dropdown>
                {/*{this.props.useServerFilter &&*/}
                {/*<div style={{marginLeft: '10px', display: 'inline'}}>*/}
                {/*    <span style={{color: 'gray', fontSize: 'larger'}}>  {t("filters")}: </span>*/}
                {/*    <Select*/}
                {/*        notFoundContent={t('notfound')}*/}
                {/*        allowClear={true}*/}
                {/*        style={{width: '400px'}}*/}
                {/*        showSearch={true}*/}
                {/*      //  onSelect={ (e:any) => this.setState({serverFilters: e})}*/}
                {/*        mode="multiple"*/}
                {/*        placeholder="No Filters Selected"*/}
                {/*        defaultValue={defaultFilter}*/}
                {/*    >*/}
                {/*        {*/}
                {/*            this.props.serverFilters !== undefined ?*/}
                {/*                this.props.serverFilters*/}
                {/*                    .map((f: EObject) =>*/}
                {/*                        <Select.Option*/}
                {/*                            key={`${f.get('datasetColumn').get('name')} ${f.get('operation')} ${f.get('value')}`}*/}
                {/*                            value={`${f.get('datasetColumn').get('name')} ${f.get('operation')} ${f.get('value')}`}*/}
                {/*                        >*/}
                {/*                            {f.get('datasetColumn').get('name')} {f.get('operation')} {f.get('value')}*/}
                {/*                        </Select.Option>)*/}
                {/*                :*/}
                {/*                undefined*/}
                {/*        }*/}
                {/*    </Select>*/}
                {/*    <Button title={t('addFilters')} icon="plus" type="primary" style={{ marginLeft: '10px' }} shape="circle" size="default"*/}
                {/*            onClick={() => this.setState({ modalResourceVisible: true })}/>*/}
                {/*    {this.state.modalResourceVisible && <Modal*/}
                {/*        width={'1000px'}*/}
                {/*        title={t('addFilters')}*/}
                {/*        visible={this.state.modalResourceVisible}*/}
                {/*        footer={null}*/}
                {/*        onCancel={this.handleResourceModalCancel}*/}
                {/*    >*/}
                {/*        {*/}
                {/*            this.props.serverFilters*/}
                {/*                ?*/}
                {/*                <ServerFilter*/}
                {/*                    {...this.props}*/}
                {/*                    serverFilters={this.props.serverFilters}*/}
                {/*                    columnDefs={this.props.columnDefs}*/}
                {/*                />*/}
                {/*                :*/}
                {/*                <ServerFilter/>*/}
                {/*        }*/}
                {/*    </Modal>}*/}
                {/*</div>*/}
                {/*}*/}
                {this.props.reportDate &&
                <div style={{marginTop: "10px"}}>
                    <span style={{color: 'gray', fontSize: 'larger'}}>{t("reportdate")}: </span>
                    <DatePicker
                        placeholder="Select date"
                        defaultValue={moment(this.props.reportDate)}
                        format={'DD.MM.YYYY'}
                        onChange={ (e: any) => this.updateTableData(e)}
                    />
                </div>
                }
                <div style={{ marginTop: "30px"}}>
                    <AgGridReact
                        ref={this.grid}
                        //columnDefs={columnDefs}
                        rowData={rowData}
                        modules={AllCommunityModules}
                        rowSelection="multiple" //выделение строки
                        onGridReady={this.onGridReady} //инициализация грида
                       //Выполняет глубокую проверку значений старых и новых данных и подгружает обновленные
                        //rowDataChangeDetectionStrategy={'DeepValueCheck' as ChangeDetectionStrategyType}
                        suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                        suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                        allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                        headerHeight={40} //высота header в px (25 по умолчанию)
                        suppressRowClickSelection //строки не выделяются при нажатии на них
                        pagination={true}

                        enableColResize={true}
                        // //pivotHeaderHeight={true}
                        enableSorting={true}
                        // //sortingOrder={["desc", "asc", null]}
                        enableFilter={true}
                        gridAutoHeight={true}
                        paginationPageSize={Number(this.state.paginationPageSize)}
                        {...gridOptions}
                    >
                        <AgGridColumn
                            headerName="#"
                            width={30}
                            checkboxSelection
                            sortable={false}
                            suppressMenu //скрыть меню с фильтрами и пр.
                            filter={false}
                            hide={false}
                            pinned //закрепить стобец (слево, справо, отмена)
                        >
                        </AgGridColumn>
                        <AgGridColumn
                            headerName="Name_agDateColumnFilter"
                            field="name"
                            hide={false}
                            pinned
                            headerTooltip={"headerTooltip"}
                            filter="agDateColumnFilter"
                            sort={"DESC"}
                            editable={true}
                        >
                        </AgGridColumn>
                            {
                                columnDefs !== undefined ?
                                    columnDefs.map((col: any) =>
                                        <AgGridColumn
                                            field={col.get("field")}
                                            headerName={col.get("headerName").toString().substring(0,1).toUpperCase() + col.get("headerName").toString().substring(1)}
                                            headerTooltip={col.get("headerTooltip")}
                                            hide={col.get("hide")}
                                            editable={col.get("editable")}
                                            pinned={col.get("pinned") === 'Left' ? 'left' : col.get("pinned") === 'Right' ? 'right' : false}
                                            filter={col.get("filter") === 'NumberColumnFilter'
                                                ? 'agNumberColumnFilter' : col.get("filter") === 'DateColumnFilter' ?
                                                    'agDateColumnFilter' : 'agTextColumnFilter'}
                                        />
                                    )
                                    : null
                            }
                    </AgGridReact>
                </div>
            </div>
        )
    }
}

export default withTranslation()(NfDataGrid)
