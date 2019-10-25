import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";


interface Props {
}

interface State {
}

class ReportDiagram extends React.Component<Props & WithTranslation, State> {

    state = {
    };

    componentDidMount(): void {
    }

    render() {
        return (
            <div>
                This is Diagram (Test)
            </div>
        )
    }
}

const ReportDiagramTrans = withTranslation()(ReportDiagram);
export default ReportDiagramTrans;
