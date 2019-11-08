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

export default withTranslation()(ReportDiagram)
