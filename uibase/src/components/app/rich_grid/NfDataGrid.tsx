import React, { Component } from 'react';
import {AgGridReact} from '@ag-grid-community/react';
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
import DateComponent from "./DateComponent";
import {ChangeDetectionStrategyType} from "@ag-grid-community/react/lib/changeDetectionService";

interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    columnDefs?: Array<any>,
    rowData?: Array<any>,
    gridOptions?: { [ key:string ]: any }
}

class NfDataGrid extends Component<Props & WithTranslation, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            themes: [
                "ag-theme-balham",
                "ag-theme-material",
                "ag-theme-fresh",
                "ag-theme-blue",
                "ag-theme-bootstrap"
            ],
            theme: "ag-theme-balham",
            rowCount: null
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

        this.calculateRowCount();
    };

    calculateRowCount = () => {
        if (this.grid.current.api && this.state.rowData) {
            const model = this.grid.current.api.getModel();
            const totalRows = this.state.rowData.length;
            const processedRows = model.getRowCount();
            this.setState({
                rowCount: processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString()
            });
        }
    };

    render() {
        const { columnDefs, rowData, gridOptions, t } = this.props

        return (
            <div
                onKeyDown={this.handleKeyDown}
                style={{ boxSizing: 'border-box', height: '100%', width: '100%' }}
                className={this.state.theme}
            >
                <Select
                    notFoundContent={t('notfound')}
                    allowClear={true}
                    showSearch={true}
                    style={{ width: '180px' }}
                    autoFocus
                    placeholder="Theme"
                    onSelect={ (e:string) => this.setState({theme: e})}
                    defaultValue={"ag-theme-balham"}
                >
                    {
                        this.state.themes
                            .map((theme: string) =>
                                <Select.Option key={theme} value={theme}>
                                    {theme}
                                </Select.Option>)
                    }
                </Select>
                <div style={{marginTop: "30px"}}>
                    <AgGridReact
                        ref={this.grid}
                        columnDefs={columnDefs}
                        rowData={rowData}
                        modules={AllCommunityModules}
                        pagination //странички
                        rowSelection="multiple" //выделение строки
                        onGridReady={this.onGridReady} //инициализация грида
                       //Выполняет глубокую проверку значений старых и новых данных и подгружает обновленные
                        rowDataChangeDetectionStrategy={'DeepValueCheck' as ChangeDetectionStrategyType}
                        suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                        suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                        allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                        headerHeight={40} //высота header в px (25 по умолчанию)
                        suppressRowClickSelection //строки не выделяются при нажатии на них

                        dateComponentFramework={DateComponent} // setting grid wide date component

                        enableColResize={true}
                        // //pivotHeaderHeight={true}
                        enableSorting={true}
                        // //sortingOrder={["desc", "asc", null]}
                        enableFilter={true}
                        gridAutoHeight={true}
                        {...gridOptions}
                    />
                </div>
            </div>
        )
    }
}

export default withTranslation()(NfDataGrid)
