import * as React from "react";
import {Row, Col, Table, Checkbox, Button, Tooltip, Divider, Input, Form, Modal, Tag, notification} from 'antd';
import {API} from "../modules/api";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
// import Splitter from './CustomSplitter'
import {faCheckCircle, faCloudDownloadAlt, faCloudUploadAlt, faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {WithTranslation, withTranslation} from "react-i18next";
import SearchGrid from "./SearchGrid";
import Ecore from "ecore";
import FilesystemLookup from "./app/filesystem/FilesystemLookup";
import {Helmet} from "react-helmet";

const {Column} = Table;
const ButtonGroup = Button.Group

interface Props {
}

interface State {
    fileName?: string,
    deployName?: string,
    modalResourceVisible: boolean,
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
    sql?: string
}

class Tools extends React.Component<any, State> {

    state: State = {
        modalResourceVisible: false,
        withReferences: false,
        withDependents: false,
        recursiveDependents: false,
        resourceList: [],
        checkedFiles: [],
        branchInfo: {
            current: "master",
            default: 'master',
            branches: ["master"]
        }
    };

    componentDidMount(): void {
        this.fetchBranchInfo()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
    }

    fetchBranchInfo = () => {
        API.instance().fetchJson("/system/branch").then(branchInfo => {
            this.setState({branchInfo})
        })
    }

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
    }

    uploadFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({fileName: file.name.replace(/\\/g, '/').replace(/.*\//, '')})
        API.instance().fetchJson("/system/importdb", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    }

    uploadMD = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({mdFileName: file.name.replace(/\\/g, '/').replace(/.*\//, '')})
        API.instance().fetchJson("/masterdata/import", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    }

    deployFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        this.setState({deployName: file.name.replace(/\\/g, '/').replace(/.*\//, '')});
        API.instance().fetchJson("/system/deploySupply", {method: 'POST', body: form}).then(json => {
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    }

    downloadAll = () => {
        let filename = "export.zip";
        API.instance().download("/system/exportdb", {}, filename)
    }

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
    }

    downloadSQL = () => {
        let filename = "masterdata.json";
        API.instance().download(`/masterdata/export?sql=${this.state.sql}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, filename)
    }

    handleAddNewResource = (resources: Ecore.Resource[]): void => {
        const {resourceList} = this.state
        resourceList.push(...resources)
        this.setState({modalResourceVisible: false})
    }

    render() {
        const {t} = this.props as Props & WithTranslation;
        const branches = this.state.branchInfo.branches.map(branch => ({
            branch,
            key: branch,
            isCurrent: branch === this.state.branchInfo.current,
            isDefault: branch === this.state.branchInfo.default
        }))
        const fileInput = <Tooltip title={this.props.t("import")}>
            <label>
                <FontAwesomeIcon icon={faCloudUploadAlt}/>
                <Input type="file" style={{display: "none"}}
                       onChange={e => {
                           const file = e!.target!.files![0]
                           if (file) {
                               this.uploadFile(file)
                           }
                       }}
                       onClick={e => {
                           this.setState({fileName: undefined})
                       }}
                />
            </label>
        </Tooltip>

        const mdInput = <Tooltip title={this.props.t("import")}>
            <label>
                <FontAwesomeIcon icon={faCloudUploadAlt}/>
                <Input type="file" style={{display: "none"}}
                       onChange={e => {
                           const file = e!.target!.files![0]
                           if (file) {
                               this.uploadMD(file)
                           }
                       }}
                       onClick={e => {
                           this.setState({fileName: undefined})
                       }}
                />
            </label>
        </Tooltip>

        const fileDeploy = <Tooltip title={this.props.t("import")}>
            <label>
                <FontAwesomeIcon icon={faCloudUploadAlt}/>
                <Input type="file" style={{display: "none"}}
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
            </label>
        </Tooltip>

        return (
            <Row>
                <Helmet>
                    <title>{this.props.t('tools')}</title>
                    <link rel="shortcut icon" type="image/png" href="/developer.ico" />
                </Helmet>
                <Col span={3}/>
                <Col span={18}>
                    <Table pagination={false} size="small" dataSource={branches}>
                        <Column title={this.props.t("branch")}
                                dataIndex={"branch"} key={"branch"}
                        />
                        <Column
                            title={this.props.t("is current")}
                            dataIndex={"isCurrent"} key={"isCurrent"}
                            render={(text) => <Checkbox disabled={true} checked={text === true}/>}
                        />
                        <Column title={this.props.t("is default")}
                                dataIndex={"isDefault"} key={"isDefault"}
                                render={(text) => <Checkbox disabled={true} checked={text === true}/>}
                        />
                        <Column dataIndex={"branch"} key={"command"}
                                render={branch => (
                                    <ButtonGroup className="pull-right">
                                        <Tooltip title={this.props.t("set current")}>
                                            <Button type="dashed" size="small" onClick={() => {
                                                this.setCurrentBranch(branch)
                                            }}>
                                                <FontAwesomeIcon icon={faCheckCircle}/>
                                            </Button>
                                        </Tooltip>
                                    </ButtonGroup>
                                )}
                        />
                    </Table>
                    <Divider orientation="left">{this.props.t("export all objects")}</Divider>
                    <Tooltip title={this.props.t("export")}>
                        <Button type="dashed" size="small" onClick={() => {
                            this.downloadAll();
                        }}>
                            <FontAwesomeIcon icon={faCloudDownloadAlt}/>
                        </Button>
                    </Tooltip>
                    <Divider orientation="left">{this.props.t("export selected files objects")}</Divider>
                    <div>
                        <FilesystemLookup checked={this.state.checkedFiles}
                                          onCheck={paths => this.setState({checkedFiles: paths})}/>
                    </div>
                    {this.state.modalResourceVisible && <Modal
                        key="add_resource_modal"
                        width={'1000px'}
                        title={t('addresource')}
                        visible={this.state.modalResourceVisible}
                        footer={null}
                        onCancel={() => this.setState({modalResourceVisible: false})}>
                        <SearchGrid key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={false}
                                    specialEClass={undefined}/>
                    </Modal>}
                    <div>
                        <Tooltip title={this.props.t("add objects")}>
                            <Button type="dashed" size="small" onClick={() => {
                                this.setState({modalResourceVisible: true})
                            }}>
                                <FontAwesomeIcon icon={faPlusCircle}/>
                            </Button>
                        </Tooltip>
                        {this.state.resourceList.map(r =>
                            <Tooltip title={r.eContents()[0].eClass.get('name')}>
                                <Tag key={r.get("uri")} closable={true} onClose={() => {
                                    const index = this.state.resourceList.indexOf(r);
                                    this.state.resourceList.splice(index, 1)
                                }}>
                                    {r.eContents()[0].get('name') || r.get('uri')}
                                </Tag>
                            </Tooltip>
                        )}
                    </div>
                    <Form layout={"inline"}>
                        <Form.Item>
                            <Tooltip title={this.props.t("export with all referenced objects")}>
                                <Checkbox checked={this.state.withReferences}
                                          onChange={(e) => this.setState({withReferences: e.target.checked})}>
                                    {this.props.t("with references")}</Checkbox>
                            </Tooltip>
                            <Tooltip title={this.props.t("export with dependent objects")}>
                                <Checkbox checked={this.state.withDependents}
                                          onChange={(e) => this.setState({withDependents: e.target.checked})}>
                                    {this.props.t("with dependents")}</Checkbox>
                            </Tooltip>
                            <Tooltip title={this.props.t("collect dependent objects recursively")}>
                                <Checkbox checked={this.state.recursiveDependents}
                                          onChange={(e) => this.setState({recursiveDependents: e.target.checked})}>
                                    {this.props.t("recursive dependents")}</Checkbox>
                            </Tooltip>
                            <Tooltip title={this.props.t("export selected")}>
                                <Button type="dashed" size="small"
                                        disabled={this.state.resourceList.length === 0 && this.state.checkedFiles.length === 0}
                                        onClick={() => {
                                            this.downloadSelected()
                                        }}>
                                    <FontAwesomeIcon icon={faCloudDownloadAlt}/>
                                </Button>
                            </Tooltip>
                        </Form.Item>
                    </Form>
                    <Divider orientation="left">{this.props.t("import objects")}</Divider>
                    <Form layout={"inline"}>
                        <Form.Item>
                            <Input addonBefore={fileInput} value={this.state!.fileName} readOnly={true}/>
                        </Form.Item>
                    </Form>
                    <Divider orientation="left">{this.props.t("deploy supply")}</Divider>
                    <Form layout={"inline"}>
                        <Form.Item>
                            <Input addonBefore={fileDeploy} value={this.state!.deployName} readOnly={true}/>
                        </Form.Item>
                    </Form>
                    <Divider orientation="left">{this.props.t("export master data")}</Divider>
                    <Form layout={"inline"}>
                        <Tooltip title={this.props.t("query data to export")}>
                            <Input.TextArea placeholder="SQL" value={this.state.sql}
                                            onChange={(e) => this.setState({sql: e.target.value})}></Input.TextArea>
                        </Tooltip>
                        <Tooltip title={this.props.t("export selected")}>
                            <Button type="dashed" size="small" disabled={!this.state.sql} onClick={() => {
                                this.downloadSQL()
                            }}>
                                <FontAwesomeIcon icon={faCloudDownloadAlt}/>
                            </Button>
                        </Tooltip>
                    </Form>
                    <Divider orientation="left">{this.props.t("import master data")}</Divider>
                    <Form layout={"inline"}>
                        <Form.Item>
                            <Input addonBefore={mdInput} value={this.state!.mdFileName} readOnly={true}/>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={3}/>
            </Row>
        );
    }
}

export default withTranslation()(Tools);
