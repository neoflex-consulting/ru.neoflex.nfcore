import * as React from "react";
import { Tree, Icon, Table, Modal, Button, Select, Row, Col, Menu } from 'antd';
import Ecore from "ecore";
import { API } from "../modules/api";
import Splitter from './CustomSplitter'
import update from 'immutability-helper';
//import { any } from "prop-types";
//import _filter from 'lodash/filter'
//import _map from 'lodash/map'
import EditableTextArea from './EditableTextArea'
import SearchGridTrans from "./SearchGrid";
import { WithTranslation } from "react-i18next";

export interface Props {
}

interface State {
    resource: Ecore.EObject,
    resourceJSON: { [key: string]: any },
    ePackages: Ecore.EPackage[],
    currentNode: {
        [key: string]: any
    },
    tableData: Array<any>,
    targetObject: {
        eClass: string,
        [key: string]: any
    },
    selectedKey: String,
    modalVisible: Boolean,
    rightClickMenuVisible: Boolean,
    rightMenuPosition: Object,
    uniqKey: String,
    treeRightClickNode: { [key: string]: any }
}

export class ResourceEditor extends React.Component<any, State> {

    private splitterRef: React.RefObject<any>;

    constructor(props: any) {
        super(props);
        this.splitterRef = React.createRef();
    }

    state = {
        resource: {} as Ecore.EObject,
        resourceJSON: {},
        ePackages: [],
        currentNode: {},
        tableData: [],
        targetObject: { eClass: "" },
        selectedKey: "",
        modalVisible: false,
        rightClickMenuVisible: false,
        rightMenuPosition: { x: 100, y: 100 },
        uniqKey: "",
        treeRightClickNode: {}
    };

    getPackages(): void {
        API.instance().fetchPackages().then(packages => {
            this.setState({ ePackages: packages })
        })
    }

    getResource(): void {
        API.instance().fetchEObject(`${this.props.match.params.id}?ref=${this.props.match.params.ref}`).then(resource => {
            this.setState({
                resource: resource,
                resourceJSON: this.nestUpdaters(resource.eResource().to(), null)
            })
        })
    }

    /**
     * Creates updaters for all levels of an object, including for objects in arrays.
     */
    nestUpdaters(json: any, parentObject: any = null, property?: String): Object {
        
        const createUpdater = (data: Object, init_idx?: Number) => {
            return (newValues: Object, indexForParentUpdater?: any, updaterProperty?: any, options?: any) => {
                const currentObject: { [key: string]: any } = data;
                const idx: any = init_idx;
                const prop: any = property;
                const parent = parentObject;
                let updatedData;
                if (updaterProperty) {
                    if (indexForParentUpdater !== undefined) {
                        //updating element of array
                        updatedData = update(currentObject as any, { [updaterProperty]: { [indexForParentUpdater]: { $merge: newValues } } })
                    } else {
                        if(options && options.operation === "push"){
                            //cause a property may not exist
                            if(!currentObject[updaterProperty]) currentObject[updaterProperty] = []
                            updatedData = update(currentObject as any, { [updaterProperty]: { $push: [newValues] } })
                        } else if(options && options.index && options.operation === "splice") { 
                            updatedData = update(currentObject as any, { [updaterProperty]: { $splice: [[options.index, 1]] } })
                        } else if(options && options.operation === "set") { 
                            updatedData = update(currentObject as any, { [updaterProperty]: { $set: newValues } })
                        } else {
                            //if nothing from listed above, then updating object by property name
                            updatedData = update(currentObject as any, { [updaterProperty]: { $merge: newValues } })
                        }
                    }
                } else {
                    updatedData = update(currentObject, { $merge: newValues })
                }
                let result = updatedData
                if (parent && parent.updater) {
                    result = parent.updater(updatedData, idx, prop)
                }
                return result
            }
        }

        const walkThroughArray = (array: Array<any>) => {
            array.forEach((obj, index) => {
                //we have to check the type, cause it can be an array of strings, for e.g.
                if (typeof obj === "object") {
                    walkThroughObject(obj)
                    obj.updater = createUpdater(obj, index)
                }
            })
        };

        const walkThroughObject = (obj: any) => {
            obj.updater = createUpdater(obj);
            Object.entries(obj).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    this.nestUpdaters(value, obj, key)
                } else {
                    if (value instanceof Object && typeof value === "object") this.nestUpdaters(value, obj, key)
                }
            })
        };

        if (Array.isArray(json)) {
            walkThroughArray(json)
        } else {
            walkThroughObject(json)
        }

        return json
    }

    findObjectById(data: any, id: String): any {

        const walkThroughArray = (array: Array<any>): any => {
            for (var el of array) {
                if (el._id && el._id === id) {
                    return el
                } else {
                    const result = this.findObjectById(el, id);
                    if (result) return result
                }
            }
        };

        const walkThroughObject = (obj: any): any => {
            let result;

            for (let prop in obj) {
                if (result) {
                    break
                }
                if (Array.isArray(obj[prop])) {
                    result = this.findObjectById(obj[prop], id)
                } else {
                    if (obj[prop] instanceof Object && typeof obj[prop] === "object") result = this.findObjectById(obj[prop], id)
                }
            }
            if (result) return result
        };

        if (data._id === id) return data;

        if (Array.isArray(data)) {
            return walkThroughArray(data)
        } else {
            return walkThroughObject(data)
        }
    }

    createTree() {

        const getTitle = (object: {[key:string]: any}) =>{
            const possibleTitles:Array<string> = ["name", "qname", "caption", "createdBy"]
            let result = null
            for(let title of possibleTitles){
                if (object[title]){
                    result = object[title]
                    break
                } 
            }
            return result
        }

        const generateNodes = (eClass: Ecore.EObject, json: { [key: string]: any }, parentId?: String): Array<any> => {
            return eClass.get('eAllStructuralFeatures') && eClass.get('eAllStructuralFeatures').map((feature: Ecore.EObject, idx: Number) => {
                const isContainment = Boolean(feature.get('containment'));
                const upperBound = feature.get('upperBound')
                if ((upperBound === -1 || upperBound === 1) && isContainment) {
                    const targetObject: { [key: string]: any } = Array.isArray(json[feature.get('name')]) ?
                        json[feature.get('name')]
                        :
                        json[feature.get('name')] ? [json[feature.get('name')]] : []
                    return <Tree.TreeNode
                        parentUpdater={json.updater}
                        upperBound={upperBound}
                        isArray={true}
                        arrayLength={targetObject.length}
                        key={`${parentId ? parentId : null}.${feature.get('name')}${idx}`}
                        eClass={feature.get('eType').eURI()}
                        propertyName={feature.get('name')}
                        targetObject={targetObject}
                        icon={upperBound === 1 ? <Icon type="line" style={{ color:"#d831ff", fontSize: 12 }}/> : <Icon type="dash" style={{ color:"#d831ff" }}/>}
                        title={feature.get('name')}
                    >
                        {targetObject.map((object: { [key: string]: any }) => {
                            const res = Ecore.ResourceSet.create()
                            const eClass = res.getEObject(object.eClass)
                            const title = getTitle(object)   
                            return <Tree.TreeNode
                                key={object._id}
                                featureUpperBound={upperBound}
                                parentUpdater={json.updater}
                                eClass={object.eClass ? object.eClass : feature.get('eType').eURI()}
                                propertyName={feature.get('name')}
                                targetObject={object}
                                icon={<Icon type="block" style={{color: "#88bc51"}} />}
                                title={<React.Fragment>{title} <span style={{ fontSize: "11px", color: "#b1b1b1" }}>{eClass.get('name')}</span></React.Fragment>}
                            >
                                {generateNodes(eClass, object, object._id ? object._id : null)}
                            </Tree.TreeNode>
                        })}
                    </Tree.TreeNode>
                }
                return null
            }
            )
        };

        return (
            <Tree
                showIcon
                defaultExpandAll
                key="mainTree"
                switcherIcon={<Icon type="down" />}
                onSelect={this.onTreeSelect}
                onRightClick={this.onTreeRightClick}
            >
                <Tree.TreeNode headline={true} style={{ fontWeight: '600' }} eClass={this.state.resource.eClass.eURI()} targetObject={this.state.resourceJSON} icon={<Icon type="cluster" style={{ color:"#2484fe" }}/>} title={this.state.resource.eClass.get('name')} key={this.state.resource._id}>
                    {generateNodes(this.state.resource.eClass, this.state.resourceJSON)}
                </Tree.TreeNode>
            </Tree>
        )
    }

    onTreeSelect = (selectedKeys: Array<String>, e: any, imitateClick: boolean = false) => {
        if (selectedKeys[0] && e.node.props.targetObject.eClass) {
            const targetObject = imitateClick ? this.state.targetObject : e.node.props.targetObject
            const uniqKey = e.node.props.eventKey
            this.setState({
                tableData: this.prepareTableData(targetObject, this.state.resource, uniqKey),
                targetObject: targetObject,
                currentNode: e.node.props,
                uniqKey: uniqKey
            })
        } else {
            this.setState({
                tableData: [],
                targetObject: { eClass: "" },
                currentNode: {}
            })
        }
    };

    onTreeRightClick = (e: any) => {
        this.setState({
            rightClickMenuVisible: true,
            rightMenuPosition: { x: e.event.clientX, y: e.event.clientY },
            treeRightClickNode: e.node.props
        })
    };

    prepareTableData(targetObject: { [key: string]: any; }, resource: Ecore.EObject, key: String): Array<any> {

        const boolSelectionOption: { [key: string]: any } = { "null": null, "true": true, "false": false }
        const getPrimitiveType = (value: string): any => boolSelectionOption[value]
        const convertPrimitiveToString = (value: string): any => String(boolSelectionOption[value])

        const prepareValue = (eObject: Ecore.EObject, value: any, idx: Number): any => {
            if (eObject.isKindOf('EReference')) {
                const elements = value ?
                    eObject.get('upperBound') === -1 ?
                        value.map((el: Object, idx: number) => <React.Fragment key={idx}>{JSON.stringify(el)}<br /></React.Fragment>)
                        :
                        <React.Fragment key={value.$ref}>{JSON.stringify(value)}<br /></React.Fragment>
                    :
                    []
                const component = <React.Fragment key={key + "_" + idx}>
                    {elements}
                    <Button key={key + "_" + idx} onClick={() => this.setState({ modalVisible: true })}>...</Button>
                </React.Fragment>
                return component
            } else if (eObject.get('eType').isKindOf('EDataType') && eObject.get('eType').get('name') === "EBoolean") {
                return <Select value={convertPrimitiveToString(value)} key={key + "_" + idx} style={{ width: "300px" }} onChange={(newValue: any) => {
                    const updatedJSON = targetObject.updater({ [eObject.get('name')]: getPrimitiveType(newValue) });
                    const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                    this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                }}>
                    {Object.keys(boolSelectionOption).map((value: any) =>
                        <Select.Option key={key + "_" + value + "_" + key} value={value}>{value}</Select.Option>)}
                </Select>
            } else if (eObject.get('eType').isKindOf('EDataType') && eObject.get('eType').get('name') === "Timestamp") {
                return value
            } else if (eObject.get('eType').isKindOf('EDataType') && eObject.get('eType').get('name') === "Date") {
                return value
            }else if (eObject.get('eType').isKindOf('EDataType') && eObject.get('eType').get('name') === "Password") {
                return <EditableTextArea
                    type="password"
                    key={key + "_" + idx}
                    editedProperty={eObject.get('name')}
                    value={value}
                    onChange={(newValue: Object) => {
                        const updatedJSON = targetObject.updater(newValue);
                        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            } else if (eObject.get('eType').isKindOf('EEnum')) {
                return <Select value={value} key={key + "_" + idx} style={{ width: "300px" }} onChange={(newValue: any) => {
                    const updatedJSON = targetObject.updater({ [eObject.get('name')]: newValue });
                    const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                    this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                }}>
                    {eObject.get('eType').eContents().map((obj: Ecore.EObject) =>
                        <Select.Option key={key + "_opt_" + obj.get('name') + "_" + targetObject.id} value={obj.get('name')}>{obj.get('name')}</Select.Option>)}
                </Select>
            } else {
                return <EditableTextArea
                    type="text"
                    key={key + "_" + idx}
                    editedProperty={eObject.get('name')}
                    value={value}
                    onChange={(newValue: Object) => {
                        const updatedJSON = targetObject.updater(newValue);
                        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            }
        }

        const preparedData: Array<Object> = []
        const featureList = resource.eContainer.getEObject(targetObject._id).eClass.get('eAllStructuralFeatures')
        featureList.forEach((feature: Ecore.EObject, idx: Number) => {
            const isContainment = Boolean(feature.get('containment'))
            if (!isContainment) preparedData.push({
                property: feature.get('name'),
                value: prepareValue(feature, targetObject[feature.get('name')], idx),
                key: feature.get('name') + idx
            })
        });

        return preparedData
    }

    handleModalCancel = () => {
        this.setState({ modalVisible: false })
    };

    hideRightClickMenu = (e: any) => {
        this.state.rightClickMenuVisible && this.setState({ rightClickMenuVisible: false })
    };

    renderRightMenu(): any {
        const node: { [key: string]: any } = this.state.treeRightClickNode
        const eClass = node.eClass
        const eClassObject = Ecore.ResourceSet.create().getEObject(eClass)
        const allSubTypes = eClassObject.get('eAllSubTypes')
        node.isArray && eClassObject && allSubTypes.push(eClassObject)
        return <div style={{
            position: "absolute",
            display: "grid",
            boxShadow: "2px 2px 8px -1px #cacaca",
            borderRadius: "4px",
            minHeight: "10px",
            maxHeight: "100%",
            minWidth: "100px",
            maxWidth: "300px",
            left: this.state.rightMenuPosition.x,
            top: this.state.rightMenuPosition.y,
            backgroundColor: "#fff",
            padding: "1px",
            lineHeight: 2,
            zIndex: 100
        }}>
            <Menu onClick={this.handleRightMenuSelect} style={{ width: 150, border: "none" }} mode="vertical">
                {allSubTypes.length > 0 && (node.upperBound === 1 && node.arrayLength > 0 ? false : true) && <Menu.SubMenu
                    key="add"
                    title="Add child"
                >
                    {allSubTypes.map((type: Ecore.EObject, idx: Number) =>
                        type.get('abstract') ?
                            undefined
                            :
                            <Menu.Item key={type.get('name')}>
                                {type.get('name')}
                            </Menu.Item>)}
                </Menu.SubMenu>}
                {(node.isArray || node.headline) && <Menu.Item key="moveUp">Collapse children</Menu.Item>}
                {!node.isArray && !node.headline && <Menu.Item key="moveUp">Move Up</Menu.Item>}
                {!node.isArray && !node.headline && <Menu.Item key="moveDown">Move Down</Menu.Item>}
                {!node.isArray && !node.headline && <Menu.Item key="delete">Delete</Menu.Item>}
            </Menu>
        </div>
    }

    handleRightMenuSelect = (e: any) => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const node: { [key: string]: any } = this.state.treeRightClickNode

        if (e.keyPath[e.keyPath.length - 1] === "add") {
            //willkommen
            const subTypeName = e.item.props.children
            const eClass = node.eClass
            const eClassObject = Ecore.ResourceSet.create().getEObject(eClass)
            const allSubTypes = eClassObject.get('eAllSubTypes')
            node.isArray && eClassObject && allSubTypes.push(eClassObject)
            const foundEClass = allSubTypes.find((subType: Ecore.EObject) => subType.get('name') === subTypeName)
            const lastId = node.targetObject.length > 0 ? node.targetObject[node.targetObject.length - 1]._id : undefined
            const id = lastId ? 
                lastId.substring(0, lastId.length - 1) + (node.targetObject.length) 
                :
                `ui_generated_${node.pos}//${node.propertyName}.0` 
            const newObject = {
                eClass: foundEClass.eURI(),
                _id: id
            }
            let updatedJSON
            if(node.upperBound === -1) {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, {operation: "push"})
            } else {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, {operation: "set"})
            }
            const nestedJSON = this.nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : this.findObjectById(updatedJSON, targetObject._id)
            const resourceSet = Ecore.ResourceSet.create()
            const resource = resourceSet.create({ uri: this.state.resource.eURI() }).parse(updatedJSON, ()=>{})
            this.setState({ 
                resourceJSON: nestedJSON, 
                targetObject: updatedTargetObject, 
                resource: resource.eContents()[0] 
            })
        }

        if (e.key === "moveUp") {
           
        }

        if (e.key === "moveDown") {
           
        }

        if (e.key === "delete") {
            let updatedJSON
            if(node.featureUpperBound === -1) {
                const index = node.eventKey ? node.eventKey[node.eventKey.length-1] : undefined  
                updatedJSON = index && node.parentUpdater(null, undefined, node.propertyName, {operation: "splice", index: index})
            } else {
                updatedJSON = node.parentUpdater(null, undefined, node.propertyName, {operation: "set"})
            }
            const nestedJSON = this.nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : this.findObjectById(updatedJSON, targetObject._id)
            const resourceSet = Ecore.ResourceSet.create()
            const resource = resourceSet.create({ uri: this.state.resource.eURI() }).parse(updatedJSON, ()=>{})
            this.setState({ 
                resourceJSON: nestedJSON, 
                targetObject: updatedTargetObject !== undefined ? updatedTargetObject : { eClass: "" }, 
                resource: resource.eContents()[0] 
            })
        }
    }

    handleSelect = (resources: Ecore.Resource[]): void => {
        this.setState({ modalVisible: false })
        //processing selected object
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.hideRightClickMenu)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        //that means resourceJSON was edited and updated
        if (this.state.resourceJSON !== prevState.resourceJSON && Object.keys(this.state.targetObject).length > 0 && this.state.targetObject.eClass) {
            const nestedJSON = this.nestUpdaters(this.state.resourceJSON, null)
            const preparedData = this.prepareTableData(this.state.targetObject, this.state.resource, this.state.uniqKey);
            this.setState({ resourceJSON: nestedJSON, tableData: preparedData })
        }
    }

    componentDidMount(): void {
        this.getPackages()
        this.getResource()
        window.addEventListener("click", this.hideRightClickMenu)
    }

    render() {
        const { t } = this.props as Props & WithTranslation;
        return (
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                    {this.state.rightClickMenuVisible && this.renderRightMenu()}
                    <Splitter
                        ref={this.splitterRef}
                        position="horizontal"
                        primaryPaneMaxHeight="90%"
                        primaryPaneMinHeight={"10%"}
                        primaryPaneHeight={localStorage.getItem('resource_splitter_pos') || "400px"}
                        dispatchResize={true}
                        postPoned={false}
                        onDragFinished={() => {
                            const size: string = this.splitterRef.current!.panePrimary.props.style.height
                            localStorage.setItem('resource_splitter_pos', size)
                        }}
                    >
                        <div className="view-box" style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                            <Row>
                                <Col span={23}>
                                    {this.state.resource.eClass && this.createTree()}
                                </Col>
                                <Col span={1}>
                                    <Button icon="plus" type="primary" style={{ marginLeft: '20px' }} shape="circle" size="large" onClick={() => this.setState({ modalVisible: true })}></Button>
                                </Col>
                            </Row>
                        </div>
                        <div style={{ height: '100%', width: '100%', overflow: 'auto', backgroundColor: '#fff' }}>
                            <Table bordered
                                size="small"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Property',
                                        dataIndex: 'property',
                                        width: 300
                                    },
                                    {
                                        title: 'Value',
                                        dataIndex: 'value'
                                    },]}
                                dataSource={this.state.tableData}
                            />
                        </div>
                    </Splitter>
                </div>
                <Modal
                    key="add_resource_modal"
                    width={'1000px'}
                    title={t('addresource')}
                    visible={this.state.modalVisible}
                    footer={null}
                    onCancel={this.handleModalCancel}
                >
                    <SearchGridTrans onSelect={this.handleSelect} showAction={true} specialEClass={undefined} />
                </Modal>
            </div>
        );
    }
}
