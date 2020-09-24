import * as React from "react";
import {withTranslation} from "react-i18next";
import {Dropdown, Menu} from "antd";
import {NeoButton, NeoCol, NeoRow, NeoTypography} from "neo-design/lib";
import './../styles/BreadcrumbApp.css';
import Ecore from "ecore"

interface State {
    isResolved: boolean;
}

class HeaderMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            isResolved: false,
        }
    }

    selectApplication(applicationName: string): void  {
        const {applications, t} = this.props
        for (let i = 3; i < applications.length; i++){
            if (applications[i].eContents()[0].get('name') === applicationName){
                let temp: any = applications[0].eContents()[0]
                applications[0].eContents()[0] = applications[i].eContents()[0]
                applications[i].eContents()[0] = temp
                for (let i = 1; i < applications.length; i++) {

                }
            }
        }
        this.props.context.changeURL!(applicationName, false);
        this.props.context.changeUserProfile('startApp', applicationName)
    }

    appsMenu(selectedApp:any) {

        const {applications, t} = this.props
        const menu = (<Menu style={{ marginTop: '10px', backgroundColor: '#2a356c',
            height: '10%',
            overflow: 'auto',
            width: "200px"}}>
            {applications.slice(3).map(
                (app: any) =>
                    <Menu.Item className={'headerMenu'}
                        key={app.eContents()[0].get('name')}
                        onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                    >
                        <NeoTypography className='appNameInMenu' style={{color: app.eContents()[0].get('name') === selectedApp ? "#2A356C"  : "#8C8C8C"}} type={'capture-regular'}> {app.eContents()[0].get('name')}</NeoTypography>
                    </Menu.Item>
            )}
        </Menu>);
        return (
            <NeoRow style={{justifyContent: 'space-between', width: '100%', marginLeft: "70px"}}>
                {applications.slice(0,3).map((app: any) =>
                    <NeoCol className='btn-appName' span={applications.length < 4 ? 8 : 7} key={app.eContents()[0].get('name')}>
                        <NeoButton
                            key={app.eContents()[0].get('name')}
                            type="link"
                            onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                        >
                            <NeoTypography className='appName' style={{color: app.eContents()[0].get('name') === selectedApp ? "#FFFFFF"  : "#B3B3B3"}} type={app.eContents()[0].get('name') === selectedApp ? 'h4-regular' : 'h4-light'}>{app.eContents()[0].get('name')}</NeoTypography>
                        </NeoButton>
                    </NeoCol>
                )}
                {applications.length >= 4 &&
                <NeoCol span={3}>
                        <Dropdown overlay={menu} placement="bottomCenter" className={'headerDropdown'}>
                        <div className='btn-appName'>
                        <NeoButton

                                type="link"
                                style={{
                            fontWeight: 500,
                            background: "#2a356c",
                            color: "white",
                            cursor: "pointer",
                                    marginRight: "90px"
                        }}
                        >
                            <NeoTypography className='appName' style={{color: "#B3B3B3"}} type={'h4-light'}> {t('more')}</NeoTypography>
                        </NeoButton>
                        </div>
                    </Dropdown>
                </NeoCol>
                }
            </NeoRow>
        )
}

    render() {
        let selectedApp: any;
        if (this.props.applications.length !== 0 && this.props.context !== undefined && this.props.context.userProfilePromise !== undefined) {
            this.props.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
                if (userProfile !== undefined) {
                    const application = userProfile.eContents()[0].get('params').array()
                        .filter((u: any) => u.get('key') === 'startApp');
                    if (application.length !== 0 && application[0].get('value') !== undefined) {
                        selectedApp = JSON.parse(application[0].get('value'))
                        if (selectedApp !== this.state.App && selectedApp !== undefined){
                            this.setState({App: selectedApp})
                        }

                    }
                    else {
                            selectedApp = this.props.applications[0].eContents()[0].get('name')
                        if (selectedApp !== this.state.App && selectedApp !== undefined){
                            this.setState({App: selectedApp})
                        }
                    }
                } else {
                    selectedApp = this.props.applications[0].eContents()[0].get('name')
                    if (selectedApp !== this.state.App && selectedApp !== undefined){
                        this.setState({App: selectedApp})
                    }
                }
            });
        }
        return (
            <NeoRow style={{marginTop: '0px', width: '100%'}} className='apps-menu'>
                {

                    this.props.applications.length === 0 && this.state.App === undefined
                        ?
                        <span style={{fontWeight: 500, color: 'rgb(255, 255, 255)'}}>Loading... </span>
                        :
                        this.appsMenu(this.state.App)
                }
            </NeoRow>
        );
    }
}

export default withTranslation()(HeaderMenu)
