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
import _ from 'lodash';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBackward, faSave, faTrash} from "@fortawesome/free-solid-svg-icons";

import './masterdata.css'
import {Button} from "antd";
import clockRefreshIcon from "../../../icons/clockRefreshIcon.svg";
import plusIcon from "../../../icons/plusIcon.svg";

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
        currentRow: null,
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

    loadData = () => {
        const entityType = this.props.entityType as EObject
        const sql = "select * from " + entityType.get('name')
        API.instance().fetchJson("/masterdata/select?sql=" + sql).then(json => {
            this.setState({rowData: json})
            //console.log(json)
        })
    }

    refresh = () => {
        this.setState({rowData: []}, () => this.loadData())
    }

    edit = (rid: string) => {
        const currentIndex = this.state.rowData.findIndex(value => value['@rid'] === rid)
        if (currentIndex >= 0) {
            this.setState({currentRow: _.cloneDeep(this.state.rowData[currentIndex]), currentIndex})
        }
    }

    create = () => {
        const entityType = this.props.entityType as EObject
        const currentRow = {'@class': entityType.get('name')}
        this.setState({currentRow, currentIndex: undefined})
    }

    cancel = () => {
        this.setState({currentRow: null})
    }

    actionMenu = (params: any) => (
        <a onClick={event => this.edit(params.value)}>{params.value}</a>
    )

    getAllThemes = () => {
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

    getAllAttributes = (entityType: EObject): EObject[] => {
        return [
            ...(entityType.get('superTypes') as EObject[]).map(t => this.getAllAttributes(t)).flat(),
            ...entityType.get('attributes').array()
        ]
    }

    getAttributeFilter = (attribute: EObject): string => {
        return 'agTextColumnFilter'
    }

    renderForm() {
        const {t} = this.props
        const {currentRow} = this.state || {}
        return (
            <React.Fragment>
                <div>
                    <Button title={t('cancel')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}} onClick={this.cancel}>
                        <FontAwesomeIcon icon={faBackward} size='lg' color="#7b7979"/>
                    </Button>
                    <div style={{
                        display: 'inline-block',
                        height: '30px',
                        borderLeft: '1px solid rgb(217, 217, 217)',
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginBottom: '-10px',
                        borderRight: '1px solid rgb(217, 217, 217)',
                        width: '6px'
                    }}/>
                    <Button title={t('save')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}} onClick={this.cancel}>
                        <FontAwesomeIcon icon={faSave} size='lg' color="#7b7979"/>
                    </Button>
                    {currentRow!['@rid'] && <Button title={t('save')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}} onClick={this.cancel}>
                        <FontAwesomeIcon icon={faTrash} size='lg' color="red"/>
                    </Button>}
                </div>
            </React.Fragment>
        )
    }

    renderGrid() {
        const {t} = this.props
        const {gridOptions} = this.state;
        const viewObject = this.props.viewObject as EObject
        return (
            <React.Fragment>
                <div>
                    <Button title={t('refresh')} style={{color: 'rgb(151, 151, 151)'}} onClick={this.refresh}>
                        <img style={{width: '24px', height: '24px'}} src={clockRefreshIcon} alt="clockRefreshIcon"/>
                    </Button>
                    <div style={{
                        display: 'inline-block',
                        height: '30px',
                        borderLeft: '1px solid rgb(217, 217, 217)',
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginBottom: '-10px',
                        borderRight: '1px solid rgb(217, 217, 217)',
                        width: '6px'
                    }}/>
                    <Button title={t('create')} style={{color: 'rgb(151, 151, 151)'}} onClick={this.create}>
                        <img style={{width: '24px', height: '24px'}} src={plusIcon} alt="clockRefreshIcon"/>
                    </Button>
                </div>
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
                        headerHeight={75} //высота header в px (25 по умолчанию)
                        suppressRowClickSelection //строки не выделяются при нажатии на них
                        pagination={true}
                        domLayout='autoHeight'
                        paginationPageSize={this.state.paginationPageSize}
                        gridAutoHeight={true}
                        {...gridOptions}
                    >
                        <AgGridColumn
                            field={'@rid'}
                            cellRendererFramework={this.actionMenu}
                            width={120}
                            //suppressMenu={true}
                        />
                        {this.getAllAttributes(viewObject.get('entityType')).map(att =>
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
            </React.Fragment>
        )
    }

    render() {
        return this.state.currentRow ? this.renderForm() : this.renderGrid()
    }
}

export default withTranslation()(MasterdataEditor)