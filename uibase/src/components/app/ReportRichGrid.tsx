import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import NfDataGrid from './../NfDataGrid'
 
interface Props {
}

interface State {
    
}

class ReportRichGrid extends React.Component<Props & WithTranslation, State> {

    constructor(props: any) {
        super(props)
        this.state = {
            
        }
    }

    componentDidMount(): void {
    }

    render() {
        return (
            <div style={{ width: '100%' }}>
               
            </div>
        )
    }
}

const ReportRichGridTrans = withTranslation()(ReportRichGrid);
export default ReportRichGridTrans;
