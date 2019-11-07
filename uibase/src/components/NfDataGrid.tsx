import React, { Component } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import { copyIntoClipboard } from './../utils/clipboard.js';

interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    columnDefs?: Array<any>, 
    rowData?: Array<any>, 
    gridOptions?: { [ key:string ]: any }
}

class NfDataGrid extends Component<Props, {}> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);
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

    render() {
        const { columnDefs, rowData, gridOptions } = this.props

        return (
            <div
                onKeyDown={this.handleKeyDown}
                style={{ boxSizing: 'border-box', height: '100%', width: '100%' }}
                className="ag-theme-balham"
            >
                <AgGridReact
                    ref={this.grid}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    enableColResize={true}
                    //pivotHeaderHeight={true}
                    enableSorting={true}
                    //sortingOrder={["desc", "asc", null]}
                    enableFilter={true}
                    gridAutoHeight={true}
                    {...gridOptions}
                />
            </div>
        )
    }
}

export default NfDataGrid;
