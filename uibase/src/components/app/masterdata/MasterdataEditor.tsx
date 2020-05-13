import React from 'react';
import {withTranslation} from "react-i18next";
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import '@ag-grid-community/core/dist/styles/ag-theme-fresh.css';
import '@ag-grid-community/core/dist/styles/ag-theme-blue.css';
import '@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css';
import {API} from "../../../modules/api";
import Ecore, {EObject} from "ecore";

const backgroundColor = "#fdfdfd";

class MasterdataEditor extends React.Component<any, any> {
    private grid: React.RefObject<any>;
    state = {
        gridOptions: {
            defaultColDef: {
                resizable: true,
                filter: true,
                sortable: true,
            }
        },
        rowData: [],
        paginationPageSize: 20,
        currentTheme: 'material',
        themes: [],
        cellStyle: {}
    }

    componentDidMount(): void {
        if (this.state.themes.length === 0) {
            this.getAllThemes()
        }
        this.loadData()

    }

    loadData() {
        const viewObject = this.props.viewObject as EObject
        const sql = "select * from " + viewObject.get('entityType').get('name')
        API.instance().fetchJson("/masterdata/select?sql=" + sql).then(json => {
            this.setState({rowData: json})
            console.log(json)
        })
    }

    getAllThemes() {
        API.instance().findEnum('application', 'Theme')
            .then((result: Ecore.EObject[]) => {
                let themes = result.map((t: any) => {
                    return t.get('name').toLowerCase()
                });
                this.setState({themes})
            })
    };

    onGridReady = (params: any) => {
        if (this.grid && this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    }

    getAllAttributes(entityType: EObject): EObject[] {
        return [
            ...(entityType.get('superTypes') as EObject[]).map(t => this.getAllAttributes(t)).flat(),
            ...entityType.get('attributes').array()
        ]
    }

    getAttributeFilter(attribute: EObject): string {
        return 'agTextColumnFilter'
    }

    render() {
        const {gridOptions} = this.state;
        const viewObject = this.props.viewObject as EObject
        return (
            <div style={{boxSizing: 'border-box', height: '100%', backgroundColor: backgroundColor}}
                 className={'ag-theme-' + this.state.currentTheme}>
                <AgGridReact
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
                    paginationPageSize={this.state.paginationPageSize}
                    {...gridOptions}
                >
                    {this.getAllAttributes(viewObject.get('entityType')).map(att => <AgGridColumn
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
                    />)}
                </AgGridReact>
            </div>
        )
    }
}

export default withTranslation()(MasterdataEditor)