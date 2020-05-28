import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import '@ag-grid-community/core/dist/styles/ag-theme-fresh.css';
import '@ag-grid-community/core/dist/styles/ag-theme-blue.css';
import '@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css';
import {EObject} from "ecore";
import FetchSpinner from "../../FetchSpinner";
import {Button} from "antd";
import Paginator from "../dataset/Paginator";
import {getAllAttributes, truncate} from "./utils";
import * as _ from "lodash";

const backgroundColor = "#fdfdfd";

interface Props {
    entityType: EObject,
    rowData: any[],
    onSelect: (row: any)=>void
}

class MasterdataGrid extends React.Component<Props&WithTranslation, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            gridOptions: {
                defaultColDef: {
                    resizable: true,
                    filter: true,
                    sortable: true,
                }
            },
            paginationPageSize: 10,
            isGridReady: false,
            themes: [],
            cellStyle: {}
        }
        this.grid = React.createRef();
    }

    getGridData = () => {
        return this.props.rowData.map(value=>
            _.mapValues(value, (v)=>
                typeof v !== "object" ? v : truncate(JSON.stringify(v), 45)))
    }

    onGridReady = (params: any) => {
        if (this.grid && this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    }

    getAttributeFilter = (attribute: EObject): string => {
        if (attribute.get('attributeType').eClass.get('name') === 'PlainType') {
            if (['DATE', 'DATETIME'].includes(attribute.get('attributeType').get('name'))) {
                return 'agDateColumnFilter'
            }
            if (['INTEGER', 'LONG', 'FLOAT', 'DOUBLE', 'DECIMAL'].includes(attribute.get('attributeType').get('name'))) {
                return 'agNumberColumnFilter'
            }
        }
        return 'agTextColumnFilter'
    }

    actionMenu = (params: any) => (
        <Button type="link" onClick={event =>
            this.props.onSelect(this.props.rowData.find(value => value['@rid'] === params.value))}>
            {params.value}
        </Button>
    )

    onPaginationChanged = () => {
        this.setState({ paginationCurrentPage: this.grid.current.api.paginationGetCurrentPage() + 1});
        this.setState({ paginationTotalPage: this.grid.current.api.paginationGetTotalPages()});
        this.setState({isGridReady: true});
    }

    render() {
        const {entityType} = this.props
        const {gridOptions} = this.state;
        return (
            <React.Fragment>
                <FetchSpinner/>
                <div style={{boxSizing: 'border-box', height: 750, width: "99,5%", backgroundColor: backgroundColor}}
                     className={'ag-theme-material'}>
                    <AgGridReact
                        ref={this.grid}
                        rowData={this.getGridData()}
                        modules={AllCommunityModules}
                        rowSelection='multiple' //выделение строки
                        onGridReady={this.onGridReady} //инициализация грида
                        //Выполняет глубокую проверку значений старых и новых данных и подгружает обновленные
                        //rowDataChangeDetectionStrategy={'DeepValueCheck' as ChangeDetectionStrategyType}
                        suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                        suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                        allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                        headerHeight={75} //высота header в px (25 по умолчанию)
                        suppressRowClickSelection //строки не выделяются при нажатии на них
                        pagination={true}
                        suppressPaginationPanel={true}
                        paginationPageSize={this.state.paginationPageSize}
                        onPaginationChanged={this.onPaginationChanged.bind(this)}
                        {...gridOptions}
                    >
                        <AgGridColumn
                            field={'@rid'}
                            cellRendererFramework={this.actionMenu}
                            width={120}
                            //suppressMenu={true}
                        />
                        {getAllAttributes(entityType).map(att =>
                            <AgGridColumn
                                key={att.get('name')}
                                field={att.get('name')}
                                headerName={att.get('caption')}
                                headerTooltip={att.get('caption')}
                                hide={att.get('hide') || false}
                                editable={false}
                                pinned={false}
                                filter={this.getAttributeFilter(att)}
                                checkboxSelection={false}
                                resizable={true}
                                sortable={true}
                                suppressMenu={false}
                                cellStyle={this.state.cellStyle}
                                cellRenderer={function (params: any) {
                                    return params.value;
                                }}
                                autoHeight={true}
                            />
                        )}
                    </AgGridReact>
                </div>
                <div style={{marginLeft: "800px", marginBottom: "20px", float: "right", opacity: this.state.isGridReady ? 1 : 0}}>
                    <Paginator
                        {...this.props}
                        currentPage = {this.state.paginationCurrentPage}
                        totalNumberOfPage = {this.state.paginationTotalPage}
                        paginationPageSize = {this.state.paginationPageSize}
                        grid = {this.grid}
                    />
                </div>

            </React.Fragment>
        )
    }
}

export default withTranslation()(MasterdataGrid)
