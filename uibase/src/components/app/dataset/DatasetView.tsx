import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilter, faSync} from '@fortawesome/free-solid-svg-icons';
import {Button, DatePicker, Drawer, Select} from 'antd';
import ServerFilter from './ServerFilter';
import moment from 'moment';
import {operationsMapper} from '../../../utils/consts';

const operationsMapper_: any = operationsMapper;

const { Option, OptGroup } = Select;

interface Props {
}

interface State {
    allDatasetComponents: any[];
    currentDatasetComponent: Ecore.Resource;
    columnDefs: any[];
    rowData: any[];
    serverFilters: any[];
    useServerFilter: boolean;
    datasetComponentsData: any;
    allOperations: any[];
    updateData: boolean;
    filtersMenuVisible: boolean;
}

class DatasetView extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            allDatasetComponents: [],
            currentDatasetComponent: {} as Ecore.Resource,
            columnDefs: [],
            rowData: [],
            serverFilters: [],
            useServerFilter: false,
            datasetComponentsData: undefined,
            allOperations: [],
            updateData: false,
            filtersMenuVisible: false
        }
    }

    getAllDatasetComponents(findColumn: boolean) {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === '//DatasetComponent')
            let allDatasetComponents: any[] = [];
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((result: Ecore.Resource[]) => {
                        const userComponentName = this.props.context.userProfile.get('params').array()
                            .filter( (p: any) => p.get('key') === this.props.viewObject._id);
                        const currentDatasetComponent = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
                            result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'))
                            : result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === JSON.parse(userComponentName[0].get('value'))['name'])
                        if (currentDatasetComponent) {
                            this.setState({currentDatasetComponent})
                            if (findColumn) {this.findColumnDefs(currentDatasetComponent)}
                        }
                        result.forEach( (d: Ecore.Resource) => {
                            if (d.eContents()[0].get('dataset').get('name') === this.props.viewObject.get('dataset').get('name')) {
                                if (this.props.context.userProfile.get('userName') === 'admin') {
                                    allDatasetComponents.push(d)
                                }
                                else if (this.props.viewObject.get('datasetComponent').get('audit') !== null && this.props.context.userProfile.get('userName') === this.props.viewObject.get('datasetComponent').get('audit').get('createdBy')) {
                                    allDatasetComponents.push(d)
                                }
                                else if (this.props.viewObject.get('datasetComponent').get('access') === 'Default' || this.props.viewObject.get('datasetComponent').get('access') === 'Public') {
                                    allDatasetComponents.push(d)
                                }
                            }
                        });
                        if (allDatasetComponents.length !== 0) {
                            this.setState({allDatasetComponents})
                        }
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
        this.updateContext(columnDefs, undefined, resource.eContents()[0].get('name'))
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
        this.runQuery(resource/*this.state.currentDatasetComponent*/, true, serverFilters);
    }

    componentDidUpdate(prevProps: any): void {
        if (this.state.currentDatasetComponent.rev !== undefined) {
            let refresh = this.props.context.userProfile.eResource().to().params
                .find( (p: any) => JSON.parse(p.value).name === this.state.currentDatasetComponent.eResource().to().name)
            if (prevProps.location.pathname !== this.props.location.pathname) {
                this.findServerFilters(this.state.currentDatasetComponent, this.state.columnDefs);
            }
            else if (refresh === undefined || refresh.length === 0) {
                this.getAllDatasetComponents(false)
            }
        }
    }

    private runQuery(resource: Ecore.Resource, updateData: boolean, componentParams: Object[]) {
        if (updateData) {
            this.props.context.runQuery(resource, componentParams)
                .then((result: string) => {
                    this.props.context.notification('Filters notification','Request completed', 'success')
                    this.setState({rowData: JSON.parse(result)});
                        this.updateContext(undefined, JSON.parse(result), this.state.currentDatasetComponent.eContents()[0].get('name'))
                    }
                )
        }
    }

    componentDidMount(): void {
        if (this.state.allDatasetComponents.length === 0) {this.getAllDatasetComponents(true)}
        if (this.state.allOperations.length === 0) {this.getAllOperations()}
    }

    componentWillUnmount() {
        this.props.context.updateContext({datasetComponents: undefined})
    }

    updateContext(columnDefs: any, rowData: any, datasetComponentName: string){
        let currentDataset = {
            [datasetComponentName] : {
                columnDefs: columnDefs ? columnDefs : this.state.columnDefs.length !== 0 ? this.state.columnDefs : [],
                rowData: rowData ? rowData : this.state.rowData.length !== 0 ? this.state.rowData : []
            }
        };
        if (this.props.context.datasetComponents) {
            let datasetComponents = this.props.context.datasetComponents;
            datasetComponents[datasetComponentName] = {
                columnDefs: columnDefs ? columnDefs : this.state.columnDefs.length !== 0 ? this.state.columnDefs : [],
                rowData: rowData ? rowData : this.state.rowData.length !== 0 ? this.state.rowData : []
            };
                this.props.context.updateContext({datasetComponents: datasetComponents})

        } else {
            this.props.context.updateContext({datasetComponents: currentDataset})
        }
    }

    handleFiltersMenu = () => {
        this.state.filtersMenuVisible ? this.setState({ filtersMenuVisible: false }) : this.setState({ filtersMenuVisible: true })
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

    onChangeServerFilter = (newServerFilter: any[], updateData: boolean): void => {
        this.setState({serverFilters: newServerFilter});
        this.runQuery(this.state.currentDatasetComponent, updateData, newServerFilter);
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

    saveResource = (currentDatasetComponent: EObject) => {
        this.props.viewObject.set('datasetComponent', currentDatasetComponent.eContents()[0])
        API.instance().saveResource(this.props.viewObject.eResource(), 99999)
            .then((newResource: Ecore.Resource) => {
                const newResourceSet: Ecore.ResourceSet = newResource.eContainer as Ecore.ResourceSet
                const newViewObject: Ecore.EObject[] = newResourceSet.elements()
                    .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                    .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                    .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
                this.props.context.updateContext!(({viewObject: newViewObject[0]}))


                let allDatasetComponents: any[] = [];
                this.state.allDatasetComponents.forEach( (d: Ecore.Resource) => {
                    if (d.eContents()[0].get('name') === newViewObject[0].get('name')) {
                        allDatasetComponents.push(newResource)
                    }
                    else {
                        allDatasetComponents.push(d)
                    }
                });
                if (allDatasetComponents.length !== 0) {
                    this.setState({allDatasetComponents})
                }
            })};

    handleChange(e: any): void {
        let params: any = {name: e}
        this.props.context.changeUserProfile(this.props.viewObject._id, params);
        let currentDatasetComponent: Ecore.Resource[] = this.state.allDatasetComponents
            .filter((c: any) => c.eContents()[0].get('name') === e)
        this.setState({currentDatasetComponent: currentDatasetComponent[0]})
        this.findColumnDefs(currentDatasetComponent[0]);
    }

    refresh(currentDatasetComponent: Ecore.Resource) {
        this.findColumnDefs(currentDatasetComponent)
    }

    render() {
        const { t } = this.props;
        const filtersBtn = (
            <Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}
            onClick={this.handleFiltersMenu}
            >
                <FontAwesomeIcon icon={faFilter} size='xs'/>
            </Button>);
        const filtersModal = (
            <Drawer
                placement='right'
                title={t('filters')}
                width={'700px'}
                visible={this.state.filtersMenuVisible}
                onClose={this.handleFiltersMenu}
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
                {
                    this.state.allDatasetComponents.length !== 0 &&
                    <div style={{display: 'inline-block'}}>
                        <Select
                            style={{ width: '250px'}}
                            showSearch={true}
                            allowClear={true}
                            value={this.state.currentDatasetComponent.eContents()[0].get('name')}
                            onChange={(e: any) => {
                                this.handleChange(e)
                            }}
                        >
                            <OptGroup label='Default'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') === 'Default')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                            <OptGroup label='Private'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') === 'Private')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                            <OptGroup label='Public'>
                                {
                                    this.state.allDatasetComponents
                                        .filter((c: any) => c.eContents()[0].get('access') !== 'Private' && c.eContents()[0].get('access') !== 'Default')
                                        .map( (c: any) =>
                                            <Option
                                                key={c.eContents()[0].get('name')}
                                                value={c.eContents()[0].get('name')}>
                                                {c.eContents()[0].get('name')}
                                            </Option>)
                                }
                            </OptGroup>
                        </Select>
                    </div>
                }
                <Button title={t('refresh')} style={{color: 'rgb(151, 151, 151)', marginLeft: '10px'}}
                        onClick={ ()=>this.refresh(this.state.currentDatasetComponent)}>
                    <FontAwesomeIcon icon={faSync} size='xs'/>
                </Button>
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                {filtersBtn}
                {filtersModal}
                {
                    this.state.serverFilters !== undefined && this.state.useServerFilter &&
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
                                            onChange={(e: any) => this.updateTableData(e)}
                                        />
                                    </div>
                                    :
                                    f['operation'].includes('Null')
                                        ?
                                        <Select
                                            key={`${f['datasetColumn']} ${operationsMapper_[f['operation']]}`}
                                            defaultValue={`${f['datasetColumn']} ${operationsMapper_[f['operation']]}`}
                                            style={{width: 'auto', marginLeft: '10px'}}
                                            allowClear={true}
                                            showArrow={false}
                                            onChange={() => this.changeEnableServerFilters(f)}
                                        >
                                        </Select>
                                        :
                                        f['value']
                                            ?
                                            <Select
                                                key={`${f['datasetColumn']} ${operationsMapper_[f['operation']]} ${f['value']}`}
                                                defaultValue={`${f['datasetColumn']} ${operationsMapper_[f['operation']]} ${f['value']}`}
                                                style={{width: 'auto', marginLeft: '10px'}}
                                                allowClear={true}
                                                showArrow={false}
                                                onChange={() => this.changeEnableServerFilters(f)}
                                            >
                                            </Select>
                                            :
                                            <div/>
                            )
                        }
                </div>
                }
            </div>
        )
    }
}

export default withTranslation()(DatasetView)
