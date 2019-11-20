import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCode, faHome} from "@fortawesome/free-solid-svg-icons";
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
        const {t} = this.props;
        return (

            <Breadcrumb className="ul-breadcrumb">
                <ul className="ul-breadcrumb">
                {this.props.selectedKeys[0] && this.props.selectedKeys[0].split('.').includes('app') && this.props.breadcrumb.length !== 0 ?
                    this.props.breadcrumb.reverse().map((b: string) => {
                        let bName;
                        if (b.length > 18) {
                            bName = b.slice(0, 15) + "..."
                        } else {bName = b}
                        return (
                            <li className="li-breadcrumb">
                                <a className="a-breadcrumb">
                                    <Breadcrumb.Item separator="separator" key={b} onClick={() => this.props.onClickBreadcrumb(b)}>
                                        {b !== this.props.breadcrumb[this.props.breadcrumb.length - 1] ?
                                            <div>
                                                <FontAwesomeIcon className="icon" icon={faCode} size="1x"/>
                                                <span className="text">{bName}</span>
                                            </div>
                                            :
                                            <FontAwesomeIcon className="icon" icon={faHome} size="1x"/>
                                        }
                                    </Breadcrumb.Item>
                                </a>
                            </li>
                            )
                    }) : ""
                }
                </ul>
            </Breadcrumb>

        );
    }
}

export default withTranslation()(BreadcrumbApp)
