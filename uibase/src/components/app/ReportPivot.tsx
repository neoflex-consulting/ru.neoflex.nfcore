import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";


interface Props {
}

interface State {
}

class ReportPivot extends React.Component<Props & WithTranslation, State> {

    state = {
    };

    componentDidMount(): void {
    }

    render() {
        return (
            <div>
                This is Pivot (Test)
            </div>
        )
    }
}

const ReportPivotTrans = withTranslation()(ReportPivot);
export default ReportPivotTrans;
