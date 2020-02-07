import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilter} from '@fortawesome/free-solid-svg-icons';
import {Button, DatePicker, Drawer, Select} from 'antd';
import ServerFilter from './ServerFilter';
import moment from 'moment';
import {operationsMapper} from '../../../utils/consts';

const operationsMapper_: any = operationsMapper;

const Option = Select.Option;

interface Props {
}

interface State {
    allDatasetComponents: Ecore.Resource[];
    currentDatasetComponent: Ecore.Resource;
    columnDefs: any[];
    rowData: any[];
    queryCount: number;
    serverFilters: any[];
    useServerFilter: boolean;
    datasetComponentsData: any;
    modalResourceVisible: boolean;
    allOperations: any[];
}

class DatasetView extends React.Component<any, State> {

    state = {
        allDatasetComponents: [],
        currentDatasetComponent: {} as Ecore.Resource,
        columnDefs: [],
        rowData: [],
        queryCount: 0,
        serverFilters: [],
        useServerFilter: false,
        datasetComponentsData: undefined,
        modalResourceVisible: false,
        allOperations: []
    };

    getAllDatasetComponents() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === '//DatasetComponent')
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((allDatasetComponents: Ecore.Resource[]) => {
                        this.setState({allDatasetComponents})
                    })
            }
        })
    };

    getAllOperations() {
        API.instance().findEnum('application', 'Operations')
            .then((result: EObject[]) => {
                let allOperations = result.map( (o: any) => {return o});
                this.setState({allOperations})
            })
    };

    findColumnDefs(resource: Ecore.Resource){
        this.setState({queryCount: 2});
        let columnDefs: any = [];
        resource.eContents()[0].get('column')._internal.forEach( (c: Ecore.Resource) => {
            let rowData = new Map();
            rowData.set('field', c.get('name'));
            rowData.set('headerName', c.get('headerName').get('name'));
            rowData.set('headerTooltip', c.get('headerTooltip'));
            rowData.set('hide', c.get('hide'));
            rowData.set('pinned', c.get('pinned'));
            rowData.set('filter', c.get('filter'));
            rowData.set('sort', c.get('sort'));
            rowData.set('editable', c.get('editable'));
            rowData.set('checkboxSelection', c.get('checkboxSelection'));
            rowData.set('sortable', c.get('sortable'));
            rowData.set('suppressMenu', c.get('suppressMenu'));
            rowData.set('resizable', c.get('resizable'));
            rowData.set('type', c.get('datasetColumn').get('convertDataType'));
            columnDefs.push(rowData);
        });
        this.setState({columnDefs});
        this.findServerFilters(resource as Ecore.Resource, columnDefs);
        this.updateContext(columnDefs, undefined)
    }

    findServerFilters(resource: Ecore.Resource, columnDefs: Object[]){
        let serverFilters: any = [];
        const params = this.props.pathFull[this.props.pathFull.length - 1].params;
        if (params.length !== 0) {
            params.forEach( (f: any) => {
                if (f) {
                    columnDefs.forEach( (c: any) => {
                        if (c.get('field').toLowerCase() === f.datasetColumn.toLowerCase()) {
                            serverFilters.push({
                                index: serverFilters.length + 1,
                                datasetColumn: f.datasetColumn,
                                operation: f.operation,
                                value: f.value,
                                enable: (f.enable !== null ? f.enable : false),
                                type: f.type
                            })
                        }
                    })
                }
            })
        }
        resource.eContents()[0].get('serverFilter').array().forEach( (f: Ecore.Resource) => {
            if (serverFilters.filter( (filter: any) =>
                filter['datasetColumn'] === f.get('datasetColumn').get('name') &&
                filter['operation'] === f.get('operation') &&
                filter['value'] === f.get('value') &&
                filter['enable'] === (f.get('enable') !== null ? f.get('enable') : false)
            ).length === 0) {
                serverFilters.push({
                    index: serverFilters.length + 1,
                    datasetColumn: f.get('datasetColumn').get('name'),
                    operation: f.get('operation'),
                    value: f.get('value'),
                    enable: (f.get('enable') !== null ? f.get('enable') : false),
                    type: f.get('datasetColumn').get('convertDataType')
                })
            }
        });
        if (serverFilters.length < 9) {
            for (let i = serverFilters.length + 1; i <= 9; i++) {
                serverFilters.push(
                    {index: i,
                        datasetColumn: undefined,
                        operation: undefined,
                        value: undefined,
                        enable: undefined,
                        type: undefined})
            }
        } else {
            serverFilters.push(
                {index: serverFilters.length + 1,
                    datasetColumn: undefined,
                    operation: undefined,
                    value: undefined,
                    enable: undefined,
                    type: undefined})
        }
        this.setState({serverFilters, useServerFilter: resource.eContents()[0].get('useServerFilter') || false});
    }

    componentDidUpdate(prevProps: any): void {
        if (this.state.allDatasetComponents) {
            let resource = this.state.allDatasetComponents.find( (d:Ecore.Resource) =>
                d.eContents()[0].get('dataset').get('name') === this.props.viewObject.get('dataset').get('name'));
            if (resource) {
                if (this.state.queryCount === 0) {
                    this.setState({currentDatasetComponent: resource});
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) =>  {
                            this.setState({rowData: JSON.parse(result)})
                                this.updateContext(undefined, JSON.parse(result))
                        }
                        )
                }
                if (this.state.queryCount < 2) {
                    this.findColumnDefs(resource as Ecore.Resource);
                }
                if (prevProps.location.pathname !== this.props.location.pathname) {
                    this.findServerFilters(resource as Ecore.Resource, this.state.columnDefs);
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) => {
                                this.setState({rowData: JSON.parse(result)})
                                this.updateContext(undefined, JSON.parse(result))
                            }
                        )
                }
            }
        }
    }

    componentDidMount(): void {
        if (this.state.allDatasetComponents.length === 0) {this.getAllDatasetComponents()}
        if (this.state.allOperations.length === 0) {this.getAllOperations()}
    }

    componentWillUnmount() {
        this.props.context.updateContext({datasetComponents: undefined})
    }

    updateContext(columnDefs: any, rowData: any){
        const datasetComponentName: string = this.props.viewObject.get('datasetComponent').get('name');
        let currentDataset = {
            [datasetComponentName] : {
                columnDefs: this.state.columnDefs.length !== 0 ? this.state.columnDefs : columnDefs,
                rowData: this.state.rowData.length !== 0 ? this.state.rowData : rowData,
            }
        };
        if (this.props.context.datasetComponents) {
            let datasetComponents = this.props.context.datasetComponents
            datasetComponents[datasetComponentName] = {
                columnDefs: this.state.columnDefs.length !== 0 ? this.state.columnDefs : columnDefs,
                rowData: this.state.rowData.length !== 0 ? this.state.rowData : rowData,
            };
                this.props.context.updateContext({datasetComponents: datasetComponents})

        } else {
            this.props.context.updateContext({datasetComponents: currentDataset})
        }
    }

    handleFilterModal = () => {
        this.state.modalResourceVisible
            ?
            this.setState({ modalResourceVisible: false })
            :
            this.setState({ modalResourceVisible: true })
    };

    updateTableData(e: any): void  {
        if (e !== null) {
            let params: Object[] = [{
                datasetColumn: 'reportDate',
                operation: 'EqualTo',
                value: e._d,
                enable: true,
                type: 'Date'
            }];
            this.props.context.changeURL!(this.props.pathFull[this.props.pathFull.length - 1].appModule, undefined, params)
        }
    }

    onChangeServerFilter = (newServerFilter: any[]): void => {
        this.setState({serverFilters: newServerFilter})
    };

    changeEnableServerFilters(filter: any): void {
        const serverFilters = this.state.serverFilters
            .map( (f: any) => {
                if (filter['datasetColumn'] === f['datasetColumn']
                    && filter['operation'] === f['operation']
                    && filter['value'] === f['value']) {
                    return {
                        index: f['index'],
                        datasetColumn: f['datasetColumn'],
                        operation: f['operation'],
                        value: f['value'],
                        enable: false,
                        type: f['type']
                    }
                }
                else {
                    return f
                }
        });
        this.setState({serverFilters})
    }

    render() {
        const { t } = this.props;
        let filtersBtn = (
            <Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}
            onClick={this.handleFilterModal}
            >
                <FontAwesomeIcon icon={faFilter} size='xs'/>
            </Button>);
        let filtersModal = (
            <Drawer
                placement='right'
                title={t('filters')}
                width={'700px'}
                visible={this.state.modalResourceVisible}
                onClose={this.handleFilterModal}
                mask={false}
                maskClosable={false}
            >
                {
                    this.state.serverFilters
                        ?
                        <ServerFilter
                            {...this.props}
                            serverFilters={this.state.serverFilters}
                            columnDefs={this.state.columnDefs}
                            allOperations={this.state.allOperations}
                            onChangeServerFilter={this.onChangeServerFilter}

                        />
                        :
                        <ServerFilter/>
                }
            </Drawer>
        );
        return (
            <div>
                {filtersBtn}
                {filtersModal}
                {this.state.useServerFilter &&
                <div style={{display: 'inline-block'}}>
                    {this.state.serverFilters
                        .filter((f: any) => f['enable'] === true && f['operation'] && f['datasetColumn'])
                        .map((f: any) =>
                            f.type === 'Date' || f.type === 'Timestamp'
                                ?
                                <div style={{marginLeft: '10px', width: 'auto', display: 'inline-block'}}>
                                    <span style={{color: 'gray'}}>{f.datasetColumn}: </span>
                                    <DatePicker
                                        defaultValue={moment(f.value)}
                                        format={'DD.MM.YYYY'}
                                        onChange={ (e: any) => this.updateTableData(e)}
                                    />
                                </div>
                                 :
                                f['operation'].includes('Null')
                                    ?
                                    <Select
                                        key={`${f['datasetColumn']} ${operationsMapper_[f['operation']]}`}
                                        defaultValue={`${f['datasetColumn']} ${operationsMapper_[f['operation']]}`}
                                        style={{ width: 'auto', marginLeft: '10px' }}
                                        allowClear={true}
                                        showArrow={false}
                                        onChange={ () => this.changeEnableServerFilters(f) }
                                    >
                                    </Select>
                                    :
                                    <Select
                                        key={`${f['datasetColumn']} ${operationsMapper_[f['operation']]} ${f['value']}`}
                                        defaultValue={`${f['datasetColumn']} ${operationsMapper_[f['operation']]} ${f['value']}`}
                                        style={{ width: 'auto', marginLeft: '10px' }}
                                        allowClear={true}
                                        showArrow={false}
                                        onChange={ () => this.changeEnableServerFilters(f) }
                                    >
                                    </Select>
                        )
                    }
                </div>
                }
            </div>
        )
    }
}

export default withTranslation()(DatasetView)
