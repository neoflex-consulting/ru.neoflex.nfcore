import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisH, faHome} from "@fortawesome/free-solid-svg-icons";
import {Breadcrumb} from "antd";
import './../styles/BreadcrumbApp.css';

interface Props {
    selectedKeys: string[];
    breadcrumb: string[];
    onClickBreadcrumb: (breadcrumb: any) => void;
}

interface State {
}

class BreadcrumbApp extends React.Component<Props & WithTranslation, any> {

    render() {
        return (
            this.props.selectedKeys[0] &&
            this.props.selectedKeys[0].split('.').includes('app') &&
            this.props.breadcrumb.length !== 0
            ?
                <Breadcrumb className="ul-breadcrumb breadcrumb-visibility">
                    {this.props.breadcrumb.map((b: string) =>
                            <li className="li-breadcrumb" title={b}>
                                <Breadcrumb.Item separator="" key={b} onClick={() => this.props.onClickBreadcrumb(b)}>
                                    <FontAwesomeIcon className="breadcrumbIcon" icon={b !== this.props.breadcrumb[0] ? faEllipsisH : faHome}/>
                                    <span className="text">
                                        {b}
                                    </span>
                                </Breadcrumb.Item>
                            </li>
                        )
                    }
                </Breadcrumb>
                : ""
        );
    }
}

export default withTranslation()(BreadcrumbApp)
