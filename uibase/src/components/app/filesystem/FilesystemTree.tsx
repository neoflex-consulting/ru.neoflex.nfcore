import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Button, Input, Tree} from 'antd';
import {
    AntTreeNode,
    AntTreeNodeCheckedEvent,
    AntTreeNodeExpandedEvent,
    AntTreeNodeSelectedEvent
} from "antd/lib/tree/Tree";
import {API} from "../../../modules/api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudDownloadAlt, faCloudUploadAlt, faFile, faFolderPlus, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons/faTrashAlt";

const {DirectoryTree} = Tree;

interface Props {
    onSelect?: (path?: string, isLeaf?: boolean)=>void;
    onCheck?: (keys: string[])=>void;
}

class FilesystemTree extends React.Component<Props & WithTranslation, any> {
    state = {
        key: "/",
        isLeaf: undefined,
        loadedKeys: [],
        selectedKeys: ["/"],
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

    getChildren = (list: any[], key: string): any[] => {
        return list.map(node=>{
            if (node.key === key) {
                return node.children || []
            }
            else if (node.isLeaf !== true) {
                return this.getChildren(node.children || [], key)
            }
            return []
        }).flat()
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
        this.setState({selectedKeys, key, isLeaf})
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
            const key = this.state.key||"/"
            const newKey = ["", ...key.slice(1).split("/"), newCatalog].join("/")
            const children = [...this.getChildren(this.state.treeData, key),
                {key: newKey, title: newCatalog, isLeaf: false}]
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, children),
                selectedKeys: [newKey],
                key: newKey,
                isLeaf: false
            })
            if (this.props.onSelect) {
                this.props.onSelect(newKey, false)
            }
        }
    }

    createFile = () => {
        var newFile = prompt("New file name", "test.groovy")
        if (newFile) {
            console.log(newFile)
            const key = this.state.key||"/"
            const newKey = ["", ...key.slice(1).split("/"), newFile].join("/")
            const children = [...this.getChildren(this.state.treeData, key),
                {key: newKey, title: newFile, isLeaf: true}]
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, children),
                selectedKeys: [newKey],
                key: newKey,
                isLeaf: true
            })
            if (this.props.onSelect) {
                this.props.onSelect(newKey, true)
            }
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
                const parent = ["", ...(this.state.key||"/").slice(1).split("/")].slice(0, -1).join("/") || "/"
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, parent, json),
                    loadedKeys: this.state.loadedKeys.filter((value: string) => value === parent || !value.startsWith(parent)),
                    selectedKeys: [parent],
                    key: parent,
                    isLeaf: false
                })
                if (this.props.onSelect) {
                    this.props.onSelect(parent, false)
                }
            })
        }
    }

    uploadFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        const name = file.name.replace(/\\/g, '/').replace(/.*\//, '')
        const key = this.state.key||""
        API.instance().fetchJson(`/system/fs?path=${key}&name=${name}`,
            {method: 'POST', body: form}).then(json=>{
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, json),
                loadedKeys: this.state.loadedKeys.filter((value: string) => value === key || !value.startsWith(key))
            })
        })
    }

    downloadFile = () => {
        let filename = (this.state.key||"").split("/").pop();
        API.instance().download("/system/fs/data?path=" + this.state.key, {}, filename)
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
                    <Button title={t('createdir')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={!this.state.isLeaf !== true} onClick={this.createFolder}>
                        <FontAwesomeIcon icon={faFolderPlus} size='lg' color="#7b7979"/>
                    </Button>
                    <Button title={t('createfile')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={!this.state.isLeaf !== true} onClick={this.createFile}>
                        <FontAwesomeIcon icon={faFile} size='lg' color="#7b7979"/>
                    </Button>
                    <Button title={t('upload')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={!this.state.isLeaf !== true}>
                        <label>
                            <FontAwesomeIcon icon={faCloudUploadAlt} size='lg' color="#7b7979"/>
                            <Input type="file" style={{display: "none"}}
                                   onChange={e => {
                                       const file = e!.target!.files![0]
                                       if (file) {
                                           this.uploadFile(file)
                                       }
                                   }}
                            />
                        </label>
                    </Button>
                    <Button title={t('download')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={!this.state.isLeaf === true} onClick={this.downloadFile}>
                        <FontAwesomeIcon icon={faCloudDownloadAlt} size='lg' color="#7b7979"/>
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
                    selectedKeys={this.state.selectedKeys}
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
