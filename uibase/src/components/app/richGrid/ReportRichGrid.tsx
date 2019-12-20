import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import {API} from "../../../modules/api";
import Ecore from "ecore";
import NfDataGrid from "./NfDataGrid";

interface Props {
    headerName: string
    datasetSettingsGridName: string
}

interface State {
    datasetSettings: Ecore.Resource[];
    columnDefs: any[];
    rowData: any[];
    queryCount: number;
    serverFilters: any[]
}

class ReportRichGrid extends React.Component<Props & WithTranslation, State> {

    state = {
        datasetSettings: [],
        columnDefs: [],
        rowData: [],
        queryCount: 0,
        serverFilters: []
    };

    getDatasetSettings() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//DatasetSettings")
            if (temp !== undefined) {
                API.instance().findByKind(temp,  {contents: {eClass: temp.eURI()}})
                    .then((datasetSettings: Ecore.Resource[]) => {
                        this.setState({datasetSettings})
                    })
            }
        })
    };

    runQuery(resource: Ecore.Resource) {
        this.setState({queryCount: 1})
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = 'runQueryDatasetSettings';
        const parameters: any[] = [];
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
            allColumn.push(rowData)
        })
        this.setState({columnDefs: allColumn});
    }

    findServerFilters(resource: Ecore.Resource){
        let serverFilters: any = [];
        resource.eContents()[0].get('serverFilter')._internal.forEach( (f: Ecore.Resource) => {
            serverFilters.push(f)
        });
        this.setState({serverFilters});
    }

    componentDidUpdate(): void {
        if (this.state.datasetSettings) {
            let resource = this.state.datasetSettings.find( (d:Ecore.Resource) =>
                d.eContents()[0].get('name') === this.props.datasetSettingsGridName
            );
            if (resource) {
                if (this.state.queryCount === 0) {
                    this.runQuery(resource as Ecore.Resource)
                }
                if (this.state.queryCount < 2) {
                    this.findcolumnDefs(resource as Ecore.Resource)
                    this.findServerFilters(resource as Ecore.Resource)
                }
            }
        }
    }

    componentDidMount(): void {
        this.getDatasetSettings()
    }

    render() {
        return (
            this.props.headerName !== undefined && this.state.rowData.length > 0 && this.state.columnDefs.length > 0
                ?
                <div>
                    {this.props.headerName && this.state.serverFilters !== undefined}
                    <NfDataGrid columnDefs={this.state.columnDefs} rowData={this.state.rowData} serverFilters={this.state.serverFilters}/>
                </div>
                :
                this.props.headerName === undefined && this.state.rowData.length > 0 && this.state.columnDefs.length > 0 && this.state.serverFilters !== undefined
                ?
                    <div>
                        <NfDataGrid columnDefs={this.state.columnDefs} rowData={this.state.rowData} serverFilters={this.state.serverFilters}/>
                    </div>
                    :
                    <div>
                        NOT found
                    </div>
        )
    }
}

export default withTranslation()(ReportRichGrid)
