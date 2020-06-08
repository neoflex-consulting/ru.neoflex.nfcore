import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {Button, Modal, Tag, Tooltip} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FilesystemTree from "./FilesystemTree";
import {faFolderPlus} from "@fortawesome/free-solid-svg-icons";

interface Props {
    checked: string[],
    onCheck: (paths: string[]) => void
}

interface State {
    showDialog: boolean
}

class FilesystemLookup extends React.Component<Props & WithTranslation, State> {
    state = {
        showDialog: false
    }

    render() {
        const {onCheck, checked} = this.props
        return <React.Fragment>
            <Modal title={"Select files"}
                   onCancel={() => this.setState({showDialog: false})}
                   visible={this.state.showDialog}
                   footer={null}
            >
                <FilesystemTree checked={checked} onCheck={onCheck}/>
            </Modal>
            <Tooltip title={"Add Files"}>
                <Button type="dashed" size={'small'}
                        onClick={(event) => {
                            this.setState({showDialog: true})
                        }}>
                    <FontAwesomeIcon icon={faFolderPlus}/>
                </Button>
            </Tooltip>
            {this.props.checked.filter(r => (r.split("/").pop() || "").includes(".")).map(r =>
                <Tooltip title={r}>
                    <Tag key={r} closable={false} onClose={() => {
                        const index = this.props.checked.indexOf(r);
                        this.props.checked.splice(index, 1)
                    }}>
                        {r.split("/").pop()}
                    </Tag>
                </Tooltip>
            )}
        </React.Fragment>;
    }
}

export default withTranslation()(FilesystemLookup)