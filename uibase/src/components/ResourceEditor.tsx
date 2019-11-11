import * as React from "react";
import {
    Tree, Icon, Table, Modal,
    Button, Select, Row, Col,
    Menu, Tag, Layout, DatePicker
} from 'antd';
import Ecore from "ecore";
import { API } from "../modules/api";
import Splitter from './CustomSplitter'
import update from 'immutability-helper';
import EditableTextArea from './EditableTextArea'
import SearchGridTrans from "./SearchGrid";
import { WithTranslation } from "react-i18next";
import moment from 'moment';
import EClassSelection from './EClassSelection'

export interface Props {
}

interface State {
    mainEObject: Ecore.EObject,
    resourceJSON: { [key: string]: any },
    currentNode: {
        [key: string]: any
    },
    tableData: Array<any>,
    targetObject: {
        eClass: string,
        [key: string]: any
    },
    selectedKey: String,
    modalRefVisible: Boolean,
    modalResourceVisible: Boolean,
    rightClickMenuVisible: Boolean,
    modalSelectEClassVisible: Boolean,
    rightMenuPosition: Object,
    uniqKey: String,
    treeRightClickNode: { [key: string]: any },
    addRefPropertyName: String,
    isSaving: Boolean,
    addRefPossibleTypes: Array<string>,
    classes: Ecore.EObject[]
}

export class ResourceEditor extends React.Component<any, State> {

    private splitterRef: React.RefObject<any>;
    private selectedRefUries: string[];

    constructor(props: any) {
        super(props);
        this.splitterRef = React.createRef();
        this.selectedRefUries = []
    }

    state = {
        mainEObject: {} as Ecore.EObject,
        resourceJSON: {},
        currentNode: {},
        tableData: [],
        targetObject: { eClass: "" },
        selectedKey: "",
        modalRefVisible: false,
        modalResourceVisible: false,
        modalSelectEClassVisible: false,
        rightClickMenuVisible: false,
        rightMenuPosition: { x: 100, y: 100 },
        uniqKey: "",
        treeRightClickNode: {},
        addRefPropertyName: "",
        isSaving: false,
        addRefPossibleTypes: [],
        classes: []
    }

    generateEObject(): void {
        const {selectedEClass, name} = this.props.location.state
        const targetEClass: {[key:string]: any}|undefined = this.state.classes.find((eclass: Ecore.EClass) => eclass.get('name') === selectedEClass)
        const resourceSet = Ecore.ResourceSet.create()
        const newResourceJSON: { [key: string]: any } = {}


        newResourceJSON.eClass = targetEClass && targetEClass!.eURI()
        newResourceJSON._id = '/'
        newResourceJSON.name = name

        const resource = resourceSet.create({ uri: ' ' }).parse(newResourceJSON as Ecore.EObject)
        
        resource.set('uri', null)

        const mainEObject = resource.eResource().eContents()[0]

        this.setState({
            mainEObject: mainEObject,
            resourceJSON: this.nestUpdaters(mainEObject.eResource().to(), null)
        })
    }

    getEObject(): void {
        this.props.match.params.id !== "null" ?
        API.instance().fetchEObject(`${this.props.match.params.id}?ref=${this.props.match.params.ref}`).then(mainEObject => {
            this.setState({
                mainEObject: mainEObject,
                resourceJSON: this.nestUpdaters(mainEObject.eResource().to(), null)
            })
        })
        :
        this.generateEObject()
    }

    getEClasses(): void {
        API.instance().fetchAllClasses(false).then(classes => {
            const filtered = classes.filter((c: Ecore.EObject) => !c.get('interface'))
            this.setState({ classes: filtered })
            this.getEObject()
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
                        updatedData = update(currentObject as any, { [updaterProperty]: { [indexForParentUpdater]: { $merge: newValues } } })
                    } else {
                        if (options && options.operation === "push") {
                            //cause a property may not exist
                            if (!currentObject[updaterProperty]) currentObject[updaterProperty] = []
                            updatedData = update(currentObject as any, { [updaterProperty]: { $push: [newValues] } })
                        } else if (options && options.index && options.operation === "splice") {
                            updatedData = update(currentObject as any, { [updaterProperty]: { $splice: [[options.index, 1]] } })
                        } else if (options && options.operation === "set") {
                            updatedData = update(currentObject as any, { [updaterProperty]: { $set: newValues } })
                        } else if (options && options.operation === "unset") {
                            updatedData = update(currentObject as any, { $unset: [updaterProperty] })
                        } else {
                            //if nothing from listed above, then merge updating the object by a property name
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
                    if (obj[prop] instanceof Object && typeof obj[prop] === "object") {
                        result = this.findObjectById(obj[prop], id)
                    }
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

        const getTitle = (object: { [key: string]: any }) => {
            const possibleTitles: Array<string> = ["name", "qname", "caption", "createdBy", "code"]
            let result = null
            for (let title of possibleTitles) {
                if (object[title]) {
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
                        icon={upperBound === 1 ? <Icon type="line" style={{ color: "#d831ff", fontSize: 12 }} /> : <Icon type="dash" style={{ color: "#d831ff" }} />}
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
                                icon={<Icon type="block" style={{ color: "#88bc51" }} />}
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
                <Tree.TreeNode headline={true} style={{ fontWeight: '600' }} eClass={this.state.mainEObject.eClass.eURI()} targetObject={this.state.resourceJSON} icon={<Icon type="cluster" style={{ color: "#2484fe" }} />} title={this.state.mainEObject.eClass.get('name')} key={this.state.mainEObject._id}>
                    {generateNodes(this.state.mainEObject.eClass, this.state.resourceJSON)}
                </Tree.TreeNode>
            </Tree>
        )
    }

    onTreeSelect = (selectedKeys: Array<String>, e: any, imitateClick: boolean = false) => {
        if (selectedKeys[0] && e.node.props.targetObject.eClass) {
            const targetObject = e.node.props.targetObject
            const uniqKey = e.node.props.eventKey
            this.setState({
                tableData: this.prepareTableData(targetObject, this.state.mainEObject, uniqKey),
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
    }

    onTreeRightClick = (e: any) => {
        this.setState({
            rightClickMenuVisible: true,
            rightMenuPosition: { x: e.event.clientX, y: e.event.clientY },
            treeRightClickNode: e.node.props
        })
    }

    prepareTableData(targetObject: { [key: string]: any; }, mainEObject: Ecore.EObject, key: String): Array<any> {

        const boolSelectionOption: { [key: string]: any } = { "true": true, "false": false, "undefined": false }
        const getPrimitiveType = (value: string): any => boolSelectionOption[value]
        const convertPrimitiveToString = (value: string): any => String(boolSelectionOption[value])

        const getRelatedResourceByRef = (reference: string) => {
            const refObject = mainEObject.eResource().eContainer.get('resources')
                .find((res: Ecore.Resource) => res.eContents()[0].eURI() === reference)

            return (refObject && refObject.eContents()[0]) || null
        }

        const prepareValue = (feature: Ecore.EObject, value: any, idx: Number): any => {
            if (feature.isKindOf('EReference')) {
                const relatedResource = value && value.$ref && getRelatedResourceByRef(value!.$ref)
                const elements = value ?
                    feature.get('upperBound') === -1 ?
                        value.map((el: { [key: string]: any }, idx: number) =>
                            <Tag
                                onClose={(e: any) => {
                                    this.handleDeleteRef(el, feature.get('name'))
                                }}
                                closable
                                key={el["$ref"]}
                            >
                                {getRelatedResourceByRef(el.$ref) && getRelatedResourceByRef(el.$ref)!.get('name')}&nbsp;
                                {getRelatedResourceByRef(el.$ref) && getRelatedResourceByRef(el.$ref)!.eClass.get('name')}&nbsp; 
                            </Tag>)
                        :
                        <Tag
                            onClose={(e: any) => {
                                this.handleDeleteSingleRef(value, feature.get('name'))
                            }}
                            closable
                            key={value["$ref"]}
                        >
                            {relatedResource && relatedResource.get('name')}&nbsp;
                            {relatedResource && relatedResource.eClass.get('name')}&nbsp;
                        </Tag>
                    :
                    []
                const component = <React.Fragment key={key + "_" + idx}>
                    {elements}
                    {feature.get('eType').get('name') === 'EClass' ?
                        <Button 
                            style={{ display: "inline-block" }} 
                            key={key + "_" + idx} 
                            onClick={() => 
                                this.setState({ modalSelectEClassVisible: true, addRefPropertyName: feature.get('name') })}
                        >...</Button>
                        :
                        <Button 
                            style={{ display: "inline-block" }} 
                            key={key + "_" + idx} 
                            onClick={() => {
                                const addRefPossibleTypes = []
                                addRefPossibleTypes.push(feature.get('eType').get('name'))
                                feature.get('eType').get('eAllSubTypes').forEach((subType: Ecore.EObject) => 
                                    addRefPossibleTypes.push(subType.get('name'))
                                )
                                this.setState({ 
                                    modalRefVisible: true, 
                                    addRefPropertyName: feature.get('name'),
                                    addRefPossibleTypes: addRefPossibleTypes
                                })
                            }}
                        >...</Button>
                    }
                </React.Fragment>
                return component
            } else if (feature.get('eType') && feature.get('eType').isKindOf('EDataType') && feature.get('eType').get('name') === "EBoolean") {
                return <Select value={convertPrimitiveToString(value)} key={key + "_" + idx} style={{ width: "300px" }} onChange={(newValue: any) => {
                    const updatedJSON = targetObject.updater({ [feature.get('name')]: getPrimitiveType(newValue) });
                    const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                    this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                }}>
                    {Object.keys(boolSelectionOption).map((value: any) =>
                        value !== "undefined" && <Select.Option key={key + "_" + value + "_" + key} value={value}>{value}</Select.Option>)}
                </Select>
            } else if (feature.get('eType') && feature.get('eType').isKindOf('EDataType') && feature.get('eType').get('name') === "Timestamp") {
                return value
            } else if (feature.get('eType') && feature.get('eType').isKindOf('EDataType') && feature.get('eType').get('name') === "Date") {
                return <DatePicker
                    showTime
                    key={key + "_date_" + idx}
                    defaultValue={moment(value)}
                    onChange={(value: any) => {
                        const newValue = { [feature.get('name')]: value ? value.format() : '' }
                        const updatedJSON = targetObject.updater(newValue);
                        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            } else if (feature.get('eType') && feature.get('eType').isKindOf('EDataType') && feature.get('eType').get('name') === "Password") {
                return <EditableTextArea
                    type="password"
                    key={key + "_" + idx}
                    editedProperty={feature.get('name')}
                    value={value}
                    onChange={(newValue: Object) => {
                        const updatedJSON = targetObject.updater(newValue);
                        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            } else if (feature.get('eType') && feature.get('eType').isKindOf('EEnum')) {
                return <Select mode={feature.get('upperBound') === -1 ? "multiple" : "default"} value={value} key={key + "_" + idx} style={{ width: "300px" }} onChange={(newValue: any) => {
                    const updatedJSON = targetObject.updater({ [feature.get('name')]: newValue });
                    const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                    this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                }}>
                    {feature.get('eType').eContents().map((obj: Ecore.EObject) =>
                        <Select.Option key={key + "_opt_" + obj.get('name') + "_" + targetObject.id} value={obj.get('name')}>{obj.get('name')}</Select.Option>)}
                </Select>
            } else {
                return <EditableTextArea
                    type="text"
                    key={key + "_" + idx}
                    editedProperty={feature.get('name')}
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
        const featureList = mainEObject.eContainer.getEObject(targetObject._id).eClass.get('eAllStructuralFeatures')
        featureList.forEach((feature: Ecore.EObject, idx: Number) => {
            const isContainment = Boolean(feature.get('containment'))
            if (!isContainment) preparedData.push({
                property: feature.get('name'),
                value: prepareValue(feature, targetObject[feature.get('name')], idx),
                key: feature.get('name') + idx
            })
        })

        return preparedData
    }

    setSelectEClassVisible = (visible: boolean) => {
        this.setState({ modalSelectEClassVisible: visible })
    }

    handleRefModalCancel = () => {
        this.setState({ modalRefVisible: false })
    }

    handleResourceModalCancel = () => {
        this.setState({ modalResourceVisible: false })
    }

    hideRightClickMenu = (e: any) => {
        this.state.rightClickMenuVisible && this.setState({ rightClickMenuVisible: false })
    }

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
            if (node.upperBound === -1) {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "push" })
            } else {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "set" })
            }
            const nestedJSON = this.nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : this.findObjectById(updatedJSON, targetObject._id)
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject)
            this.setState({
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject,
                mainEObject: resource.eContents()[0]
            })
        }

        if (e.key === "moveUp") {

        }

        if (e.key === "moveDown") {

        }

        if (e.key === "delete") {
            let updatedJSON
            if (node.featureUpperBound === -1) {
                const index = node.eventKey ? node.eventKey[node.eventKey.length - 1] : undefined
                updatedJSON = index && node.parentUpdater(null, undefined, node.propertyName, { operation: "splice", index: index })
            } else {
                updatedJSON = node.parentUpdater(null, undefined, node.propertyName, { operation: "set" })
            }
            const nestedJSON = this.nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : this.findObjectById(updatedJSON, targetObject._id)
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject)
            this.setState({
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject !== undefined ? updatedTargetObject : { eClass: "" },
                mainEObject: resource.eContents()[0]
            })
        }
    }

    handleAddNewResource = (resources: Ecore.Resource[]): void => {
        const resourceList: Ecore.EList = this.state.mainEObject.eResource().eContainer.get('resources')
        resourceList.addAll(resources)
        this.setState({ modalResourceVisible: false })
    }

    handleDeleteResource = (resource: { [key: string]: any }): void => {
        this.state.mainEObject.eResource().eContainer.get('resources').remove(resource)
        this.forceUpdate()
    }

    addRef = (resources: Ecore.Resource[]): void => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const { addRefPropertyName } = this.state
        let updatedJSON: Object = {}
        let refsArray: Array<Object>
        //too explosive?
        const feature = this.state.mainEObject.eClass.get('eAllStructuralFeatures').find((feature: Ecore.EObject) => feature.get('name') === addRefPropertyName)
        const upperBound = feature && feature.get('upperBound')
        //res.eContents()[0] may not be null, I hope
        if (upperBound === -1) {
            refsArray = targetObject[addRefPropertyName] ? [...targetObject[addRefPropertyName]] : []
            resources.forEach((res) => {
                //const isInArray = refsArray.findIndex((refObj: { [key: string]: any }) => res.eContents()[0].eURI() === refObj["$ref"])
                //isInArray === -1 && refsArray.push({
                refsArray.push({
                    $ref: res.eContents()[0].eURI(),
                    eClass: res.eContents()[0].eClass.eURI()
                })
            })
            updatedJSON = targetObject.updater({ [addRefPropertyName]: refsArray })
        } else {
            //if a user choose several resources for the adding, but upperBound === 1, we put only first resource
            updatedJSON = targetObject.updater({
                [addRefPropertyName]: {
                    $ref: resources[0].eContents()[0].eURI(),
                    eClass: resources[0].eContents()[0].eClass.eURI()
                }
            })
        }
        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
        this.setState({ modalRefVisible: false, resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    }

    handleAddNewRef = () => {
        const resources: any = []
        this.state.mainEObject.eResource().eContainer.get('resources').each((res: { [key: string]: any }) => {
            const isFound = this.selectedRefUries.indexOf(res.eURI())
            isFound !== -1 && resources.push(res)
        })
        this.addRef(resources)
    }

    handleDeleteRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const oldRefsArray = targetObject[addRefPropertyName] ? targetObject[addRefPropertyName] : []
        const newRefsArray = oldRefsArray.filter((refObj: { [key: string]: any }) => refObj["$ref"] !== deletedObject["$ref"])
        const updatedJSON = targetObject.updater({ [addRefPropertyName]: newRefsArray })
        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id)
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    }

    handleDeleteSingleRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const updatedJSON = targetObject.updater({[addRefPropertyName]: null })
        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id)
        delete updatedTargetObject[addRefPropertyName]
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    }

    save = () => {
        this.state.mainEObject.eResource().clear()
        const resource = this.state.mainEObject.eResource().parse(this.state.resourceJSON as Ecore.EObject)
        const targetObject: { [key: string]: any } = this.state.targetObject

        if (resource) {
            this.setState({ isSaving: true })
            API.instance().saveResource(resource).then((result: any) => {
                const nestedJSON = this.nestUpdaters(result.eResource().to(), null)
                const updatedTargetObject = this.findObjectById(nestedJSON, targetObject._id)
                this.setState({ 
                    isSaving: false, 
                    mainEObject: result.eResource().eContents()[0], 
                    resourceJSON: nestedJSON,
                    targetObject: updatedTargetObject
                })
            }).catch(() => {
                this.setState({ isSaving: false })
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.hideRightClickMenu)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        //that means resourceJSON was edited and updated
        if (this.state.resourceJSON !== prevState.resourceJSON && Object.keys(this.state.targetObject).length > 0 && this.state.targetObject.eClass) {
            const nestedJSON = this.nestUpdaters(this.state.resourceJSON, null)
            const preparedData = this.prepareTableData(this.state.targetObject, this.state.mainEObject, this.state.uniqKey);
            this.setState({ resourceJSON: nestedJSON, tableData: preparedData })
        }
    }

    componentDidMount(): void {
        this.getEClasses()
        window.addEventListener("click", this.hideRightClickMenu)
    }

    render() {
        const { t } = this.props as Props & WithTranslation;
        return (
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <Layout.Header className="head-panel">
                    {this.state.isSaving ?
                        <Icon type="loading" style={{ fontSize: '20px', margin: '6px 10px', color: '#61dafb' }} />
                        :
                        <Button className="panel-button" icon="save" onClick={this.save} />}
                    <Button className="panel-button" icon="reload" onClick={this.save} />
                </Layout.Header>
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
                                <Col span={21}>
                                    {this.state.mainEObject.eClass && this.createTree()}
                                </Col>
                                <Col span={3} style={{ position: 'sticky', top: '0' }}>
                                    <Button icon="plus" type="primary" style={{ display: 'block', margin: '0px 0px 10px auto' }} shape="circle" size="large" onClick={() => this.setState({ modalResourceVisible: true })}></Button>
                                    <div className="resource-container">
                                        {this.state.mainEObject.eClass && this.state.mainEObject.eResource().eContainer.get('resources').size() > 0 &&
                                            this.state.mainEObject.eResource().eContainer.get('resources').map((res: { [key: string]: any }) =>
                                                <div
                                                    className="resource-container-item"
                                                    key={res.eURI()}
                                                >
                                                    <a className="resource-link" href={`/settings/data/${res.get('uri')}/${res.rev}`} target='_blank' rel="noopener noreferrer">
                                                        <span title={`${res.eContents()[0].get('name')} ${res.eContents()[0].eClass.get('name')}`} className="item-title">
                                                            {`${res.eContents()[0].get('name')}`}
                                                            &nbsp;
                                                                    {<b>
                                                                {`${res.eContents()[0].eClass.get('name')}`}
                                                            </b>}
                                                            &nbsp;
                                                            </span>
                                                    </a>
                                                    <Button
                                                        className="item-close-button"
                                                        shape="circle"
                                                        icon="close"
                                                        onClick={(e: any) => this.handleDeleteResource(res)}
                                                    />
                                                </div>
                                            )
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div style={{ height: '100%', width: '100%', overflow: 'auto', backgroundColor: '#fff' }}>
                            <Table
                                bordered
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
                {this.state.modalRefVisible && <Modal
                    key="add_ref_modal"
                    width={'700px'}
                    title={t('addreference')}
                    visible={this.state.modalRefVisible}
                    onCancel={this.handleRefModalCancel}
                    onOk={this.handleAddNewRef}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        defaultValue={[]}
                        onChange={(uriArray: string[]) => {
                            this.selectedRefUries = uriArray
                        }}
                    >
                        {this.state.mainEObject.eClass && this.state.mainEObject.eResource().eContainer.get('resources').map((res: { [key: string]: any }, index: number) => {
                            const possibleTypes: Array<string> = this.state.addRefPossibleTypes
                            const isEObjectType: boolean = possibleTypes[0] === 'EObject'
                            return isEObjectType ?
                                <Select.Option key={index} value={res.eURI()}>
                                    {<b>
                                        {`${res.eContents()[0].eClass.get('name')}`}
                                    </b>}
                                    &nbsp;
                                    {`${res.eContents()[0].get('name')}`}
                                </Select.Option>
                                :
                                possibleTypes.includes(res.eContents()[0].eClass.get('name')) && <Select.Option key={index} value={res.eURI()}>
                                    {<b>
                                        {`${res.eContents()[0].eClass.get('name')}`}
                                    </b>}
                                    &nbsp;
                                    {`${res.eContents()[0].get('name')}`}
                                </Select.Option>
                        })}
                    </Select>
                </Modal>}
                {this.state.modalResourceVisible && <Modal
                    key="add_resource_modal"
                    width={'1000px'}
                    title={t('addresource')}
                    visible={this.state.modalResourceVisible}
                    footer={null}
                    onCancel={this.handleResourceModalCancel}
                >
                    <SearchGridTrans key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={true} specialEClass={undefined} />
                </Modal>}
                <EClassSelection
                    key="eclass_selection"
                    translate={t}
                    modalSelectEClassVisible={this.state.modalSelectEClassVisible}
                    setSelectEClassVisible={this.setSelectEClassVisible}
                    onOk={(EClassObject: any) => {
                        const targetObject: { [key: string]: any } = this.state.targetObject;
                        const updatedJSON = targetObject.updater({
                            [this.state.addRefPropertyName]: {
                                $ref: EClassObject.eURI(),
                                eClass: EClassObject.eClass.eURI()
                            }
                        })
                        const updatedTargetObject = this.findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            </div>
        );
    }
}
