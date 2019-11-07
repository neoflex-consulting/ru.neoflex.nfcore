import * as React from "react";
import {Row, Col, Table, Checkbox, Button, Tooltip} from 'antd';
// import { Ecore } from "ecore";
import { API } from "../modules/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import {Icon as IconFA} from 'react-fa';
// import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
// import Splitter from './CustomSplitter'
import {WithTranslation, withTranslation} from "react-i18next";
const {Column} = Table;
const ButtonGroup = Button.Group

interface Props {}

interface State {
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

    state = {
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

    render() {
        const {t} = this.props as Props & WithTranslation;
        const branches = this.state.branchInfo.branches.map(branch => ({
            branch,
            key: branch,
            isCurrent: branch === this.state.branchInfo.current,
            isDefault: branch === this.state.branchInfo.default
        }))
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
                </Col>
                <Col span={3}/>
            </Row>
        );
    }
}

export default withTranslation()(GitDB);
