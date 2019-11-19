import * as React from "react";
import Splitter from './components/CustomSplitter'
import {Layout, Tooltip} from "antd";
import {Icon as IconFA} from 'react-fa';
import './styles/MainApp.css'
import {API} from "./modules/api";
import Ecore from "ecore"
import {ViewRegistry} from './ViewRegistry'
import {Tree} from 'antd'
import {IMainContext, MainContext} from './MainContext'
import update from 'immutability-helper'
const FooterHeight = '2em';
const backgroundColor = "white";

interface State {
    appModuleName: string;
    pathFull: string;
    pathBreadcrumb: string[];
    context: IMainContext
    hideReferences: boolean
    currentTool?: string
    objectApp?: Ecore.EObject
}

export class MainApp extends React.Component<any, State> {
    private refSplitterRef: React.RefObject<any> = React.createRef();
    private toolsSplitterRef: React.RefObject<any> = React.createRef();
    private viewFactory = ViewRegistry.INSTANCE.get('antd');

    constructor(props: any) {
        super(props);
        const context: IMainContext = {
            updateContext: this.updateContext,
            changeURL: this.changeURL
        };
        this.state = {
            appModuleName: props.appModuleName,
            pathFull: props.pathFull,
            pathBreadcrumb: [],
            hideReferences: false,
            context
        }
    }

    updateContext = (context: any, cb?: ()=>void) => {
        this.setState((state, props) => {
            return {context: update(state.context, {$merge: context})}
        }, cb)
    };

    changeURL = (appModuleName?: string, pathFull?: string) => {
        let path;
        let appModuleNameThis = appModuleName || this.state.appModuleName;
        if (this.state.pathBreadcrumb.length !== 0) {
            if (this.state.pathBreadcrumb.includes(appModuleNameThis)) {
                if (this.state.pathBreadcrumb[0] !== appModuleNameThis) {
                    path = '?path=' + JSON.stringify(this.state.pathBreadcrumb.slice(0, this.state.pathBreadcrumb.indexOf(appModuleNameThis)))
                } else {
                    path = ""
                }
                } else {
                let pathBreadcrumb = this.state.pathBreadcrumb;
                if (appModuleName !== this.state.appModuleName) {
                    pathBreadcrumb.push(this.state.appModuleName)
                }
                this.setState({pathBreadcrumb});
                path = '?path=' + JSON.stringify(pathBreadcrumb)
            }
        }
        else if (this.state.appModuleName !== appModuleName) {
            path = '?path=' + JSON.stringify([this.state.appModuleName])
        } else {path = ""}
        if (pathFull && appModuleNameThis) {
            this.props.history.push(`/app/${appModuleNameThis}${path}#${pathFull}`);
        }
        else if (appModuleNameThis) {
            this.props.history.push(`/app/${appModuleNameThis}${path}`);
        }
    };

    loadObject = () => {
        let name: string;
        let objectPackage: string;
        let objectClass: string;
        if (this.state.appModuleName !== undefined) {
        name = decodeURI(this.state.appModuleName);
        objectPackage = "ru.neoflex.nfcore.application";
        objectClass = "AppModule";
        API.instance().fetchPackages().then(packages => {
            const ePackage = packages.find(p => p.get("nsURI") === objectPackage);
            if (ePackage) {
                const eClass = ePackage.eContents().find(c => c.get("name") === objectClass) as Ecore.EClass;
                API.instance().findByKindAndName(eClass, name).then(resources => {
                    if (resources.length > 0) {
                        const objectApp = resources[0].eContents()[0];
                        const splitPath = this.state.pathFull.split('#');
                        if (splitPath.length === 1) {
                            this.setState({objectApp}, () => {
                                this.updateContext(
                                    ({viewObject: objectApp.get('view'), applicationReferenceTree: objectApp.get('referenceTree')})
                                )
                                //NOT DELETE!
                                // API.instance().call(objectApp.eURI(), "generateReferenceTree", [])
                                //     .then(referenceTree => {
                                //     if (!!referenceTree) {
                                //         API.instance().loadEObjectWithRefs(999, referenceTree, Ecore.ResourceSet.create(), {}, objectApp.eURI() + referenceTree._id).then(r => {
                                //             this.updateContext(({applicationReferenceTree: r.eContents()[0]}))
                                //         })
                                //     }
                                // })
                                //     .catch( ()=> {console.log("Reference Tree not exists")} )
                            });
                        } else {
                            let treeChildren = objectApp.get('referenceTree').eContents();
                            let treePath: string[];
                            if (splitPath[1].split('?').length === 1) {
                                treePath = splitPath[1].split('/');
                            } else {
                                treePath = splitPath[1].split('?')[1].split('/')
                            }
                            for (let i = 0; i < treePath.length; i++) {
                                for (let t of treeChildren
                                    .filter((t: any) => t.get('name') === decodeURI(treePath[i]))) {
                                    treeChildren = t.eContents();
                                }
                            }
                            this.updateContext(
                                ({
                                    viewObject: treeChildren[0],
                                    applicationReferenceTree: objectApp.get('referenceTree')})
                            )
                        }
                    }
                })
            }
        })}
    };

    componentDidUpdate(prevProps: any, prevState: any): void {
        if (prevState.pathFull !== this.state.pathFull) {
            this.loadObject()
        }
    }

    componentDidMount(): void {
        this.loadObject()
    }

    static getDerivedStateFromProps(nextProps: any, prevState: State) {
        const pathFull = nextProps.history.location.pathname +
            decodeURI(nextProps.history.location.search) + nextProps.history.location.hash;
        if (
            prevState.pathFull !== pathFull
           ) {
            return {
                pathBreadcrumb: prevState.pathBreadcrumb.length === 0 ||  prevState.appModuleName !== nextProps.match.params.appModuleName
                    ?
                    nextProps.history.location.search !== ""
                        ?
                        prevState.pathBreadcrumb.includes(nextProps.match.params.appModuleName)
                            ?
                            prevState.pathBreadcrumb.slice(0, prevState.pathBreadcrumb.indexOf(nextProps.match.params.appModuleName))
                            :
                            JSON.parse(decodeURI(nextProps.history.location.search.split('?path=')[1]))
                        :
                        ""
                    :
                    prevState.pathBreadcrumb.push(nextProps.match.params.appModuleName)
                ,
                pathFull: pathFull,
                appModuleName: nextProps.match.params.appModuleName
            }
        } else {
            return null
        }
    }

    renderToolButton = (name: string, label: string, icon: string) => {
        return <span className={this.state.currentTool === name ? "tool-button-selected" : "tool-button"}
                     onClick={() => {
                         this.setState({currentTool: this.state.currentTool === name ? undefined : name})
                     }}><IconFA className="magnify" name={icon}><span
            style={{paddingLeft: 5}}>{label}</span></IconFA></span>
    };

    renderFooter = () => {
        return (
            <div>
                <Tooltip title={this.state.hideReferences ? "Show" : "Hide"}>
                    <span className="references-button" onClick={() => {
                        this.setState({hideReferences: !this.state.hideReferences})
                    }}><IconFA name="bars"></IconFA></span>
                </Tooltip>
                <div style={{
                    display: "inline-block",
                    alignItems: "center",
                    justifyContent: "center",
                    alignContent: "center"
                }}>
                    {this.renderToolButton("log", "Log", "ellipsis-v")}
                    {this.renderToolButton("search", "Search", "search")}
                </div>
            </div>
        )
    };

    renderToolbox = () => {
        return this.state.currentTool
    };

    renderContent = () => {
        const {context} = this.state;
        const {viewObject} = context;
        if (!viewObject) return null;
        return this.viewFactory.createView(viewObject, this.props)
    };

    renderReferences = () => {
        const {context} = this.state;
        const {applicationReferenceTree, viewReferenceTree} = context;
        const referenceTree = viewReferenceTree || applicationReferenceTree;
        const cbs = new Map<string, () => void>();
        const onSelect = (keys: string[], event: any) => {
            const cb = cbs.get(keys[keys.length - 1]);
            if (cb) cb();
        };
        const pathReferenceTree = decodeURI(this.props.history.location.hash).split('#')[1];
        return !referenceTree ? null : (
            <Layout style={{backgroundColor: backgroundColor}}>
                <Tree.DirectoryTree defaultSelectedKeys={[pathReferenceTree]} defaultExpandAll onSelect={onSelect}>
                    {referenceTree.get('children').map((c: Ecore.EObject) => this.renderTreeNode(c, cbs))}
                </Tree.DirectoryTree>
            </Layout>
        )
    };

    renderTreeNode = (eObject: Ecore.EObject, cbs: Map<string, () => void>, parentKey?: string) => {
        const code = eObject.get('name');
        const key = parentKey ? parentKey + '/' + code : code;
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
            })
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
        return (
            <Tree.TreeNode title={code} key={key} isLeaf={isLeaf}>{children}</Tree.TreeNode>
        )
    };

    private setURL(eObject: Ecore.EObject, key: any) {
        const appModuleName = eObject.get('AppModule') ? eObject.get('AppModule').get('name') : this.state.appModuleName;
        let pathFull = eObject.get('AppModule') ? undefined : key;
        this.changeURL(appModuleName, pathFull);
    }

    render = () => {
        return (
            <MainContext.Provider value={this.state.context}>
                <div style={{flexGrow: 1}}>
                    <Splitter
                        minimalizedPrimaryPane={this.state.hideReferences}
                        allowResize={!this.state.hideReferences}
                        ref={this.refSplitterRef}
                        position="vertical"
                        primaryPaneMaxWidth="50%"
                        primaryPaneMinWidth={0}
                        primaryPaneWidth={localStorage.getItem('mainapp_refsplitter_pos') || "40px"}
                        dispatchResize={true}
                        postPoned={false}
                        onDragFinished={() => {
                            const size: string = this.refSplitterRef.current!.panePrimary.props.style.width;
                            localStorage.setItem('mainapp_refsplitter_pos', size)
                        }}
                    >
                        <div style={{flexGrow: 1, backgroundColor: backgroundColor, height: '100%', overflow: "auto"}}>
                            {this.renderReferences()}
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
                                        }}>{this.renderContent()}</div>
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
            </MainContext.Provider>
        )
    }
}
