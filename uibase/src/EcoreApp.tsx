import * as React from "react";
import {Button, Layout, Menu, notification, Dropdown, Col, Row} from "antd/lib";
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
import Ecore, {EObject} from "ecore";
import DynamicComponent from "./components/DynamicComponent"
import _map from "lodash/map";
import Tools from "./components/Tools";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTools, faEquals,} from "@fortawesome/free-solid-svg-icons";
import {faBellSlash, faBell} from "@fortawesome/free-regular-svg-icons";
import {
    IMainContext,
    MainContext,
    IServerQueryParam,
    IServerNamedParam,
    IEventAction
} from "./MainContext";
import update from "immutability-helper";
import ConfigUrlElement from "./ConfigUrlElement";
import HeaderMenu from "./components/HeaderMenu";
import EventTracker from "./EventTracker";
import MasterdataBrowser from "./components/app/masterdata/MasterdataBrowser";
import FilesystemBrowser from "./components/app/filesystem/FilesystemBrowser";
import pony from './icons/pony.png';
import FetchSpinner from "./components/FetchSpinner";

const backgroundColor = "#2a356c";

const { Header, Content, Sider } = Layout;

interface State {
    principal?: any;
    languages: string[];
    notifierDuration: number;
    breadcrumb: string[];
    applications: EObject[];
    applicationNames: string[];
    context: IMainContext;
    pathFull: any[];
    appModuleName: string;
    queryParameterPattern?: EObject;
    queryConditionDTOPattern?: EObject;
    queryFilterDTOPattern?: EObject;
    userProfilePattern?: EObject;
    parameterPattern?: EObject;
    getUserProfile: boolean;
    globalSettings?: EObject;
}

class EcoreApp extends React.Component<any, State> {

    private docxHandlers: any[] = [];
    private excelHandlers: any[] = [];
    private eventActions: any[] = [];
    private eventTracker = new EventTracker();

    constructor(props: any) {
        super(props);
        const context: IMainContext = {
            updateContext: this.updateContext,
            changeURL: this.changeURL,
            runQuery: this.runQuery,
            notification: this.notification,
            changeUserProfile: this.changeUserProfile,
            addDocxHandler: (handler: any) => { this.docxHandlers.push(handler) },
            addExcelHandler: (handler: any) => { this.excelHandlers.push(handler) },
            addEventAction: (action: IEventAction) => { this.eventActions.push(action) },
            removeDocxHandler: () => { this.docxHandlers.pop() },
            removeExcelHandler: () => { this.excelHandlers.pop() },
            removeEventAction: () => { this.eventActions.pop() },
            getDocxHandlers: ()=>{return this.docxHandlers},
            getExcelHandlers: ()=>{return this.excelHandlers},
            getEventActions: ()=>{return this.eventActions},
            //По событию на странице
            contextItemValues: new Map(),
            addEventHandler: this.eventTracker.addEventHandler.bind(this.eventTracker),
            removeEventHandler: this.eventTracker.removeEventHandler.bind(this.eventTracker),
            notifyAllEventHandlers: this.eventTracker.notifyAllEventHandlers.bind(this.eventTracker),
        };
        this.state = {
            principal: undefined,
            languages: [],
            notifierDuration: 0,
            breadcrumb: [],
            applications: [],
            applicationNames: [],
            context,
            pathFull: [],
            appModuleName: props.appModuleName,
            getUserProfile: true,
        }
    }

    updateContext = (context: any, cb?: ()=>void) => {
        this.setState((state, props) => {
            return {context: update(state.context, {$merge: context})}
        }, cb)
    };

    static getDerivedStateFromProps(nextProps: any, prevState: State) {
        if (nextProps.location.pathname.includes("app")) {
            const pathFull = JSON.parse(decodeURIComponent(atob(nextProps.location.pathname.split("/app/")[1])));
            return {
                pathFull: pathFull,
                appModuleName: pathFull[pathFull.length - 1].appModule
            }
        } else {
            return null
        }
    }

    getParameterPattern() {
        API.instance().findClass('auth', 'Parameter')
            .then( (parameterPattern: EObject ) => {
                this.setState({parameterPattern})
            })
    };

    changeUserProfile = (viewObjectId: string, userProfileParams: any) => {
        let updatedUserProfile: EObject = this.state.context.userProfile!;
        if (this.state.context.userProfile!.get('params').size() === 0) {
            let newParams: EObject = this.state.parameterPattern!.create({
                key: viewObjectId,
                value: JSON.stringify(userProfileParams)
            });
            updatedUserProfile.get('params').addAll(newParams)
        }
        else if (this.state.context.userProfile!.get('params').size() !== 0) {
            let otherObjects;
            let updatedObject;
            otherObjects = this.state.context.userProfile!.get('params').array()
                .filter( (p:any) => p.get('key') !== viewObjectId);
            updatedObject = this.state.context.userProfile!.get('params').array()
                .filter( (p:any) => p.get('key') === viewObjectId);

            if (updatedObject === undefined || updatedObject.length === 0) {
                updatedObject = this.state.parameterPattern!.create({
                    key: viewObjectId,
                    value: JSON.stringify(userProfileParams)
                });
            }
            else if (userProfileParams !== undefined) {
                updatedObject[0].set('value', JSON.stringify(userProfileParams))
            }
            updatedUserProfile.get('params').clear();
            if (otherObjects !== undefined && otherObjects.length !== 0 ) {
                updatedUserProfile.get('params').addAll(otherObjects)
            }
            if (userProfileParams !== undefined) {
                updatedUserProfile.get('params').addAll(updatedObject[0] !== undefined ? updatedObject[0] : updatedObject)
            }
        }
        return API.instance().saveResource(updatedUserProfile.eResource(), 99999).then(
            (newResource: Ecore.Resource) => {
                this.state.context.updateContext!(({userProfile: newResource.eContents()[0]}))
            }
        )
    };

    notification = (title: string, description: string, notificationType: string) => {
        const {t} = this.props;
        let btnCloseAll = (<Button type="link" size="small" onClick={() => notification.destroy()}>
            {t("closeall")}
        </Button>);
        let key = title + description;
        if (notificationType === "success") {
            return (
                notification.success({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", fontWeight: 350}
                }))
        }
        else if (notificationType === "error") {
            return (
                notification.error({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", fontWeight: 350}
                }))
        }
        else if (notificationType === "info") {
            return (
                notification.info({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", fontWeight: 350}
                }))
        }
        else if (notificationType === "warning") {
            return (
                notification.warning({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", fontWeight: 350}
                }))
        }
        else if (notificationType === "open") {
            return (
                notification.open({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", fontWeight: 350}
                }))
        }

    };

    getGlobalSettings() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//GlobalSettings");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((result) => {
                        if (result[0] !== undefined) {
                            this.setState({globalSettings: result[0].eContents()[0]})
                        }
                    })
            }
        })
    };

    prepareServerQueryNamedParam = (resourceSet: any, pattern: any, param: IServerNamedParam[], uri: string) => {
        function parseFormatClientToServer(format: string) : string {
            return (format) ? format.replace(new RegExp('Y', 'g'),'y')
                                    .replace(new RegExp('D', 'g'),'d')
                            : format
        }
        let resourceParameter = resourceSet.create({ uri: uri });
        let serverOperations: EObject[] =
            param === undefined
                ?
                param
                :
                param
                    .filter( (p: any) => p['parameterName'] )
                    .map( (p: any) => {
                        return (
                            pattern.create({
                                parameterName: p['parameterName'],
                                parameterValue: p['parameterValue'],
                                parameterDataType: p['parameterDataType']||"String",
                                parameterDateFormat: parseFormatClientToServer(p['parameterDateFormat'])||"yyyy-MM-dd"
                            } as IServerNamedParam)
                        )
                    });
        resourceParameter.addAll(serverOperations);
        return serverOperations.length === 1 ? [resourceParameter.to()] : resourceParameter.to();
    };

    prepareServerQueryParam = (resourceSet: any, pattern: any, param: IServerQueryParam[], uri: string) => {
        let resourceParameter = resourceSet.create({ uri: uri });
        let serverOperations: EObject[] =
            param === undefined
                ?
                param
                :
                param
                    .filter( (p: any) => p['datasetColumn'] !== undefined && p['operation'] !== undefined && p['enable'] !== undefined)
                    .map( (p: any) => {
                        return (
                            pattern.create({
                                datasetColumn: p['datasetColumn'],
                                operation: p['operation'],
                                value: p['value'],
                                enable: p['enable'],
                                type: p['type']
                            } as IServerQueryParam)
                        )
                    });
        resourceParameter.addAll(serverOperations);
        return serverOperations.length === 1 ? [resourceParameter.to()] : resourceParameter.to();
    };

    runQuery = (
        resource_: Ecore.Resource,
        queryParams: IServerNamedParam[] = [],
        filterParams: IServerQueryParam[] = [],
        aggregationParams: IServerQueryParam[] = [],
        sortParams: IServerQueryParam[] = [],
        groupByParams: IServerQueryParam[] = [],
        calculatedExpression: IServerQueryParam[] = [],
        groupByColumn: IServerQueryParam[] = []
    ) => {
        const resource: Ecore.Resource = resource_;
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = 'runQuery';
        let resourceSet = Ecore.ResourceSet.create();
        return API.instance().call(ref, methodName, [
            this.prepareServerQueryNamedParam(resourceSet, this.state.queryParameterPattern!, queryParams, '/queryParameter'),
            this.prepareServerQueryParam(resourceSet, this.state.queryFilterDTOPattern!, filterParams, '/parameterFilter'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, aggregationParams, '/parameterAggregation'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, sortParams, '/parameterSort'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, groupByParams, '/parameterGroupBy'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, calculatedExpression, '/parameterCalculatedExpression'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, groupByColumn, '/parameterGroupByColumn')])
    };

    changeURL = (appModuleName?: string, useParentReferenceTree?: boolean, treeValue?: string, params?: Object[]) => {
        let path: any[] = [];
        let urlElement: ConfigUrlElement = {
            appModule: appModuleName,
            tree: treeValue !== undefined ? treeValue.split('/') : [],
            params: params,
            useParentReferenceTree: useParentReferenceTree || false
        };
        let appModuleNameThis = appModuleName || this.state.appModuleName;
        if (appModuleName !== undefined && this.state.applicationNames.includes(appModuleName)){
            path.push(urlElement)
        }
        else if (this.state.pathFull && appModuleName === this.state.appModuleName && treeValue !== undefined) {
            this.state.pathFull.forEach( (p:any) => {
                urlElement = p;
                if (p.appModule === appModuleNameThis) {
                    urlElement.tree = treeValue.split('/');
                    urlElement.params = params;
                    path.push(urlElement)
                }
                else {
                    path.push(urlElement)
                }
            });
        } else if (this.state.pathFull && appModuleName === this.state.appModuleName && params !== undefined) {
            this.state.pathFull.forEach( (p:any) => {
                urlElement = p;
                if (p.appModule === appModuleNameThis) {
                    urlElement.params = params;
                    path.push(urlElement)
                }
                else {
                    path.push(urlElement)
                }
            });
        } else if (appModuleName !== this.state.appModuleName) {
            let splitPathFull: any = [];
            this.state.pathFull.forEach((p: any, index: any) => {
                if (p.appModule === appModuleName) {splitPathFull.push(index)}
            });
            if (splitPathFull.length === 0) {
                this.state.pathFull.forEach( (p:any, index: any) => {
                    path.push(p);
                });
                urlElement.appModule = appModuleName;
                urlElement.tree = treeValue !== undefined ? treeValue.split('/') : [];
                urlElement.params = params;

                const nextPath = path[path.length - 1];
                if (
                    nextPath.useParentReferenceTree === true &&
                    nextPath.tree.length !== 0 &&
                    path.length !== 1
                ) {
                    path.pop()
                }
                path.push(urlElement)
            } else {
                path = this.state.pathFull.splice(0, splitPathFull[0] + 1)
            }
        } else if (appModuleName === this.state.appModuleName) {
            path = this.state.pathFull
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

    logOut = () => {
        API.instance().logout().then(() => {
            this.setState({principal : undefined, getUserProfile: true});
            this.state.context.updateContext!(({userProfile: undefined}))
        });
        this.props.history.push('')
    };

    setPrincipal = (principal: any)=>{
        this.setState({principal}, API.instance().init);
    };

    getAllApplication() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Application");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((applications) => {
                        let applicationNames = applications.map( (a:any) =>
                            a.eContents()[0].get('name')
                        );
                        this.setState({applicationNames, applications});
                        if (applicationNames.length !== 0) {
                            this.startPageSelection(applicationNames[0])
                        }
                        else {
                            this.notification("Application", "Not found","info")
                        }
                    })
            }
        })
    };

    startPageSelection(applicationName: string) {
        let application: any = undefined;
        if (this.state.context.userProfile !== undefined) {
            application = this.state.context.userProfile.get('params').array()
                .filter((u: any) => u.get('key') === 'startApp')
        }
        if (this.props.history.location.pathname === "/") {
            if (application !== undefined && application.length !== 0 && application[0].get('value') !== undefined) {
                this.changeURL(JSON.parse(application[0].get('value')), false)
            }
            else {
                this.changeURL(applicationName, false)
            }
        }
    }

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

    onClickBellIcon = () => {
        if (this.state.notifierDuration === 3){
            this.setState({ notifierDuration: 0});
            localStorage.setItem('notifierDuration', '0');
        }
        else{
            this.setState({ notifierDuration: 3});
            localStorage.setItem('notifierDuration', '3');
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
        const langMenu = () => <Menu style={{ backgroundColor: backgroundColor }}>
            {_map(languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={lang} style={{ width: '60px' }}>
                    <span className='lang-title' style={{ fontVariantCaps: 'petite-caps' }}>{lang}</span>
                </Menu.Item>
            )}
        </Menu>;
        return (
            <Layout style={{height: '100vh'}}>
                <FetchSpinner/>
                <Header className="app-header" style={{height: '80px', padding: '10px 0 0 0', backgroundColor: backgroundColor}}>
                    <Row style={{height: '70'}}>
                        <Col span={5} style={{display: "block", height: 'inherit', paddingLeft: '20px'}}>
                            <div className={window.location.pathname.includes('developer' +
                                '') ? "app-logo-settings" : "app-logo"}
                                 onClick={this.renderDashboard}
                            >
                                <img alt={t('notfound')} src={pony} style={{ maxHeight: '53px', maxWidth: '55px', marginRight: '10px', marginBottom: '10px' }}/>
                                <span style={{ fontVariantCaps: 'normal' }}>{t('appname').substr(0,2)}</span>{t('appname').substr(3)}
                            </div>
                        </Col>
                        <Col span={14}
                                    style={{textAlign: 'center', height: 'inherit'}}>
                                    {
                                        this.props.location.pathname.includes('/app/') &&

                                        <MainContext.Consumer>
                                            {(context: any) => {
                                                return <HeaderMenu
                                                    {...props}
                                                    applications={this.state.applications}
                                                    context={context}
                                                />
                                            }}
                                        </MainContext.Consumer>
                                    }
                        </Col>
                        <Col span={5}
                             style={{
                                    height: 'inherit'
                             }}>
                            <Button
                                onClick={this.logOut}
                                type="link" className="bell-icon logout-icon" ghost style={{
                                width: '5px',
                                height: '20px',
                                marginTop: '22px',
                                background: "rgb(255,255,255)", borderColor: "rgb(250,250,250)"}}
                            >
                            </Button>
                            <Link to={`/developer/data`}>
                                    <FontAwesomeIcon className="bell-icon developer-icon" icon={faTools} size="1x"/>
                            </Link>
                            <div className='header-menu'>
                                    <span style={{
                                        textTransform: "capitalize",
                                        fontSize: '15px',
                                        lineHeight: '39px'
                                    }}>
                                        <span>{principal.name}</span></span>
                            </div>
                            <Dropdown overlay={langMenu} placement="bottomCenter">
                                    <div className="lang-label" style={{ fontVariantCaps: 'petite-caps' }}>
                                        {languages.includes(storeLangValue) ? storeLangValue.toUpperCase() : 'US'}
                                    </div>
                            </Dropdown>
                            <Button  type="link"
                                    className="bell-icon" ghost style={{
                                    width: '5px',
                                    height: '20px',
                                    marginRight: '5px',
                                    color: '#ffffff',
                                    background: "rgb(255,255,255)", borderColor: "rgb(250,250,250)"}}
                                         onClick={this.onClickBellIcon}>
                                    {localStorage.getItem('notifierDuration') === '3'  ?
                                        <FontAwesomeIcon icon={faBellSlash} size="lg" style={{marginLeft: '-3px'}}/>
                                    :
                                        <FontAwesomeIcon icon={faBell} size="lg"/>}
                            </Button>
                        </Col>
                    </Row>
                </Header>
                <Switch>
                    <Route path='/app/:appModuleName' component={this.renderApplication}/>
                    <Route path='/developer' component={this.renderSettings}/>
                    <Route path='/test' component={this.renderTest}/>
                </Switch>
            </Layout>
        )
    };

    renderDashboard = () => {
        this.changeURL(this.state.globalSettings!.get('dashboard').get('name'))
    };

    private setSelectedKeys() {
        let selectedKeys = ['developer', 'test'];
        if (this.state.applicationNames) {
            this.state.applicationNames.map((a: any) =>
                selectedKeys.push(`app.${a}`));
        }
        if (this.props.location.pathname.includes('/app/')) {
            const currentApplication = JSON.parse(decodeURIComponent(atob(this.props.location.pathname.split('/app/')[1])))[0].appModule;
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
        let selectedKeys = ['metadata', 'data', 'query', 'tools', 'masterdata', 'filesystem']
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
                        <Menu.Item style={{ fontSize: 14 }} key={'masterdata'}>
                            <Link to={`/developer/masterdata`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee'}}/>
                                <span style={{ color: '#eeeeee' }}>{t('masterdata')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item style={{ fontSize: 14 }} key={'filesystem'}>
                            <Link to={`/developer/filesystem`}>
                                <FontAwesomeIcon icon={faEquals} size="1x" style={{marginRight: "10px", color: '#eeeeee'}}/>
                                <span style={{ color: '#eeeeee' }}>{t('filesystem')}</span>
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
                            <Route path='/developer/masterdata' component={MasterdataBrowser}/>
                            <Route path='/developer/filesystem' component={FilesystemBrowser}/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        )
    };

    renderApplication = ()=>{
        return (
            <MainContext.Consumer>
                {context => {
                    return <MainApp
                            {...this.props}
                            context={context}
                            pathFull={this.state.pathFull}
                            appModuleName={this.state.appModuleName}
                        />
                }}
            </MainContext.Consumer>
        )
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.state.context.userProfile === undefined && this.state.userProfilePattern !== undefined && this.state.principal !== undefined && this.state.getUserProfile) {
            this.setState({getUserProfile: false});
            this.getUserProfile(this.state.principal);
        }
    }

    getUserProfilePattern() {
        API.instance().findClass('auth', 'UserProfile')
            .then( (userProfilePattern: EObject ) => {
                this.setState({userProfilePattern})
            })
    };


    getEobjectByClass(ePackageName:string, className:string, paramName:string) {
        API.instance().findClass(ePackageName, className)
            .then((result: EObject) => {
                this.setState<never>({
                    [paramName]: result
                })
            })
    };

    getUserProfile(principal: any):void {
        const userName = principal.name;
            if (this.state.userProfilePattern !== undefined) {
                API.instance().findByKind(this.state.userProfilePattern,  {contents: {eClass: this.state.userProfilePattern.eURI()}})
                    .then((result: Ecore.Resource[]) => {
                        if (result.length !== 0) {
                            let currentUserProfile = result.filter( (r: EObject) => r.eContents()[0].get('userName') === userName)
                            if (currentUserProfile.length === 0) {
                                this.createUserProfile(userName);
                            }
                            else {
                                this.state.context.updateContext!(({userProfile: currentUserProfile[0].eContents()[0]}))
                            }
                        }
                        else {
                            this.createUserProfile(userName);
                        }

                        if (this.props.history.location.pathname === "/" && this.state.applicationNames !== undefined && this.state.applicationNames.length !== 0) {
                            this.startPageSelection(this.state.applicationNames[0])
                        }
                    })
            }
    }

   private createUserProfile(userName: string) {
       let resourceSet = Ecore.ResourceSet.create()
       let resourceParameters = resourceSet.create({ uri: '/params' });
       let newUserProfilePattern: EObject = this.state.userProfilePattern!.create({userName: userName})
       resourceParameters.add(newUserProfilePattern)
       API.instance().saveResource(resourceParameters, 99999)
           .then((newResource: Ecore.Resource) => {
               this.state.context.updateContext!(({userProfile: newResource.eContents()[0]}))
           });
    }

    componentDidMount(): void {
        if (!this.state.queryFilterDTOPattern) this.getEobjectByClass("dataset","QueryFilterDTO", "queryFilterDTOPattern");
        if (!this.state.queryConditionDTOPattern) this.getEobjectByClass("dataset","QueryConditionDTO", "queryConditionDTOPattern");
        if (!this.state.queryParameterPattern) this.getEobjectByClass("dataset","QueryParameter", "queryParameterPattern");
        if (!this.state.userProfilePattern) this.getUserProfilePattern();

        this.getGlobalSettings();
        if (!this.state.languages.length) this.getLanguages();
        if (!this.state.applicationNames.length) {this.getAllApplication()}
        if (this.state.parameterPattern === undefined) {this.getParameterPattern()};

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
