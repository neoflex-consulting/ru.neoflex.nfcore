import * as React from "react";
import {
    Input,
    Tag,
    notification,
    Tabs,
    Select, Drawer
} from 'antd';
import {API} from "../modules/api";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
import {WithTranslation, withTranslation} from "react-i18next";
import SearchGrid from "./SearchGrid";
import Ecore from "ecore";
import FilesystemLookup from "./app/filesystem/FilesystemLookup";
import {Helmet} from "react-helmet";
import { NeoButton } from "neo-design";
// CSS
import './../styles/Tools.css';
import {ReactComponent as ExportIcon} from './../icons/exportFileIcon.svg'
import { NeoInput, NeoSelect} from "neo-design/lib";

const { TabPane } = Tabs;

interface Props {
}

interface State {
    fileName?: string,
    deployName?: string,
    drawerResourceVisible: boolean,
    withReferences: boolean,
    withDependents: boolean,
    recursiveDependents: boolean,
    resourceList: Ecore.Resource[],
    checkedFiles: string[],
    branchInfo: {
        current: string,
        default: string,
        branches: string[]
    },
    mdFileName?: string,
    sql?: string,
    currentBranch: {
        branch: string,
        key: string,
        isCurrent: boolean,
        isDefault: boolean
    }
    MDUploadArray: File[],
    filesUploadArray: File[],
}

class Tools extends React.Component<any, State> {

    fileSystemLookupRef = React.createRef<any>();
    deploySupplyInputRef = React.createRef<HTMLInputElement>();
    importObjectInputRef = React.createRef<HTMLInputElement>();
    importMDInputRef = React.createRef<HTMLInputElement>();

    state: State = {
        drawerResourceVisible: false,
        withReferences: false,
        withDependents: false,
        recursiveDependents: false,
        resourceList: [],
        checkedFiles: [],
        branchInfo: {
            current: "master",
            default: 'master',
            branches: ["master"]
        },
        currentBranch: {
            branch: "",
            key: "",
            isCurrent: false,
            isDefault: false
        },
        MDUploadArray: [],
        filesUploadArray: [],
    };

    componentDidMount(): void {
        this.fileSystemLookupRef = React.createRef();
        this.fetchBranchInfo()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
    }

    fetchBranchInfo = () => {
        API.instance().fetchJson("/system/branch").then(branchInfo => {
            this.setState({branchInfo})
        })
    };

    setCurrentBranch = (branch: string) => {
        API.instance().fetchJson("/system/branch/" + branch, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(branchInfo => {
            this.setState({branchInfo})
        })
    };

    uploadFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({fileName: file.name.replace(/\\/g, '/').replace(/.*\//, '')})
        API.instance().fetchJson("/system/importdb", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    };

    uploadMD = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({mdFileName: file.name.replace(/\\/g, '/').replace(/.*\//, '')})
        API.instance().fetchJson("/masterdata/import", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    };

    deployFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({deployName: file.name.replace(/\\/g, '/').replace(/.*\//, '')});
        API.instance().fetchJson("/system/deploySupply", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    };

    downloadAll = () => {
        let filename = "export.zip";
        API.instance().download("/system/exportdb", {}, filename)
    };

    downloadSelected = () => {
        let filename = "export.zip";
        API.instance().download(`/system/exportdb?withReferences=${this.state.withReferences === true}&withDependents=${this.state.withDependents === true}&recursiveDependents=${this.state.recursiveDependents === true}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resources: this.state.resourceList.map(r => r.get('uri')),
                files: this.state.checkedFiles
            })
        }, filename)
    };

    downloadSQL = () => {
        let filename = "masterdata.json";
        API.instance().download(`/masterdata/export?sql=${this.state.sql}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, filename)
    };

    handleAddNewResource = (resources: Ecore.Resource[]): void => {
        const {resourceList} = this.state
        resourceList.push(...resources)
        this.setState({drawerResourceVisible: false})
    };

    render() {
        const {t} = this.props as Props & WithTranslation;
        const branches = this.state.branchInfo.branches.map(branch => ({
            branch,
            key: branch,
            isCurrent: branch === this.state.branchInfo.current,
            isDefault: branch === this.state.branchInfo.default
        }));

        const branchRegion = <div className={"tools-branch-region tools-vertical-center-element"}>
            <div>
                <p className={"tools-header tools-padding-top tools-margin-left"}>{t("branch parameters")}</p>
                <p className={"tools-text tools-margin-left"}>{t("branch")}</p>
                <NeoSelect
                    placeholder={t("choose from the list")}
                    className={"tools-select tools-margin-left"} onChange={(currentValue: string)=>{
                    this.setState({currentBranch:branches.find(b=>b.key === currentValue)!})
                }}>
                    {branches.map(b=>{
                        return <Select.Option key={b.key} >
                            {b.key}
                        </Select.Option>
                    })}
                </NeoSelect>
            </div>
            <div className={"tools-select-checkbox-area"}>
                <p className={"tools-text tools-branch-checkbox-text-margin"}>{t("is default")}</p>
                <NeoInput className={"tools-branch-checkbox"} type={"checkbox"} disabled={true} checked={this.state.currentBranch.isDefault}/>
            </div>
            <div className={"tools-select-checkbox-area"}>
                <p className={"tools-text tools-branch-checkbox-text-margin"}>{t("is current")}</p>
                <NeoInput className={"tools-branch-checkbox"} type={"checkbox"} disabled={true} checked={this.state.currentBranch.isCurrent}/>
            </div>
        </div>;

        const exportAllObjectsRegion = <div
            className={"tools-region-element tools-export-all-objects"}>
            <p className={"tools-header tools-margin-left tools-horizontal-center-element"}>{t("export parameters")}</p>
            <a className={"tools-href tools-horizontal-center-element tools-margin-right"}
               onClick={() => {this.downloadAll();}}>
                {t("export all objects")}
            </a>
        </div>;

        const exportFilesRegion = <div
            className={"tools-region-element tools-horizontal-center-element tools-export-files"}>
            <div className={"tools-horizontal-center-element tools-icon-container tools-margin-left"}>
                <ExportIcon className={"tools-icon"}/>
                <a className={"tools-highlighted-text"}
                   onClick={(event) => {
                       this.fileSystemLookupRef.current.showDrawer()
                   }}>
                    {this.props.t("select export scripts")}
                </a>
            </div>
            <div className={"tools-horizontal-center-element"}>
                <FilesystemLookup ref={this.fileSystemLookupRef}
                                  checked={this.state.checkedFiles}
                                  onCheck={paths => this.setState({checkedFiles: paths})}/>
            </div>
        </div>;

        const exportObjectsRegion = <div
            className={"tools-region-element tools-export-objects-region"}>
            <p className={"tools-sub-header tools-margin-top tools-margin-left"}>{t("export metadata")}</p>
            <p className={"tools-text tools-margin-left"}>{t("select metadata parameters")}</p>
            <NeoInput type={"checkbox"}
                      className={"tools-checkbox tools-margin-left"}
                      checked={this.state.withReferences}
                      onChange={(e:any) => this.setState({withReferences: e.target.checked})}>
                {t("with references")}
            </NeoInput>
            <NeoInput type={"checkbox"}
                      className={"tools-checkbox tools-margin-left"}
                      checked={this.state.withDependents}
                      onChange={(e:any) => this.setState({withDependents: e.target.checked})}>
                {t("with dependents")}
            </NeoInput>
            <NeoInput type={"checkbox"}
                      className={"tools-checkbox tools-margin-left"}
                      checked={this.state.recursiveDependents}
                      onChange={(e:any) => this.setState({recursiveDependents: e.target.checked})}>
                {t("recursive dependents")}
            </NeoInput>
            <div className={"tools-horizontal-center-element tools-export-files"}>
                <div className={"tools-horizontal-center-element tools-icon-container tools-margin-left"}>
                    <ExportIcon className={"tools-icon"}/>
                    <a className={"tools-highlighted-text"}
                       onClick={() => {
                           this.setState({drawerResourceVisible: true})
                       }}>
                        {t("select metadata for export")}
                    </a>
                </div>
                <div className={"tools-horizontal-center-element"}>
                    {this.state.resourceList.map(r =>
                        <Tag key={r.get("uri")} closable={true} onClose={() => {
                            const index = this.state.resourceList.indexOf(r);
                            this.state.resourceList.splice(index, 1)
                        }}>
                            {r.eContents()[0].get('name') || r.get('uri')}
                        </Tag>
                    )}
                </div>
                <Drawer
                    title={this.props.t("select data")}
                    width={'50vw'}
                    visible={this.state.drawerResourceVisible}
                    placement={"right"}
                    mask={false}
                    maskClosable={false}
                    onClose={()=>this.setState({drawerResourceVisible: false})}
                >
                    <SearchGrid key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={false}
                                specialEClass={undefined}/>
                </Drawer>
            </div>
        </div>;

        const exportSQL = <div
            className={"tools-export-sql"}>
            <p className={"tools-highlighted-text tools-margin-left tools-margin-top"}>{t("export master data")}</p>
            <Input.TextArea className={"tools-sql-area tools-margin-left"} placeholder="SQL" value={this.state.sql}
                            onChange={(e) => this.setState({sql: e.target.value})}/>
        </div>;

        const exportButtonRegion = <div className={"tools-button-region"}>
            <NeoButton
                className={"tools-button tools-action-button tools-margin-left"}
                type={this.state.resourceList.length === 0 && this.state.checkedFiles.length === 0 && !this.state.sql ? "disabled" : undefined}
                onClick={() => {
                    if (!(this.state.resourceList.length === 0 && this.state.checkedFiles.length === 0))
                        this.downloadSelected();
                    if (this.state.sql)
                        this.downloadSQL();
                    this.setState({resourceList:[], checkedFiles:[], sql: undefined})
                }}
            >{t('do export')}</NeoButton>
            <NeoButton
                className={"tools-button tools-clear-button tools-margin-left"}
                type={"secondary"}
                onClick={()=>{
                    this.setState({resourceList:[], checkedFiles:[], sql: undefined})
                }}>
                {t('clear')}
            </NeoButton>
        </div>;

        const importButtonRegion = <div className={"tools-button-region"}>
            <NeoButton
                className={"tools-button tools-action-button tools-margin-left"}
                type={this.state.filesUploadArray.length === 0 && this.state.MDUploadArray.length === 0 ? "disabled" : undefined}
                onClick={() => {
                    if (this.state.filesUploadArray.length !== 0) {
                        this.state.filesUploadArray.forEach(f=>this.uploadFile(f));
                    }
                    if (this.state.MDUploadArray.length !== 0) {
                        this.state.MDUploadArray.forEach(f=>this.uploadMD(f));
                    }
                    this.setState({MDUploadArray: [], filesUploadArray: []})
                }}
            >{t('import files')}</NeoButton>
            <NeoButton
                className={"tools-button tools-clear-button tools-margin-left"}
                type={"secondary"}
                onClick={()=>{
                    this.setState({MDUploadArray: [], filesUploadArray: []})
                }}>
                {t('clear')}
            </NeoButton>
        </div>;

        const importParametersRegion = <div className={"tools-import-parameters tools-region-element"}>
            <p className={"tools-header tools-margin-left tools-horizontal-center-element"}>{t("import parameters")}</p>
            <a className={"tools-href tools-horizontal-center-element tools-margin-right"}
               onClick={() => {
                   this.deploySupplyInputRef.current!.click()
               }}>
                {t("deploy supply")}
                <input ref={this.deploySupplyInputRef}
                       type="file" style={{display: "none"}}
                       onChange={e => {
                           const file = e!.target!.files![0]
                           if (file) {
                               this.deployFile(file)
                           }
                       }}
                       onClick={e => {
                           this.setState({deployName: undefined})
                       }}
                />
            </a>
        </div>;

        const importFilesRegion = <div className={"tools-import-files tools-region-element"}>
            <div className={"tools-horizontal-center-element tools-icon-container tools-margin-left"}>
                <ExportIcon className={"tools-icon"}/>
                <a className={"tools-highlighted-text"}
                   onClick={(event) => {
                       this.importObjectInputRef.current!.click()
                   }}>
                    {this.props.t("select files")}
                    <input ref={this.importObjectInputRef}
                           type="file" style={{display: "none"}}
                           onChange={e => {
                               const file = e!.target!.files![0];
                               if (file) {
                                   this.setState({filesUploadArray: this.state.filesUploadArray.concat([file])})
                                   this.importObjectInputRef.current!.value = ""
                               }
                           }}
                           onClick={e => {
                               this.setState({fileName: undefined})
                           }}
                    />
                </a>
            </div>
            <div className={"tools-horizontal-center-element"}>
                {this.state.filesUploadArray.map(r =>
                    <Tag key={r.name} closable={true} onClose={() => {
                        const index = this.state.filesUploadArray.indexOf(r);
                        this.state.filesUploadArray.splice(index, 1);
                    }}>
                        {r.name}
                    </Tag>
                )}
            </div>
        </div>;

        const importMasterData = <div className={"tools-import-masterdata"}>
            <div className={"tools-horizontal-center-element tools-icon-container tools-margin-left"}>
                <ExportIcon className={"tools-icon"}/>
                <a className={"tools-highlighted-text"}
                    onClick={(event) => {
                        this.importMDInputRef.current!.click()
                    }}>
                    {this.props.t("select masterdata")}
                    <input ref={this.importMDInputRef}
                           type="file" style={{display: "none"}}
                           onChange={e => {
                               const file = e!.target!.files![0];
                               if (file) {
                                   this.setState({MDUploadArray: this.state.MDUploadArray.concat([file])})
                                   this.importMDInputRef.current!.value = ""
                               }
                           }}
                           onClick={e => {
                               this.setState({fileName: undefined})
                           }}
                    />
                </a>
            </div>
            <div className={"tools-horizontal-center-element"}>
                {this.state.MDUploadArray.map(r =>
                    <Tag key={r.name} closable={true} onClose={() => {
                        const index = this.state.MDUploadArray.indexOf(r);
                        this.state.MDUploadArray.splice(index, 1);
                    }}>
                        {r.name}
                    </Tag>
                )}
            </div>
        </div>;

        return (
            <div >
                <Helmet>
                    <title>{this.props.t('tools')}</title>
                    <link rel="shortcut icon" type="image/png" href="/developer.ico" />
                </Helmet>
                {branchRegion}
                <Tabs className={"tools-tabs-region tools-vertical-center-element"}
                    defaultActiveKey={"export"}
                    tabPosition={'top'}>
                    <TabPane tab={t("export")} key={t("export")}>
                        <div
                            className={"tools-export-region tools-vertical-center-element"}>
                            {exportAllObjectsRegion}
                            {exportFilesRegion}
                            {exportObjectsRegion}
                            {exportSQL}
                        </div>
                        {exportButtonRegion}
                    </TabPane>
                    <TabPane tab={t("import")} key={t("import")} >
                        <div
                            className={"tools-import-region tools-vertical-center-element"}>
                            {importParametersRegion}
                            {importFilesRegion}
                            {importMasterData}
                        </div>
                        {importButtonRegion}
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default withTranslation()(Tools);
