import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Tree} from 'antd';
import {AntTreeNodeCheckedEvent, AntTreeNodeSelectedEvent} from "antd/lib/tree/Tree";

const {DirectoryTree} = Tree;

class FilesystemTree extends React.Component<any & WithTranslation, any> {
    state = {
        treeData: [
            {
                title: 'parent 0',
                key: '0-0',
                children: [
                    {title: 'leaf 0-0', key: '0-0-0', isLeaf: true},
                    {title: 'leaf 0-1', key: '0-0-1', isLeaf: true},
                ],
            },
            {
                title: 'parent 1',
                key: '0-1',
                children: [
                    {title: 'leaf 1-0', key: '0-1-0', isLeaf: true},
                    {title: 'leaf 1-1', key: '0-1-1', isLeaf: true},
                ],
            },
        ]
    }

    onSelect = (selectedKeys: string[], e: AntTreeNodeSelectedEvent) => {
        console.log('Trigger Select', selectedKeys, e);
    };

    onCheck = (checkedKeys: string[] | {
        checked: string[];
        halfChecked: string[];
    }, e: AntTreeNodeCheckedEvent) => {
        console.log('Trigger Check', checkedKeys, e);
    };

    onExpand = () => {
        console.log('Trigger Expand');
    };

    render() {
        return (
            <div style={{flexGrow: 1, height: '100%'}}>
                <DirectoryTree
                    checkable={true}
                    multiple={false}
                    defaultExpandAll={false}
                    onCheck={this.onCheck}
                    onSelect={this.onSelect}
                    onExpand={this.onExpand}
                    treeData={this.state.treeData}
                />
            </div>
        )
    }
}

export default withTranslation()(FilesystemTree)
