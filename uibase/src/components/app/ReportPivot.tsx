import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
// import {API} from "../../modules/api";
// import Ecore from "ecore";
import JqxPivotGrid, { IPivotGridProps, jqx } from 'jqwidgets-scripts/jqwidgets-react-tsx/jqxpivotgrid';
import {MainContext} from "../../MainContext";

interface Props {
}

class ReportPivot extends React.PureComponent<WithTranslation, IPivotGridProps> {
    //
    // getAllRoles() {
    //     API.instance().fetchAllClasses(false).then(classes => {
    //         const temp = classes.find((c: Ecore.EObject) => c._id === "//Role");
    //         if (temp !== undefined) {
    //             API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
    //                 .then((classComponent) => {
    //                     console.log()
    //                     this.setState({classComponents: classComponent})
    //                 })
    //         }
    //     })
    // };

    constructor(props: WithTranslation) {
        super(props);
        const pivotDataSource = this.createPivotDataSource();
        this.state = {
            source: pivotDataSource
        }
    }

    private createPivotDataSource(): any {
        // prepare sample data
        const data = [];
        const reports = [
            'Report1', 'Report2', 'Report3', 'Report4', 'Report5', 'Report6'];
        const reportTime = [
            '2.25', '1.5', '3.0', '3.3', '4.5', '3.6', '3.8', '2.5', '5.0', '1.75', '3.25', '4.0'
        ];
        for (let i = 0; i < reports.length * 2; i++) {
            const row: any = {};
            const value = parseFloat(reportTime[Math.round((Math.random() * 100)) % reportTime.length]);
            row.report = reports[i % reports.length];
            row.value = value;
            data[i] = row;
        }
        // create a data source and data adapter
        const source = {
            datafields: [
                { name: 'report', type: 'string' },
                { name: 'value', type: 'number' }
            ],
            datatype: 'array',
            localdata: data
        };
        const dataAdapter = new jqx.dataAdapter(source);
        dataAdapter.dataBind();
        // create a pivot data source from the dataAdapter
        const pivotDataSource = new jqx.pivot(
            dataAdapter,
            {
                columns: [],
                pivotValuesOnRows: false,
                rows: [{ dataField: 'report', width: 190 }],
                values: [
                    { dataField: 'value', width: 400, 'function': 'min', text: 'Min Time (days)', formatSettings: { align: 'left', prefix: '', decimalPlaces: 2 } },
                    { dataField: 'value', width: 400, 'function': 'max', text: 'Average Time (days)', formatSettings: { align: 'center', prefix: '', decimalPlaces: 2 } },
                    { dataField: 'value', width: 400, 'function': 'average', text: 'Max Time (days)', formatSettings: { align: 'right', prefix: '', decimalPlaces: 2 } }
                ]
            }
        );
        return pivotDataSource;
    }

    render() {
        return (

            <MainContext.Consumer>
                { context => (
                    <div style={{borderColor: "black"}}>
                        This is Pivot (Test)
                        <JqxPivotGrid style={{ width: "100%", height: 600, border: "3px solid lightgray" }} source={this.state.source}
                                      treeStyleRows={false} autoResize={false} multipleSelectionEnabled={true} />
                    </div>
                )}
            </MainContext.Consumer>
        )
    }

}

export default withTranslation()(ReportPivot)
