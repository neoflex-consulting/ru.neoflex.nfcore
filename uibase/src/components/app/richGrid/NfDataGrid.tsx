import React, { Component } from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";
import "@ag-grid-community/core/dist/styles/ag-theme-material.css";
import "@ag-grid-community/core/dist/styles/ag-theme-fresh.css";
import "@ag-grid-community/core/dist/styles/ag-theme-blue.css";
import "@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css";
import { copyIntoClipboard } from '../../../utils/clipboard';
import {Select} from "antd";
import {WithTranslation, withTranslation} from "react-i18next";
import './../../../styles/RichGrid.css';
import {EObject} from "ecore";

interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    columnDefs?: Array<any>,
    rowData?: Array<any>,
    gridOptions?: { [ key:string ]: any },
    serverFilters:  Array<EObject>
}

class NfDataGrid extends Component<Props & WithTranslation, any> {

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
            paginationPageSize: 10,
            selectedServerFilters: []
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

    render() {
        const { columnDefs, rowData, gridOptions, t } = this.props
         return (
            <div
                onKeyDown={this.handleKeyDown}
                style={{ boxSizing: 'border-box', height: '100%', width: '100%' }}
                className={"ag-theme-" + this.state.theme}
            >
                <Select
                    notFoundContent={t('notfound')}
                    allowClear={true}
                    showSearch={true}
                    style={{ width: '180px', marginLeft: '10px' }}
                    onSelect={ (e:string) => this.setState({theme: e})}
                    defaultValue={"Theme: " + this.state.themes[0]}
                >
                    {
                        this.state.themes
                            .map((theme: string) =>
                                <Select.Option key={theme} value={theme}>
                                    {"Theme: " + theme}
                                </Select.Option>)
                    }
                </Select>
                <Select
                    notFoundContent={t('notfound')}
                    allowClear={true}
                    showSearch={true}
                    style={{ width: '180px', marginLeft: '10px' }}
                    placeholder="Show rows"
                    defaultValue={"Show rows: " + this.state.paginationPageSize}
                    onChange={this.onPageSizeChanged.bind(this)}
                >
                    {
                        this.state.paginationPageSizes
                            .map((paginationPageSize: string) =>
                                <Select.Option key={paginationPageSize} value={paginationPageSize}>
                                    {"Show rows: " + paginationPageSize}
                                </Select.Option>)
                    }
                </Select>
                <Select

                    //selectedServerFilters
                    notFoundContent={t('notfound')}
                    //allowClear={true}
                    showSearch={true}
                    style={{ width: '400px', marginLeft: '10px' }}
                    //onSelect={ (e:any) => this.setState({serverFilters: e})}
                    mode="multiple"
                    defaultValue={
                        this.props.serverFilters
                            .filter((f: EObject) => f.get('enable') === true)
                            .map((f: EObject) =>
                                f.get('name'))

                    }
                >
                    {
                        this.props.serverFilters
                            .map((f: EObject) =>
                                <Select.Option key={f.get('name')} value={f.get('name')}>
                                    {f.get('name')}
                                </Select.Option>)
                    }
                </Select>
                <div style={{ marginTop: "30px", marginLeft: '10px'}}>
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


                        enableColResize={true}
                        // //pivotHeaderHeight={true}
                        enableSorting={true}
                        // //sortingOrder={["desc", "asc", null]}
                        enableFilter={true}
                        gridAutoHeight={true}
                        {...gridOptions}
                        paginationPageSize={this.state.paginationPageSize}
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
