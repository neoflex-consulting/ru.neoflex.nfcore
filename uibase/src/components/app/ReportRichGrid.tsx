import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import {API} from "../../modules/api";
import Ecore from "ecore";
//import NfDataGrid from './../NfDataGrid'
 
interface Props {
}

interface State {
    jdbcDatasets: Ecore.EObject[];
    operations: Ecore.EOperation[];
    queryResult: any[];
    
}

class ReportRichGrid extends React.Component<Props & WithTranslation, State> {

    constructor(props: any) {
        super(props)
        this.state = {
            jdbcDatasets: [],
            operations: [],
            queryResult: []
        }
    }

    getAlljdbcDatasets() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//JdbcDataset")
            if (temp !== undefined) {
                // this.getAllOperation(temp);
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((jdbcDatasets) => {
                        this.setState({jdbcDatasets})
                        this.runQuery(this.state.jdbcDatasets[0] as Ecore.Resource);
                    })
            }
        })
    };

    // getAllOperation(temp: Ecore.EObject) {
    //     if (temp !== undefined) {
    //         let operations: Ecore.EOperation[] = [];
    //         temp.get('eAllSuperTypes')
    //             .filter((t: Ecore.EObject) => t.get('eOperations')._internal
    //                 .forEach ( (o: Ecore.EOperation) => operations.push(o)
    //                 )
    //             )
    //         if (operations.length !== 0) {
    //             this.setState({operations})
    //         }
    //     }
    // };

    runQuery(resource: Ecore.Resource) {
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = 'runQuery';
        const parameters: any[] = [];
        API.instance().call(ref, methodName, parameters).then( result => {
            this.setState({queryResult: JSON.parse(result)})
        })
    }

    componentDidMount(): void {
        this.getAlljdbcDatasets();
    }


    render() {
        return (
            <div style={{ width: '100%' }}>
               
            </div>
        )
    }
}

export default withTranslation()(ReportRichGrid)
