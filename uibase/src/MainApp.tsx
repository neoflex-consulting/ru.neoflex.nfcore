import * as React from "react";
import {Helmet} from 'react-helmet';
import Splitter from './components/CustomSplitter'
import {Layout, Menu, Tooltip} from "antd";
import {Icon as IconFA} from 'react-fa';
import './styles/MainApp.css'
import {API} from "./modules/api";
import Ecore from "ecore"
import {ViewRegistry} from './ViewRegistry'
import FetchSpinner from "./components/FetchSpinner";
import {grantType} from "./utils/consts";
import SubMenu from "antd/es/menu/SubMenu";
import {NeoIcon_} from "./AntdFactory";
import {adaptiveElementSize, getAdaptiveSize} from "./utils/adaptiveResizeUtils";

const FooterHeight = '2em';
const backgroundColor = "#fdfdfd";

interface State {
    pathBreadcrumb: string[];
    openKeys: string[];
    hideReferences: boolean
    currentTool?: string
    objectApp?: Ecore.EObject
    eClassAppModule?: Ecore.EObject
}

export class MainApp extends React.Component<any, State> {
    private refSplitterRef: React.RefObject<any> = React.createRef();
    private toolsSplitterRef: React.RefObject<any> = React.createRef();
    private viewFactory = ViewRegistry.INSTANCE.get('antd');
    private appModuleMap:Map<string,string>;

    constructor(props: any) {
        super(props);
        this.appModuleMap = new Map<string,string>();
        this.state = {
            pathBreadcrumb: [],
            openKeys: [],
            hideReferences: true,
        }
    }

    getEClassAppModule(): void {
        API.instance().fetchAllClasses(false).then(classes => {
            const eClass = classes.find((c: Ecore.EObject) => c._id === "//AppModule") as Ecore.EClass;
            this.setState({eClassAppModule: eClass})
            this.loadObject()
        })
    }

    loadObject = () => {
        let name: string;
        if (this.props.appModuleName !== undefined) {
            name = decodeURI(this.props.appModuleName);

            if (this.state.eClassAppModule) {
                API.instance().findByKindAndName(this.state.eClassAppModule, name, 999).then(resources => {
                    if (resources.length > 0) {
                        const objectApp = resources[0].eContents()[0];

                        let currentAppModule = this.props.pathFull[this.props.pathFull.length - 1];
                        if (currentAppModule.tree.length === 0) {
                            this.setState({objectApp}, () => {
                                if (objectApp.get('referenceTree') === null) {
                                    if (currentAppModule.useParentReferenceTree) {
                                        this.props.context.updateContext!(
                                            ({viewObject: objectApp.get('view')})
                                        );
                                        let app = this.props.pathFull.filter((p: any) => !p.useParentReferenceTree);
                                        if (app.length !== 0 && this.props.context.applicationReferenceTree === undefined) {
                                            this.setReferenceTree(app[app.length - 1].appModule)
                                        }
                                    } else {
                                        this.props.context.updateContext!(
                                            ({viewObject: objectApp.get('view'), applicationReferenceTree: undefined})
                                        );
                                        this.setState({hideReferences: true})
                                        this.setVerticalSplitterWidth(this.refSplitterRef.current.panePrimary.props.style.minWidth);
                                    }
                                } else {
                                    this.props.context.updateContext!(
                                        ({
                                            viewObject: objectApp.get('view'),
                                            applicationReferenceTree: objectApp.get('referenceTree')
                                        })
                                    );
                                    if (this.props.pathFull.length !== 1) {
                                        this.setState({hideReferences: false});
                                    }
                                }
                            })
                        } else {
                            if (objectApp.get('referenceTree') === null) {
                                if (currentAppModule.useParentReferenceTree) {
                                    this.props.context.updateContext!(
                                        ({viewObject: objectApp.get('view')})
                                    );
                                    let app = this.props.pathFull.filter((p: any) => !p.useParentReferenceTree);
                                    if (app.length !== 0 && this.props.context.applicationReferenceTree === undefined) {
                                        this.setReferenceTree(app[app.length - 1].appModule)
                                    }
                                } else {
                                    this.props.context.updateContext!(
                                        ({viewObject: objectApp.get('view'), applicationReferenceTree: undefined})
                                    );
                                    this.setState({hideReferences: true})
                                    this.setVerticalSplitterWidth(this.refSplitterRef.current.panePrimary.props.style.minWidth);
                                }
                            }
                            else {
                                let treeChildren = objectApp.get('referenceTree').eContents();
                                let currentAppModule = this.props.pathFull[this.props.pathFull.length - 1]

                                if (objectApp.get('name') === currentAppModule.appModule) {
                                    let currentTree: any[] = currentAppModule['tree']
                                    for (let i = 0; i <= currentTree.length - 1; i++) {
                                        for (let t of treeChildren
                                            .filter((t: any) => t.get('name') === currentTree[i])) {
                                            if (t.eContents().length !== 0) {
                                                treeChildren = t.eContents();
                                            }
                                            if (t.get('AppModule') !== undefined && t.get('AppModule').get('name') === currentAppModule.appModule) {
                                                treeChildren = t.get('AppModule').get('view')
                                            }
                                        }
                                    }
                                    this.props.context.updateContext!(
                                        ({
                                            viewObject: treeChildren[0] || treeChildren,
                                            applicationReferenceTree: objectApp.get('referenceTree')
                                        })
                                    );
                                }
                                else {
                                    this.props.context.updateContext!(
                                        ({
                                            viewObject: objectApp.get('view'),
                                            applicationReferenceTree: objectApp.get('referenceTree')
                                        })
                                    );
                                }
                            }
                        }
                        if (objectApp.get('referenceTree') !== null && objectApp.get('referenceTree').eContents().length !== 0) {
                            this.setState({hideReferences: false})
                        }
                    }
                })
            }
        }
    };

    setReferenceTree = (appModuleName: string) => {
        if (this.state.eClassAppModule !== undefined) {
            API.instance().findByKindAndName(this.state.eClassAppModule, appModuleName, 999).then(resources => {
                if (resources.length > 0) {
                    const objectApp = resources[0].eContents()[0];
                    this.props.context.updateContext!(
                        ({applicationReferenceTree: objectApp.get('referenceTree')})
                    );
                    this.setState({hideReferences: false})
                }
            })
        }
    };


    componentDidUpdate(prevProps: any, prevState: any): void {
        if (this.props.context.viewObject !== undefined && this.props.context.viewObject !== null) {
            if (this.props.context.viewObject.eResource().eContents()[0].get('name') !== this.props.pathFull[0].appModule
                && this.props.context.viewObject.eResource().eContents()[0].eClass.get('name') === 'Application') {
                this.props.context.updateContext!(({viewObject: undefined, applicationReferenceTree: undefined}))
            }
        }
        if (prevProps.location.pathname !== this.props.location.pathname) {
            this.loadObject()
        }
        if (this.props.context !== prevProps.context) {
            //В момент инициализации даем понять адаптивным элементам что нужно пересчитать размеры
            window.dispatchEvent(new Event('appAdaptiveResize'));
        }
    }


    handleResize = () => {
        const hideReferences = getAdaptiveSize(this.refSplitterRef.current.panePrimary.div.offsetWidth ? this.refSplitterRef.current.panePrimary.div.offsetWidth : 0, "referenceMenu") <= adaptiveElementSize.extraSmall;
        if (hideReferences !== this.state.hideReferences && this.refSplitterRef.current.panePrimary.div.offsetWidth) {
            this.setState({hideReferences})
        }
    };

    componentDidMount(): void {
        this.getEClassAppModule()
        window.addEventListener("appAdaptiveResize", this.handleResize);
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("appAdaptiveResize", this.handleResize);
        window.removeEventListener("resize", this.handleResize);
    }


    renderToolButton = (name: string, label: string, icon: string) => {
        return <span className={this.state.currentTool === name ? "tool-button-selected" : "tool-button"}
                     onClick={() => {
                         this.setState({currentTool: this.state.currentTool === name ? undefined : name})
                     }}><IconFA className="magnify" name={icon}><span
            style={{paddingLeft: 5}}>{label}</span></IconFA></span>
    };

    setVerticalSplitterWidth = (width:string, minWidth?:string, maxWidth: string = "50%") => {
        if (!minWidth) {
            minWidth = this.refSplitterRef.current.panePrimary.props.style.minWidth;
        }
        this.refSplitterRef.current.panePrimary.div.setAttribute("style",
            `width: ${width}; min-width: ${minWidth}; max-width: ${maxWidth}`);
    }

    renderFooter = () => {
        return (
            <div>
                <Tooltip title={this.state.hideReferences ? this.props.t("show") : this.props.t("hide")}>
                    <span className="references-button" onClick={() => {
                        if (this.state.hideReferences) {
                            const size = localStorage.getItem('mainapp_refsplitter_pos');
                            this.setVerticalSplitterWidth(size && (parseInt(size) < 233) ? "233px" : size!)
                        } else {
                            this.setVerticalSplitterWidth(this.refSplitterRef.current.panePrimary.props.style.minWidth)
                        }
                        this.setState({hideReferences: !this.state.hideReferences})
                    }}><IconFA name="bars"></IconFA></span>
                </Tooltip>
                <div style={{
                    display: "inline-block",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "center"
                }}>
                </div>
            </div>
        )
    };

    renderToolbox = () => {
        return this.state.currentTool
    };

    renderContent = () => {
        const {context} = this.props;
        const {viewObject} = context;
        if (!viewObject) return null;
        return this.viewFactory.createView(viewObject, this.props)
    };

    renderReferences = (isShortSize = false) => {
        function splitPath(path:string|undefined) {
            let arr:string[] = [];
            if (path) {
                while (path.split("/").length > 1) {
                    path = path.split("/").slice(0,-1).join("/");
                    arr.push(path)
                }
            }
            return arr;
        }
        const {context} = this.props;
        const {applicationReferenceTree, viewReferenceTree} = context;
        const referenceTree = viewReferenceTree || applicationReferenceTree;
        const cbs = new Map<string, () => void>();
        const currentAppModule = this.props.pathFull[this.props.pathFull.length - 1];
        const pathReferenceTree = currentAppModule.tree.length && currentAppModule.tree.length > 0 ? currentAppModule.tree.join('/') : this.appModuleMap.get(currentAppModule.appModule);
        return !referenceTree ? null : (
            <Layout style={{backgroundColor: backgroundColor}}>
                <Menu
                    id={"referenceTree"}
                    className={`${isShortSize && "short-size"}`}
                    openKeys={this.state.hideReferences ? [] : this.state.openKeys.length > 0 ? this.state.openKeys : splitPath(pathReferenceTree)}
                    selectedKeys={pathReferenceTree ? [pathReferenceTree] : undefined}
                    onSelect={params => {
                        const cb = cbs.get(params.key);
                        if (cb) cb();
                    }}
                    onOpenChange={openKeys => {
                        this.setState({openKeys:openKeys});
                        //Восстанавливаем ширину если были в свернутом виде
                        if (this.state.hideReferences) {
                            localStorage.setItem('mainapp_refsplitter_pos', "233px");
                            this.setVerticalSplitterWidth(localStorage.getItem('mainapp_refsplitter_pos')!)
                        }
                    }}
                    mode="inline"
                >
                    {referenceTree.get('children')
                        .filter((c: Ecore.EObject)=> (isShortSize && c.get('icon')) || !isShortSize)
                        .map((c: Ecore.EObject) => this.renderTreeNode(c, cbs, undefined, isShortSize))}
                </Menu>
            </Layout>
        )
    };

    renderTreeNode = (eObject: Ecore.EObject, cbs: Map<string, () => void>, parentKey?: string, isShortSize = false) => {
        const code = eObject.get('name');
        const key = parentKey ? parentKey + '/' + code : code;
        const icon = eObject.get('icon') && <NeoIcon_ {...this.props} viewObject={eObject.get('icon')}/>;
        const content = isShortSize ? <div className={"menu-content"}>{icon}</div> : <div className={"menu-content"}>{icon}{code}</div>;
        let children = [];
        if (eObject.get('children')) {
            children = eObject.get('children')
                .map((c: Ecore.EObject) =>
                    this.renderTreeNode(c, cbs, key));
        }

        const isLeaf = !eObject.isKindOf('CatalogNode');

        if (eObject.isKindOf('AppModuleNode')) {
            cbs.set(key, () => {
                if (eObject.get('AppModule')) {
                    this.setURL(eObject, key);
                }
            });
            if (eObject.get('AppModule'))
                this.appModuleMap.set(eObject.get('AppModule').get('name'), key);
        }
        else if (eObject.isKindOf('ViewNode') ) {
            cbs.set(key, () => {
                if (eObject.get('view')) {
                    this.setURL(eObject, key);
                }
            })
        }
        else if (eObject.isKindOf('EClassNode')) {
            cbs.set(key, () => {
                if (eObject.get('aClass') && eObject.get('view')) {
                    this.setURL(eObject, key);
                }
            })
        }
        else if (eObject.isKindOf('DynamicNode')) {
            cbs.set(key, () => {
                if (eObject.get('methodName') && eObject.get('eObject')) {
                    this.setURL(eObject, key);
                }
            })
        }
        if (isShortSize) {
            const cb = cbs.get(key);
            cbs.set(key, () => {
                cb && cb();
                /*this.setState({hideReferences: false});*/
            })
        }
        return eObject.get('grantType') === grantType.denied ? undefined : (
            isLeaf
                ? <Menu.Item key={key}>{content}</Menu.Item>
                : <SubMenu onTitleClick={()=>{isShortSize && this.setState({hideReferences: false})}} key={key} title={content}>{children}</SubMenu>
        )
    };

    private setURL(eObject: Ecore.EObject, key: any) {
        const appModuleName = eObject.get('AppModule') ? eObject.get('AppModule').get('name') : this.props.pathFull[0].appModule;
        let treeValue = key;
        let useParentReferenceTree = eObject.get('AppModule') !== undefined ? (eObject.get('AppModule').get('useParentReferenceTree') || false) : true;
        this.props.context.changeURL!(appModuleName, useParentReferenceTree, treeValue)
    }

    render = () => {
        const hasIcons: boolean = this.props.context.applicationReferenceTree
            && this.props.context.applicationReferenceTree.get('children').filter((c: Ecore.EObject)=> c.get('icon')).length > 0;
        return (
            <div style={{flexGrow: 1}}>
                <Helmet>
                    <title>{this.props.showTabTitle ? this.props.appModuleName : undefined}</title>
                    <link rel="shortcut icon" type="image/png" href="/application.ico" />
                </Helmet>
                <FetchSpinner/>
                <Splitter
                    allowResize={!this.state.hideReferences}
                    ref={this.refSplitterRef}
                    position="vertical"
                    primaryPaneMaxWidth="50%"
                    primaryPaneMinWidth={hasIcons ? "62px" : "0px"}
                    primaryPaneWidth={hasIcons && this.state.hideReferences
                        ? "62px"
                        : this.state.hideReferences
                            ? 0
                            : localStorage.getItem('mainapp_refsplitter_pos') || "233px"}
                    dispatchResize={true}
                    postPoned={false}
                    onDragFinished={() => {
                        if (this.refSplitterRef.current) {
                            const size: string = this.refSplitterRef.current.panePrimary.props.style.width;
                            localStorage.setItem('mainapp_refsplitter_pos', size)
                        }
                    }}
                >
                    <div className={'leftSplitter'} style={{flexGrow: 1, backgroundColor: backgroundColor, height: '100%', overflow: "auto"}}>
                        {this.renderReferences(this.state.hideReferences)}
                    </div>
                    <div style={{backgroundColor: backgroundColor, height: '100%', overflow: 'auto'}}>
                        <div style={{height: `calc(100% - ${FooterHeight})`, width: '100%', overflow: 'hidden'}}>
                            <Splitter
                                ref={this.toolsSplitterRef}
                                position="horizontal"
                                primaryPaneMaxHeight="100%"
                                primaryPaneMinHeight="0%"
                                primaryPaneHeight={localStorage.getItem('mainapp_toolssplitter_pos') || "400px"}
                                dispatchResize={true}
                                postPoned={false}
                                maximizedPrimaryPane={this.state.currentTool === undefined}
                                allowResize={this.state.currentTool !== undefined}
                                onDragFinished={() => {
                                    const size: string = this.toolsSplitterRef.current!.panePrimary.props.style.height;
                                    localStorage.setItem('mainapp_toolssplitter_pos', size)
                                }}
                            >
                                <div style={{zIndex: 10, backgroundColor: backgroundColor}}>
                                    <div style={{
                                        height: '100%',
                                        width: '100%',
                                        backgroundColor: backgroundColor
                                    }}>
                                        {
                                            this.props.context.viewObject === null
                                                ?
                                                this.renderContent()
                                                :
                                                this.props.context.viewObject === undefined ||
                                                this.props.context.viewObject.eResource().eContents()[0].get('name') !== this.props.pathFull[this.props.pathFull.length - 1].appModule
                                                    ?
                                                    undefined
                                                    : this.renderContent()
                                        }
                                    </div>
                                </div>
                                <div style={{
                                    height: '100%',
                                    width: '100%',
                                    overflow: 'auto',
                                    backgroundColor: backgroundColor
                                }}>
                                    {this.renderToolbox()}
                                </div>
                            </Splitter>
                        </div>
                        <div style={{height: `${FooterHeight}`}}>
                            {this.renderFooter()}
                        </div>
                    </div>
                </Splitter>
            </div>
        )
    }
}
