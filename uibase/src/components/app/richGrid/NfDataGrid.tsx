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
import {Button, DatePicker, Modal, Select} from "antd";
import {WithTranslation, withTranslation} from "react-i18next";
import './../../../styles/RichGrid.css';
import {EObject} from "ecore";
import ServerFilter from "./ServerFilter";
import moment from 'moment';

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
            themes: [
                "balham",
                "blue",
                "bootstrap",
                "fresh",
                "material"
            ],
            theme: "balham",
            paginationPageSizes: [
                1,
                10,
                20,
                50,
                100,
                500,
                1000,
                "All"
            ],
            paginationPageSize: 7,
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
        this.props.context.changeURL!(this.props.appModule, undefined, e._d)
    }
    render() {
        const { columnDefs, rowData, gridOptions, t, serverFilters } = this.props
        let defaultFilter: any[] = [];
        if (serverFilters !== undefined) {
            defaultFilter = serverFilters
                .filter((f: EObject) => f.get('enable') === true)
                .map((f: EObject) =>
                    f.get('name'))
        }
        return (
            <div
                onKeyDown={this.handleKeyDown}
                style={{boxSizing: 'border-box', height: '100%', marginLeft: '20px', marginRight: '20px' }}
                className={"ag-theme-" + this.state.theme}
            >
                <span style={{color: 'gray', fontSize: 'larger'}}>{t("theme")}: </span>
                <Select
                    notFoundContent={t('notfound')}
                    allowClear={true}
                    showSearch={true}
                    style={{ width: '180px' }}
                    onSelect={ (e:string) => this.setState({theme: e})}
                    defaultValue={this.state.themes[0]}
                >
                    {
                        this.state.themes
                            .map((theme: string) =>
                                <Select.Option key={theme} value={theme}>
                                    {theme}
                                </Select.Option>)
                    }
                </Select>
                <span style={{color: 'gray', fontSize: 'larger', marginLeft: '10px'}}>  {t("showrows")}: </span>
                <Select
                    notFoundContent={t('notfound')}
                    allowClear={true}
                    showSearch={true}
                    style={{ width: '180px' }}
                    placeholder="Show rows"
                    defaultValue={this.state.paginationPageSize}
                    onChange={this.onPageSizeChanged.bind(this)}
                >
                    {
                        this.state.paginationPageSizes
                            .map((paginationPageSize: string) =>
                                <Select.Option key={paginationPageSize} value={paginationPageSize}>
                                    {paginationPageSize}
                                </Select.Option>)
                    }
                </Select>
                {this.props.useServerFilter &&
                <div style={{marginLeft: '10px', display: 'inline'}}>
                    <span style={{color: 'gray', fontSize: 'larger'}}>  {t("filters")}: </span>
                    <Select
                        //selectedServerFilters
                        notFoundContent={t('notfound')}
                        //allowClear={true}
                        style={{width: '400px'}}
                        showSearch={true}
                        //onSelect={ (e:any) => this.setState({serverFilters: e})}
                        mode="multiple"
                        placeholder="No Filters Selected"
                        defaultValue={defaultFilter}
                    >
                        {
                            this.props.serverFilters !== undefined ?
                                this.props.serverFilters
                                    .map((f: EObject) =>
                                        <Select.Option key={f.get('name')} value={f.get('name')}>
                                            {f.get('name')}
                                        </Select.Option>)
                                :
                                undefined
                        }
                    </Select>
                    <Button title={t('addFilters')} icon="plus" type="primary" style={{ marginLeft: '10px' }} shape="circle" size="default"
                            onClick={() => this.setState({ modalResourceVisible: true })}/>
                    {this.state.modalResourceVisible && <Modal
                        width={'1000px'}
                        title={t('addFilters')}
                        visible={this.state.modalResourceVisible}
                        footer={null}
                        onCancel={this.handleResourceModalCancel}
                    >
                        {
                            this.props.serverFilters
                                ?
                                <ServerFilter serverFilters={this.props.serverFilters}/>
                                :
                                <ServerFilter/>
                        }
                    </Modal>}
                </div>
                }
                {this.props.reportDate &&
                <div style={{marginTop: "10px"}}>
                    <span style={{color: 'gray', fontSize: 'larger'}}>{t("reportdate")}: </span>
                    <DatePicker
                        allowClear={true}
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
                        //pagination //странички
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
                        paginationPageSize={this.state.paginationPageSize}
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
