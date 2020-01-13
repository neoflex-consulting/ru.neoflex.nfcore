import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import {API} from "../../../modules/api";
import Ecore from "ecore";
import NfDataGrid from "./NfDataGrid";

interface Props {
    datasetGridName: string
}

interface State {
    datasetComponents: Ecore.Resource[];
    columnDefs: any[];
    rowData: any[];
    queryCount: number;
    serverFilters: any[];
    useServerFilter: boolean;
    reportDate: any;
    appModule: any;
}

class ReportRichGrid extends React.Component<any, State> {

    state = {
        datasetComponents: [],
        columnDefs: [],
        rowData: [],
        queryCount: 0,
        serverFilters: [],
        useServerFilter: false,
        reportDate: undefined,
        appModule: undefined
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

    runQuery(resource: Ecore.Resource) {
        this.setState({queryCount: 1})
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = 'runQuery';
        const parameters: any[] = [];
        const currentApp = JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split("/app/")[1])))
            [JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split("/app/")[1]))).length - 1]
        const reportDate = currentApp.params.reportDate
        this.setState({appModule: currentApp.appModule})
        if (reportDate) {
            this.setState({reportDate})
            parameters.push(reportDate)
        }
        API.instance().call(ref, methodName, parameters).then( result => {
            this.setState({rowData: JSON.parse(result)});
        })
    }

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
                d.eContents()[0].get('dataset').get('name') === this.props.datasetGridName
            );
            if (resource) {
                if (this.state.queryCount === 0) {
                    this.runQuery(resource as Ecore.Resource)
                }
                if (this.state.queryCount < 2) {
                    this.findcolumnDefs(resource as Ecore.Resource)
                    this.findServerFilters(resource as Ecore.Resource)
                }
                if (prevProps.location.pathname !== this.props.location.pathname) {
                    this.runQuery(resource as Ecore.Resource)
                }
            }
        }
    }

    componentDidMount(): void {
        this.getDatasetComponents()
    }

    render() {
        let reportDate = undefined
        if (this.state.reportDate && this.state.columnDefs) {
            this.state.columnDefs.forEach( (c: any) => {
                if (c.get("field").toLowerCase() === "reportdate") {
                    reportDate = this.state.reportDate
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
                        reportDate={reportDate}
                        appModule={this.state.appModule}
                        rowData={this.state.rowData}
                    />
                    :
                    <NfDataGrid
                        {...this.props}
                        columnDefs={this.state.columnDefs}
                        useServerFilter={this.state.useServerFilter}
                        serverFilters={this.state.serverFilters}
                        reportDate={reportDate}
                        appModule={this.state.appModule}
                        rowData={[]}
                    />
                    :
                "No columns found"
        )
    }
}

export default withTranslation()(ReportRichGrid)
