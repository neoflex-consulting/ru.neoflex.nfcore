import * as React from "react";
import {withTranslation} from "react-i18next";
import {Dropdown, Menu} from "antd";
import {NeoButton, NeoCol, NeoRow, NeoTypography} from "neo-design/lib";
import './../styles/BreadcrumbApp.css';
import Ecore from "ecore"
import {NeoIcon} from "neo-icon/lib";
import {Link} from "react-router-dom";

interface State {
    isResolved: boolean;
    linksArray: string[];
}

class HeaderMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            isResolved: false,
            linksArray: []
        }
    }



    selectApplication(applicationName: string): void  {
        const {applications, t} = this.props
        for (let i = 3; i < applications.length; i++){
            if (applications[i].eContents()[0].get('name') === applicationName){
                let temp: any = applications[0].eContents()[0]
                applications[0].eContents()[0] = applications[i].eContents()[0]
                applications[i].eContents()[0] = temp

                temp = applications[1].eContents()[0]
                applications[1].eContents()[0] = applications[i].eContents()[0]
                applications[i].eContents()[0] = temp

                temp = applications[2].eContents()[0]
                applications[2].eContents()[0] = applications[i].eContents()[0]
                applications[i].eContents()[0] = temp

            }
        }
        this.props.context.changeURL!(applicationName, false);
        this.props.context.changeUserProfile('startApp', applicationName)
    }

    getPathwayAndReorderApplicationArray(applicationName: string): any{
        const {applications, t} = this.props
        for (let i = 3; i < applications.length; i++) {
            if (this.props.context.getURL(applications[i].eContents()[0].get('name'), false) === this.props.location.pathname) {
                if (applications[i].eContents()[0].get('name') === applicationName) {
                    let temp: any = applications[0].eContents()[0]
                    applications[0].eContents()[0] = applications[i].eContents()[0]
                    applications[i].eContents()[0] = temp

                    temp = applications[1].eContents()[0]
                    applications[1].eContents()[0] = applications[i].eContents()[0]
                    applications[i].eContents()[0] = temp

                    temp = applications[2].eContents()[0]
                    applications[2].eContents()[0] = applications[i].eContents()[0]
                    applications[i].eContents()[0] = temp

                }
            }
        }
        return this.props.context.getURL(applicationName, false);
    }


    appsMenu(selectedApp:any) {
        const {applications, t} = this.props
        let flag = false;
        for (let i = 0; i < applications.length; i++){
            if (this.props.context.getURL(applications[i].eContents()[0].get('name'), false) === this.props.location.pathname){
                flag = true;
            }
        }
        const menu = (<Menu style={{ marginTop: '10px', backgroundColor: '#2a356c',
            height: '150px',
            overflow: 'auto',
            width: "200px"}}>
            {applications.slice(3).map(
                (app: any) =>
                    <Link to={(this.getPathwayAndReorderApplicationArray(app.eContents()[0].get('name')))} className={'limksInMoreWord'}>
                    <Menu.Item className={'headerMenu'}
                        key={app.eContents()[0].get('name')}
                        onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                    >
                        <NeoTypography className='appNameInMenu' style={{color: flag ? this.props.context.getURL(app.eContents()[0].get('name'), false) === this.props.location.pathname ? "#2A356C"  : "#8C8C8C" : app.eContents()[0].get('name') === selectedApp ? "#2A356C"  : "#8C8C8C"}} type={'capture-regular'}> {app.eContents()[0].get('name')}</NeoTypography>
                    </Menu.Item>
                    </Link>
            )}
        </Menu>);
        const menuForSmallScreen = (<Menu style={{ marginTop: '-8px', backgroundColor: '#2a356c',
            height: '150px',
            overflow: 'auto',
            width: "200px"}}>
            {applications.map(
                (app: any) =>
                    <Link to={this.props.context.getURL(app.eContents()[0].get('name'), false)} className={'limksInMoreWord'}>
                    <Menu.Item className={'headerMenu'}
                               key={app.eContents()[0].get('name')}
                               onClick={ ()=> this.selectApplication(app.eContents()[0].get('name')) }
                    >
                        <NeoTypography className='appNameInMenu' style={{color: flag ? this.props.context.getURL(app.eContents()[0].get('name'), false) === this.props.location.pathname ? "#2A356C" : "#8C8C8C" : app.eContents()[0].get('name') === selectedApp ? "#2A356C"  : "#8C8C8C"}} type={'capture-regular'}> {app.eContents()[0].get('name')}</NeoTypography>
                    </Menu.Item>
                    </Link>
            )}
        </Menu>);
        return (
            <div>
            <div className={'HeaderWithNames'}>
        <NeoRow style={{width: '100%'}}>
            {applications.slice(0, 3).map((app: any) =>

                <NeoCol className='btn-appName' span={applications.length < 4 ? 8 : 7}
                        key={app.eContents()[0].get('name')}>
                        <Link to={this.props.context.getURL(app.eContents()[0].get('name'), false)}
                              className={'linksInMoreWord'}>
                            <NeoButton
                                key={app.eContents()[0].get('name')}
                                type="link"
                                onClick={() => this.selectApplication(app.eContents()[0].get('name'))}
                            >
                                <NeoTypography className='applicationName'
                                               style={{color: /*flag ? this.props.context.getURL(app.eContents()[0].get('name'), false) === this.props.location.pathname ? "#FFFFFF" : "#B3B3B3" : */app.eContents()[0].get('name') === selectedApp ? "#FFFFFF"  : "#B3B3B3"}}
                                               type={this.props.context.getURL(app.eContents()[0].get('name'), false) === this.props.location.pathname ? 'h4-regular' : 'h4-light'}>{app.eContents()[0].get('name')}</NeoTypography>
                            </NeoButton>
                        </Link>
                </NeoCol>
            )}
            {applications.length >= 4 &&
            <NeoCol span={3} >
                <Dropdown overlay={menu} placement="bottomCenter" className={'headerDropdown'}>
                    <div className='btn-appName'>
                        <NeoButton
                            type="link"
                            style={{
                                fontWeight: 500,
                                background: "#2a356c",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            <NeoTypography className='appMoreWord' style={{color: "#B3B3B3"}}
                                           type={'h4-light'}> {t('more')}</NeoTypography>
                        </NeoButton>
                    </div>
                </Dropdown>
            </NeoCol>
            }
        </NeoRow>
            </div>
            <div className={'HeaderWithNamesSmallScreen'}>
                <NeoRow>
                        <Dropdown
                            overlay={menuForSmallScreen} placement="bottomCenter">
                            <div style={{marginTop: "17px"}}>
                                    <NeoIcon color={'white'} icon={"table"} size={'m'}/>
                            </div>
                        </Dropdown>
                </NeoRow>

            </div>


            </div>


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
