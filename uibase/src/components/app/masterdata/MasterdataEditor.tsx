import React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import '@ag-grid-community/core/dist/styles/ag-theme-fresh.css';
import '@ag-grid-community/core/dist/styles/ag-theme-blue.css';
import '@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css';
import {API} from "../../../modules/api";
import {EObject} from "ecore";
import _ from 'lodash';
import update from 'immutability-helper';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBackward, faSave, faTrash, faClone} from "@fortawesome/free-solid-svg-icons";

import './masterdata.css'
import {Button} from "antd";
import clockRefreshIcon from "../../../icons/clockRefreshIcon.svg";
import plusIcon from "../../../icons/plusIcon.svg";
import MasterdataForm from "./MasterdataForm";
import {truncate} from './utils'
import MasterdataGrid from "./MasterdataGrid";
import {actionType, eventType, grantType} from "../../../utils/consts";

interface Props {
    entityType: EObject,
    onSelect?: ((row: any)=>void),
    hidden?: boolean,
    disabled?: boolean,
    context?: any,
    viewObject?: any,
    grantType?: any
}

class MasterdataEditor extends React.Component<Props&WithTranslation, any> {
    state = {
        entityTypeName: '',
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
        cellStyle: {},
        isHidden: this.props.hidden,
        isDisabled: this.props.disabled,
        isReadOnly: this.props.grantType === grantType.read || this.props.disabled,
    }

    componentDidMount(): void {
        // if (this.state.themes.length === 0) {
        //     this.getAllThemes()
        // }
        this.loadData();
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
            actions: [
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount() {
        this.props.context.removeEventAction()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (this.state.entityTypeName !== this.props.entityType.get('name')) {
            this.setState({entityTypeName: this.props.entityType.get('name'), currentRow: null}, this.loadData)
        }
    }

    loadData = () => {
        const entityType = this.props.entityType as EObject
        const sql = "select * from " + entityType.get('name')
        API.instance().fetchJson("/masterdata/select?sql=" + sql).then(json => {
            this.setState({rowData: json})
        })
    }

    refresh = () => {
        this.setState({rowData: []}, () => this.loadData())
    }

    edit = (rid: string) => {
        const currentIndex = this.state.rowData.findIndex(value => value['@rid'] === rid)
        if (currentIndex >= 0) {
            const currentRow = _.cloneDeep(this.state.rowData[currentIndex])
            this.setState({currentRow})
        }
    }

    create = () => {
        const entityType = this.props.entityType as EObject
        const currentRow = {'@class': entityType.get('name')}
        this.setState({currentRow})
    }

    cancel = () => {
        this.setState({currentRow: null})
    }

    clone = () => {
        this.setState({currentRow: {..._.cloneDeep(this.state.currentRow) as any, '@rid': undefined}})
    }

    save = () => {
        const rid = this.state.currentRow!['@rid']
        if (rid) {
            API.instance().fetchJson("/masterdata/entity?id=" + encodeURIComponent(rid), {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.currentRow)
            }).then(json => {
                const currentIndex = this.state.rowData.findIndex(value => value['@rid'] === rid)
                const rowData = [...this.state.rowData.slice(0, currentIndex), json, ...this.state.rowData.slice(currentIndex + 1)]
                this.setState({rowData, currentRow: json})
            })
        } else {
            API.instance().fetchJson("/masterdata/entity", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.currentRow)
            }).then(json => {
                const rowData = [...this.state.rowData.slice(), json]
                this.setState({rowData, currentRow: json})
            })
        }
    }

    delete = () => {
        const rid = this.state.currentRow!['@rid']
        if (rid) {
            API.instance().fetchJson("/masterdata/entity?id=" + encodeURIComponent(rid), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(json => {
                const currentIndex = this.state.rowData.findIndex(value => value['@rid'] === rid)
                const rowData = [...this.state.rowData.slice(0, currentIndex), ...this.state.rowData.slice(currentIndex + 1)]
                this.setState({rowData, currentRow: null})
            })
        }
    }

    // getAllThemes = () => {
    //     API.instance().findEnum('application', 'Theme')
    //         .then((result: Ecore.EObject[]) => {
    //             let themes = result.map((t: any) => {
    //                 return t.get('name').toLowerCase()
    //             });
    //             this.setState({themes})
    //         })
    // };

    getGridData = () => {
        return this.state.rowData.map(value=>
            _.mapValues(value, (v)=>
                typeof v !== "object" ? v : truncate(JSON.stringify(v), 45)))
    }

    renderForm() {
        const {t} = this.props
        const {currentRow} = this.state
        const entityType = this.props.entityType as EObject
        return (
            <div hidden={this.state.isHidden}>
                <React.Fragment>
                    <div>
                        <Button title={t('cancel')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}}
                                onClick={this.cancel}>
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
                        <Button title={t('save')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}}
                                onClick={this.save}>
                            <FontAwesomeIcon icon={faSave} size='lg' color="#7b7979"/>
                        </Button>
                        {currentRow!['@rid'] &&
                        <Button title={t('clone')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}}
                                onClick={this.clone}>
                            <FontAwesomeIcon icon={faClone} size='lg'/>
                        </Button>}
                        {currentRow!['@rid'] &&
                        <Button title={t('delete')} style={{color: 'rgb(151, 151, 151)', marginTop: '15px'}}
                                onClick={this.delete}>
                            <FontAwesomeIcon icon={faTrash} size='lg' color="red"/>
                        </Button>}
                    </div>
                    <MasterdataForm
                        entityType={entityType}
                        data={currentRow}
                        updateData={(data: Object) => {
                            this.setState({currentRow: update(currentRow || {}, {$merge: data})})
                        }}
                    />
                </React.Fragment>
            </div>
        )
    }

    renderGrid() {
        const {t, onSelect} = this.props
        const {rowData} = this.state;
        const entityType = this.props.entityType as EObject
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
                    {this.state.isDisabled
                        ? <div/>
                        :<Button title={t('create')} style={{color: 'rgb(151, 151, 151)'}} onClick={this.create}>
                        <img style={{width: '24px', height: '24px'}} src={plusIcon} alt="clockRefreshIcon"/>
                    </Button>}
                </div>
                <MasterdataGrid entityType={entityType} rowData={rowData} onSelect={row =>
                    onSelect? onSelect(row) : (this.state.isDisabled ? null : this.edit(row['@rid']))
                }/>
            </React.Fragment>
        )
    }

    render() {
        return this.state.currentRow ? this.renderForm() : this.renderGrid()
    }
}

export default withTranslation()(MasterdataEditor)