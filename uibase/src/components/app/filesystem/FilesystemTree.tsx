import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Button, Tree} from 'antd';
import {
    AntTreeNode,
    AntTreeNodeCheckedEvent,
    AntTreeNodeExpandedEvent,
    AntTreeNodeSelectedEvent
} from "antd/lib/tree/Tree";
import {API} from "../../../modules/api";
import clockRefreshIcon from "../../../icons/clockRefreshIcon.svg";
import plusIcon from "../../../icons/plusIcon.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolderPlus, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons/faTrashAlt";

const {DirectoryTree} = Tree;

interface Props {
    onSelect?: (key?: string, isLeaf?: boolean)=>void;
    onCheck?: (keys: string[])=>void;
}

class FilesystemTree extends React.Component<Props & WithTranslation, any> {
    state = {
        key: undefined,
        isLeaf: undefined,
        loadedKeys: [],
        treeData: [
            {
                title: '/',
                key: '/',
                isLeaf: false,
                children: [],
            },
        ]
    }

    updateTreeData = (list: any[], key: string, children: any[]): any[] => {
        if (!list) return list
        return list.map(node=>{
            if (node.key === key) {
                return {...node, children}
            }
            else if (node.isLeaf !== true) {
                return {...node, children: this.updateTreeData(node.children, key, children)}
            }
            return node
        })
    }

    reloadKey = (key: string) => {
        return API.instance().fetchJson(`/system/fs?path=${key}`).then(json=>{
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, json),
                loadedKeys: this.state.loadedKeys.filter((value: string) => value === key || !value.startsWith(key))
            })
        })
    }

    loadData = (node: AntTreeNode): PromiseLike<void> => {
        return this.reloadKey(node.props.eventKey || "")
    }

    onSelect = (selectedKeys: string[], e: AntTreeNodeSelectedEvent) => {
        console.log('Trigger Select', selectedKeys, e);
        const key = e.node ? e.node.props.eventKey : undefined
        const isLeaf = e.node ? e.node.props.isLeaf === true : undefined
        this.setState({key, isLeaf})
        if (this.props.onSelect) {
            this.props.onSelect(key, isLeaf)
        }
    };

    onCheck = (checkedKeys: string[] | {
        checked: string[];
        halfChecked: string[];
    }, e: AntTreeNodeCheckedEvent) => {
        console.log('Trigger Check', checkedKeys, e);
        if (this.props.onCheck) {
            this.props.onCheck(Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked)
        }
    };

    onExpand = (expandedKeys: string[], info: AntTreeNodeExpandedEvent) => {
        console.log('Trigger Expand', expandedKeys, info);
    };

    onRefresh = () => {
        this.reloadKey(this.state.key || "")
    }

    onLoad = (loadedKeys: string[]) => {
        this.setState({loadedKeys})
    }

    createFolder = () => {
        var newCatalog = prompt("New catalog name", "NewCatalog")
        if (newCatalog) {
            console.log(newCatalog)
            return API.instance().fetchJson(`/system/fs?path=${this.state.key}&name=${newCatalog}`, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },

            }).then(json=>{
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, this.state.key||"", json),
                    loadedKeys: this.state.loadedKeys.filter((value: string) => value === this.state.key || !value.startsWith(this.state.key||""))
                })
            })
        }
    }

    delete = () => {
        if (this.state.key) {
            return API.instance().fetchJson(`/system/fs?path=${this.state.key}`, {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },

            }).then(json=>{
                const parent = (this.state.key||"").split("/").slice(0, -1).join("/")
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, parent, json),
                    loadedKeys: this.state.loadedKeys.filter((value: string) => value === parent || !value.startsWith(parent))
                })
            })
        }
    }

    render() {
        const {t} = this.props
        return (
            <div style={{flexGrow: 1, height: '100%'}}>
                <div>
                    <Button title={t('refresh')} style={{color: 'rgb(151, 151, 151)'}} disabled={!this.state.isLeaf !== true} onClick={this.onRefresh}>
                        <FontAwesomeIcon icon={faSyncAlt} size='lg' color="#7b7979"/>
                    </Button>
                    <div style={{
                        display: 'inline-block',
                        height: '30px',
                        borderLeft: '1px solid rgb(217, 217, 217)',
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginBottom: '-10px',
                        borderRight: '1px solid rgb(217, 217, 217)',
                        width: '6px'
                    }}/>
                    <Button title={t('create')} style={{color: 'rgb(151, 151, 151)'}} disabled={!this.state.isLeaf !== true} onClick={this.createFolder}>
                        <FontAwesomeIcon icon={faFolderPlus} size='lg' color="#7b7979"/>
                    </Button>
                    <Button title={t('delete')}
                            disabled={!this.state.key || this.state.key === "/"}
                            style={{color: 'rgb(151, 151, 151)'}}
                            onClick={this.delete}>
                        <FontAwesomeIcon icon={faTrashAlt} size='sm' color="#7b7979"/>
                    </Button>
                </div>
                <DirectoryTree
                    checkable={!!this.props.onCheck}
                    selectable={!!this.props.onSelect}
                    loadedKeys={this.state.loadedKeys}
                    multiple={false}
                    defaultExpandAll={false}
                    onCheck={this.onCheck}
                    onSelect={this.onSelect}
                    onExpand={this.onExpand}
                    onLoad={this.onLoad}
                    treeData={this.state.treeData}
                    loadData={this.loadData}
                />
            </div>
        )
    }
}

export default withTranslation()(FilesystemTree)
