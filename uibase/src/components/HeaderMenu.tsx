import * as React from "react";
import {withTranslation} from "react-i18next";
import {Button, Col, Row} from "antd";
import './../styles/BreadcrumbApp.css';

interface State {
}

class HeaderMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {}
    }

    selectApplication(applicationName: string): void  {
        this.props.context.changeURL!(applicationName, false);
        this.props.context.changeUserProfile('startApp', applicationName)
    }

    render() {
        const span = 24 / this.props.applications.length;

        let selectedApp: any = undefined;
        if (this.props.applications.length !== 0 && this.props.context !== undefined) {
            if (this.props.context.userProfile !== undefined) {
                const application = this.props.context.userProfile.get('params').array()
                    .filter((u: any) => u.get('key') === 'startApp');
                if (application.length !== 0 && application[0].get('value') !== undefined) {
                    selectedApp = JSON.parse(application[0].get('value'))
                }
                else {
                    selectedApp = this.props.applications[0].eContents()[0].get('name')
                }
            } else {
                selectedApp = this.props.applications[0].eContents()[0].get('name')
            }
        }

        return (
            <Row style={{marginTop: '-5px'}}>
                {
                    this.props.applications.length === 0
                        ?
                        <span style={{fontWeight: 500}}>Loading... </span>
                        :
                        this.props.applications.map(
                            (app: any) =>
                                <Col span={span} key={app.eContents()[0].get('name')}>
                                    <Button
                                        key={app.eContents()[0].get('name')}
                                        type="link"
                                        ghost
                                        style={{
                                            fontWeight: 500,
                                            background: "rgb(255,255,255)",
                                            fontSize: selectedApp === app.eContents()[0].get('name') ? "larger" : "medium",
                                            color: selectedApp === app.eContents()[0].get('name') ? "rgb(18, 18, 18)" : "rgb(18, 18, 18, 0.35)",
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
