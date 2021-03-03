import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Dropdown, Input, Menu, Popconfirm, Tree} from 'antd';
import {AntTreeNode, AntTreeNodeCheckedEvent, AntTreeNodeSelectedEvent} from "antd/lib/tree/Tree";
import {API} from "../../../modules/api";
import '../../../styles/FilesystemTree.css'
import {NeoButton} from 'neo-design';
import {NeoInput, NeoModal, NeoRow} from "neo-design/lib";
import {IMainContext} from "../../../MainContext";

const {DirectoryTree} = Tree;
const pathSeparator = ";";
const disabled = "#B3B3B3";
const enabled = "#5E6785";

interface Props {
    onSelect?: (path?: string, isLeaf?: boolean) => void;
    onCheck?: (keys: string[]) => void;
    checked?: string[],
    notification: IMainContext['notification']
}

interface State {
    key: string,
    isLeaf: boolean,
    loadedKeys: string[],
    selectedKeys: string[],
    treeData: any[],
    popupMenuVisible: boolean,
    folderModalVisible: boolean,
    fileModalVisible: boolean,
    renameModalVisible: boolean,
    isDeleteMode: boolean,
    deleteKeys: string[]
}

const SwitcherIcon = (props:any) => {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0)">
            <path d="M2.34315 10.5306C2.53841 10.7259 2.85499 10.7259 3.05025 10.5306L8 5.5809L12.9497 10.5306C13.145 10.7259 13.4616 10.7259 13.6569 10.5306C13.8521 10.3354 13.8521 10.0188 13.6569 9.82354L8.35355 4.52024C8.15829 4.32498 7.84171 4.32498 7.64645 4.52024L2.34315 9.82354C2.14788 10.0188 2.14788 10.3354 2.34315 10.5306Z" fill="#8C8C8C"/>
        </g>
        <defs>
            <clipPath id="clip0">
                <rect width="16" height="16" fill="white"/>
            </clipPath>
        </defs>
    </svg>
}

const getTreeIcon = ( treeObject:any ) => {
    const {isLeaf, expanded} = treeObject;
    if (expanded) {
        return <svg className={"tree-icon"} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.20711 4.5L6.93934 3.23223C6.4705 2.76339 5.83461 2.5 5.17157 2.5H3C2.17157 2.5 1.5 3.17157 1.5 4V11.5C1.5 12.2392 1.90103 12.8847 2.49738 13.2309C2.73858 13.3997 3.03319 13.5 3.35548 13.5H11.4914C12.3844 13.5 13.1691 12.908 13.4144 12.0494L14.6358 7.77472C14.8183 7.1359 14.3386 6.5 13.6743 6.5H13.5C13.5 5.39543 12.6046 4.5 11.5 4.5H8.20711ZM3 3.5C2.72386 3.5 2.5 3.72386 2.5 4V8.83333L2.66123 8.08094C2.85883 7.1588 3.67376 6.5 4.61683 6.5H12.5C12.5 5.94772 12.0523 5.5 11.5 5.5H8C7.87204 5.5 7.74408 5.45118 7.64645 5.35355L6.23223 3.93934C5.95093 3.65804 5.5694 3.5 5.17157 3.5H3ZM11.4914 12.5C11.9379 12.5 12.3303 12.204 12.4529 11.7747L13.6743 7.5H4.61683C4.14529 7.5 3.73783 7.8294 3.63903 8.29047L2.86658 11.8952C2.82518 12.0884 2.90089 12.2748 3.04039 12.3884C3.178 12.4597 3.33429 12.5 3.5 12.5H11.4914Z" fill="#B38136"/>
        </svg>
    }
    if (isLeaf) {
        return <svg className={"tree-icon"} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.17157 1.5C8.70201 1.5 9.21071 1.71071 9.58579 2.08579L12.9142 5.41421C13.2893 5.78929 13.5 6.29799 13.5 6.82843V12.5C13.5 13.6046 12.6046 14.5 11.5 14.5H4.5C3.39543 14.5 2.5 13.6046 2.5 12.5V3.5C2.5 2.39543 3.39543 1.5 4.5 1.5H8.17157ZM8 2.5H4.5C3.94772 2.5 3.5 2.94772 3.5 3.5V12.5C3.5 13.0523 3.94772 13.5 4.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V7H10C8.89543 7 8 6.10457 8 5V2.5ZM12.0858 6L9 2.91421V5C9 5.55228 9.44772 6 10 6H12.0858Z" fill="#404040"/>
        </svg>
    }
    return <svg className={"tree-icon"} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.20711 4.5L6.93934 3.23223C6.4705 2.76339 5.83461 2.5 5.17157 2.5H3C2.17157 2.5 1.5 3.17157 1.5 4V11.5C1.5 12.6046 2.39543 13.5 3.5 13.5H12.5C13.6046 13.5 14.5 12.6046 14.5 11.5V6.5C14.5 5.39543 13.6046 4.5 12.5 4.5H8.20711ZM3 3.5C2.72386 3.5 2.5 3.72386 2.5 4V5.5C2.5 5.77614 2.72386 6 3 6H5.33333C5.65789 6 5.97369 5.89473 6.23333 5.7L7.2388 4.9459L6.23223 3.93934C5.95093 3.65804 5.5694 3.5 5.17157 3.5H3ZM2.5 6.91465C2.65639 6.96992 2.82468 7 3 7H5.33333C5.87426 7 6.40059 6.82456 6.83333 6.5L8.16667 5.5H12.5C13.0523 5.5 13.5 5.94772 13.5 6.5V11.5C13.5 12.0523 13.0523 12.5 12.5 12.5H3.5C2.94772 12.5 2.5 12.0523 2.5 11.5V6.91465Z" fill="#404040"/>
    </svg>
}

function updateJSON (json: {[key:string]:any}[]) {
    json.forEach(j => {
        j.icon = getTreeIcon;
        if (j.children) {
            updateJSON(j.children)
        }
    });
    return json
}

const prepareNodes = (json: any[]): any[] => {
    return json.map(value => {
        return {...value,
            checkable: true,
            icon: getTreeIcon,
            children: prepareNodes(value.children || [])
        }
    })
}

class FilesystemTree extends React.Component<Props & WithTranslation, State> {
    folderName = "";
    fileName = "";
    newName = "";

    state: State = {
        key: "/",
        isLeaf: false,
        loadedKeys: [],
        selectedKeys: ["/"],
        treeData: prepareNodes([
            {
                title: '/',
                key: '/',
                isLeaf: false,
                children: [],
            },
        ]),
        popupMenuVisible: false,
        folderModalVisible: false,
        fileModalVisible: false,
        renameModalVisible: false,
        isDeleteMode: false,
        deleteKeys: []
    }

    componentDidMount() {
        this.reloadKey("/")
    }

    updateTreeData = (list: any[], key: string, children: any[]): any[] => {
        if (!list) return list
        return list.map(node => {
            if (node.key === key) {
                return {...node, children}
            } else if (node.isLeaf !== true) {
                return {...node, children: this.updateTreeData(node.children, key, children)}
            }
            return node
        })
    }

    findNodes = (list: any[], key: string): any[] => {
        return list.map(value => value.key === key ? [value] :
            (value.isLeaf === true ? [] : this.findNodes(value.children || [], key))).flat()
    }

    getChildren = (list: any[], key: string): any[] => {
        return this.findNodes(list, key).map(value => value.children || []).flat()
    }

    reloadKey = (key: string) => {
        return API.instance().fetchJson(`/system/fs?path=${key}`).then(json => {
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, prepareNodes(json)),
                loadedKeys: this.state.loadedKeys.filter((value: string) => value === key || !value.startsWith(key))
            })
        })
    }

    loadData = (node: AntTreeNode): PromiseLike<void> => {
        return this.reloadKey(node.props.eventKey || "")
    }

    isSelectedLoaded = () => true

    onSelect = (selectedKeys: string[], e: AntTreeNodeSelectedEvent) => {
        console.log('Trigger Select', selectedKeys, e);
        const key = e.node ? e.node.props.eventKey || "/" : "/"
        const isLeaf = e.node ? e.node.props.isLeaf === true : false
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

    onDeleteCheck = (checkedKeys: string[] | {
        checked: string[];
        halfChecked: string[];
    }, e: AntTreeNodeCheckedEvent) => {
        this.setState({deleteKeys: Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked})
    };

    onRefresh = () => {
        this.reloadKey(this.state.key || "")
    }

    onLoad = (loadedKeys: string[]) => {
        this.setState({loadedKeys})
    }

    createFolder = () => {
        //filter paths separator
        let newCatalog = this.folderName.split(pathSeparator).join("");
        if (newCatalog) {
            console.log(newCatalog)
            const {key, treeData} = this.state
            const newKey = ["", ...key.split("/").filter(p=>!!p), newCatalog].join("/")
            const children = [...this.getChildren(treeData, key),
                {key: newKey, title: newCatalog, isLeaf: false, icon: getTreeIcon}]
            this.setState({
                treeData: this.updateTreeData(treeData, key, children),
                selectedKeys: [newKey],
                key: newKey,
                isLeaf: false,
                folderModalVisible: false
            })
            if (this.props.onSelect) {
                this.props.onSelect(newKey, false)
            }
        } else {
            this.props.notification!(this.props.t('notification'), this.props.t('folder name is empty'), "error");
        }
    }

    createFile = () => {
        //filter paths separator
        let newFile = this.fileName.split(pathSeparator).join("");
        if (newFile) {
            console.log(newFile)
            const {key, treeData} = this.state
            const newKey = ["", ...key.split("/").filter(p=>!!p), newFile].join("/")
            const children = [...this.getChildren(treeData, key),
                {key: newKey, title: newFile, isLeaf: true, icon: getTreeIcon}]
            this.setState({
                treeData: this.updateTreeData(treeData, key, children),
                selectedKeys: [newKey],
                key: newKey,
                isLeaf: true,
                fileModalVisible: false
            })
            if (this.props.onSelect) {
                this.props.onSelect(newKey, true)
            }
        } else {
            this.props.notification!(this.props.t('notification'), this.props.t('folder name is empty'), "error");
        }
    }

    onDelete = () => {
        this.setState({isDeleteMode: !this.state.isDeleteMode})
    };

    deleteKeys = () => {
        if (this.state.deleteKeys.length === 1 && this.state.deleteKeys[0] !== "/") {
            return API.instance().fetchJson(`/system/fs?path=${this.state.deleteKeys[0]}`, {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },

            }).then(json => {
                json = updateJSON(json);
                const parent = ["", ...this.state.key.split("/").filter(p=>!!p)].slice(0, -1).join("/") || "/";
                this.setState({
                    treeData: this.updateTreeData(this.state.treeData, parent, json),
                    loadedKeys: this.state.loadedKeys.filter((value: string) => value === parent || !value.startsWith(parent)),
                    selectedKeys: [parent],
                    key: parent,
                    isLeaf: false,
                    deleteKeys: [],
                    isDeleteMode: false
                })
                if (this.props.onSelect) {
                    this.props.onSelect(parent, false)
                }
            })
        } else if (this.state.deleteKeys.length > 1) {
            const paths = this.state.deleteKeys
                .filter(path=>path !== "/")
                .sort((a, b) => b.length - a.length)
                .reduce((previousValue, currentValue) => previousValue + ";" + currentValue)
            API.instance().fetchText(`/system/fs/many?paths=${paths}`, {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }).then(()=>{
                this.setState({
                    deleteKeys: [],
                    isDeleteMode: false
                }, () => this.reloadKey("/"))
            })
        }
    }

    uploadFile = (file: any) => {
        let form = new FormData()
        form.append("file", file)
        const name = file.name.replace(/\\/g, '/').replace(/.*\//, '')
        const key = this.state.key || ""
        API.instance().fetchJson(`/system/fs?path=${key}&name=${name}`,
            {method: 'POST', body: form}).then(json => {
            json = updateJSON(json);
            this.setState({
                treeData: this.updateTreeData(this.state.treeData, key, json),
                loadedKeys: this.state.loadedKeys.filter((value: string) => value === key || !value.startsWith(key))
            })
        })
    }

    downloadFile = () => {
        let filename = (this.state.key || "").split("/").pop();
        API.instance().download("/system/fs/data?path=" + this.state.key, {}, filename)
    }

    rename = () => {
        const found = this.findNodes(this.state.treeData, this.state.key)[0].title
        if (found.length > 0) {
            const newName = this.newName;
            if (newName) {
                return API.instance().fetchJson(`/system/fs/rename?path=${this.state.key}&name=${newName}`, {
                    method: "PUT",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },

                }).then(json => {
                    json = updateJSON(json);
                    this.newName = "";
                    const parent = ["", ...(this.state.key || "/").slice(1).split("/")].slice(0, -1).join("/") || "/"
                    const renamed = parent + "/" + newName;
                    this.setState({
                        treeData: this.updateTreeData(this.state.treeData, parent, json),
                        loadedKeys: this.state.loadedKeys.filter((value: string) => value === parent || !value.startsWith(parent)),
                        selectedKeys: [renamed],
                        key: renamed,
                        popupMenuVisible: false,
                        renameModalVisible: false
                    })
                    if (this.props.onSelect) {
                        this.props.onSelect(renamed, this.state.isLeaf)
                    }
                })
            } else {
                this.props.notification!(this.props.t('notification'), this.props.t('new name name is empty'), "error");
            }
        }
    }

    handleFolderModalVisible = () => {
        this.setState({folderModalVisible: !this.state.folderModalVisible})
    };

    handleFileModalVisible = () => {
        this.setState({fileModalVisible: !this.state.fileModalVisible})
    };

    handleRenameModalVisible = () => {
        this.setState({renameModalVisible: !this.state.renameModalVisible})
    };

    render() {
        const {t} = this.props;
        const menu = (
            <Menu>
                <Menu.Item key="rename" onClick={this.handleRenameModalVisible}>{t("rename")}</Menu.Item>
            </Menu>
        )
        return (
            <div style={{flexGrow: 1, height: '100%'}}>
                <NeoRow hidden={!!this.props.onCheck} className={"tree-button-bar"} style={{alignItems: 'center'}}>
                    <NeoButton
                        className={`tree-button ${!this.state.isLeaf !== true ? "disabled" : "link"}`}
                        title={t('refresh')}
                        type={"link"}
                        onClick={!(!this.state.isLeaf !== true) ? this.onRefresh : undefined}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.9917 5.12252C13.3293 4.39936 11.4611 4.30284 9.733 4.85083C8.00487 5.39883 6.53373 6.55424 5.59179 8.10326C4.64985 9.65229 4.30088 11.4901 4.60946 13.2766C4.91803 15.063 5.86326 16.6773 7.27024 17.8206C8.67722 18.9639 10.4507 19.5589 12.2625 19.4954C14.0743 19.432 15.8019 18.7144 17.1254 17.4754C18.449 16.2365 19.2789 14.5601 19.4618 12.7564C19.5036 12.3443 19.8715 12.0441 20.2836 12.0859C20.6957 12.1276 20.9959 12.4956 20.9541 12.9077C20.7347 15.0721 19.7387 17.0838 18.1505 18.5705C16.5622 20.0572 14.4892 20.9183 12.315 20.9945C10.1408 21.0706 8.01265 20.3567 6.32428 18.9847C4.63591 17.6127 3.50164 15.6756 3.13135 13.5319C2.76106 11.3881 3.17982 9.18275 4.31014 7.32392C5.44047 5.46508 7.20584 4.07859 9.2796 3.421C11.3534 2.76341 13.5951 2.87923 15.5901 3.74703C17.1905 4.44323 18.5452 5.58561 19.5 7.02503V4.5C19.5 4.08579 19.8358 3.75 20.25 3.75C20.6642 3.75 21 4.08579 21 4.5V9C21 9.41422 20.6642 9.75 20.25 9.75H15.75C15.3358 9.75 15 9.41422 15 9C15 8.58579 15.3358 8.25 15.75 8.25H18.4952C17.695 6.86394 16.469 5.76514 14.9917 5.12252Z" fill={!this.state.isLeaf !== true ? disabled : enabled}/>
                        </svg>
                    </NeoButton>
                    <div style={{
                        display: 'inline-block',
                        height: '40px',
                        padding: "0 16px 0 0",
                        borderLeft: '1px solid #B3B3B3',
                        width: '1px'
                    }}/>
                    <NeoButton
                        className={`tree-button ${!this.state.isLeaf !== true ? "disabled" : "link"}`}
                        title={t('download')}
                        type={"link"}
                        onClick={!(!this.state.isLeaf !== true) ? this.downloadFile : undefined}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.21967 7.71967C5.92678 8.01256 5.92678 8.48744 6.21967 8.78033C6.51256 9.07322 6.98744 9.07322 7.28033 8.78033L11.25 4.81066V16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5V4.81066L16.7197 8.78033C17.0126 9.07322 17.4874 9.07322 17.7803 8.78033C18.0732 8.48744 18.0732 8.01256 17.7803 7.71967L12.5303 2.46967C12.2374 2.17678 11.7626 2.17678 11.4697 2.46967L6.21967 7.71967Z" fill={!this.state.isLeaf !== true ? disabled : enabled}/>
                            <path d="M3 18V21C3 21.4142 3.33579 21.75 3.75 21.75H20.25C20.6642 21.75 21 21.4142 21 21V18C21 17.5858 20.6642 17.25 20.25 17.25C19.8358 17.25 19.5 17.5858 19.5 18V20.25H4.5V18C4.5 17.5858 4.16421 17.25 3.75 17.25C3.33579 17.25 3 17.5858 3 18Z" fill={!this.state.isLeaf !== true ? disabled : enabled}/>
                        </svg>
                    </NeoButton>
                    <NeoButton
                        className={`tree-button ${!this.state.isLeaf !== true ? "disabled" : "link"} upload`}
                        title={t('upload')}
                        type={"link"}>
                        <label>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.25 3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V15.4393L16.7197 11.4697C17.0126 11.1768 17.4874 11.1768 17.7803 11.4697C18.0732 11.7626 18.0732 12.2374 17.7803 12.5303L12.5303 17.7803C12.2374 18.0732 11.7626 18.0732 11.4697 17.7803L6.21967 12.5303C5.92678 12.2374 5.92678 11.7626 6.21967 11.4697C6.51256 11.1768 6.98744 11.1768 7.28033 11.4697L11.25 15.4393V3Z" fill={!this.state.isLeaf !== true ? disabled : enabled}/>
                                <path d="M3 18V21C3 21.4142 3.33579 21.75 3.75 21.75H20.25C20.6642 21.75 21 21.4142 21 21V18C21 17.5858 20.6642 17.25 20.25 17.25C19.8358 17.25 19.5 17.5858 19.5 18V20.25H4.5V18C4.5 17.5858 4.16421 17.25 3.75 17.25C3.33579 17.25 3 17.5858 3 18Z" fill={!this.state.isLeaf !== true ? disabled : enabled}/>
                            </svg>
                            <Input type="file" style={{display: "none"}}
                                   disabled={!this.state.isLeaf !== true}
                                   onChange={e => {
                                       const file = e!.target!.files![0]
                                       if (file) {
                                           this.uploadFile(file)
                                       }
                                   }}
                            />
                        </label>
                    </NeoButton>
                    <div style={{
                        display: 'inline-block',
                        height: '40px',
                        padding: "0 16px 0 0",
                        borderLeft: '1px solid #B3B3B3',
                        width: '1px'
                    }}/>
                    <NeoButton
                        className={`tree-button ${!this.state.isLeaf !== true || !this.isSelectedLoaded() ? "disabled" : "link"}`}
                        title={t('createdir')}
                        type={"link"}
                        onClick={!(!this.state.isLeaf !== true || !this.isSelectedLoaded()) ? this.handleFolderModalVisible : undefined}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3107 6.75L10.409 4.84835C9.70575 4.14509 8.75192 3.75 7.75736 3.75H4.5C3.25736 3.75 2.25 4.75736 2.25 6V17.25C2.25 18.9069 3.59315 20.25 5.25 20.25H11.6367C11.3269 19.7872 11.0728 19.284 10.8841 18.75H5.25C4.42157 18.75 3.75 18.0784 3.75 17.25V10.372C3.98458 10.4549 4.23702 10.5 4.5 10.5H8C8.81139 10.5 9.60089 10.2368 10.25 9.75L12.25 8.25H18.75C19.5784 8.25 20.25 8.92157 20.25 9.75V10.4516C20.7961 10.723 21.3002 11.0662 21.75 11.4688V9.75C21.75 8.09315 20.4069 6.75 18.75 6.75H12.3107ZM4.5 5.25C4.08579 5.25 3.75 5.58579 3.75 6V8.25C3.75 8.66421 4.08579 9 4.5 9H8C8.48683 9 8.96053 8.8421 9.35 8.55L10.8582 7.41885L9.34835 5.90901C8.92639 5.48705 8.3541 5.25 7.75736 5.25H4.5Z" fill={!this.state.isLeaf !== true || !this.isSelectedLoaded() ? disabled : enabled}/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M22.5 16.5C22.5 19.3995 20.1495 21.75 17.25 21.75C14.3505 21.75 12 19.3995 12 16.5C12 13.6005 14.3505 11.25 17.25 11.25C20.1495 11.25 22.5 13.6005 22.5 16.5ZM17.25 13.5C16.8358 13.5 16.5 13.8358 16.5 14.25V15.75H15C14.5858 15.75 14.25 16.0858 14.25 16.5C14.25 16.9142 14.5858 17.25 15 17.25H16.5V18.75C16.5 19.1642 16.8358 19.5 17.25 19.5C17.6642 19.5 18 19.1642 18 18.75V17.25H19.5C19.9142 17.25 20.25 16.9142 20.25 16.5C20.25 16.0858 19.9142 15.75 19.5 15.75H18V14.25C18 13.8358 17.6642 13.5 17.25 13.5Z" fill={!this.state.isLeaf !== true || !this.isSelectedLoaded() ? disabled : enabled}/>
                        </svg>
                    </NeoButton>
                    <NeoButton
                        className={`tree-button ${!this.state.isLeaf !== true || !this.isSelectedLoaded() ? "disabled" : "link"}`}
                        title={t('createfile')}
                        type={"link"}
                        onClick={!(!this.state.isLeaf !== true || !this.isSelectedLoaded()) ? this.handleFileModalVisible : undefined}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 22.5C19.3995 22.5 21.75 20.1495 21.75 17.25C21.75 14.3505 19.3995 12 16.5 12C13.6005 12 11.25 14.3505 11.25 17.25C11.25 20.1495 13.6005 22.5 16.5 22.5ZM15.75 15C15.75 14.5858 16.0858 14.25 16.5 14.25C16.9142 14.25 17.25 14.5858 17.25 15V16.5H18.75C19.1642 16.5 19.5 16.8358 19.5 17.25C19.5 17.6642 19.1642 18 18.75 18H17.25V19.5C17.25 19.9142 16.9142 20.25 16.5 20.25C16.0858 20.25 15.75 19.9142 15.75 19.5V18H14.25C13.8358 18 13.5 17.6642 13.5 17.25C13.5 16.8358 13.8358 16.5 14.25 16.5H15.75V15Z" fill={!this.state.isLeaf !== true || !this.isSelectedLoaded() ? disabled : enabled}/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.1893 1.93934C12.908 1.65803 12.5265 1.5 12.1287 1.5H6C4.34315 1.5 3 2.84315 3 4.5V18C3 19.6569 4.34315 21 6 21H10.8867C10.5769 20.5372 10.3228 20.034 10.1341 19.5H6C5.17157 19.5 4.5 18.8284 4.5 18V4.5C4.5 3.67157 5.17157 3 6 3H11.25V6.75C11.25 8.40685 12.5931 9.75 14.25 9.75H18V10.6673C18.526 10.7866 19.0286 10.9674 19.5 11.2016V8.87132C19.5 8.4735 19.342 8.09196 19.0607 7.81066L13.1893 1.93934ZM12.75 3.62132L17.3787 8.25H14.25C13.4216 8.25 12.75 7.57843 12.75 6.75V3.62132Z" fill={!this.state.isLeaf !== true || !this.isSelectedLoaded() ? disabled : enabled}/>
                        </svg>
                    </NeoButton>
                    <div style={{
                        display: 'inline-block',
                        height: '40px',
                        padding: "0 16px 0 0",
                        borderLeft: '1px solid #B3B3B3',
                        width: '1px'
                    }}/>
                    <NeoButton
                        className={`tree-button`}
                        title={t('delete')}
                        type={"link"}
                        onClick={this.onDelete}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 9.75C9 9.33579 9.33579 9 9.75 9C10.1642 9 10.5 9.33579 10.5 9.75V15.75C10.5 16.1642 10.1642 16.5 9.75 16.5C9.33579 16.5 9 16.1642 9 15.75V9.75Z" fill={enabled}/>
                            <path d="M14.25 9C13.8358 9 13.5 9.33579 13.5 9.75V15.75C13.5 16.1642 13.8358 16.5 14.25 16.5C14.6642 16.5 15 16.1642 15 15.75V9.75C15 9.33579 14.6642 9 14.25 9Z" fill={enabled}/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 5.25V3.75C7.5 2.92157 8.17157 2.25 9 2.25H15C15.8284 2.25 16.5 2.92157 16.5 3.75V5.25H20.25C20.6642 5.25 21 5.58579 21 6C21 6.41421 20.6642 6.75 20.25 6.75H19.3636L18.248 19.0216C18.1076 20.5668 16.812 21.75 15.2604 21.75H8.73964C7.18803 21.75 5.89244 20.5668 5.75196 19.0216L4.63636 6.75H3.75C3.33579 6.75 3 6.41421 3 6C3 5.58579 3.33579 5.25 3.75 5.25H7.5ZM14.85 3.75C14.9328 3.75 15 3.81716 15 3.9V5.25H9V3.9C9 3.81716 9.06716 3.75 9.15 3.75H14.85ZM6.14255 6.75L7.2458 18.8858C7.31604 19.6584 7.96384 20.25 8.73964 20.25H15.2604C16.0362 20.25 16.684 19.6584 16.7542 18.8858L17.8575 6.75H6.14255Z" fill={enabled}/>
                        </svg>
                    </NeoButton>
                </NeoRow>
                <Dropdown
                    overlay={menu}
                    trigger={['contextMenu']}
                    visible={this.state.popupMenuVisible}>
                    <DirectoryTree
                        showIcon
                        switcherIcon={<SwitcherIcon />}
                        className={`directory-tree ${this.props.onCheck ? "tree-lookup" : ""}`}
                        expandAction={'doubleClick'}
                        checkable={!!this.props.onCheck || this.state.isDeleteMode}
                        selectable={!!this.props.onSelect}
                        loadedKeys={this.state.loadedKeys}
                        selectedKeys={this.state.selectedKeys}
                        checkedKeys={!this.state.isDeleteMode ? this.props.checked : this.state.deleteKeys}
                        multiple={false}
                        defaultExpandAll={false}
                        // onCheck={!this.state.isDeleteMode ? this.onCheck : this.onDeleteCheck}
                        // onSelect={this.onSelect}
                        // onLoad={this.onLoad}
                        treeData={this.state.treeData}
                        //loadData={this.loadData}
                        onRightClick={options => {
                            this.setState({
                                popupMenuVisible: !this.state.popupMenuVisible,
                            })
                        }
                        }
                        onClick={e => {
                            if (this.state.popupMenuVisible) {
                                this.setState({popupMenuVisible: false})
                            }
                        }}
                    />
                </Dropdown>
                {this.state.isDeleteMode && <div className={"tree-delete-footer"}>
                    <Popconfirm
                        className={"delete-popup"}
                        placement="top"
                        title={t('object will be deleted permanently are you sure you want to delete them')}
                        icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.00065 4.69008C7.713 4.69008 7.47982 4.92326 7.47982 5.21092V8.5649C7.47982 8.85256 7.713 9.08573 8.00065 9.08573C8.28831 9.08573 8.52148 8.85256 8.52148 8.5649V5.21092C8.52148 4.92326 8.28831 4.69008 8.00065 4.69008Z" fill="#404040"/>
                            <path d="M8.70378 10.4268C8.70378 10.8151 8.38898 11.1299 8.00065 11.1299C7.61233 11.1299 7.29753 10.8151 7.29753 10.4268C7.29753 10.0385 7.61233 9.72367 8.00065 9.72367C8.38898 9.72367 8.70378 10.0385 8.70378 10.4268Z" fill="#404040"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00065 1.33398C4.31568 1.33398 1.33398 4.31594 1.33398 8.00065C1.33398 11.6856 4.31594 14.6673 8.00065 14.6673C11.6856 14.6673 14.6673 11.6854 14.6673 8.00065C14.6673 4.31568 11.6854 1.33398 8.00065 1.33398ZM8.00065 13.6257C4.89146 13.6257 2.37565 11.1096 2.37565 8.00065C2.37565 4.89146 4.89167 2.37565 8.00065 2.37565C11.1098 2.37565 13.6257 4.89167 13.6257 8.00065C13.6257 11.1098 11.1096 13.6257 8.00065 13.6257Z" fill="#404040"/>
                        </svg>}
                        onConfirm={this.deleteKeys}
                        okText={t('yes')}
                        cancelText={t('no')}>
                        <NeoButton>
                            {t('delete')}
                        </NeoButton>
                    </Popconfirm>
                    <NeoButton
                        type={"secondary"}
                        onClick={this.onDelete}>
                        {t('cancel')}
                    </NeoButton>
                </div>}
                <NeoModal
                    className={"filesystem-tree-modal"}
                    closable={true}
                    type={'edit'}
                    title={t('create folder')}
                    visible={this.state.folderModalVisible}
                    onCancel={this.handleFolderModalVisible}
                    onLeftButtonClick={this.createFolder}
                    onRightButtonClick={this.handleFolderModalVisible}
                    textOfLeftButton={t("create")}
                    textOfRightButton={t("cancel")}
                >
                    <NeoInput
                        onChange={(event: any) => {
                            this.folderName = event.currentTarget.value
                        }}
                        placeholder={t('folder name')}
                    />
                </NeoModal>
                <NeoModal
                    className={"filesystem-tree-modal"}
                    closable={true}
                    type={'edit'}
                    title={t('create file')}
                    visible={this.state.fileModalVisible}
                    onCancel={this.handleFileModalVisible}
                    onLeftButtonClick={this.createFile}
                    onRightButtonClick={this.handleFileModalVisible}
                    textOfLeftButton={t("create")}
                    textOfRightButton={t("cancel")}
                >
                    <NeoInput
                        onChange={(event: any) => {
                            this.fileName = event.currentTarget.value
                        }}
                        placeholder={t('file name')}
                    />
                </NeoModal>
                {this.state.renameModalVisible && <NeoModal
                    className={"filesystem-tree-modal"}
                    closable={true}
                    type={'edit'}
                    title={t('rename')}
                    visible={this.state.renameModalVisible}
                    onCancel={this.handleRenameModalVisible}
                    onLeftButtonClick={this.rename}
                    onRightButtonClick={this.handleRenameModalVisible}
                    textOfLeftButton={t("rename")}
                    textOfRightButton={t("cancel")}
                >
                    <NeoInput
                        onChange={(event: any) => {
                            this.newName = event.currentTarget.value
                        }}
                        placeholder={t('new name')}
                    />
                </NeoModal>}
            </div>
        )
    }
}

export default withTranslation()(FilesystemTree)
