import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import {AllCommunityModules} from "@ag-grid-community/all-modules";
import {Button} from "antd";

interface Props {
}

class DatasetPivot extends React.Component<any, any>  {

        private grid: React.RefObject<any>;

        constructor(props: any) {
            super(props);

            this.state = {
                columnDefs: [
                    { headerName: "Make", field: "make" },
                    { headerName: "Model", field: "model" },
                    { headerName: "Price", field: "price" }],
                rowData: [
                    { make: "Toyota", model: "Celica", price: 35000 },
                    { make: "Ford", model: "Mondeo", price: 32000 },
                    { make: "Porsche", model: "Boxter", price: 72000 }],
                currentStyle: 1,
                cellStyle: function(params: any) {
                    if (Number(params.value) === 35000) {
                        return { background: 'red' }
                    }
                }
            };
        this.grid = React.createRef()
    }

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    };

    CLICK = () => {
        const one = function(params: any) {
            if (Number(params.value) === 35000) {
                return { background: 'red' }
            }
        }
        const two = function(params: any) {
            if (Number(params.value) === 35000) {
                return { background: 'grey' }
            }
        }
        this.state.currentStyle === 0 ? this.setState({
            currentStyle: 1,
                cellStyle: one
        }) :
            this.setState({
                currentStyle: 0,
                cellStyle: two
            })

    };

    render() {
        const {gridOptions} = this.state;
        return (
            <div className="ag-theme-material" style={ {height: '800px', width: '1200px'} }>
                <AgGridReact
                    ref={this.grid}
                    rowData={this.state.rowData}
                    modules={AllCommunityModules}
                    onGridReady={this.onGridReady} //инициализация грида
                    {...gridOptions}
                >
                    {this.state.columnDefs.map((col: any) =>
                        <AgGridColumn
                            headerName={col['headerName']}
                            field={col['field']}
                            cellStyle = {this.state.cellStyle}
                        />
                    )}
                </AgGridReact>
                <Button onClick={this.CLICK}>CLICK</Button>
            </div>
        );
    }
}

export default (DatasetPivot)
