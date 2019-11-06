import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import MandatoryReportingTrans from "./MandatoryReporting";
import ReportPivotTrans from "./ReportPivot";
import ReportDiagramTrans from "./ReportDiagram";
import ReportRichGridTrans from "./ReportRichGrid";
import TestComponentLeftTrans from "./TestComponentLeft";

const UserComponents: any = {
    MandatoryReportingTrans: MandatoryReportingTrans,
    ReportPivotTrans: ReportPivotTrans,
    ReportRichGridTrans: ReportRichGridTrans,
    ReportDiagramTrans: ReportDiagramTrans,
    TestComponentLeftTrans: TestComponentLeftTrans
};

export interface Props {
    componentClassName: string
}

class UserComponent extends React.Component<Props & WithTranslation, any> {

    render() {
        let Component;
        if (UserComponents[`${this.props.componentClassName}`]) {
            Component = UserComponents[`${this.props.componentClassName}`]
        } else {
            Component = <div>"{this.props.componentClassName}" not found</div>
        }
        return (
            <Component/>
        )}
    }

export default withTranslation()(UserComponent)
