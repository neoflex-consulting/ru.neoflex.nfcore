import * as React from "react";
import {Row, Col, Table, Checkbox, Button, Tooltip, Divider, Input, Form, Modal, Tag, notification} from 'antd';
import { API } from "../modules/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
// import Splitter from './CustomSplitter'
import { faCheckCircle, faCloudDownloadAlt, faCloudUploadAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import {WithTranslation, withTranslation} from "react-i18next";
import SearchGridTrans from "./SearchGrid";
import Ecore from "ecore";
const {Column} = Table;
const ButtonGroup = Button.Group

interface Props {}

interface State {
    fileName?: string,
    modalResourceVisible: boolean,
    withReferences: boolean,
    withDependents: boolean,
    recursiveDependents: boolean,
    resourceList: Ecore.Resource[],
    branchInfo: {
        current: string,
        default: string,
        branches: string[]
    }
}

class GitDB extends React.Component<any, State> {

    state: State = {
        modalResourceVisible: false,
        withReferences: false,
        withDependents: false,
        recursiveDependents: false,
        resourceList: [],
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
        API.instance().fetchJson("/system/importdb", {method: 'POST', body: form}).then(json=>{
            notification.success({message: JSON.stringify(json, undefined, 4)})
        })
    }

    downloadAll = () => {
        let filename = "export.zip";
        API.instance().download("/system/exportdb", {}, filename)
    }

    downloadSelected = () => {
        let filename = "export.zip";
        API.instance().download(`/system/exportdb?withReferences=${this.state.withReferences===true}&withDependents=${this.state.withDependents===true}&recursiveDependents=${this.state.recursiveDependents===true}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.resourceList.map(r=>r.get('uri')))
        }, filename)
    }

    handleAddNewResource = (resources: Ecore.Resource[]): void => {
        const {resourceList} = this.state
        resourceList.push(...resources)
        this.setState({ modalResourceVisible: false })
    }

    render() {
        const {t} = this.props as Props & WithTranslation;
        const branches = this.state.branchInfo.branches.map(branch => ({
            branch,
            key: branch,
            isCurrent: branch === this.state.branchInfo.current,
            isDefault: branch === this.state.branchInfo.default
        }))
        const fileInput = <Tooltip title={"Import"}>
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

        return (
            <Row>
                <Col span={3}/>
                <Col span={18}>
                    <Table pagination={false} size="small" dataSource={branches}>
                        <Column title={"Branch"}
                                dataIndex={"branch"} key={"branch"}
                        />
                        <Column
                            title={"Is Current"}
                            dataIndex={"isCurrent"} key={"isCurrent"}
                            render={(text) => <Checkbox disabled={true} checked={text === true}/>}
                        />
                        <Column title={"Is Default"}
                                dataIndex={"isDefault"} key={"isDefault"}
                                render={(text) => <Checkbox disabled={true} checked={text === true}/>}
                        />
                        <Column dataIndex={"branch"} key={"command"}
                                render={branch=>(
                                    <ButtonGroup className="pull-right">
                                        <Tooltip title={"Set Current"}>
                                            <Button type="dashed" size="small" onClick={()=>{
                                                this.setCurrentBranch(branch)
                                            }}>
                                                <FontAwesomeIcon icon={faCheckCircle}/>
                                            </Button>
                                        </Tooltip>
                                    </ButtonGroup>
                                )}
                        />
                    </Table>
                    <Divider orientation="left">Export All Objects</Divider>
                    <Tooltip title={"Export"}>
                        <Button type="dashed" size="small" onClick={()=>{
                            this.downloadAll();
                        }}>
                            <FontAwesomeIcon icon={faCloudDownloadAlt}/>
                        </Button>
                    </Tooltip>
                    <Divider orientation="left">Export Selected Objects</Divider>
                    {this.state.modalResourceVisible && <Modal
                        key="add_resource_modal"
                        width={'1000px'}
                        title={t('addresource')}
                        visible={this.state.modalResourceVisible}
                        footer={null}
                        onCancel={() => this.setState({modalResourceVisible: false})}                    >
                        <SearchGridTrans key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={true} specialEClass={undefined} />
                    </Modal>}
                    <div>
                        {this.state.resourceList.map(r=>
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
                            <Tooltip title={"Add Objects"}>
                                <Button type="dashed" size="small" onClick={()=>{
                                    this.setState({modalResourceVisible: true})
                                }}>
                                    <FontAwesomeIcon icon={faPlusCircle}/>
                                </Button>
                            </Tooltip>
                            <Tooltip title={"Export with all referenced objects"}>
                                <Checkbox checked={this.state.withReferences} onChange={(e)=>this.setState({withReferences: e.target.checked})}>With References</Checkbox>
                            </Tooltip>
                            <Tooltip title={"Export with dependent objects"}>
                                <Checkbox checked={this.state.withDependents} onChange={(e)=>this.setState({withDependents: e.target.checked})}>With Dependents</Checkbox>
                            </Tooltip>
                            <Tooltip title={"Collect dependent objects recursively"}>
                                <Checkbox checked={this.state.recursiveDependents} onChange={(e)=>this.setState({recursiveDependents: e.target.checked})}>Recursive Dependents</Checkbox>
                            </Tooltip>
                            <Tooltip title={"Export Selected"}>
                                <Button type="dashed" size="small" disabled={this.state.resourceList.length === 0} onClick={()=>{
                                    this.downloadSelected()
                                }}>
                                    <FontAwesomeIcon icon={faCloudDownloadAlt}/>
                                </Button>
                            </Tooltip>
                        </Form.Item>
                    </Form>
                    <Divider orientation="left">Import Objects</Divider>
                    <Form layout={"inline"}>
                        <Form.Item>
                            <Input addonBefore={fileInput} value={this.state!.fileName} readOnly={true}/>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={3}/>
            </Row>
        );
    }
}

export default withTranslation()(GitDB);
