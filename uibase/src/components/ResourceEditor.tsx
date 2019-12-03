import * as React from "react";
import {
    Tree, Icon, Table, Modal,
    Button, Select, Row, Col,
    Menu, Layout
} from 'antd';
import Ecore from "ecore";
import { withTranslation, WithTranslation } from "react-i18next";

import { API } from "../modules/api";
import Splitter from './CustomSplitter'
import {
    nestUpdaters, findObjectById, getPrimitiveType
} from '../utils/resourceEditorUtils'
import EClassSelection from './EClassSelection';
import SearchGrid from './SearchGrid';
import FormComponentMapper from './FormComponentMapper';
import Operations from './Operations';
import moment from 'moment';

export interface Props {
}

interface State {
    mainEObject: Ecore.EObject,
    resource: Ecore.Resource,
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
    classes: Ecore.EObject[],
    selectedKeys: Array<string>,
    selectedRefUries: Array<string>,
}

class ResourceEditor extends React.Component<any, State> {

    private splitterRef: React.RefObject<any>;

    constructor(props: any) {
        super(props);
        this.splitterRef = React.createRef();
    }

    state = {
        mainEObject: {} as Ecore.EObject,
        resource: {} as Ecore.Resource,
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
        classes: [],
        selectedKeys: [],
        selectedRefUries: []
    }

    refresh = (): void => {
        this.getEObject()
    }

    delete = (): void => {
        const ref: string = `${this.state.resource.get('uri')}?rev=${this.state.resource.rev}`;
        API.instance().deleteResource(ref).then(() => {
            this.props.history.push('/developer/data')
        })
    }

    generateEObject(): void {
        const { selectedEClass, name } = this.props.location.state
        const targetEClass: { [key: string]: any } | undefined = this.state.classes.find((eclass: Ecore.EClass) => `${eclass.eContainer.get('name')}.${eclass.get('name')}` === selectedEClass)
        const resourceSet = Ecore.ResourceSet.create()
        const newResourceJSON: { [key: string]: any } = {}

        newResourceJSON.eClass = targetEClass && targetEClass!.eURI()
        newResourceJSON._id = '/'
        newResourceJSON.name = name

        const resource = resourceSet.create({ uri: ' ' }).parse(newResourceJSON as Ecore.EObject)

        resource.set('uri', null)

        const mainEObject = resource.eResource().eContents()[0]
        const json = mainEObject.eResource().to()
        const nestedJSON = nestUpdaters(json, null)

        this.setState({
            mainEObject: mainEObject,
            resourceJSON: nestedJSON,
            targetObject: findObjectById(nestedJSON, '/'),
            resource: resource
        })
    }

    getEObject(): void {
        const resourceSet = Ecore.ResourceSet.create();
        this.props.match.params.id !== 'new' ?
            API.instance().fetchResource(`${this.props.match.params.id}?ref=${this.props.match.params.ref}`, 999, resourceSet, {}).then((resource: Ecore.Resource) => {
                const mainEObject = resource.eResource().eContents()[0]
                const nestedJSON = nestUpdaters(mainEObject.eResource().to(), null)
                this.setState((state, props) => ({
                    mainEObject: mainEObject,
                    resourceJSON: nestedJSON,
                    resource: resource,
                    selectedKeys: [],
                    //If we create a new sibling (without saving), when click on it, information appears in the property table.
                    //But if we click the refresh button, the new created sibling will disappear, but the property table still will
                    //show information from an old targetObject. To prevent those side effects we have to null targetObject and tableData.
                    targetObject: { eClass: "" },
                    tableData: []
                }))
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
                selectedKeys={this.state.selectedKeys}
            >
                <Tree.TreeNode headline={true} style={{ fontWeight: '600' }} eClass={this.state.mainEObject.eClass.eURI()} targetObject={this.state.resourceJSON} icon={<Icon type="cluster" style={{ color: "#2484fe" }} />} title={this.state.mainEObject.eClass.get('name')} key={this.state.mainEObject._id}>
                    {generateNodes(this.state.mainEObject.eClass, this.state.resourceJSON)}
                </Tree.TreeNode>
            </Tree>
        )
    }

    onTreeSelect = (selectedKeys: Array<string>, e: any, imitateClick: boolean = false) => {
        if (selectedKeys[0] && e.node.props.targetObject.eClass) {
            const targetObject = e.node.props.targetObject
            const uniqKey = e.node.props.eventKey
            this.setState({
                tableData: this.prepareTableData(targetObject, this.state.mainEObject, uniqKey),
                targetObject: targetObject,
                currentNode: e.node.props,
                uniqKey: uniqKey,
                selectedKeys: selectedKeys
            })
        } else {
            this.setState({
                tableData: [],
                targetObject: { eClass: "" },
                currentNode: {},
                selectedKeys: selectedKeys
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

    onTablePropertyChange = (newValue: any, componentName: string, targetObject: any, EObject: Ecore.EObject): void => {
        if (componentName === 'SelectComponent') {
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: newValue })
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id)
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else if (componentName === 'DatePickerComponent') {
            const value = { [EObject.get('name')]: newValue ? moment(newValue).format() : '' }
            const updatedJSON = targetObject.updater(value);
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else if (componentName === 'BooleanSelect') {
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: getPrimitiveType(newValue) })
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id)
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else {
            //EditableTextArea
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: newValue })
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id)
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        }
    }

    prepareTableData(targetObject: { [key: string]: any; }, mainEObject: Ecore.EObject, key: String): Array<any> {
        const preparedData: Array<Object> = []
        if (mainEObject.eContainer.getEObject(targetObject._id) !== null) {
            const featureList = mainEObject.eContainer.getEObject(targetObject._id).eClass.get('eAllStructuralFeatures')
            featureList.forEach((feature: Ecore.EObject, idx: Number) => {
                const isContainment = Boolean(feature.get('containment'))
                const isContainer = feature.get('eOpposite') && feature.get('eOpposite').get('containment') ? true : false
                if (!isContainment && !isContainer) preparedData.push({
                    property: feature.get('name'),
                    value: FormComponentMapper.getComponent({
                        value: targetObject[feature.get('name')],
                        targetObject: targetObject,
                        eObject: feature,
                        eType: feature.get('eType'),
                        upperBound: feature.get('upperBound'),
                        idx: idx,
                        ukey: key,
                        onChange: this.onTablePropertyChange,
                        handleDeleteSingleRef: this.handleDeleteSingleRef,
                        handleDeleteRef: this.handleDeleteRef,
                        onEClassBrowse: this.onEClassBrowse,
                        onBrowse: this.onBrowse,
                        mainEObject: mainEObject
                    }),
                    key: feature.get('name') + idx
                })
            })
            return preparedData
        }
        return preparedData
    }

    onEClassBrowse = (EObject: Ecore.EObject) => {
        this.setState({ modalSelectEClassVisible: true, addRefPropertyName: EObject.get('name') })
    }

    onBrowse = (EObject: Ecore.EObject) => {
        const addRefPossibleTypes = []
        addRefPossibleTypes.push(EObject.get('eType').get('name'))
        EObject.get('eType').get('eAllSubTypes').forEach((subType: Ecore.EObject) =>
            addRefPossibleTypes.push(subType.get('name'))
        )
        this.setState({
            modalRefVisible: true,
            addRefPropertyName: EObject.get('name'),
            addRefPossibleTypes: addRefPossibleTypes
        })
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
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : findObjectById(updatedJSON, targetObject._id)
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
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = !targetObject._id ? targetObject : findObjectById(updatedJSON, targetObject._id)
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject)
            this.setState((state, props) => ({
                mainEObject: resource.eContents()[0],
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject !== undefined ? updatedTargetObject : { eClass: "" },
                tableData: updatedTargetObject ? state.tableData : [],
                selectedKeys: state.selectedKeys.filter(key => key !== node.eventKey)
            }))
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
                refsArray.push({
                    $ref: res.eContents()[0].eURI(),
                    eClass: res.eContents()[0].eClass.eURI()
                })
            })
            updatedJSON = targetObject.updater({ [addRefPropertyName]: refsArray })
        } else {
            const firstResource = resources.find((res: Ecore.Resource) => res.eURI() === this.state.selectedRefUries[0])
            //if a user choose several resources for the adding, but upperBound === 1, we put only first resource
            updatedJSON = targetObject.updater({
                [addRefPropertyName]: {
                    $ref: firstResource!.eContents()[0].eURI(),
                    eClass: firstResource!.eContents()[0].eClass.eURI()
                }
            })
        }
        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
        this.setState({ 
            modalRefVisible: false, 
            resourceJSON: updatedJSON, 
            targetObject: updatedTargetObject,
            selectedRefUries: [] 
        })
    }

    handleAddNewRef = () => {
        const resources: any = []
        this.state.mainEObject.eResource().eContainer.get('resources').each((res: { [key: string]: any }) => {
            const isFound = this.state.selectedRefUries.indexOf(res.eURI() as never)
            isFound !== -1 && resources.push(res)
        })
        this.addRef(resources)
    }

    handleDeleteRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const oldRefsArray = targetObject[addRefPropertyName] ? targetObject[addRefPropertyName] : []
        const newRefsArray = oldRefsArray.filter((refObj: { [key: string]: any }) => refObj["$ref"] !== deletedObject["$ref"])
        const updatedJSON = targetObject.updater({ [addRefPropertyName]: newRefsArray })
        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id)
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    }

    handleDeleteSingleRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject
        const updatedJSON = targetObject.updater({ [addRefPropertyName]: null })
        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id)
        delete updatedTargetObject[addRefPropertyName]
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    }

    cloneResource = () => {
        this.state.mainEObject.eResource().clear()
        const resource = this.state.mainEObject.eResource().parse(this.state.resourceJSON as Ecore.EObject)
        resource.set('uri', null)

        if (resource && this.props.match.params.id !== 'new') {
            API.instance().saveResource(resource).then((resource: any) => {
                this.props.history.push(`/developer/data/editor/${resource.get('uri')}/${resource.rev}`)
            })
        }
    }

    save = () => {
        this.state.mainEObject.eResource().clear()
        const resource = this.state.mainEObject.eResource().parse(this.state.resourceJSON as Ecore.EObject)
        const targetObject: { [key: string]: any } = this.state.targetObject

        if (resource) {
            this.setState({ isSaving: true })
            API.instance().saveResource(resource).then((resource: any) => {
                const nestedJSON = nestUpdaters(resource.eResource().to(), null)
                const updatedTargetObject = findObjectById(nestedJSON, targetObject._id)
                this.setState({
                    isSaving: false,
                    mainEObject: resource.eResource().eContents()[0],
                    resourceJSON: nestedJSON,
                    targetObject: updatedTargetObject,
                    resource: resource
                })
                this.props.match.params.id === 'new' && 
                    this.props.history.push(`/developer/data/editor/${resource.get('uri')}/${resource.rev}`)
            }).catch(() => {
                this.setState({ isSaving: false })
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.hideRightClickMenu)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        //if true that means resourceJSON was edited and updated
        if (this.state.resourceJSON !== prevState.resourceJSON && Object.keys(this.state.targetObject).length > 0 && this.state.targetObject.eClass) {
            const nestedJSON = nestUpdaters(this.state.resourceJSON, null)
            let preparedData = this.prepareTableData(this.state.targetObject, this.state.mainEObject, this.state.uniqKey);
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
                        <Button className="panel-button" icon="save" onClick={this.save} title={"Save"}/>}
                    <Button className="panel-button" icon="reload" onClick={this.refresh} title={"Reload"} />
                    {this.state.resource.get && this.state.resource.get('uri') &&
                        <Operations translate={t} mainEObject={this.state.mainEObject} />}
                    <Button className="panel-button" icon="copy" onClick={this.cloneResource} title={"Copy"} />
                    <Button className="panel-button" icon="delete" type="danger" onClick={this.delete} title={"Delete"} />
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
                                    <Button title={t('additem')} icon="plus" type="primary" style={{ display: 'block', margin: '0px 0px 10px auto' }} shape="circle" size="large" onClick={() => this.setState({ modalResourceVisible: true })}></Button>
                                    <div className="resource-container">
                                        {this.state.mainEObject.eClass && this.state.mainEObject.eResource().eContainer.get('resources').size() > 0 &&
                                            this.state.mainEObject.eResource().eContainer.get('resources').map((res: { [key: string]: any }) =>
                                                <div
                                                    className="resource-container-item"
                                                    key={res.eURI()}
                                                >
                                                    <a className="resource-link" href={`/developer/data/editor/${res.get('uri')}/${res.rev}`} target='_blank' rel="noopener noreferrer">
                                                        <span 
                                                            title={`Id: ${res.get('uri')}${res.rev?`\nRev: ${res.rev}`:''}\nName: ${res.eContents()[0].get('name')}\neClass: ${res.eContents()[0].eClass.get('name')}`} 
                                                            className="item-title"
                                                        >
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
                    footer={this.state.selectedRefUries.length > 0 ? 
                        <Button type="primary" onClick={this.handleAddNewRef}>OK</Button>: null}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        defaultValue={[]}
                        onChange={(uriArray: string[]) => {
                            this.setState({ selectedRefUries: uriArray })
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
                    title={t('addresources')}
                    visible={this.state.modalResourceVisible}
                    footer={null}
                    onCancel={this.handleResourceModalCancel}
                >
                    {/*<SearchGridTrans key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={true} specialEClass={undefined} />*/}
                    <SearchGrid key="search_grid_resource" onSelect={this.handleAddNewResource} showAction={true} specialEClass={undefined} />

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
                        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            </div>
        );
    }
}

export default withTranslation()(ResourceEditor);
