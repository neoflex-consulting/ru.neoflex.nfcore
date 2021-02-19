import * as React from "react";
import {Button, Dropdown, Layout, Menu, notification} from "antd/lib";
import 'antd/dist/antd.css';
import './styles/EcoreApp.css';
import {API, Error, IErrorHandler} from './modules/api'
import MetaBrowser from "./components/MetaBrowser";
import ResourceEditor from "./components/ResourceEditor"
import {Link, Route, Switch} from "react-router-dom";
import Login from "./components/Login";
import {DataBrowser} from "./components/DataBrowser";
import {MainApp} from "./MainApp";
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore, {EObject} from "ecore";
import DynamicComponent from "./components/DynamicComponent"
import Tools from "./components/Tools";
import {IEventAction, IMainContext, IServerNamedParam, IServerQueryParam, MainContext} from "./MainContext";
import update from "immutability-helper";
import ConfigUrlElement from "./ConfigUrlElement";
import HeaderMenu from "./components/HeaderMenu";
import EventTracker from "./EventTracker";
import FilesystemBrowser from "./components/app/filesystem/FilesystemBrowser";
import {ReactComponent as AppLogo} from './icons/logo.svg';
import FetchSpinner from "./components/FetchSpinner";
import {dmlOperation, grantType} from "./utils/consts";
import 'neo-design/dist/neoDesign.css';
import {NeoButton, NeoCol, NeoRow, NeoTypography, NeoHint} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {Prohibited} from "./components/Prohibited";
import DeveloperMain from "./components/DeveloperMain";
import {excelExportObject} from "./utils/excelExportUtils";
import {docxExportObject} from "./utils/docxExportUtils";

const backgroundColor = "#2a356c";
const userProfileUpdateDebounceInterval = 1000;

const { Header } = Layout;

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


export function encodeAppURL(path?: any[]) {
    return path ? `/app/${
        btoa(
            encodeURIComponent(
                JSON.stringify(
                    path
                )
            )
        )
    }` : ""
}

class EcoreApp extends React.Component<any, State> {

    private docxHandlers: (()=>docxExportObject|undefined)[] = [];
    private excelHandlers: (()=>excelExportObject|undefined)[] = [];
    private eventActions: any[] = [];
    private eventTracker = new EventTracker();
    private userProfileTimer: NodeJS.Timeout;

    constructor(props: any) {
        super(props);
        const context: IMainContext = {
            updateContext: this.updateContext,
            changeURL: this.changeURL,
            getURL: this.getURL,
            runQuery: this.runQuery,
            runQueryDataset: this.runQueryDataset,
            executeDMLOperation: this.executeDMLOperation,
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
            globalValues: new Map(),
            addEventHandler: this.eventTracker.addEventHandler.bind(this.eventTracker),
            removeEventHandler: this.eventTracker.removeEventHandler.bind(this.eventTracker),
            notifyAllEventHandlers: this.eventTracker.notifyAllEventHandlers.bind(this.eventTracker),
            getFullPath: this.getFullPath,
            isDeveloper: this.isDeveloper,
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

    isDeveloper = () => {
        return this.state.principal && this.state.principal.principal.developer;
    };

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
        this.state.context.userProfilePromise !== undefined && this.state.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
            let updatedUserProfile: EObject = userProfile.eContents()[0];
            let updatedObject = userProfile.eContents()[0].get('params').array()
                .filter( (p:any) => p.get('key') === viewObjectId);

            if (updatedObject === undefined || updatedObject.length === 0 || updatedObject[0].get("value") !== JSON.stringify(userProfileParams)
            ) {
                if (userProfile.eContents()[0].get('params').size() === 0) {
                    let newParams: EObject = this.state.parameterPattern!.create({
                        key: viewObjectId,
                        value: JSON.stringify(userProfileParams)
                    });
                    updatedUserProfile.get('params').addAll(newParams)
                }
                else if (userProfile.eContents()[0].get('params').size() !== 0) {
                    let otherObjects;
                    otherObjects = userProfile.eContents()[0].get('params').array()
                        .filter( (p:any) => p.get('key') !== viewObjectId);

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
                clearTimeout(this.userProfileTimer);
                this.userProfileTimer = setTimeout(()=>{
                    const prom =  API.instance().saveResource(updatedUserProfile.eResource(), 99999);
                    this.state.context.updateContext!(({userProfilePromise: prom}))
                }, userProfileUpdateDebounceInterval)
            }
        })
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
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", whiteSpace: "break-spaces", fontWeight: 350}
                }))
        }
        else if (notificationType === "error") {
            return (
                notification.error({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", whiteSpace: "break-spaces", fontWeight: 350}
                }))
        }
        else if (notificationType === "info") {
            return (
                notification.info({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", whiteSpace: "break-spaces", fontWeight: 350}
                }))
        }
        else if (notificationType === "warning") {
            return (
                notification.warning({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", whiteSpace: "break-spaces", fontWeight: 350}
                }))
        }
        else if (notificationType === "open") {
            return (
                notification.open({
                    message: title, description: description, duration: this.state.notifierDuration, key, btn: [btnCloseAll], style: {width: 450, marginLeft: -52, marginTop: 16, wordWrap: "break-word", whiteSpace: "break-spaces", fontWeight: 350}
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
                                isPrimaryKey: p['isPrimaryKey']
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

    prepareServerQueryParamColumn = (resourceSet: any, pattern: any, param: IServerQueryParam[], uri: string) => {
        let resourceParameter = resourceSet.create({ uri: uri });
        let serverOperations: EObject[] =
            param === undefined
                ?
                param
                :
                param
                    .filter( (p: any) => p['datasetColumn'] !== undefined && p['enable'] !== undefined)
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
            this.prepareServerQueryParam(resourceSet, this.state.queryFilterDTOPattern!, groupByParams, '/parameterGroupBy'),
            this.prepareServerQueryParam(resourceSet, this.state.queryConditionDTOPattern!, calculatedExpression, '/parameterCalculatedExpression'),
            this.prepareServerQueryParamColumn(resourceSet, this.state.queryConditionDTOPattern!, groupByColumn, '/parameterGroupByColumn')])
    };

    executeDMLOperation = (
        resource_: Ecore.Resource,
        operation: dmlOperation,
        queryParams: IServerNamedParam[] = []
    ) => {
        const resource: Ecore.Resource = resource_;
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = operation;
        let resourceSet = Ecore.ResourceSet.create();
        return API.instance().voidCall(ref, methodName, [
            this.prepareServerQueryNamedParam(resourceSet, this.state.queryParameterPattern!, queryParams, '/queryParameter')
            ]
        )
    };

    runQueryDataset = (resource_: Ecore.Resource, queryParams: IServerNamedParam[] = []) => {
        const resource: Ecore.Resource = resource_;
        const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
        const methodName: string = 'runQueryDataset';
        let resourceSet = Ecore.ResourceSet.create();
        return API.instance().call(ref, methodName, [
            this.prepareServerQueryNamedParam(resourceSet, this.state.queryParameterPattern!, queryParams, '/queryParameter')
        ])
    };

    isDatasetComponentsBufferEmpty = () => {
        if (this.state.context.datasetComponents) {
            for (const [key] of Object.entries(this.state.context.datasetComponents)) {
                if (this.state.context.datasetComponents[key].getBuffer
                    && this.state.context.datasetComponents[key].getBuffer().length > 0) {
                    this.state.context.datasetComponents[key].showModal();
                    return false
                }
            }
        }
        return true
    };

    changeURL = (appModuleName?: string, useParentReferenceTree?: boolean, tree?: string[], params?: IServerNamedParam[]) => {
        if (this.isDatasetComponentsBufferEmpty()) {
            const path = this.getURL(appModuleName, useParentReferenceTree, useParentReferenceTree ? tree : [], params);
            if (path) {
                this.setState({pathFull: path});
                this.props.history.push(encodeAppURL(path));
            }
        }
    };

    getURL = (appModuleName?: string, useParentReferenceTree?: boolean, tree?: string[], params?: IServerNamedParam[]) => {
        let path: any[] = [];
        let urlElement: ConfigUrlElement = {
            appModule: appModuleName,
            tree: tree !== undefined ? tree : [],
            params: params,
            useParentReferenceTree: useParentReferenceTree || false
        };
        let appModuleNameThis = appModuleName || this.state.appModuleName;
        if (appModuleName !== undefined && this.state.applicationNames.includes(appModuleName)){
            path.push(urlElement)
        }
        else if (this.state.pathFull && appModuleName === this.state.appModuleName && tree !== undefined) {
            this.state.pathFull.forEach( (p:any) => {
                urlElement = p;
                if (p.appModule === appModuleNameThis) {
                    urlElement.tree = tree;
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
            if (splitPathFull.length === 0) {
                this.state.pathFull.forEach( (p:any, index: any) => {
                    path.push(p);
                });
                urlElement.appModule = appModuleName;
                urlElement.tree = tree !== undefined ? tree : [];
                urlElement.params = params ? params : [];
                this.state.context.globalValues?.forEach(obj => {
                    urlElement.params = urlElement.params!.concat(obj)
                });
                //Ограничить переходы
                if (path.length >= 50) {
                    path.shift()
                }
                path.push(urlElement)
            } else {
                path = this.state.pathFull.splice(0, splitPathFull[0] + 1)
            }
        } else if (appModuleName === this.state.appModuleName) {
            path = this.state.pathFull
        }
        return path
    };

    getFullPath = () => {
        return this.state.pathFull
    };

    logOut = () => {
        API.instance().logout().then(() => {
            this.setState({principal : undefined, getUserProfile: true});
            this.state.context.updateContext!(({userProfilePromise: undefined}));
            API.instance().stompDisconnect();
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
                        applications = applications.filter(eObj => eObj.eContents()[0].get('grantType') !== grantType.denied);
                        let applicationNames = applications.map( (a:any) =>
                            a.eContents()[0].get('name')
                        );
                        applications = applications.sort((a, b) => {
                            return (a.eContents()[0].get('headerOrder') === null ? Number.MAX_VALUE : a.eContents()[0].get('headerOrder'))
                                - (b.eContents()[0].get('headerOrder') === null ? Number.MAX_VALUE : b.eContents()[0].get('headerOrder'))
                        });
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
        if (this.state.context.userProfilePromise !== undefined) {
            this.state.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
                application = userProfile.eContents()[0].get('params').array()
                    .filter((u: any) => u.get('key') === 'startApp');
                if (this.props.history.location.pathname === "/") {
                    if (application !== undefined && application.length !== 0 && application[0].get('value') !== undefined) {
                        this.changeURL(JSON.parse(application[0].get('value')), false)
                    } else {
                        this.changeURL(applicationName, false)
                    }
                }
            })
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
        if (this.state.notifierDuration === 5){
            this.setState({ notifierDuration: 0});
            localStorage.setItem('notifierDuration', '0');
        }
        else{
            this.setState({ notifierDuration: 5});
            localStorage.setItem('notifierDuration', '5');
        }
    };

    renderDev = (props: any) => {
        const storeLangValue = String(localStorage.getItem('i18nextLng'));
        let principal = this.state.principal as any;
        const {t, i18n} = this.props as WithTranslation;
        let selectedKeys = ['metadata', 'data', 'query', 'tools', 'masterdata', 'filesystem']
            .filter(k => this.props.location.pathname.split('/').includes(k));
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng)
        };

        const devMenu = (<Menu className="header-menu" mode="horizontal" selectedKeys={selectedKeys} style={{ backgroundColor: backgroundColor, textAlign: "center"}}>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'metadata'}>
                    <Link to={`/developer/metadata`}>

                                                        <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/metadata') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('metadata')}</NeoTypography>
                    </Link>
                </Menu.Item>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'data'}>
                    <Link to={`/developer/data`}>
                        <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/data') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('data')}</NeoTypography>
                    </Link>
                </Menu.Item>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'query'}>
                    <Link to={`/developer/query`}>
                                                         <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/query') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('query')}</NeoTypography>
                    </Link>
                </Menu.Item>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'tools'}>
                    <Link to={`/developer/tools`}>

                        <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/tools') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('tools')}</NeoTypography>
                    </Link>
                </Menu.Item>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'masterdata'}>
                    <Link to={`/developer/masterdata`}>

                        <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/masterdata') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('masterdata')}</NeoTypography>
                    </Link>
                </Menu.Item>
                <Menu.Item style={{ fontSize: 14, paddingRight: "14px"}} key={'filesystem'}>
                    <Link to={`/developer/filesystem`}>

                        <NeoTypography className='appNameInMenu' style={{color: this.props.location.pathname.includes('/developer/filesystem') ? "#2A356C"  : "#8C8C8C"}} type={'capture_regular'}>{t('filesystem')}</NeoTypography>
                    </Link>
                </Menu.Item>
            </Menu>

        )


        return (
            <Layout style={{height: 'calc(100% - 80px)', marginTop: '80px'}}>
                <FetchSpinner/>
                {(this.props.location.pathname.startsWith('/app') || (!this.props.location.pathname.startsWith('/app') && this.isDeveloper())) && <Header className="app-header" style={{height: '80px', padding: '0', backgroundColor: backgroundColor}}>
                    <NeoRow style={{height: '80px'}}>
                        <NeoCol className={'headerAppNameSpanLarge'} span={5} style={{height: 'inherit'}}>
                            <div className={window.location.pathname.includes('developer' +
                                '') ? "app-logo-settings" : "app-logo"}
                                 onClick={this.renderDashboard}
                            >
                                {/*<img src={AppLogo} alt="App Logo"/>*/}
                                <AppLogo/>
                            </div>
                        </NeoCol>
                        <NeoCol span={14}
                                    style={{textAlign: 'center', alignItems: 'center', height: 'inherit'}}>
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
                            {

                                        this.props.location.pathname.includes('/developer/') &&
                                            <div>

                                            <div>
                                    <div className="headerDev-menu">
                                        <Menu className="header-menu" mode="horizontal" selectedKeys={selectedKeys} style={{ backgroundColor: backgroundColor, textAlign: "center"}}>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px" }} key={'main'}>
                                                <Link to={`/developer/main`}>
                                                    <span>
                                                        {this.props.location.pathname.includes('/developer/main') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('main page')}</NeoTypography>
                                                            :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('main page')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px" }} key={'metadata'}>
                                                <Link to={`/developer/metadata`}>
                                                    <span>
                                                        {this.props.location.pathname.includes('/developer/metadata') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('metadata')}</NeoTypography>
                                                        :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('metadata')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px"   }} key={'data'}>
                                                <Link to={`/developer/data`}>
                                                    <span>
                                                        {this.props.location.pathname.includes('/developer/data') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('data')}</NeoTypography>
                                                            :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('data')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px"   }} key={'tools'}>
                                                <Link to={`/developer/tools`}>
                                                     <span>
                                                        {this.props.location.pathname.includes('/developer/tools') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('tools')}</NeoTypography>
                                                            :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('tools')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px"   }} key={'masterdata'}>
                                                <Link to={`/developer/masterdata`}>
                                                     <span>
                                                        {this.props.location.pathname.includes('/developer/masterdata') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('masterdata')}</NeoTypography>
                                                            :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('masterdata')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item style={{ fontSize: 14, paddingRight: "14px", paddingBottom: "12px"   }} key={'filesystem'}>
                                                <Link to={`/developer/filesystem`}>
                                                     <span>
                                                        {this.props.location.pathname.includes('/developer/filesystem') ?
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#FFFFFF"}} type={'h4_regular'}>{t('filesystem')}</NeoTypography>
                                                            :
                                                            <NeoTypography className={'namesOfDevMenu'} style={{color: "#B3B3B3"}} type={'h4_light'}>{t('filesystem')}</NeoTypography>
                                                        }
                                                        </span>
                                                </Link>
                                            </Menu.Item>
                                        </Menu>
                                    </div>


                                            </div>
                                 <div className={'devMenuSmallWidth'}>
                                    <Dropdown overlay={devMenu} placement="bottomCenter">
                                        <div style={{float: "left"}}>
                                            <NeoIcon color={'white'} icon={"table"} size={'m'}/>
                                        </div>
                                    </Dropdown>
                                </div>
                                </div>
                                    }

                        </NeoCol>
                        <NeoCol span={5}
                             style={{
                                    height: 'inherit',
                                 alignItems: 'center'
                             }}>
                            <div className={'headerRightSide'}
                                style={{
                                    width: '75%',
                                    margin: 'auto 32px auto auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    lineHeight:'1',
                                    justifyContent:'flex-end'
                                }}>
                                <NeoButton onClick={()=>setLang(storeLangValue==='ru' ? 'en' : 'ru')} type={"link"} className="lang-label">
                                    {storeLangValue.toUpperCase()}
                                </NeoButton>
                                {
                                    this.props.history.location.pathname.includes('developer')
                                        ?
                                        <NeoHint  title={this.props.t('back to applications')}>
                                            <NeoButton type={'link'} style={{marginRight:'10px'}}>
                                                <Link to={encodeAppURL(this.getURL(this.state.applicationNames[0], false))}>
                                                    <NeoIcon className={'changeToDevelopButton'} icon={"play"} color={'white'} />
                                                </Link>
                                            </NeoButton>
                                        </NeoHint>
                                        :
                                        this.isDeveloper() &&
                                                <NeoHint  title={this.props.t('developer menu')}>
                                                    <NeoButton type={'link'} style={{marginRight:'10px'}}>
                                                        <Link to={`/developer/main`}>
                                                            <NeoIcon className={'changeToDevelopButton'} icon={'settings'} color={'white'} />
                                                        </Link>
                                                    </NeoButton>
                                                </NeoHint>

                                }
                                <NeoHint title={this.props.t('auto-close notification')}>
                            <NeoButton
                                type="link"
                                        style={{marginRight:'10px'}}
                                        onClick={this.onClickBellIcon}>
                                    {localStorage.getItem('notifierDuration') === '5'  ?
                                        <NeoIcon className={'bellButton'} icon={'notificationOff'} color={'white'} />
                                    :
                                        <NeoIcon className={'bellButton'} icon={'notification'} color={'white'} />}
                            </NeoButton>
                                </NeoHint>
                                    <span style={{
                                        textTransform: "capitalize",
                                        fontSize: '15px',
                                        height: '32px',
                                        color: '#ffffff',
                                        marginRight:'25px',
                                        lineHeight: '2'
                                    }}>
                                        <span className={'NameOfUser'}>{principal.name}</span>
                                    </span>
                                <NeoHint title={this.props.t('logout')}>
                            <NeoButton
                                style={{marginRight: "10px"}}

                                onClick={this.logOut}
                                type="link"
                            >
                                <NeoIcon icon={'exit'} color={'white'} />
                            </NeoButton>
                                </NeoHint>
                            </div>
                        </NeoCol>
                    </NeoRow>
                </Header>}
                <Switch>
                    <Route path='/app/:appModuleName' component={this.renderApplication}/>
                    <Route path='/test' component={this.renderTest}/>
                    <Route path='/developer/metadata' component={this.isDeveloper() ? MetaBrowser : Prohibited}/>
                    <Route path='/developer/main' component={this.isDeveloper() ? DeveloperMain : Prohibited}/>
                    <Route exact={true} path='/developer/data' component={this.isDeveloper() ? DataBrowser : Prohibited}/>
                    <Route path='/developer/data/editor/:id/:ref/:edit?/:targetId?' render={(props:any) => this.isDeveloper() ? <ResourceEditor applications={this.state.applications} notification={this.notification} principal={this.state.principal} {...props}/> : Prohibited}/>
                    <Route path='/developer/tools' render={(props:any) => this.isDeveloper() ? <Tools notification={this.notification} {...props}/> : Prohibited}/>
                    <Route path='/developer/filesystem' render={(props:any) => this.isDeveloper() ? <FilesystemBrowser notification={this.notification} {...props}/> : Prohibited}/>
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

    renderApplication = ()=>{
        return (
            <MainContext.Consumer>
                {context => {
                    return <MainApp
                            {...this.props}
                            context={context}
                            pathFull={this.state.pathFull}
                            appModuleName={this.state.appModuleName}
                            showTabTitle={this.state.applicationNames.includes(this.state.appModuleName)||this.state.appModuleName === "Dashboard"}
                        />
                }}
            </MainContext.Consumer>
        )
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.state.context.userProfilePromise === undefined && this.state.userProfilePattern !== undefined && this.state.principal !== undefined && this.state.getUserProfile) {
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
                            let currentUserProfile = result.filter( (r: EObject) => r.eContents()[0].get('userName') === userName);
                            if (currentUserProfile.length === 0) {
                                this.createUserProfile(userName);
                            }
                            else {
                                this.state.context.updateContext!({userProfilePromise: Promise.resolve(currentUserProfile[0])}, ()=> {
                                    if (this.props.history.location.pathname === "/" && this.state.applicationNames !== undefined && this.state.applicationNames.length !== 0) {
                                        this.startPageSelection(this.state.applicationNames[0])
                                    }
                                })
                            }
                        }
                        else {
                            this.createUserProfile(userName);
                        }
                    })
            }
    }

   private createUserProfile(userName: string) {
       let resourceSet = Ecore.ResourceSet.create();
       let resourceParameters = resourceSet.create({ uri: '/params' });
       let newUserProfilePattern: EObject = this.state.userProfilePattern!.create({name: userName, userName: userName})
       resourceParameters.add(newUserProfilePattern);
       API.instance().saveResource(resourceParameters, 99999)
           .then((newResource: Ecore.Resource) => {
               this.state.context.updateContext!({userProfilePromise: Promise.resolve(newResource)}, ()=> {
                   if (this.props.history.location.pathname === "/" && this.state.applicationNames !== undefined && this.state.applicationNames.length !== 0) {
                       this.startPageSelection(this.state.applicationNames[0])
                   }
               })
           });
    }

    componentDidMount(): void {
        const {t} = this.props;
        API.instance().onServerDown = () => {
            this.setState({principal: undefined})
        };
        API.instance().updateObject = (object: any) => {
            /*Обновить UserProfile, если объект обновлялся не на текущей странице*/
            if (object.contents[0].eClass.includes("ru.neoflex.nfcore.base.auth#//UserProfile")) {
                this.state.context.userProfilePromise !== undefined && this.state.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
                    if (object.uri.split("?rev=")[1] > userProfile.rev) {
                        this.getUserProfile(this.state.principal);
                    }
                })
            }
            /*Обновить объект в ResourceEditor, если объект обновлялся не на текущей странице*/
            else if (this.props.location.pathname.includes("developer/data/editor")) {
                const locationId = this.props.location.pathname.split("/")[this.props.location.pathname.split("/").length - 2];
                const locationRev = this.props.location.pathname.split("/")[this.props.location.pathname.split("/").length - 1];
                const updatedId = object.uri.split("?rev=")[0];
                const updatedRev = Number(object.uri.split("?rev=")[1]) + 1;
                if (updatedId === locationId && updatedRev > locationRev) {
                    this.props.history.push(`/developer/data/editor/${updatedId}/${updatedRev}`);
                }
            }
        };
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
                    _this.notification(t('notification'), t('re-authorization required'),"info")
                }
                else if (error.status === 504 || error.error === "Unknown error") {
                    _this.notification(t('notification'), t('server is not available'),"info")
                }
                else if ((error.status === 500 && error.message !== undefined) && error.message.includes('duplicated key')) {
                    _this.notification(t('notification'), error.message.split("'")[1]+': '+t('the name is not unique'),"error")
                }
                else {
                    _this.notification("Error: " + error.status + " (" + error.error + ")", error.message!,"error")
                }
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
