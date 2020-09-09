import React from 'react';
import {Dropdown, Menu} from "antd";
import {dmlOperation} from "../../../../utils/consts";

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
                <a>{this.props.t("undo changes")}</a>
            </Menu.Item>
            <Menu.Item hidden={!this.props.showMenuCopyButton}
                key="1"
                onClick={()=>{
                    this.props.editGrid.copy([{...this.props.data, operationMark__ : dmlOperation.insert}], this.props.rowIndex + 1)
                }}>
                <a>{this.props.t("copy")}</a>
            </Menu.Item>
        </Menu>
    );

    render() {
        return (
            <Dropdown overlay={this.menu} trigger={['click']}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    {this.props.t("action")}
                </a>
            </Dropdown>

        );
    }
}
