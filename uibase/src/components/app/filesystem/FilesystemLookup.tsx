import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {Tag, Drawer} from "antd";
import FilesystemTree from "./FilesystemTree";
import {NeoTag} from "neo-design/lib";

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
                style={{top:'80px'}}
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
                <NeoTag
                    key={r} closable={true} onClose={() => {
                    let checked: string[] = [];
                    let prevElement = "";
                    r.split("/").forEach((value, index, array)=>{
                        if (index === 0) {
                            checked.push("/");
                        } else {
                            checked.push(prevElement.concat("/", value));
                            prevElement = prevElement.concat("/", value)
                        }
                    });
                    this.props.onCheck(this.props.checked.filter(e=> !checked.includes(e)))
                }}>
                    {r.split("/").pop()}
                </NeoTag>
            )}
            </div>
        </React.Fragment>;
    }
}

export default withTranslation('common', { withRef: true })(FilesystemLookup)