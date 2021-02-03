import * as React from "react";
import {withTranslation} from "react-i18next";
import {Dropdown, Menu} from "antd";
import {NeoButton, NeoCol, NeoRow, NeoTypography} from "neo-design/lib";
import Ecore from "ecore"
import {NeoIcon} from "neo-icon/lib";
import {Link} from "react-router-dom";
import {encodeAppURL} from "../EcoreApp";

interface State {
    selectedApp: string;
    applications: any[];
}

class HeaderMenu extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            selectedApp: undefined,
            applications: this.props.applications
        }
    }

    sliceApp(applicationName: string): any{
        const {applications} = this.state;
        for (let i = 3; i < applications.length; i++) {
            if (encodeAppURL(this.props.context.getURL(applications[i].eContents()[0].get('name'), false)) === this.props.location.pathname) {
                if (applications[i].eContents()[0].get('name') === applicationName) {

                    let temp: any;

                    temp = applications[2].eContents()[0].get("headerOrder");
                    applications[2].eContents()[0].values.headerOrder = applications[i].eContents()[0].get("headerOrder")
                    applications[i].eContents()[0].values.headerOrder = temp

                    temp = applications[1].eContents()[0].get("headerOrder");
                    applications[1].eContents()[0].values.headerOrder = applications[i].eContents()[0].get("headerOrder")
                    applications[i].eContents()[0].values.headerOrder = temp

                    temp = applications[0].eContents()[0].get("headerOrder");
                    applications[0].eContents()[0].values.headerOrder = applications[i].eContents()[0].get("headerOrder")
                    applications[i].eContents()[0].values.headerOrder = temp
                }
            }
        }

        return encodeAppURL(this.props.context.getURL(applicationName, false));
    }

    appsMenu() {
        const {t} = this.props;
        const {applications} = this.state;
        applications.sort((a : any, b: any) => {return (a.eContents()[0].get('headerOrder') - b.eContents()[0].get('headerOrder'))})
        
        const menu = (<Menu style={{ marginTop: '10px', backgroundColor: '#2a356c',
            height: '150px',
            overflow: 'auto',
            width: "200px"}}>
                {applications.slice(3).map(
                    (app: any) =>
                        <Menu.Item
                            className={'headerMenu'}
                            key={app.eContents()[0].get('name')}
                            onClick={() => this.setSelectedApp(app.eContents()[0].get('name'))}
                        >
                            <Link
                                key={app.eContents()[0].get('name')}
                                to={(this.sliceApp(app.eContents()[0].get('name')))}
                                className={'limksInMoreWord'}
                            >
                                <NeoTypography
                                    className='appNameInMenu'
                                    style={{color: app.eContents()[0].get('name') === this.state.selectedApp ? "#2A356C"  : "#8C8C8C"}}
                                    type={'capture_regular'}
                                >
                                    {app.eContents()[0].get('name')}
                                </NeoTypography>
                            </Link>
                        </Menu.Item>
                )}
        </Menu>);

        const menuForSmallScreen = (<Menu style={{marginTop: '-8px', backgroundColor: '#2a356c',
            height: '150px',
            overflow: 'auto',
            width: "200px"}}>
                {applications.map((app: any) =>
                    <Menu.Item
                        className={'headerMenu'}
                        key={app.eContents()[0].get('name')}
                        onClick={() => this.setSelectedApp(app.eContents()[0].get('name'))}
                    >
                        <Link
                            key={app.eContents()[0].get('name')}
                            to={encodeAppURL(this.props.context.getURL(app.eContents()[0].get('name'), false))}
                            className={'limksInMoreWord'}
                        >
                            <NeoTypography
                                className='appNameInMenu'
                                style={{color: app.eContents()[0].get('name') === this.state.selectedApp ? "#2A356C"  : "#8C8C8C"}}
                                type={'capture_regular'}
                            >
                                {app.eContents()[0].get('name')}
                            </NeoTypography>
                        </Link>
                    </Menu.Item>
                )}
        </Menu>);

        return (
            <div>
                <div className={'HeaderWithNames'}>
                    <NeoRow style={{width: '100%'}}>
                        {applications.slice(0, 3).map((app: any) =>
                            <NeoCol
                                className='btn-appName'
                                span={applications.length < 4 ? 8 : 7}
                                key={app.eContents()[0].get('name')}
                            >
                                <Link
                                    key={app.eContents()[0].get('name')}
                                    to={encodeAppURL(this.props.context.getURL(app.eContents()[0].get('name'), false))}
                                    className={'linksInMoreWord'}
                                    onClick={() => this.setSelectedApp(app.eContents()[0].get('name'))}
                                >
                                    <NeoTypography
                                        className='applicationName'
                                        style={{color: app.eContents()[0].get('name') === this.state.selectedApp ? "#FFFFFF"  : "#B3B3B3"}}
                                        type={app.eContents()[0].get('name') === this.state.selectedApp ? 'h4_regular' : 'h4_light'}
                                    >
                                        {app.eContents()[0].get('name')}
                                    </NeoTypography>
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
                                            <NeoTypography
                                                className='appMoreWord'
                                                style={{color: "#B3B3B3"}}
                                                type={'h4_light'}
                                            >
                                                {t('more')}
                                            </NeoTypography>
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

    setSelectedApp = (newSelectedApp?: string) => {
        if (newSelectedApp !== undefined) {
            this.setState({selectedApp: newSelectedApp});
            this.props.context.changeURL!(newSelectedApp, false);
            this.props.context.changeUserProfile('startApp', newSelectedApp)
        }
        else {
            let selectedApp: string;
            let apps = this.state.applications.length !== 0 ? this.state.applications : this.props.applications.length !== 0 ? this.props.applications : undefined
            if (apps !== undefined && this.props.context !== undefined && this.props.context.userProfilePromise !== undefined) {
                this.props.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
                    if (userProfile !== undefined) {
                        const application = userProfile.eContents()[0].get('params').array()
                            .filter((u: any) => u.get('key') === 'startApp');
                        if (application.length !== 0 && application[0].get('value') !== undefined) {
                            selectedApp = JSON.parse(application[0].get('value'));
                        }
                        else {
                            selectedApp = apps[0].eContents()[0].get('name');
                        }
                    } else {
                        selectedApp = apps[0].eContents()[0].get('name');
                    }
                    if (JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split('/app/')[1])))[0].appModule !== selectedApp) {
                        selectedApp = JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split('/app/')[1])))[0].appModule
                    }
                    if (selectedApp !== this.state.selectedApp && selectedApp !== undefined){
                        this.setState({selectedApp});
                        this.props.context.changeUserProfile('startApp', selectedApp)
                    }
                });
            }
        }
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.applications.length !== this.props.applications.length) {
            this.setState({applications: this.props.applications});
            this.setSelectedApp()
        }
    }

    componentDidMount(): void {
        this.setSelectedApp()
    }

    render() {
        return (
            <NeoRow style={{marginTop: '0px', width: '100%'}} className='apps-menu'>
                {
                    this.state.applications.length === 0 && this.state.selectedApp === undefined
                        ?
                        <span style={{fontWeight: 500, color: 'rgb(255, 255, 255)'}}>Loading... </span>
                        :
                        this.appsMenu()
                }
            </NeoRow>
        );
    }
}

export default withTranslation()(HeaderMenu)
