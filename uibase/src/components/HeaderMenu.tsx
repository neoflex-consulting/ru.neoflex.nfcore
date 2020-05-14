import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import {Breadcrumb, Button, Col, Row} from "antd";
import './../styles/BreadcrumbApp.css';

interface Props {
    selectedKeys: string[];
    breadcrumb: string[];
    onClickBreadcrumb: (breadcrumb: any) => void;
}

interface State {
}

class HeaderMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {}
    }

    selectApplication(applicationName: string): void  {
        this.props.context.changeURL!(applicationName)
    }

    render() {
        const { t } = this.props as Props & WithTranslation;
        const span = 24 / this.props.applications.length;

        // if (this.props.applications.length !== 0) {
        //     this.props.applications.map((a: any) =>
        //         selectedKeys.push(`app.${a}`));
        // }

        return (
            <Row style={{marginTop: '-5px'}}>
                {
                    this.props.applications.length === 0
                        ?
                        <span style={{fontWeight: 500}}>Loading... </span>
                        :
                        this.props.applications.map(
                            (app: any) =>
                                <Col span={span}>
                                    <Button
                                        type="link"
                                        ghost
                                        style={{
                                            fontWeight: 500,
                                            background: "rgb(255,255,255)",
                                            fontSize: "medium",
                                            color: "rgb(18, 18, 18)",
                                            cursor: "pointer"
                                        }}
                                        onClick={ ()=> this.selectApplication(app.eContents()[0].get('name'))}
                                    >
                                        {app.eContents()[0].get('name')}
                                    </Button>
                                </Col>
                        )
                }
            </Row>
        );
    }
}

export default withTranslation()(HeaderMenu)
