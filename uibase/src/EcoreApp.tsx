import * as React from "react";
import {Button, Icon, Layout, Menu, notification, Dropdown, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import './styles/EcoreApp.css';
import {API, Error, IErrorHandler} from './modules/api'
import MetaBrowser from "./components/MetaBrowser";
import ResourceEditor from "./components/ResourceEditor"
import {Link, Route, Switch} from "react-router-dom";
import QueryRunner from "./components/QueryRunner";
import Login from "./components/Login";
import {DataBrowser} from "./components/DataBrowser";
import {MainApp} from "./MainApp";
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from "ecore";
import DynamicComponent from "./components/DynamicComponent"
import _map from "lodash/map"
import Tools from "./components/Tools";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSignOutAlt, faBullhorn, faTools, faEquals} from '@fortawesome/free-solid-svg-icons'
import {faClock, faEye, faUser} from '@fortawesome/free-regular-svg-icons'
import {faBuffer, faSketch} from "@fortawesome/free-brands-svg-icons";
import BreadcrumbApp from "./components/BreadcrumbApp";
import {StartPage} from "./components/StartPage";
import {IMainContext, MainContext} from "./MainContext";
import update from "immutability-helper";
import ConfigUrlElement from "./ConfigUrlElement";

const { Header, Content, Sider } = Layout;

interface State {
    principal?: any;
    languages: string[];
    notifierDuration: number;
    breadcrumb: string[];
    applications: string[];
    context: IMainContext;
    pathFull: any[];
    appModuleName: string;
}

class EcoreApp extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        const context: IMainContext = {
            updateContext: this.updateContext,
            changeURL: this.changeURL
        };
        this.state = {
            principal: undefined,
            languages: [],
            notifierDuration: 0,
            breadcrumb: [],
            applications: [],
            context,
            pathFull: [],
            appModuleName: props.appModuleName,
        }
    }

    updateContext = (context: any, cb?: ()=>void) => {
        this.setState((state, props) => {
            return {context: update(state.context, {$merge: context})}
        }, cb)
    };

    static getDerivedStateFromProps(nextProps: any, prevState: State) {
        if (nextProps.location.pathname.includes("app")) {
            const pathFull = JSON.parse(decodeURIComponent(atob(nextProps.location.pathname.split("/app/")[1])))
            return {
                pathFull: pathFull,
                appModuleName: pathFull[pathFull.length - 1].appModule
            }
        } else {
            return null
        }
    }

    changeURL = (appModuleName?: string, treeValue?: string, reportDate?: string) => {
        let path: any[] = [];
        let urlElement: ConfigUrlElement = {
            appModule: appModuleName,
            tree: [],
            params: {
                reportDate: reportDate
            }
        };
        let appModuleNameThis = appModuleName || this.state.appModuleName;
        if (appModuleName !== undefined && this.state.applications.includes(appModuleName)){
            path.push(urlElement)
        }
        else if (this.state.pathFull && appModuleName === this.state.appModuleName && treeValue !== undefined) {
            this.state.pathFull.forEach( (p:any) => {
                urlElement = p;
                if (p.appModule === appModuleNameThis) {
                    urlElement.tree = treeValue.split('/');
                    urlElement.params.reportDate = reportDate;
                    path.push(urlElement)
                }
                else {
                    path.push(urlElement)
                }
            });
        } else if (this.state.pathFull && appModuleName === this.state.appModuleName && reportDate !== undefined) {
            this.state.pathFull.forEach( (p:any) => {
                urlElement = p;
                if (p.appModule === appModuleNameThis) {
                    urlElement.params.reportDate = reportDate;
                    path.push(urlElement)
                }
                else {
                    path.push(urlElement)
                }
            });
        } else if (appModuleName !== this.state.appModuleName) {
            this.state.pathFull.forEach( (p:any) => {
                path.push(p)
            });
            urlElement.appModule = appModuleName
            urlElement.tree = treeValue !== undefined ? treeValue.split('/') : []
            urlElement.params.reportDate = reportDate
            path.push(urlElement)
        } else if (appModuleName === this.state.appModuleName) {
            this.state.pathFull.forEach( (p:any) => {
                path.push(p)
            });
        }
        this.setState({pathFull: path});
        this.props.history.push(`/app/${
            btoa(
                encodeURIComponent(
                    JSON.stringify(
                        path
                    )
                )
            )
            }`);
    };

    onRightMenu(e : any) {
        if (e.key === "logout") {
            API.instance().logout().then(() => {
                this.setState({principal : undefined});
            });
            this.props.history.push('')
        }
        else if (e.key === "developer") {
            this.props.history.push('/developer/data');
        }
        else if (e.key.split('.').includes('app')) {
            this.changeURL(e.key.split('.').slice(1).join('.'))
        }
        else if (e.key === "test") {
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
        if (this.props.history.location.pathname === "/") {
            this.props.history.push('/home')
        }
    };

    getAllApplication() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Application");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((applicationsObjects) => {
                        let applications = applicationsObjects.map( (a:any) =>
                            a.eContents()[0].get('name')
                        )
                        this.setState({applications})
                    })
            }
        })
    };

    getLanguages() {
        const prepared: Array<string> = [];
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Lang");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((resources) => {
                        resources.forEach((r) => {
                            prepared.push(r.eContents()[0].get('name'))
                        });
                        this.setState({languages: prepared.sort()})
                    })
            }
        })
    }

    setBreadcrumb() {
        if (this.props.location.pathname.split('/app/')[1] !== undefined) {
            const allAppModules = JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split('/app/')[1])));
            let breadcrumb = [];
            for (let i = 0; i <= allAppModules.length - 1; i++) {
                breadcrumb.push(`${allAppModules[i].appModule}_${i}`)
            }
            this.setState({breadcrumb})
        }
    }

    onClickBreadcrumb = (b : string): void => {
        if (b === "home") {
            this.props.history.push('/home')
            this.setState({breadcrumb: []});
        } else {
            let indexBreadcrumb = this.state.breadcrumb.indexOf(b);
            let breadcrumb = this.state.breadcrumb.slice(0, indexBreadcrumb + 1);
            let path = JSON.parse(decodeURIComponent(atob(this.props.history.location.pathname.split('/app/')[1]))).slice(0, indexBreadcrumb + 1);
            this.props.history.push(`/app/${
                btoa(
                    encodeURIComponent(
                        JSON.stringify(
                            path
                        )
                    )
                )
                }`);
            this.setState({breadcrumb});
        }
    };

    renderDev = (props: any) => {
        const languages: { [key: string]: any } = this.state.languages;
        const storeLangValue = String(localStorage.getItem('i18nextLng'));
        let principal = this.state.principal as any;
        const {t, i18n} = this.props as WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng)
        };
        const langMenu = () => <Menu style={{ marginTop: '24px' }}>
            {_map(languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={lang} style={{ width: '60px' }}>
                    <span style={{ fontVariantCaps: 'petite-caps' }}>{lang}</span>
                </Menu.Item>
            )}
        </Menu>;
        let selectedKeys = this.setSelectedKeys();
        return (
            <Layout style={{height: '100vh'}}>
                <Header className="app-header" style={{height: '55px', padding: '0px', backgroundColor: 'white'}}>
                    <Row>
                        <Col span={4} style={{display: "block", width: "10.5%", boxSizing: "border-box"}}>
                            <div className={window.location.pathname.includes('developer' +
                                '') ? "app-logo-settings" : "app-logo"}>
                                <Icon type='appstore'
                                      style={{color: '#1890ff', marginRight: '2px', marginLeft: '10px'}}/>
                                <span style={{fontVariantCaps: 'petite-caps'}}>{t('appname')}</span>
                            </div>
                        </Col>
                        <Col style={{marginLeft: "291px"}}>
                            <Row>
                                <Col span={19}>
                                    <BreadcrumbApp {...props}  selectedKeys={selectedKeys} breadcrumb={this.state.breadcrumb}
                                                   onClickBreadcrumb={this.onClickBreadcrumb}/>
                                </Col>
                                <Col span={5}>
                                    <Menu selectedKeys={selectedKeys} className="header-menu" theme="light"
                                          mode="horizontal" onClick={(e) => this.onRightMenu(e)}>
                                        <Menu.SubMenu title={<span style={{
                                            fontVariantCaps: 'petite-caps',
                                            fontSize: '18px',
                                            lineHeight: '39px'
                                        }}>
                                    <FontAwesomeIcon icon={faUser} size="xs"
                                                     style={{marginRight: "7px"}}/>{principal.name}</span>}
                                                      style={{float: "right", height: '100%'}}>
                                            <Menu.Item key={'logout'}><FontAwesomeIcon icon={faSignOutAlt} size="lg"
                                                                                       flip="both"
                                                                                       style={{marginRight: "10px"}}/>{t('logout')}
                                            </Menu.Item>
                                            <Menu.Item key={'developer'}>
                                                <Link to={`/developer/data`}>
                                                    <FontAwesomeIcon icon={faTools} size="lg"
                                                                     style={{marginRight: "10px"}}/>
                                                    {t('developer')}
                                                </Link>
                                            </Menu.Item>
                                            <Menu.SubMenu title={<span><FontAwesomeIcon icon={faSketch} size="lg"
                                                                                        style={{marginRight: "10px"}}/>Applications</span>}>
                                                {this.state.applications.map((a: any) =>
                                                    <Menu.Item key={`app.${a}`}>
                                                        {a}
                                                    </Menu.Item>
                                                )}
                                            </Menu.SubMenu>
                                            <Menu.Item key={'test'}>
                                                <Link to={`/test`}>
                                                    <FontAwesomeIcon icon={faBuffer} size="lg"
                                                                     style={{marginRight: "10px"}}/>
                                                    Test component
                                                </Link>
                                            </Menu.Item>
                                            <Menu.SubMenu title={<span><FontAwesomeIcon icon={faBullhorn} size="lg"
                                                                                        style={{marginRight: "10px"}}/>Notification</span>}>
                                                {localStorage.getItem('notifierDuration') === '3' ?
                                                    <Menu.Item key={'showNotifications'}>
                                                        <FontAwesomeIcon icon={faEye} size="lg"
                                                                         style={{marginRight: "10px"}}/>
                                                        Disable autohiding</Menu.Item>
                                                    :
                                                    <Menu.Item key={'autoHideNotifications'}>
                                                        <FontAwesomeIcon icon={faClock} size="lg"
                                                                         style={{marginRight: "10px"}}/>
                                                        Autohide</Menu.Item>}
                                            </Menu.SubMenu>
                                        </Menu.SubMenu>
                                    </Menu>
                                    <Dropdown overlay={langMenu} placement="bottomCenter">
                                        <div className="lang-label" style={{ fontVariantCaps: 'petite-caps' }}>
                                            {languages.includes(storeLangValue) ? storeLangValue.toUpperCase() : 'US'}
                                        </div>
                                    </Dropdown>
                                    <Icon className="bell-icon" type="bell"/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Header>
                <Switch>
                    <Route path='/home' component={this.renderStartPage}/>
                    <Route path='/app/:appModuleName' component={this.renderApplication}/>
                    <Route path='/developer' component={this.renderSettings}/>
                    <Route path='/test' component={this.renderTest}/>
                </Switch>
            </Layout>
        )
    };

    private setSelectedKeys() {
        let selectedKeys = ['developer', 'test'];
        if (this.state.applications) {
            this.state.applications.map((a: any) =>
                selectedKeys.push(`app.${a}`));
        }
        if (this.props.location.pathname.includes('/app/')) {
            const currentApplication = JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split('/app/')[1])))[0].appModule
            selectedKeys = selectedKeys
                .filter(k => k.split('.').length > 1)
                .filter( k =>
                    currentApplication.includes(k.slice(4))
                )
        } else {
            selectedKeys = selectedKeys.filter(k =>
                this.props.location.pathname.split('/').includes(k) ||
                this.props.location.pathname.split('/').includes(k.slice(4) !== "" && k.slice(4))
            )
        }
        return selectedKeys;
    }

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
        let selectedKeys = ['metadata', 'data', 'query', 'tools']
            .filter(k => this.props.location.pathname.split('/').includes(k));
        return (
            <Layout>
                <Sider collapsible breakpoint="lg" collapsedWidth="0" theme="dark" width='260px' style={{ backgroundColor: '#1b2430' }}>
                    <Menu className="sider-menu" theme="dark" mode="inline" selectedKeys={selectedKeys} style={{ marginTop: '20px', backgroundColor: '#1b2430', fontVariantCaps: 'petite-caps' }}>
                        <Menu.Item style={{ fontSize: 14 }} key={'metadata'}>
                            <Link to={`/developer/metadata`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee' }}/>
                                <span style={{ color: '#eeeeee', }}>{t('metadata')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'data'}>
                            <Link to={`/developer/data`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee' }}/>
                                <span style={{ color: '#eeeeee' }}>{t('data')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'query'}>
                            <Link to={`/developer/query`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee'}}/>
                                <span style={{ color: '#eeeeee' }}>{t('query')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'tools'}>
                            <Link to={`/developer/tools`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee'}}/>
                                <span style={{ color: '#eeeeee' }}>{t('tools')}</span>
                            </Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Content className="app-content">
                        <Switch>
                            <Route path='/developer/metadata' component={MetaBrowser}/>
                            <Route path='/developer/query' component={QueryRunner}/>
                            <Route exact={true} path='/developer/data' component={DataBrowser}/>
                            <Route path='/developer/data/editor/:id/:ref' component={ResourceEditor}/>
                            <Route path='/developer/tools' component={Tools}/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        )
    };

    renderApplication = (props: any)=>{
        return (
            <MainContext.Consumer>
                {context => {
                    return <MainApp {...props} context={context}/>;
                }}
            </MainContext.Consumer>
        )
    };

    renderStartPage = (props: any) => {
        return (
            <MainContext.Consumer>
                {context => {
                    return <StartPage {...props} context={context} applications={this.state.applications}/>;
                }}
            </MainContext.Consumer>
        )
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            this.setBreadcrumb()
        }
    }

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages();
        if (!this.state.applications.length) {this.getAllApplication()}
        if (!this.state.breadcrumb.length) {this.setBreadcrumb()}
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
                            width: 450,
                            marginLeft: -52,
                            marginTop: 16,
                            wordWrap: "break-word",
                            fontWeight: 350
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
            <MainContext.Provider value={this.state.context}>
                <Layout>
                    {this.state.principal === undefined ?
                        <Login onLoginSucceed={this.setPrincipal}/>
                        :
                        this.renderDev(this.props)
                    }
                </Layout>
            </MainContext.Provider>
        )
    }
}

export default withTranslation()(EcoreApp);
