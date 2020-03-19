import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {API} from '../../../modules/api';
import Ecore, {EObject} from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFilter, faSync} from '@fortawesome/free-solid-svg-icons';
import {Button, Drawer, Select} from 'antd';
import ServerFilter from './ServerFilter';

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
                        let currentDatasetComponent = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
                            result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'))
                            : result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === JSON.parse(userComponentName[0].get('value'))['name'])
                        if (currentDatasetComponent === undefined) {
                            currentDatasetComponent = result.find( (d: Ecore.Resource) => d.eContents()[0].get('name') === this.props.viewObject.get('datasetComponent').get('name'))
                            this.props.context.changeUserProfile(this.props.viewObject._id, undefined)
                        }
                        if (currentDatasetComponent) {
                            this.setState({currentDatasetComponent})
                            if (findColumn) {this.findColumnDefs(currentDatasetComponent)}
                        }
                        result.forEach( (d: Ecore.Resource) => {
                            if (d.eContents()[0].get('dataset')) {
                                if (d.eContents()[0].get('dataset').get('name') === this.props.viewObject.get('dataset').get('name')) {
                                    if (this.props.context.userProfile.get('userName') === 'admin' || this.props.context.userProfile.get('userName') === 'anna') {
                                        allDatasetComponents.push(d)
                                    }
                                    else if (this.props.context.userProfile.get('userName') === this.props.viewObject.get('datasetComponent').get('owner').get('name')) {
                                        allDatasetComponents.push(d)
                                    }
                                    else if (this.props.viewObject.get('datasetComponent').get('access') === 'Default' || this.props.viewObject.get('datasetComponent').get('access') === null) {
                                        allDatasetComponents.push(d)
                                    }
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
        API.instance().findEnum('dataset', 'Operations')
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
        this.updatedDatasetComponents(columnDefs, undefined, resource.eContents()[0].get('name'))
    }

    findServerFilters(resource: Ecore.Resource, columnDefs: Object[]){
        let serverFilters: any = [];
        const userProfileValue = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === resource.eContents()[0]._id);
        if (userProfileValue.length !== 0) {
            let userProfileServerFilters = JSON.parse(userProfileValue[0].get('value')).serverFilters
            userProfileServerFilters.forEach((f: any, index: any) =>
                serverFilters.push({
                    index: serverFilters.length + 1,
                    datasetColumn: f.datasetColumn,
                    operation: f.operation || 'EqualTo',
                    value: f.value,
                    enable: (f.enable !== null ? f.enable : false),
                    type: f.type
                })
            )
        }
        else {
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
                        operation: f.get('operation') || 'EqualTo',
                        value: f.get('value'),
                        enable: (f.get('enable') !== null ? f.get('enable') : false),
                        type: f.get('datasetColumn').get('convertDataType')
                    })
                }
            });
        }
        const params = this.props.pathFull[this.props.pathFull.length - 1].params;
        if (params !== undefined && params.length !== 0) {
            params.forEach( (f: any) => {
                if (f) {
                    columnDefs.forEach( (c: any) => {
                        if (c.get('field').toLowerCase() === f.datasetColumn.toLowerCase()) {
                            serverFilters.push({
                                index: serverFilters.length + 1,
                                datasetColumn: f.datasetColumn,
                                operation: f.operation || 'EqualTo',
                                value: f.value,
                                enable: (f.enable !== null ? f.enable : false),
                                type: f.type
                            })
                        }
                    })
                }
            })
        }
        serverFilters.push(
            {index: serverFilters.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                value: undefined,
                enable: undefined,
                type: undefined});
        this.setState({serverFilters, useServerFilter: resource.eContents()[0].get('useServerFilter') || false});
        this.runQuery(resource, serverFilters);
    }

    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.state.currentDatasetComponent.rev !== undefined) {
            let refresh = this.props.context.userProfile.eResource().to().params !== undefined ?
                this.props.context.userProfile.eResource().to().params
                .find( (p: any) => JSON.parse(p.value).name === this.state.currentDatasetComponent.eResource().to().name)
                : undefined;
            if (prevProps.location.pathname !== this.props.location.pathname) {
                this.findServerFilters(this.state.currentDatasetComponent, this.state.columnDefs);
            }
            else if ((refresh === undefined || refresh.length === 0) &&
                this.props.viewObject.get('datasetComponent').get('name') !== this.state.currentDatasetComponent.eContents()[0].get('name') &&
                this.props.context.userProfile.eResource().to().params !== undefined) {
                this.getAllDatasetComponents(false)
            }
            else if (prevState.allDatasetComponents.length !== 0 &&
                this.props.viewObject.get('datasetComponent').get('name') === this.state.currentDatasetComponent.eContents()[0].get('name')
                && JSON.stringify(this.props.viewObject.get('datasetComponent').eResource().to()) !== JSON.stringify(this.state.currentDatasetComponent.to())
            ) {
                this.getAllDatasetComponents(false)
            }
        }
    }

    private runQuery(resource: Ecore.Resource, componentParams: Object[]) {
        const datasetComponentName = resource.eContents()[0].get('name');
        this.props.context.runQuery(resource, componentParams)
            .then((result: string) => {
                this.setState({rowData: JSON.parse(result)});
                this.updatedDatasetComponents(undefined, JSON.parse(result), datasetComponentName)
            });
    }

    componentDidMount(): void {
        if (this.state.allDatasetComponents.length === 0) {this.getAllDatasetComponents(true)}
        if (this.state.allOperations.length === 0) {this.getAllOperations()}
    }

    componentWillUnmount() {
        this.props.context.updateContext({datasetComponents: undefined})
    }

    updatedDatasetComponents(columnDefs: any, rowData: any, datasetComponentName: string){
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

    onChangeServerFilter = (newServerFilter: any[]): void => {
        const datasetComponentId = this.state.currentDatasetComponent.eContents()[0]._id;
        if (newServerFilter !== undefined) {
            this.setState({serverFilters: newServerFilter});
            this.runQuery(this.state.currentDatasetComponent, newServerFilter);
            let serverFilters: any[] = [];
            newServerFilter
                .filter( (f: any) => f.datasetColumn !== undefined && f.datasetColumn !== null)
                .forEach((f: any)=> serverFilters.push(f)
                )
            this.props.context.changeUserProfile(datasetComponentId, {serverFilters: serverFilters})
        }
        else {
            this.props.context.changeUserProfile(datasetComponentId, undefined).then(()=>
                this.findServerFilters(this.state.currentDatasetComponent, this.state.columnDefs)
            )
        }
    };

    handleChange(e: any): void {
        let params: any = {name: e}
        this.props.context.changeUserProfile(this.props.viewObject._id, params);
        let currentDatasetComponent: Ecore.Resource[] = this.state.allDatasetComponents
            .filter((c: any) => c.eContents()[0].get('name') === e)
        this.setState({currentDatasetComponent: currentDatasetComponent[0]})
        this.findColumnDefs(currentDatasetComponent[0]);
    }

    render() {
        const { t } = this.props;
        return (
            <div>



                {this.state.allDatasetComponents.length !== 0 && this.state.currentDatasetComponent !== undefined &&
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
                            <OptGroup
                                label='Default'>
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
                <div style={{display: 'inline-block', height: '30px',
                    borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', marginBottom: '-10px',
                    borderRight: '1px solid rgb(217, 217, 217)', width: '6px'}}/>
                <Button title={t('filters')} style={{color: 'rgb(151, 151, 151)'}}
                        onClick={this.handleFiltersMenu}
                >
                    <FontAwesomeIcon icon={faFilter} size='xs'/>
                </Button>
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
            </div>
        )
    }
}

export default withTranslation()(DatasetView)
