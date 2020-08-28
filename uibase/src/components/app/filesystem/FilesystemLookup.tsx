import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {Tag, Drawer} from "antd";
import FilesystemTree from "./FilesystemTree";

interface Props {
    ref: any,
    checked: string[],
    onCheck: (paths: string[]) => void
}

interface State {
    showDrawer: boolean
}

class FilesystemLookup extends React.Component<Props & WithTranslation, State> {
    state = {
        showDrawer: false
    };

    showDrawer = () => {
        this.setState({showDrawer: true})
    };

    render() {
        const {onCheck, checked} = this.props;
        return <React.Fragment>
            <Drawer
                title={this.props.t("select scripts")}
                width={'50vw'}
                visible={this.state.showDrawer}
                placement={"right"}
                mask={false}
                maskClosable={false}
                onClose={()=>this.setState({showDrawer: false})}
            >
                <FilesystemTree checked={checked} onCheck={onCheck}/>
            </Drawer>
            <div style={{display: "unset !important",alignItems:"unset !important"}}>
            {this.props.checked.filter(r => (r.split("/").pop() || "").includes(".")).map(r =>
                <Tag
                    key={r} closable={true} onClose={() => {
                    const index = this.props.checked.indexOf(r);
                    this.props.checked.splice(index, 1)
                }}>
                    {r.split("/").pop()}
                </Tag>
            )}
            </div>
        </React.Fragment>;
    }
}

export default withTranslation('common', { withRef: true })(FilesystemLookup)