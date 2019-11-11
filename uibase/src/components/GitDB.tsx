import * as React from "react";
import {Row, Col, Table, Checkbox, Button, Tooltip, Divider, Input, Form} from 'antd';
// import { Ecore } from "ecore";
import { API } from "../modules/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCloudDownloadAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
// import {Icon as IconFA} from 'react-fa';
// import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
// import Splitter from './CustomSplitter'
import {WithTranslation, withTranslation} from "react-i18next";
const {Column} = Table;
const ButtonGroup = Button.Group

interface Props {}

interface State {
    fileName?: string,
    branchInfo: {
        current: string,
        default: string,
        branches: string[]
    }
}

class GitDB extends React.Component<any, State> {

    // constructor(props: any) {
    //     super(props);
    // }

    state: State = {
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
        //this.fetchBranchInfo()
    }

    fetchBranchInfo = () => {
        API.instance().fetchJson("/system/branch").then(branchInfo => {
            this.setState({branchInfo})
        })
    }

    putCurrentBranch = (branch: string) => {
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
            console.log(json)
        })
    }

    downloadAll = () => {
        let filename = "export.zip";
        return API.instance().fetch("/system/exportdb", {}).then(response => {
            var disposition = response.headers.get('Content-Disposition');
            if (disposition) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            return response.blob()
        }).then((blob: any) => {
            const a: HTMLAnchorElement = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute("style", "display: none");
            let objectURL = URL.createObjectURL(blob)
            a.href = objectURL;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(objectURL)
            document.body.removeChild(a)
        })

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
                                                this.putCurrentBranch(branch)
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
