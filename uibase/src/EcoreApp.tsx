import * as React from "react";
import {Button, Icon, Layout, Menu, notification, Dropdown, Breadcrumb, Col, Row} from 'antd';
import 'antd/dist/antd.css';
import './styles/EcoreApp.css';
import {API, Error, IErrorHandler} from './modules/api'
import MetaBrowser from "./components/MetaBrowser";
import ResourceEditor from "./components/ResourceEditor"
import {Link, Redirect, Route, Switch} from "react-router-dom";
import QueryRunner from "./components/QueryRunner";
import Login from "./components/Login";
import {DataBrowser} from "./components/DataBrowser";
import {MainApp} from "./MainApp";
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from "ecore";
import DynamicComponent from "./components/DynamicComponent"
import _map from "lodash/map"
import GitDB from "./components/GitDB";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSignOutAlt, faBullhorn, faTools, faHome} from '@fortawesome/free-solid-svg-icons'
import {faClock, faEye, faUser} from '@fortawesome/free-regular-svg-icons'
import {faBuffer, faSketch} from "@fortawesome/free-brands-svg-icons";

const { Header, Content, Sider } = Layout;

interface State {
    principal?: any;
    languages: string[];
    notifierDuration: number;
    langIcons: { [key: string]: any };
    breadcrumb: string[];
    applications: Ecore.EObject[];
}

class EcoreApp extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            principal: undefined,
            languages: [],
            notifierDuration: 0,
            langIcons: {},
            breadcrumb: [],
            applications: []
        }
    }

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
            this.props.history.push(`/app/${e.key.split('.').slice(1).join('.')}?path=${JSON.stringify([e.key.slice(4)])}`);
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
    };

    getAllApplication() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Application");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((applications) => {
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
                            this.importLangIcon(r.eContents()[0].get('name'))
                        });
                        this.setState({languages: prepared.sort()})
                    })
            }
        })
    }

    importLangIcon(lang:string){
        const langIcons: { [key: string]: any } = this.state.langIcons
        import (`flag-icon-css/flags/1x1/${lang}.svg`).then((importedModule)=> { 
            langIcons[lang] = importedModule 
            this.setState({ langIcons })
        });
    }

    setBreadcrumb() {
        if (this.props.location.search !== "") {
            let breadcrumb = JSON.parse(decodeURI(this.props.location.search.split('?path=')[1]));
            this.setState({breadcrumb})
        }
    }

    onClickBreadcrumb(b: string) {
        let indexBreadcrumb = this.state.breadcrumb.indexOf(b);
        let breadcrumb = this.state.breadcrumb.slice(0, indexBreadcrumb + 1);
        this.setState({breadcrumb});
        this.props.history.push(`${b}?path=${JSON.stringify(breadcrumb)}`)
    }

    renderDev = () => {
        const storeLangValue = String(localStorage.getItem('i18nextLng'));
        const langIcons: { [key: string]: any } = this.state.langIcons;
        let principal = this.state.principal as any;
        const {t, i18n} = this.props as WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng)
        };
        const langMenu = () => <Menu>
            {_map(this.state.languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={index} style={{ width: '60px' }}>
                    <img 
                        style={{ borderRadius: '25px' }} 
                        alt='li' 
                        src={langIcons[lang] ? langIcons[lang].default : ''} />
                </Menu.Item>
            )}
        </Menu>;
        let selectedKeys = this.setSelectedKeys();
        return (
            <Layout style={{ height: '100vh' }}>
                <Header className="app-header" style={{ height: '55px', padding: '0px', backgroundColor: 'white' }} >
                    <Row>
                        <Col span={4} style={{display: "block", width: "10.5%", boxSizing: "border-box"}}>
                            <div className={window.location.pathname.includes('developer' +
                                '') ? "app-logo-settings" : "app-logo"}>
                                <Icon type='appstore' style={{ color: '#1890ff', marginRight: '2px', marginLeft: '10px' }} />
                                <span style={{ fontVariantCaps: 'petite-caps' }}>{t('appname')}</span>
                            </div>
                        </Col>
                        <Col style={{marginLeft: "291px"}} >
                            <Row>
                                <Col span={19} className="breadcrumb">
                            <Breadcrumb separator={">"} style={{marginTop: "16px"}}>
                                {selectedKeys[0] && selectedKeys[0].split('.').includes('app') && this.state.breadcrumb.length !== 0 ?
                                    this.state.breadcrumb.map( (b: string) => {
                                        return (
                                            <Breadcrumb.Item key={b} onClick={() => this.onClickBreadcrumb(b)}>
                                                {b === this.state.breadcrumb[0] ?
                                                    <FontAwesomeIcon icon={faHome} size="lg"/>
                                                    : b }
                                            </Breadcrumb.Item>)
                                    }) : ""
                                }
                            </Breadcrumb>
                        </Col>
                        <Col span={5}>
                            <Menu selectedKeys={selectedKeys} className="header-menu" theme="light" mode="horizontal" onClick={(e) => this.onRightMenu(e)}>
                                <Menu.SubMenu title={<span style={{ fontVariantCaps: 'petite-caps', fontSize: '18px', lineHeight: '39px' }}>
                                    <FontAwesomeIcon icon={faUser} size="xs"style={{marginRight: "7px"}}/>{principal.name}</span>} style={{ float: "right", height: '100%' }}>
                                    <Menu.Item key={'logout'}><FontAwesomeIcon icon={faSignOutAlt} size="lg" flip="both" style={{marginRight: "10px"}}/>{t('logout')}</Menu.Item>
                                    <Menu.Item key={'developer'}>
                                        <Link to={`/developer/data`}>
                                            <FontAwesomeIcon icon={faTools} size="lg" style={{marginRight: "10px"}}/>
                                            {t('developer')}
                                        </Link>
                                    </Menu.Item>
                                    <Menu.SubMenu title={<span><FontAwesomeIcon icon={faSketch} size="lg"style={{marginRight: "10px"}}/>Applications</span>}>
                                        {this.state.applications.map( (a: any) =>
                                            <Menu.Item key={`app.${a.eContents()[0].get('name')}`}>
                                                {a.eContents()[0].get('name')}
                                            </Menu.Item>
                                        )}
                                    </Menu.SubMenu>
                                    <Menu.Item key={'test'}>
                                        <Link to={`/test`}>
                                            <FontAwesomeIcon icon={faBuffer} size="lg"style={{marginRight: "10px"}}/>
                                            Test component
                                        </Link>
                                    </Menu.Item>
                                    <Menu.SubMenu title={<span><FontAwesomeIcon icon={faBullhorn} size="lg" style={{marginRight: "10px"}}/>Notification</span>}>
                                        {localStorage.getItem('notifierDuration') === '3' ?
                                            <Menu.Item key={'showNotifications'}>
                                                <FontAwesomeIcon icon={faEye} size="lg"style={{marginRight: "10px"}}/>
                                                Disable autohiding</Menu.Item>
                                            :
                                            <Menu.Item key={'autoHideNotifications'}>
                                                <FontAwesomeIcon icon={faClock} size="lg"style={{marginRight: "10px"}}/>
                                                Autohide</Menu.Item>}
                                    </Menu.SubMenu>
                                </Menu.SubMenu>
                            </Menu>
                            <Dropdown overlay={langMenu} placement="bottomCenter" >
                                <img className="lang-icon" alt='li' src={langIcons[storeLangValue] ? langIcons[storeLangValue].default : ''} />
                            </Dropdown>
                            <Icon className="bell-icon" type="bell" />
                        </Col>
                            </Row>
                        </Col>
                    </Row>
                </Header>
                <Switch>
                    <Redirect from={'/'} exact={true} to={'/app'}/>
                    <Redirect from={'/app'} exact={true} to={`/app/ReportsApp?path=${JSON.stringify(["ReportsApp"])}`}/>
                    {/*<Redirect from={'/app'} exact={true} to={`/app/ReportsApp`}/>*/}
                    <Route path='/app/:appModuleName' component={this.renderStartPage}/>
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
                selectedKeys.push(`app.${a.eContents()[0].get('name')}`));
        }
        if (this.props.location.search) {
            selectedKeys = selectedKeys.filter(k => {
                if (k.split('.').length > 1) {
                    return JSON.parse(decodeURI(this.props.location.search.split('?path=')[1])).includes(k.slice(4))
                }
            })
        } else {
            selectedKeys = selectedKeys.filter(k =>
                this.props.location.pathname.split('/').includes(k));
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
        let selectedKeys = ['metadata', 'data', 'query', 'gitdb']
            .filter(k => this.props.location.pathname.split('/').includes(k));
        return (
            <Layout>
                <Sider collapsible breakpoint="lg" collapsedWidth="0" theme="dark" width='260px' style={{ backgroundColor: '#1b2430' }}>
                    <Menu className="sider-menu" theme="dark" mode="inline" selectedKeys={selectedKeys} style={{ marginTop: '20px', backgroundColor: '#1b2430', fontVariantCaps: 'petite-caps' }}>
                        <Menu.Item style={{ fontSize: 14 }} key={'metadata'}>
                        <Link to={`/developer/metadata`}>
                            <span style={{ color: '#eeeeee', }}>{t('metadata')}</span>
                        </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'data'}>
                            <Link to={`/developer/data`}>
                            <Icon type="shopping" style={{ color: '#7d7d7d' }} />  
                            <span style={{ color: '#eeeeee' }}>{t('data')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'query'}>
                            <Link to={`/developer/query`}>
                                <Icon type="database" style={{ color: '#7d7d7d' }} />
                                <span style={{ color: '#eeeeee' }}>{t('query')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'gitdb'}>
                            <Link to={`/developer/gitdb`}>
                                <Icon type="database" style={{ color: '#7d7d7d' }} />
                                <span style={{ color: '#eeeeee' }}>{t('gitdb')}</span>
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
                            <Route path='/developer/gitdb' component={GitDB}/>
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

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (decodeURI(prevProps.location.search) !== decodeURI(this.props.location.search)) {
            this.setBreadcrumb()
        }
}

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages()
        if (!this.state.breadcrumb.length) {this.setBreadcrumb()}
        if (!this.state.applications.length) {this.getAllApplication()}
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

export default withTranslation()(EcoreApp);
