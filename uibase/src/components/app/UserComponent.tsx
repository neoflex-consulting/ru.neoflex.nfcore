import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";

import DatasetView from "./dataset/DatasetView";
import DatasetPivot from "./dataset/DatasetPivot";
import DatasetDiagram from "./dataset/DatasetDiagram";
import DatasetGrid from "./dataset/DatasetGrid"
import PageNotFound from "./PageNotFound";

const UserComponents: any = {
    DatasetPivot: DatasetPivot,
    DatasetDiagram: DatasetDiagram,
    DatasetView: DatasetView,
    PageNotFound: PageNotFound,
    DatasetGrid: DatasetGrid,
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
