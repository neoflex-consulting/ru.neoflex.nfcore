import React from 'react';
import {Dropdown, Menu} from "antd";
import {dmlOperation} from "../../../../utils/consts";
import {NeoColor, NeoTypography} from "neo-design/lib";

interface Props {
    t: any,
    editGrid: any,
    data: {[key: string]: unknown},
    rowIndex: number,
    showMenuCopyButton: boolean
}

interface State {
}

export default class GridMenu extends React.Component<Props, State> {

    menu = (
        <Menu>
            <Menu.Item
                key="0"
                onClick={()=>{
                    this.props.editGrid.undoChanges(this.props.data)
                }}>
                <NeoTypography>{this.props.t("undo changes")}</NeoTypography>
            </Menu.Item>
            <Menu.Item
                disabled={!this.props.showMenuCopyButton}
                key="1"
                onClick={()=>{
                    this.props.editGrid.copy([{...this.props.data, operationMark__ : dmlOperation.insert}], this.props.rowIndex + 1)
                }}>
                <NeoTypography>{this.props.t("copy")}</NeoTypography>
            </Menu.Item>
        </Menu>
    );

    render() {
        return (
            <Dropdown overlay={this.menu} trigger={['click']}>
                <div style={{cursor: 'pointer'}}>
                    <NeoTypography style={{color: NeoColor.violete_5}}>{this.props.t("action")}</NeoTypography>
                </div>
            </Dropdown>

        );
    }
}
