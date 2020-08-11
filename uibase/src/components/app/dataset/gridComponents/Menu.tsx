import React from 'react';
import { Dropdown, Menu} from "antd";

interface Props {
    value: string,
    mask: string,
    type: string,
    api: any,
    node: any,
    onDelete: any
}

interface State {
}
const menu = (
    <Menu>
        <Menu.Item key="0">
            <a>1st menu item</a>
        </Menu.Item>
        <Menu.Item key="1">
            <a>2nd menu item</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
);

export default class GridMenu extends React.Component<Props, State> {

    render() {
        return (
            <Dropdown overlay={menu} trigger={['click']}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    Click me
                </a>
            </Dropdown>

        );
    }
}