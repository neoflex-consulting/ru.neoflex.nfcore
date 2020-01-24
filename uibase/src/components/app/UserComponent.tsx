import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";

import MandatoryReporting from "./MandatoryReporting";
import ReportPivot from "./ReportPivot";
import ReportDiagram from "./ReportDiagram";
import ReportRichGrid from "./richGrid/ReportRichGrid";
import PageNotFound from "./PageNotFound";
import TaxReporting from "./TaxReporting";

const UserComponents: any = {
    MandatoryReporting: MandatoryReporting,
    ReportPivot: ReportPivot,
    ReportDiagram: ReportDiagram,
    ReportRichGrid: ReportRichGrid,
    PageNotFound: PageNotFound,
    TaxReporting: TaxReporting
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
            Component = UserComponents['PageNotFound']
        }
        return (
            <Component {...this.props}/>
        )}
    }

export default withTranslation()(UserComponent)
