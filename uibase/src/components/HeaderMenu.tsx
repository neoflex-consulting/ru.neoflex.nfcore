import * as React from "react";
import {withTranslation} from "react-i18next";
import {Button, Col, Row } from "antd";
import './../styles/BreadcrumbApp.css';

import { Menu, Dropdown } from 'antd';

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

    appsMenu(selectedApp:any) {
        const {applications, t} = this.props
        return (
            <Row>
                {applications.slice(0,3).map((app: any) =>
                    <Col span={applications.length < 4 ? 8 : 7} key={app.eContents()[0].get('name')}>
                        <Button
                            className='btn-appName'
                            key={app.eContents()[0].get('name')}
                            type="link"
                            ghost
                            style={{
                                fontWeight: 500,
                                background: "rgb(255,255,255)",
                                fontSize: selectedApp === app.eContents()[0].get('name') ? "larger" : "medium",
                                color: selectedApp === app.eContents()[0].get('name') ? "rgb(255, 255, 255)" : "rgb(255, 255, 255, 0.7)",
                                cursor: "pointer"
                            }}
                            onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                        >
                            {app.eContents()[0].get('name')}
                        </Button>
                    </Col>
                )}
                {applications.length >= 4 &&
                <Col span={3}>
                    <Dropdown overlay={(
                        <Menu style={{ marginTop: '10px', backgroundColor: '#2a356c' }}>
                            {applications.slice(3).map(
                                (app: any) =>
                                    <Menu.Item
                                        key={app.eContents()[0].get('name')}
                                        onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                                    >
                    <span className='lang-title'
                          style={{ fontWeight:600 }}>
                        {app.eContents()[0].get('name')}</span>
                                    </Menu.Item>
                            )}
                        </Menu>
                    )} placement="bottomCenter">
                        <Button className='btn-appName'
                                type="link"
                                ghost style={{
                            fontWeight: 500,
                            background: "rgb(255,255,255)",
                            cursor: "pointer"
                        }}>
                            {t('more')}
                        </Button>
                    </Dropdown>
                </Col>
                }
            </Row>
        )
}

    render() {
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
            <Row style={{marginTop: '0px'}} className='apps-menu'>
                {
                    this.props.applications.length === 0
                        ?
                        <span style={{fontWeight: 500, color: 'rgb(255, 255, 255)'}}>Loading... </span>
                        :
                        this.appsMenu(selectedApp)
                }
            </Row>
        );
    }
}

export default withTranslation()(HeaderMenu)
