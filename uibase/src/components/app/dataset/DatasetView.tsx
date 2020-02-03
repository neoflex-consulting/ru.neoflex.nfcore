import * as React from "react";
import { withTranslation } from 'react-i18next';
//import {API} from "../../../modules/api";
import Ecore from "ecore";
//import DatasetGrid from "./DatasetGrid";
import {Button, DatePicker, Drawer, Dropdown, Menu, Select} from 'antd';
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import ServerFilter from "./ServerFilter";
import moment from "moment";
import {rowPerPageMapper} from "../../../utils/consts";

const rowPerPageMapper_: any = rowPerPageMapper;

interface Props {
    datasetGridName: string
}

interface State {
    datasetComponents: Ecore.Resource[];
    currentDatasetComponent: Ecore.Resource;
    columnDefs: any[];
    rowData: any[];
    queryCount: number;
    serverFilters: any[];
    useServerFilter: boolean;
    modalResourceVisible: boolean;
    themes: any[];
    currentTheme: any;
    rowPerPages: any[];
    paginationPageSize: any;
    operations: any[];
    selectedServerFilters: any[];
}

class DatasetView extends React.Component<any, State> {

    constructor(props: any) {
        super(props);

        this.state = {
            datasetComponents: [],
            currentDatasetComponent: {} as Ecore.Resource,
            columnDefs: [],
            rowData: [],
            queryCount: 0,
            serverFilters: [],
            useServerFilter: false,
            modalResourceVisible: false,
            themes: [],
            currentTheme: ""/*this.props.viewObject.get('defaultDatasetGrid').get('theme')*/,
            rowPerPages: [],
            paginationPageSize: ""/*this.props.viewObject.get('defaultDatasetGrid').get('rowPerPage')*/,
            operations: [],
            selectedServerFilters: []
        };

    }

    findColumnDefs(resource: Ecore.Resource){
        this.setState({queryCount: 2});
        let allColumn: any = [];
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
            allColumn.push(rowData)
        });
        this.setState({columnDefs: allColumn});
    }

    findServerFilters(resource: Ecore.Resource){
        let serverFilters: any = [];
        if (this.props.pathFull[this.props.pathFull.length - 1].params.length !== 0) {
            this.props.pathFull[this.props.pathFull.length - 1].params.forEach( (f: any) => {
                serverFilters.push(f)
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
                    datasetColumn: f.get('datasetColumn').get('name'),
                    operation: f.get('operation'),
                    value: f.get('value'),
                    enable: (f.get('enable') !== null ? f.get('enable') : false)
                })
            }
        });
        this.setState({serverFilters, useServerFilter: resource.eContents()[0].get('useServerFilter')});
    }

    componentDidUpdate(prevProps: any): void {
        if (this.state.datasetComponents) {
            let resource = this.state.datasetComponents.find( (d:Ecore.Resource) =>
                d.eContents()[0].get('name') === this.props.datasetGridName);
            if (resource) {
                if (this.state.queryCount === 0) {
                    this.setState({currentDatasetComponent: resource});
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) => this.setState({rowData: JSON.parse(result)})
                        )
                }
                if (this.state.queryCount < 2) {
                    this.findColumnDefs(resource as Ecore.Resource);
                    this.findServerFilters(resource as Ecore.Resource)
                }
                if (prevProps.location.pathname !== this.props.location.pathname) {
                    this.findServerFilters(resource as Ecore.Resource);
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) =>
                            this.setState({rowData: JSON.parse(result)}))
                }
            }
        }
    }

    componentDidMount(): void {
    }

    updateTableData(e: any): void  {
        if (e !== null) {
            let params: Object[] = [{
                datasetColumn: 'reportDate',
                operation: 'EqualTo',
                value: e._d,
                enable: true
            }];
            this.props.context.changeURL!(this.props.pathFull[this.props.pathFull.length - 1].appModule, undefined, params)
        }
    }

    handleResourceModalCancel = () => {
        this.setState({ modalResourceVisible: false })
    };

    render() {
        const { serverFilters, t } = this.props;
        let activeReportDateField = false;
        const params = this.props.pathFull[this.props.pathFull.length - 1].params;
        let defaultFilter: any[] = [];
        if (serverFilters !== undefined) {
            defaultFilter = serverFilters
                .filter((f: any) => f['enable'] === true)
                .map((f: any) =>
                    `${f['datasetColumn']} ${f['operation']} ${f['value']}`
                )
        }
        if (params) {
            params.forEach((p: any) => {
                if (p.datasetColumn.toLowerCase() === "reportdate") {
                    this.state.columnDefs.forEach( (c: any) => {
                        if (c.get("field").toLowerCase() === "reportdate") {
                            activeReportDateField = true
                        }
                    });
                }
            })
        }
        return (
            <div>
                {this.props.activeReportDateField &&
                <div style={{marginBottom: '10px', textAlign: 'center'}}>
                    <span style={{color: 'gray', fontSize: 'larger'}}>{t("reportdate")}: </span>
                    <DatePicker
                        placeholder="Select date"
                        defaultValue={moment(this.props.pathFull[this.props.pathFull.length - 1].params.reportDate)}
                        format={'DD.MM.YYYY'}
                        onChange={ (e: any) => this.updateTableData(e)}
                    />
                </div>
                }
                <Drawer
                    placement="right"
                    title={t('filters')}
                    width={'700px'}
                    visible={this.state.modalResourceVisible}
                    onClose={this.handleResourceModalCancel}
                    mask={false}
                    maskClosable={false}
                >
                    {
                        this.props.serverFilters
                            ?
                            <ServerFilter
                                {...this.props}
                                serverFilters={this.props.serverFilters}
                                columnDefs={this.props.columnDefs}
                            />
                            :
                            <ServerFilter/>
                    }
                </Drawer>
                {this.props.useServerFilter &&
                <div style={{marginLeft: '10px', marginTop: '10px'}}>
                    <span style={{color: 'gray', fontSize: 'larger'}}>  {t("filters")}: </span>
                    <Select
                        notFoundContent={t('notfound')}
                        allowClear={true}
                        style={{width: '400px'}}
                        showSearch={true}
                        mode="multiple"
                        placeholder="No Filters Selected"
                        value={defaultFilter}
                    >
                        {
                            this.props.serverFilters !== undefined ?
                                this.props.serverFilters
                                    .map((f: any) =>
                                        <Select.Option
                                            key={`${f['datasetColumn']} ${f['operation']} ${f['value']}`}
                                            value={`${f['datasetColumn']} ${f['operation']} ${f['value']}`}
                                        >
                                            {f['datasetColumn']} {f['operation']} {f['value']}
                                        </Select.Option>)
                                :
                                undefined
                        }
                    </Select>
                </div>
                }
            </div>
        )
        // return (
        //     this.state.columnDefs.length > 0
        //         ?
        //         this.state.rowData.length > 0
        //             ?
        //             <DatasetGrid
        //                 {...this.props}
        //                 columnDefs={this.state.columnDefs}
        //                 useServerFilter={this.state.useServerFilter}
        //                 serverFilters={this.state.serverFilters}
        //                 rowData={this.state.rowData}
        //                 activeReportDateField={activeReportDateField}
        //                 currentDatasetComponent={this.state.currentDatasetComponent}
        //             />
        //             :
        //             <DatasetGrid
        //                 {...this.props}
        //                 columnDefs={this.state.columnDefs}
        //                 useServerFilter={this.state.useServerFilter}
        //                 serverFilters={this.state.serverFilters}
        //                 rowData={[]}
        //                 activeReportDateField={activeReportDateField}
        //                 currentDatasetComponent={this.state.currentDatasetComponent}
        //             />
        //             :
        //         "No columns found"
        // )
    }
}

export default withTranslation()(DatasetView)
