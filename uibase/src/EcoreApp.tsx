import * as React from "react";
import {Button, Icon, Layout, Menu, notification, Dropdown} from 'antd';
import 'antd/dist/antd.css';
import './styles/EcoreApp.css';
import {API, Error, IErrorHandler} from './modules/api'
import MetaBrowserTrans from "./components/MetaBrowser";
import {ResourceEditor} from "./components/ResourceEditor"
import {Link, Redirect, Route, Switch} from "react-router-dom";
import QueryRunnerTrans from "./components/QueryRunner";
import Login from "./components/Login";
import {DataBrowser} from "./components/DataBrowser";
import {MainApp} from "./MainApp";
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from "ecore";
import DynamicComponent from "./components/DynamicComponent"
import _map from "lodash/map"
import GitDB from "./components/GitDB";

import ru from 'flag-icon-css/flags/1x1/ru.svg';
import en from 'flag-icon-css/flags/1x1/us.svg';
import cn from 'flag-icon-css/flags/1x1/cn.svg';

const langIcon: {[key:string]: any} = {
    'en': en,
    'ru': ru,
    'ch': cn
}

const { Header, Content, Sider } = Layout;
const ResourceEditorTrans = withTranslation()(ResourceEditor);

interface State {
    principal?: any;
    languages: string[];
    notifierDuration: number;
}

class EcoreApp extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            principal: undefined,
            languages: [],
            notifierDuration: 0
        };
    }

    onRightMenu(e : any) {
        if (e.key === "logout") {
            API.instance().logout().then(() => {
                this.setState({principal : undefined});
            });
            this.props.history.push('')
        }
        else if (e.key === "developer") {
            this.props.history.push('/settings/data');
        }
        else if (e.key === "app") {
            this.props.history.push('/app');
        }
        else if (e.key === "testComponent") {
            this.props.history.push('/test');
        }
        else if (e.key === "showNotifications"){
            this.setState({notifierDuration : 0});
            localStorage.setItem('notifierDuration', '0');
        }
        else if (e.key === "autoHideNotifications"){
            this.setState({notifierDuration : 3});
            localStorage.setItem('notifierDuration', '3');
        }
    }

    setPrincipal = (principal: any)=>{
        this.setState({principal}, API.instance().init)
    };

    getLanguages() {
        const prepared: Array<string> = [];
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Lang");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((resources) => {
                        resources.map((r) =>
                                prepared.push(r.eContents()[0].get('name'))
                        );
                        this.setState({languages: prepared.sort()})
                    })
            }
        })
    }

    renderDev = () => {
        let principal = this.state.principal as any;
        const {t, i18n} = this.props as WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng)
        };
        const storeLangValue = String(localStorage.getItem('i18nextLng'))
        const langMenu = () => <Menu>
            {_map(langIcon, (iconRes:any, index:number)=>
                <Menu.Item onClick={()=>setLang(index)} key={index} style={{ width: '60px' }}>
                    <img style={{ borderRadius: '25px' }} alt='language' src={iconRes} />
                </Menu.Item>
            )}
        </Menu>

        return (
            <Layout style={{ height: '100vh' }}>
                <Header className="app-header" style={{ height: '55px', padding: '0px', backgroundColor: 'white' }}>
                    <div className={window.location.pathname.includes('settings') ? "app-logo-settings" : "app-logo"}>
                        <Icon type='appstore' style={{ color: '#1890ff', marginRight: '2px', marginLeft: '10px' }} />
                        <span style={{ fontVariantCaps: 'petite-caps' }}>Neoflex CORE</span>
                    </div>
                    <Menu className="header-menu" theme="light" mode="horizontal" onClick={(e) => this.onRightMenu(e)}>
                        <Menu.SubMenu title={<span style={{ fontVariantCaps: 'petite-caps', fontSize: '18px', lineHeight: '39px' }}>{principal.name}</span>} style={{ float: "right", height: '100%' }}>
                            <Menu.Item key={'logout'}><Icon type="logout" style={{ fontSize: '17px' }} />{t('logout')}</Menu.Item>
                            <Menu.Item key={'developer'}><Icon type="setting" style={{ fontSize: '17px' }} theme="filled" />{t('developer')}</Menu.Item>
                            <Menu.Item key={'app'}><Icon type="sketch" style={{ fontSize: '17px' }} />App</Menu.Item>
                            <Menu.Item key={'testComponent'}><Icon type="coffee" style={{ fontSize: '17px' }} />Test component</Menu.Item>
                            <Menu.SubMenu title={<span><Icon type="global" style={{ fontSize: '17px' }} />{t('language')}</span>}>
                                {
                                    this.state.languages.map((c: any) =>
                                        <Menu.Item key={c} onClick={() =>
                                            setLang(c)
                                        }>
                                            <Icon type="flag" style={{ fontSize: '17px' }} />
                                            {c.toUpperCase()}
                                        </Menu.Item>)
                                }
                            </Menu.SubMenu>
                            <Menu.SubMenu title={<span><Icon type="notification" style={{ fontSize: '17px' }} />Notification</span>}>
                                {localStorage.getItem('notifierDuration') === '3' ?
                                    <Menu.Item key={'showNotifications'}><Icon type="eye" style={{ fontSize: '17px' }} />Disable autohiding</Menu.Item>
                                    :
                                    <Menu.Item key={'autoHideNotifications'}><Icon type="clock-circle" style={{ fontSize: '17px' }} />Autohide</Menu.Item>}
                            </Menu.SubMenu>
                        </Menu.SubMenu>
                    </Menu>
                    <Dropdown overlay={langMenu} placement="bottomCenter">
                        <img className="lang-icon" alt='language' src={langIcon[storeLangValue] || en} />
                    </Dropdown>
                    <Icon className="bell-icon" type="bell" />
                </Header>
                <Switch>
                    <Redirect from={'/'} exact={true} to={'/app'}/>
                    <Redirect from={'/app'} exact={true} to={'/app/ReportsApp'}/>
                    <Route path='/app/:appModuleName' component={this.renderStartPage}/>
                    <Route path='/settings' component={this.renderSettings}/>
                    <Route path='/test' component={this.renderTest}/>
                </Switch>
            </Layout>
        )
    };

    renderTest = ()=> {
        return (
            <div>
                {/*Correct test example*/}
                <DynamicComponent componentPath={"components/reports/component.js"} componentName={"Report"}/>
                {/*Example with error*/}
                <DynamicComponent componentPath={"components/reports/component.js"} componentName={"UnCorrect"}/>
            </div>
    )};
    
    renderSettings=()=>{
        const {t} = this.props as WithTranslation;
        let selectedKeys = ['metadata', 'data', 'query', 'gitdb']
            .filter(k => this.props.location.pathname.split('/').includes(k));
        return (
            <Layout>
                <Sider collapsible breakpoint="lg" collapsedWidth="0" theme="dark" width='260px' style={{ backgroundColor: '#1b2430' }}>
                    <Menu className="sider-menu" theme="dark" mode="inline" selectedKeys={selectedKeys} style={{ marginTop: '20px', backgroundColor: '#1b2430', fontVariantCaps: 'petite-caps' }}>
                        <Menu.Item style={{ fontSize: 14 }} key={'metadata'}>
                        <Link to={`/settings/metadata`}>
                            <Icon type="compass" style={{ color: '#7d7d7d' }} />
                            <span style={{ color: '#eeeeee', }}>{t('metadata')}</span>
                        </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'data'}>
                            <Link to={`/settings/data`}>
                            <Icon type="shopping" style={{ color: '#7d7d7d' }} />  
                            <span style={{ color: '#eeeeee' }}>{t('data')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'query'}>
                            <Link to={`/settings/query`}>
                                <Icon type="database" style={{ color: '#7d7d7d' }} />
                                <span style={{ color: '#eeeeee' }}>{t('query')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'gitdb'}>
                            <Link to={`/settings/gitdb`}>
                                <Icon type="database" style={{ color: '#7d7d7d' }} />
                                <span style={{ color: '#eeeeee' }}>{t('gitdb')}</span>
                            </Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Content className="app-content">
                        <Switch>
                            <Route path='/settings/metadata' component={MetaBrowserTrans}/>
                            <Route path='/settings/query' component={QueryRunnerTrans}/>
                            <Route exact={true} path='/settings/data' component={DataBrowser}/>
                            <Route path='/settings/data/:id/:ref' component={ResourceEditorTrans}/>
                            <Route path='/settings/gitdb' component={GitDB}/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        )
    };

    renderStartPage = (props: any)=>{
        return (
            <MainApp {...props}/>
        )
    };

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages()
        const _this = this;
        let errorHandler : IErrorHandler = {
            handleError(error: Error): void {
                if (error.status === 401) {
                    _this.setState({principal: undefined});
                }
                let btn = (<Button type="link" size="small" onClick={() => notification.destroy()}>
                    Close All
                </Button>);
                let key = error.error + error.status + error.message;
                    notification.error({
                        message: "Error: " + error.status + " (" + error.error + ")",
                        btn,
                        duration: _this.state.notifierDuration,
                        description: error.message,
                        key,
                        style: {
                            width: 400,
                            marginLeft: -10,
                            marginTop: 16,
                            wordWrap: "break-word"
                        },
                    })
            }
        } as IErrorHandler;
        API.instance().addErrorHandler(errorHandler);

        const localDuration = localStorage.getItem('notifierDuration');
        localDuration && this.setState({notifierDuration: Number(localDuration) });
    }

    render = () => {
        return (
                <Layout>
                    {this.state.principal === undefined ?
                            <Login onLoginSucceed={this.setPrincipal}/>
                        :
                            this.renderDev()
                    }
                </Layout>
        )
    }
}
const EcoreAppTrans = withTranslation()(EcoreApp);
export default EcoreAppTrans;
