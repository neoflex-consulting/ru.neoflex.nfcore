import * as React from "react";
import { withTranslation } from "react-i18next";
import {API} from "../../../modules/api";
import Ecore from "ecore";
import NfDataGrid from "./NfDataGrid";

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
}

class ReportRichGrid extends React.Component<any, State> {

    state = {
        datasetComponents: [],
        currentDatasetComponent: {} as Ecore.Resource,
        columnDefs: [],
        rowData: [],
        queryCount: 0,
        serverFilters: [],
        useServerFilter: false
    };

    getDatasetComponents() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//DatasetComponent")
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((datasetComponents: Ecore.Resource[]) => {
                        this.setState({datasetComponents})
                    })
            }
        })
    };

    findcolumnDefs(resource: Ecore.Resource){
        this.setState({queryCount: 2})
        let allColumn: any = []
        console.log()
        resource.eContents()[0].get('column')._internal.forEach( (c: Ecore.Resource) => {
            let rowData = new Map()
            rowData.set('field', c.get('name'))
            rowData.set('headerName', c.get('headerName').get('name'))
            rowData.set('headerTooltip', c.get('headerTooltip'))
            rowData.set('hide', c.get('hide'))
            rowData.set('pinned', c.get('pinned'))
            rowData.set('filter', c.get('filter'))
            rowData.set('sort', c.get('sort'))
            rowData.set('editable', c.get('editable'))
            allColumn.push(rowData)
        })
        this.setState({columnDefs: allColumn});
    }

    findServerFilters(resource: Ecore.Resource){
        let serverFilters: any = [];
        resource.eContents()[0].get('serverFilter')._internal.forEach( (f: Ecore.Resource) => {
            serverFilters.push(f)
        });
        this.setState({serverFilters, useServerFilter: resource.eContents()[0].get('useServerFilter')});
    }

    componentDidUpdate(prevProps: any): void {
        if (this.state.datasetComponents) {
            let resource = this.state.datasetComponents.find( (d:Ecore.Resource) =>
                d.eContents()[0].get('name') === this.props.datasetGridName)
            if (resource) {
                if (this.state.queryCount === 0) {
                    this.setState({currentDatasetComponent: resource})
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) => this.setState({rowData: JSON.parse(result)})
                    )
                }
                if (this.state.queryCount < 2) {
                    this.findcolumnDefs(resource as Ecore.Resource)
                    this.findServerFilters(resource as Ecore.Resource)
                }
                if (prevProps.location.pathname !== this.props.location.pathname) {
                    this.props.context.runQuery(resource as Ecore.Resource)
                        .then( (result: string) => this.setState({rowData: JSON.parse(result)})
                        )
                }
            }
        }
    }

    componentDidMount(): void {
        this.getDatasetComponents()
    }

    render() {
        let activeReportDateField = false
        if (this.props.pathFull[this.props.pathFull.length - 1].params.reportDate && this.state.columnDefs) {
            this.state.columnDefs.forEach( (c: any) => {
                if (c.get("field").toLowerCase() === "reportdate") {
                    activeReportDateField = true
                }
            });
        }

        return (
            this.state.columnDefs.length > 0
                ?
                this.state.rowData.length > 0
                    ?
                    <NfDataGrid
                        {...this.props}
                        columnDefs={this.state.columnDefs}
                        useServerFilter={this.state.useServerFilter}
                        serverFilters={this.state.serverFilters}
                        rowData={this.state.rowData}
                        activeReportDateField={activeReportDateField}
                        currentDatasetComponent={this.state.currentDatasetComponent}
                    />
                    :
                    <NfDataGrid
                        {...this.props}
                        columnDefs={this.state.columnDefs}
                        useServerFilter={this.state.useServerFilter}
                        serverFilters={this.state.serverFilters}
                        rowData={[]}
                        activeReportDateField={activeReportDateField}
                        currentDatasetComponent={this.state.currentDatasetComponent}
                    />
                    :
                "No columns found"
        )
    }
}

export default withTranslation()(ReportRichGrid)
