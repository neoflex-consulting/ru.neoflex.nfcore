import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {Modal, Tag, Tooltip} from "antd";
import FilesystemTree from "./FilesystemTree";

interface Props {
    ref: any,
    checked: string[],
    onCheck: (paths: string[]) => void
}

interface State {
    showDialog: boolean
}

class FilesystemLookup extends React.Component<Props & WithTranslation, State> {
    state = {
        showDialog: false
    };

    showDialog = () => {
        this.setState({showDialog: true})
    };

    render() {
        const {onCheck, checked} = this.props
        return <React.Fragment>
            <Modal title={this.props.t("select files")}
                   onCancel={() => this.setState({showDialog: false})}
                   visible={this.state.showDialog}
                   footer={null}
            >
                <FilesystemTree checked={checked} onCheck={onCheck}/>
            </Modal>
            <div style={{display: "unset !important",alignItems:"unset !important"}}>
            {this.props.checked.filter(r => (r.split("/").pop() || "").includes(".")).map(r =>
                <Tooltip title={r}>
                    <Tag
                        key={r} closable={true} onClose={() => {
                        const index = this.props.checked.indexOf(r);
                        this.props.checked.splice(index, 1)
                    }}>
                        {r.split("/").pop()}
                    </Tag>
                </Tooltip>
            )}
            </div>
        </React.Fragment>;
    }
}

export default withTranslation('common', { withRef: true })(FilesystemLookup)