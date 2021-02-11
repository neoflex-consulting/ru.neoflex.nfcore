import * as React from "react";
import {Col, Input, Layout, Menu, Row, Tree} from 'antd';
import Ecore, {EObject, Resource} from "ecore";
import {withTranslation, WithTranslation} from "react-i18next";

import {API} from "../modules/api";
import Splitter from './CustomSplitter'
import {
    findObjectById,
    findObjectByIdCallback,
    getPrimitiveType,
    nestUpdaters,
    traverseEObject
} from '../utils/resourceEditorUtils'
import EClassSelection from './EClassSelection';
import SearchGrid from './SearchGrid';
import FormComponentMapper from './FormComponentMapper';
import Operations from './Operations';
import moment from 'moment';
import FetchSpinner from "./FetchSpinner";
import {Helmet} from "react-helmet";
import {copyToClipboard, getClipboardContents} from "../utils/clipboard";
import {getFieldAnnotationByKey} from "../utils/eCoreUtil";
import './../styles/ResouceEditor.css'
import {NeoIcon} from "neo-icon/lib";
import {NeoButton, NeoCol, NeoColor, NeoHint, NeoModal, NeoOption, NeoRow, NeoSelect, NeoTable} from "neo-design/lib";
import {IMainContext} from "../MainContext";


interface DataNode {
    title: any;
    key: string;
    isLeaf?: boolean;
    children?: DataNode[];
    headline?: boolean,
    eClass?: string,
    targetObject?: {},
    parentUpdater?: any,
    upperBound? : any,
    isArray?: boolean,
    arrayLength?: number,
    propertyName?: string,
    featureUpperBound?: any,

}

interface ITargetObject {
    eClass: string,
    [key: string]: any
}

export interface Props {
    principal: any;
    notification: IMainContext['notification'];
    maxHeaderOrder: Number;
    applications: EObject[];
    getAllApplications: void
}

interface State {
    mainEObject: Ecore.EObject,
    resource: Ecore.Resource,
    resourceJSON: { [key: string]: any },
    currentNode: {
        [key: string]: any
    },
    tableData: Array<any>,
    targetObject: ITargetObject,
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
    selectedKeys: React.Key[],
    selectedRefUries: Array<string>,
    searchResources: String,
    isModified: boolean,
    modalApplyChangesVisible: Boolean,
    clipboardObject: ITargetObject,
    edit: boolean,
    expandedKeys: React.Key[],
    saveMenuVisible: boolean,
    removalProcess: boolean,
    modalDeleteResourceVisible: boolean,
    selectDropdownVisible: boolean,
    selectTags: number,
    selectCount: number,
}

const getAllChildrenKeys = (children: any[], expandedKeys:string[] = []) => {
    children.filter((ch:any)=>ch).forEach((c:any)=> {
        if (c !== undefined && c.props.children.filter((ch:any)=>ch !== null).length !== 0) {
            expandedKeys.push(c.key);
            getAllChildrenKeys(c.props.children, expandedKeys)
        }
    });
    return expandedKeys
};

const findChildrenKey = (children: any[], key: string):string => {
    const childrenNodes = children.filter((ch:any) => ch !== null);
    for (const c of childrenNodes) {
        if (c !== undefined && c.props.targetObject?._id === key) {
            return c.key;
        } else if (c !== undefined && c.props.isArray !== true && Array.isArray(c.props.targetObject) && c.props.targetObject.find((t: { _id: string; })=>t._id === key)) {
            return c.key;
        } if (c !== undefined && c.props.children.filter((ch:any)=>ch !== null).length !== 0) {
            const retKey = findChildrenKey(c.props.children, key);
            if (retKey !== "") {
                return retKey
            }
        }
    }
    return ""
};

const getChildNode = (children: any[], nodeKey:string) => {
    let retVal:any;
    for (const c of children.filter((ch: any) => ch)) {
        if (c.props.children.filter((ch: any) => ch).length !== 0) {
            if (c.key === nodeKey) {
                return c
            } else {
                retVal = getChildNode(c.props.children, nodeKey);
                if (retVal) { break }
            }
        }
    }
    return retVal
};

class ResourceEditor extends React.Component<Props & WithTranslation & any, State> {

    splitterRef: React.RefObject<any>;
    treeRef: React.RefObject<any>;
    eventHandlerClass = "ru.neoflex.nfcore.application#//EventHandler";
    dynamicActionElementClass = "ru.neoflex.nfcore.application#//DynamicActionElement";

    constructor(props: any) {
        super(props);
        this.splitterRef = React.createRef();
        this.treeRef = React.createRef();
    }

    state = {
        mainEObject: {} as Ecore.EObject,
        resource: {} as Ecore.Resource,
        resourceJSON: {},
        currentNode: {},
        tableData: [],
        targetObject: { eClass: "" } as ITargetObject,
        selectedKey: "",
        modalRefVisible: false,
        modalResourceVisible: false,
        modalSelectEClassVisible: false,
        rightClickMenuVisible: false,
        rightMenuPosition: { x: 100, y: 100 },
        uniqKey: "",
        treeRightClickNode: {} as { [key: string]: any },
        addRefPropertyName: "",
        isSaving: false,
        addRefPossibleTypes: [],
        classes: [],
        selectedKeys: [],
        selectedRefUries: [],
        searchResources: '',
        isModified: false,
        modalApplyChangesVisible: false,
        isClipboardValidObject: false,
        clipboardObject: { eClass: "" },
        edit: false,
        expandedKeys: [],
        saveMenuVisible: false,
        removalProcess: false,
        modalDeleteResourceVisible: false,
        selectDropdownVisible: false,
        selectTags: 3,
        selectCount: 0,
    };

    componentDidMount(): void {
        this.getEClasses();
        // window.addEventListener("click", this.hideRightClickMenu);
        // window.addEventListener("keydown", this.saveOnCtrlS);
    }

    getEClasses(): void {
        API.instance().fetchAllClasses(false).then(classes => {
            const filtered = classes.filter((c: Ecore.EObject) => !c.get('interface'));
            this.setState({ classes: filtered });
            this.getEObject()
        })
    }

    getEObject(): void {
        const resourceSet = Ecore.ResourceSet.create();
        this.props.match.params.id !== 'new' ?
            API.instance().fetchResource(`${this.props.match.params.id}?ref=${this.props.match.params.ref}`, 999, resourceSet, {}).then((resource: Ecore.Resource) => {
                const mainEObject = resource.eResource().eContents()[0];
                const nestedJSON = nestUpdaters(mainEObject.eResource().to(), null);
                this.setState((state, props) => ({
                    mainEObject: mainEObject,
                    resourceJSON: nestedJSON,
                    resource: resource,
                    selectedKeys: this.state.selectedKeys !== undefined && this.state.selectedKeys.length > 0 ? this.state.selectedKeys : [],
                    //If we create a new sibling (without saving), when click on it, information appears in the property table.
                    //But if we click the refresh button, the new created sibling will disappear, but the property table still will
                    //show information from an old targetObject. To prevent those side effects we have to null targetObject and tableData.
                    targetObject: this.state.targetObject ? this.state.targetObject : { eClass: "" },
                    tableData: this.state.tableData!.length > 0 ? this.state.tableData : []
                }));
            })
            :
            this.generateEObject()
    }

    generateEObject(): void {
        const { selectedEClass, name } = this.props.location.state;
        const targetEClass: { [key: string]: any } | undefined = this.state.classes.find((eclass: Ecore.EClass) => `${eclass.eContainer.get('name')}.${eclass.get('name')}` === selectedEClass);
        const resourceSet = Ecore.ResourceSet.create();
        const newResourceJSON: { [key: string]: any } = {};

        newResourceJSON.eClass = targetEClass && targetEClass!.eURI();
        newResourceJSON.name = name;

        const resource = resourceSet.create({ uri: ' ' }).parse(newResourceJSON as Ecore.EObject);

        resource.set('uri', "");

        const mainEObject = resource.eResource().eContents()[0];
        const json = mainEObject.eResource().to();
        const nestedJSON = nestUpdaters(json, null);

        this.setState({
            mainEObject: mainEObject,
            resourceJSON: nestedJSON,
            targetObject: findObjectById(nestedJSON, '/'),
            resource: resource,
            edit: true
        })
    }

    onTreeRightClick = (e: any) => {
        const posX = e.event.clientX;
        const posY = e.event.clientY;
        const nodeProps = e.node;
        getClipboardContents().then(json => {
            let eObject = {eClass: ""} as ITargetObject;
            try {
                eObject = JSON.parse(json);
            } catch (err) {
                //Do nothing
            }
            this.setState({
                rightMenuPosition: { x: posX, y: posY },
                treeRightClickNode: nodeProps,
                clipboardObject: eObject,
                rightClickMenuVisible: true
            })
        });
    };

    onTreeSelect = (selectedKeys: React.Key[], e: any) => {
        if (selectedKeys[0] && e.node.data.targetObject.eClass) {
            const targetObject = e.node.data.targetObject;
            const uniqKey = e.node.data.eventKey;
            this.setState({
                tableData: this.prepareTableData(targetObject, this.state.mainEObject, uniqKey),
                targetObject: targetObject,
                currentNode: e.node,
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
    };

    prepareTableData(targetObject: { [key: string]: any; }, mainEObject: Ecore.EObject, key: String): Array<any> {
        function shouldRenderProperty(targetObject: { [key: string]: any; }, featureList: Ecore.EObject[], feature: Ecore.EObject, annotationJSON: string) {
            if (annotationJSON === "") {
                return true
            }
            let isVisible = true;
            for (const [key, value] of Object.entries(JSON.parse(annotationJSON.split("'").join("\"")))) {
                const eType = featureList.find(f=>f.get('name') === key)!.get('eType');
                const enumValues = eType.eContents().filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations");
                const targetValue = targetObject[key] || feature.get('defaultValueLiteral') || (enumValues && enumValues.length > 0 && enumValues[0].get('name'));
                isVisible = Array.isArray(value)
                    ? value.includes(targetValue)
                    : targetValue === value
            }
            return isVisible
        }
        const preparedData: Array<Object> = [];
        let featureList: any = undefined;
        if (mainEObject.eContainer.getEObject(targetObject._id) !== null && mainEObject.eContainer.getEObject(targetObject._id) !== undefined) {
            featureList = mainEObject.eContainer.getEObject(targetObject._id).eClass.get('eAllStructuralFeatures');
        }
        else if (targetObject._id === undefined && mainEObject.eContainer.eContents().length !== 0) {
            featureList = mainEObject.eContainer.eContents()[0].eClass.get('eAllStructuralFeatures');
        }
        if (featureList !== undefined) {
            featureList.forEach((feature: Ecore.EObject, idx: Number) => {
                const isContainment = Boolean(feature.get('containment'));
                const isContainer = !!(feature.get('eOpposite') && feature.get('eOpposite').get('containment'));
                const description = getFieldAnnotationByKey(feature.get('eAnnotations'), 'documentation');
                const isVisible = getFieldAnnotationByKey(feature.get('eAnnotations'), 'invisible') !== 'true'
                    && shouldRenderProperty(targetObject, featureList, feature, getFieldAnnotationByKey(feature.get('eAnnotations'), 'renderConditions'));
                const isDisabled = getFieldAnnotationByKey(feature.get('eAnnotations'), 'disabled') === 'true';
                const isExpandable = getFieldAnnotationByKey(feature.get('eAnnotations'), 'expandable') === 'true';
                const syntax = getFieldAnnotationByKey(feature.get('eAnnotations'), 'syntax');
                const resourceEditorName = this.props.t(getFieldAnnotationByKey(feature.get('eAnnotations'), 'resourceEditorName'));
                const isNeoIconSelect = getFieldAnnotationByKey(feature.get('eAnnotations'), 'neoIconSelect') === 'true';
                const props = {
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
                    mainEObject: mainEObject,
                    edit: this.state.edit && !isDisabled,
                    showIcon: isNeoIconSelect,
                    syntax
                };
                let value = FormComponentMapper.getComponent(props);
                value = isExpandable ? FormComponentMapper.getComponentWrapper({
                    type: "expand",
                    wrappedComponent: FormComponentMapper.getComponent(props),
                    expandedComponent: FormComponentMapper.getComponent({...props, expanded: true})
                })! : value;
                if (!isContainment && !isContainer && isVisible) preparedData.push({
                    property: description !== "" ?
                        <div style={{display: "inline-flex"}}>
                            <span style={{margin: "5px 10px 0 0"}}>
                                {resourceEditorName || feature.get('name')}
                            </span>
                            <NeoHint title={description}>
                                <NeoButton type={'link'}>
                                    <NeoIcon icon={'question'} color={NeoColor.violete_4}/>
                                </NeoButton>
                            </NeoHint>
                        </div>
                        : feature.get('name'),
                    value: value,
                    key: feature.get('name') + idx
                })
            });
            return preparedData
        }
        return preparedData
    };

    onTablePropertyChange = (newValue: any, componentName: string, targetObject: any, EObject: Ecore.EObject): void => {
        if (componentName === 'SelectComponent') {
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: newValue });
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else if (componentName === 'DatePickerComponent') {
            const value = { [EObject.get('name')]: newValue ? moment(newValue).format() : '' };
            const updatedJSON = targetObject.updater(value);
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else if (componentName === 'BooleanSelect') {
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: getPrimitiveType(newValue) });
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        } else {
            //EditableTextArea
            const updatedJSON = targetObject.updater({ [EObject.get('name')]: newValue });
            const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
            this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
        }
    };

    handleDeleteSingleRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject;
        const updatedJSON = targetObject.updater({ [addRefPropertyName]: null, column: this.state.mainEObject.eClass.get('name') === 'DatasetComponent' && addRefPropertyName === 'dataset' ? [] : targetObject.column});
        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
        delete updatedTargetObject[addRefPropertyName];
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    };

    handleDeleteRef = (deletedObject: any, addRefPropertyName: string) => {
        const targetObject: { [key: string]: any } = this.state.targetObject;
        const oldRefsArray = targetObject[addRefPropertyName] ? targetObject[addRefPropertyName] : [];
        const newRefsArray = oldRefsArray.filter((refObj: { [key: string]: any }) => refObj["$ref"] !== deletedObject["$ref"]);
        const updatedJSON = targetObject.updater({ [addRefPropertyName]: newRefsArray});
        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
    };

    onEClassBrowse = (EObject: Ecore.EObject) => {
        this.setState({ modalSelectEClassVisible: true, addRefPropertyName: EObject.get('name') })
    };

    onBrowse = (EObject: Ecore.EObject) => {
        const addRefPossibleTypes = [];
        addRefPossibleTypes.push(EObject.get('eType').get('name'));
        const resourceSet = EObject.get('eType').eResource().get('resourceSet') || Ecore.ResourceSet.create();
        //Заглушка, так как "EObject.get('eType').get('eAllSubTypes') = undefined" в package ru.neoflex.nfcore.application,в других пакетак работает нормально
        resourceSet.elements('EClass').filter((c:any)=>c.get('name')===EObject.get('eType').get('name')).map((c:any)=>c.get('eAllSubTypes')).flat().forEach((subType: Ecore.EObject) =>
            //EObject.get('eType').get('eAllSubTypes').forEach((subType: Ecore.EObject) =>
            addRefPossibleTypes.push(subType.get('name'))
        );
        this.setState({
            modalRefVisible: true,
            addRefPropertyName: EObject.get('name'),
            addRefPossibleTypes: addRefPossibleTypes
        })
    };

    cloneResource = () => {
        const clone  = (resource: Resource) => {
            if (resource && this.props.match.params.id !== 'new') {
                API.instance().saveResource(resource).then((resource: any) => {
                    API.instance().checkLock(this.state.mainEObject._id).then(locked=> {
                        locked && API.instance().deleteLock(this.state.mainEObject._id, this.state.mainEObject.get('name'), this.state.mainEObject.eResource().rev);
                        const nestedJSON = nestUpdaters(resource.eResource().to(), null);
                        const updatedTargetObject = findObjectById(nestedJSON, nestedJSON._id);
                        this.setState({
                            mainEObject: resource.eResource().eContents()[0],
                            resourceJSON: nestedJSON,
                            targetObject: updatedTargetObject,
                            selectedKeys: [nestedJSON._id],
                            resource: resource,
                            edit: true,
                        }, () => {
                            API.instance().createLock(this.state.mainEObject._id, this.state.mainEObject.get('name'), this.state.mainEObject.eClass.get('name'), this.state.mainEObject.eResource().rev)
                        });
                        this.props.history.push(`/developer/data/editor/${resource.get('uri')}/${resource.rev}`);
                        this.props.notification(t('notification'), t('success'), "info");
                    });
                }).catch(()=>{
                    //restore main eObject
                    this.refresh(true)
                })
            }
        };
        const {t} = this.props;
        this.state.mainEObject.eResource().clear();
        const resource = this.state.mainEObject.eResource().parse(this.state.resourceJSON as Ecore.EObject);
        const contents = (eObject: EObject): EObject[] => [eObject, ...eObject.eContents().flatMap(contents)];
        contents(resource.eContents()[0]).forEach(eObject => {
            (eObject as any)._id = null
        });
        resource.eContents()[0].set('name', `${resource.eContents()[0].get('name')}.clone`);
        resource.eContents()[0].values.headerOrder = null;
        resource.set('uri', "");
        const date = new Date().toDateString();
        const time = new Date().toLocaleTimeString();
        resource.eContents()[0].values.name = resource.eContents()[0].values.name + "(" + date + " " + time + ")";
        clone(resource);
    };

    refresh = (refresh: boolean): void => {
        if (refresh) {
            this.getEObject()
        }
    };

    sortEClasses = (a: any, b: any): number => {
        if (a.eContainer.get('name') + a._id < b.eContainer.get('name') + b._id) return -1;
        if (a.eContainer.get('name') + a._id > b.eContainer.get('name') + b._id) return 0;
        else return 0;
    };

    findTreeNodesBySelector = (selector: {[key:string] : any}) : {[key:string] : any}[] =>  {
        function objectsHaveSameKeysValue(obj1:{[key:string] : any}, obj2:{[key:string] : any}) {
            const intersect = Object.keys(obj1).filter((key: any, value: any) => {
                return Object.keys(obj2).includes(key)
            });
            let eq = intersect.length > 0;
            for (const key of intersect) {
                if (obj1[key] !== obj2[key]) {
                    eq = false;
                }
            }
            return eq;
        }
        let foundNodes: {[key:string] : any}[] = [];
        // eslint-disable-next-line
        for (const [_, node] of Object.entries(this.treeRef.current?.state.keyEntities)) {
            let found = Object.keys(selector).length > 0;
            for (const [selectorKey, selectorValue] of Object.entries(selector)) {
                if (typeof selectorValue === "string" && (node as { [key: string]: any })?.node?.data && (node as { [key: string]: any }).node.data[selectorKey] !== selectorValue) {
                    found = false;
                } else if (typeof selectorValue !== "string" && Object.keys(selectorValue).length > 0  && !objectsHaveSameKeysValue(selectorValue, (node as { [key: string]: any }).props[selectorKey])) {
                    found = false;
                }
            }
            if (found) {
                foundNodes.push(node as {[key:string] : any})
            }
        }
        return foundNodes
    }

    findTreeNodeById = (id: string) : {[key:string] : any} | undefined =>  {
        const nodes = this.findTreeNodesBySelector({targetObject: {_id: id}})
        return nodes.length > 0 ? nodes[0] : undefined
    }

    handleAddNewResource = (resources: Ecore.Resource[]): void => {
        const resourceList: Ecore.EList = this.state.mainEObject.eResource().eContainer.get('resources');
        resources.forEach(r=>{
            if (!resourceList.find(rl=>r.eContents()[0].eURI() === rl.eContents()[0].eURI())) {
                resourceList.add(r)
            }
        });
        this.setState({ modalResourceVisible: false })
    };

    scrollToElementWithId = (id?:string) => {
        const node = this.findTreeNodeById(id ? id : this.state.targetObject?._id);
        if (node) {
            node.selectHandle.scrollIntoView({
                behavior: "smooth",
                block: 'center',
                inline: 'center'
            });
        }
    }

    handleRightMenuSelect = (e: any) => {
        const targetObject = this.state.targetObject;
        const node: { [key: string]: any } = this.state.treeRightClickNode;
        if (e.keyPath[e.keyPath.length - 1] === "add") {
            const subTypeName = e.item.props.children;
            const eClass = node.eClass;
            const eClassObject = Ecore.ResourceSet.create().getEObject(eClass);
            const allSubTypes = eClassObject.get('eAllSubTypes');
            node.isArray && eClassObject && allSubTypes.push(eClassObject);
            const foundEClass = allSubTypes.find((subType: Ecore.EObject) => subType.get('name') === subTypeName);
            const id = `ui_generated_${node.pos}//${node.propertyName}.${node.arrayLength}`;
            const newObject = {
                eClass: foundEClass.eURI(),
                _id: id,
                name: e.key+` ${id}`
            };
            let updatedJSON;
            if (node.upperBound === -1) {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "push" })
            } else {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "set" })
            }
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = findObjectById(updatedJSON, newObject._id);
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject);
            this.setState({
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject,
                mainEObject: resource.eContents()[0],
                isModified: true,
                expandedKeys: [...new Set([node.eventKey].concat(this.state.expandedKeys))]
            }, this.scrollToElementWithId)
        }

        if (e.key === "moveUp" || e.key === "moveDown") {
            let updatedJSON;
            if (node.featureUpperBound === -1) {
                if (e.key === "moveUp") {
                    const index = node.pos ? node.pos.split('-')[node.pos.split('-').length - 1] : undefined;
                    updatedJSON = node.parentUpdater(null, undefined, node.propertyName, { operation: "move", oldIndex: index, newIndex: (index - 1).toString() })
                }
                if (e.key === "moveDown") {
                    const index = node.pos ? node.pos.split('-')[node.pos.split('-').length - 1] : undefined;
                    updatedJSON = node.parentUpdater(null, undefined, node.propertyName, { operation: "move", oldIndex: index, newIndex: (index + 1).toString() })
                }
            }
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = targetObject !== undefined ? targetObject._id !== undefined ? findObjectById(updatedJSON, targetObject._id) : undefined : undefined;
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject);
            this.setState((state, props) => ({
                mainEObject: resource.eContents()[0],
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject !== undefined ? updatedTargetObject : { eClass: "" },
                tableData: updatedTargetObject ? state.tableData : [],
                isModified: true
            }), () => {
                if (this.state.selectedKeys.find(key => key === node.eventKey)) {
                    this.setState({selectedKeys: [this.findTreeNodeById(updatedTargetObject._id)?.props.eventKey]})
                }
            })
        }

        if (e.key === "delete"||e.key === "Delete") {
            let updatedJSON;
            if (node.featureUpperBound === -1) {
                const index = node.pos ? node.pos.split('-')[node.pos.split('-').length - 1] : undefined;
                updatedJSON = index && node.parentUpdater(null, undefined, node.propertyName, { operation: "splice", index: index })
            } else {
                updatedJSON = node.parentUpdater(null, undefined, node.propertyName, { operation: "set" })
            }
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = targetObject !== undefined ? targetObject._id !== undefined ? findObjectById(updatedJSON, targetObject._id) : undefined : undefined;
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject);
            this.setState((state, props) => ({
                mainEObject: resource.eContents()[0],
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject !== undefined ? updatedTargetObject : { eClass: "" },
                tableData: updatedTargetObject ? state.tableData : [],
                selectedKeys: state.selectedKeys.filter(key => key !== node.eventKey),
                isModified: true
            }))
        }

        if (e.key === "copy") {
            const json = JSON.stringify(node.targetObject);
            copyToClipboard(json)
                .catch((err:any) => {
                    console.error('Failed to copy: ', err);
                })
        }

        if (e.key === "paste") {
            let updatedJSON;
            const id = `ui_generated_${node.pos}//${node.propertyName}.${node.arrayLength}`;
            const newObject = {
                ...this.state.clipboardObject,
                _id: id
            };
            let added:any[] = [];
            const pattern = new RegExp("(^//@[a-zA-Z]+)|^(ui_generated_[0-9]+)",'g');
            traverseEObject(newObject,  (obj:any, key: string, level: number)=>{
                //Add missing external refs
                if (key === "$ref"
                    && obj[key].search(new RegExp('^[0-9#]','g')) === 0) {
                    if (!added.includes( API.parseRef(obj[key]).id)) {
                        added.push(API.parseRef(obj[key]).id)
                        const resourceSet = Ecore.ResourceSet.create();
                        API.instance().fetchResource(obj[key], 1, resourceSet, {}).then((resource: Ecore.Resource) => {
                            this.handleAddNewResource([resource])
                        });
                    }
                }
                //Change inner _id if its child of copy element
                if (key === "_id") {
                    obj[key] = obj[key] === id ? id : (id + obj[key] as string)
                }
                //Change same page ref for children (deprecated?)
                if (key === "$ref" && level !== 1) {
                    obj[key] = (obj[key] as string).replace(pattern,id)
                }
            });
            if (node.upperBound === -1) {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "push" })
            } else {
                updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "set" })
            }
            const nestedJSON = nestUpdaters(updatedJSON, null);
            const updatedTargetObject = findObjectById(nestedJSON, id);
            const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject);
            this.setState((state, props) => ({
                resourceJSON: nestedJSON,
                targetObject: updatedTargetObject,
                mainEObject: resource.eContents()[0],
                isModified: true,
            }), this.scrollToElementWithId)
        }
        if (e.key === "expandAll") {
            const childToExpand = getChildNode([this.treeRef.current.props.children],node.key);
            const expandedKeys = getAllChildrenKeys([childToExpand]);
            this.setState({expandedKeys: [...new Set(expandedKeys.concat(this.state.expandedKeys))]})
        }
        if (e.key === "collapseAll") {
            const childToCollapse = getChildNode([this.treeRef.current.props.children],node.key);
            const collapsedKeys = getAllChildrenKeys([childToCollapse]);
            this.setState({expandedKeys: this.state.expandedKeys.filter(k=>!collapsedKeys.includes(k))})
        }
        if (e.key === "createEventHandler") {
            //Найти позицию в дереве куда поставить
            const nodes = this.findTreeNodesBySelector({title: "eventHandlers", propertyName: "eventHandlers", upperBound: -1});
            if (nodes.length > 0) {
                //Найти класс eventHandler
                const eClass = this.eventHandlerClass;
                const eClassObject = Ecore.ResourceSet.create().getEObject(eClass);
                const node = nodes[0].props;
                const id = `ui_generated_${node.pos}//${node.propertyName}.${node.arrayLength}`;
                //Создать пустышку класса
                const newObject = {
                    eClass: eClassObject.eURI(),
                    _id: id,
                    name: `${node.propertyName}_${id}`,
                    //В пустышку прописать listenItem объект на node
                    listenItem: [{
                        $ref: this.state.treeRightClickNode.data.targetObject._id,
                        eClass: this.state.treeRightClickNode.data.eClass
                    }]
                };
                let updatedJSON = node.parentUpdater(newObject, undefined, node.propertyName, { operation: "push" });
                const nestedJSON = nestUpdaters(updatedJSON, null);
                const updatedTargetObject = findObjectById(updatedJSON, newObject._id);
                const resource = this.state.mainEObject.eResource().parse(nestedJSON as Ecore.EObject);
                //Изменить состояние
                this.setState({
                    resourceJSON: nestedJSON,
                    targetObject: updatedTargetObject,
                    mainEObject: resource.eContents()[0],
                    isModified: true,
                    expandedKeys: [...new Set([node.eventKey].concat(this.state.expandedKeys))]
                }, this.scrollToElementWithId)
            }
        }
    };


    renderRightMenu(): any {
        const node: { [key: string]: any } = this.state.treeRightClickNode;
        if (!node.data.eClass) {
            return null
        }
        const eClass = node.data.eClass;
        const eClassObject = Ecore.ResourceSet.create().getEObject(eClass);
        const allSubTypes = eClassObject.get('eAllSubTypes');
        const allSuperTypes = eClassObject.get('eAllSuperTypes');
        node.data.isArray && eClassObject && allSubTypes.push(eClassObject);
        const allChildren = getAllChildrenKeys([getChildNode([this.treeRef.current.props.children],node.key)]);
        const allParentChildren = node.data.propertyName ? node.data.parentUpdater(null, undefined, node.data.propertyName, { operation: "getAllParentChildren" }) : undefined;
        const menu = (node.data.upperBound === undefined || node.data.upperBound === -1
            || (node.data.upperBound === 1))
            && node.data.propertyName !== undefined
            &&
            <div style={{
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
                    {this.state.edit && allSubTypes.length > 0 && (node.upperBound === 1 && node.arrayLength > 0 ? false : true) && <Menu.SubMenu
                        key="add"
                        title={this.props.t("add child")}
                    >
                        {allSubTypes
                            .sort((a: any, b: any) => this.sortEClasses(a, b))
                            .map((type: Ecore.EObject, idx: Number) =>
                                type.get('abstract') ?
                                    undefined
                                    :
                                    <Menu.Item
                                        style={{
                                            marginTop: idx === 0 && allSubTypes.length > 5
                                                ? '80px' : allSubTypes.length > 5 ? '-20px' : '0px'
                                        }}
                                        key={type.get('name')}
                                    >
                                        {type.get('name')}
                                    </Menu.Item>)}
                    </Menu.SubMenu>}
                    {this.state.edit && allSubTypes.length > 0
                    && (!(node.data.upperBound === 1 && node.data.arrayLength > 0))
                    && this.state.clipboardObject.eClass
                    && allSubTypes.find((el: any) => el.get('name') === this.state.clipboardObject.eClass.split("//")[1])
                    && <Menu.Item key="paste">{this.props.t("paste")}</Menu.Item>}

                    {this.state.edit && Number(node.pos.split('-')[node.pos.split('-').length - 1]) !== 0 &&
                    !node.data.isArray && !node.data.headline && <Menu.Item key="moveUp">{this.props.t("move up")}</Menu.Item>}

                    {this.state.edit && (allParentChildren ? allParentChildren.length !== 1 : false) &&
                    Number(node.pos.split('-')[node.pos.split('-').length - 1]) !== allParentChildren.length - 1 &&
                    !node.data.isArray && !node.data.headline && <Menu.Item key="moveDown">{this.props.t("move down")}</Menu.Item>}

                    {this.state.edit && !node.data.isArray && !node.data.headline && <Menu.Item key="delete">{this.props.t("delete")}</Menu.Item>}
                    {!node.data.isArray && !node.data.headline && <Menu.Item key="copy">{this.props.t("copy")}</Menu.Item>}
                    {(node.children && node.children.filter((c:any)=>c).length>0)
                    //exists expandable elements
                    && !(this.state.expandedKeys.filter(e=>allChildren.includes(e)).length ===
                        allChildren.length)
                    && <Menu.Item key="expandAll">{this.props.t("expand all")}</Menu.Item>}
                    {(node.children && node.children.filter((c:any)=>c).length>0)
                    //exists collapsible elements
                    && this.state.expandedKeys.filter(e=>allChildren.includes(e)).length > 0
                    && <Menu.Item key="collapseAll">{this.props.t("collapse all")}</Menu.Item>}
                    {//contains eventHandlers
                        this.findTreeNodesBySelector({title: "eventHandlers", propertyName: "eventHandlers", upperBound: -1}).length > 0
                        && allSuperTypes.find((t:EObject)=>t.eURI() === this.dynamicActionElementClass)
                        && node.data.upperBound !== -1
                        && !eClassObject.get('abstract')
                        && <Menu.Item key="createEventHandler">{this.props.t("create event handler")}</Menu.Item>}
                </Menu>
            </div>
        //check if menu items not exists
        if (typeof menu === "object" && menu.props.children?.props?.children.filter((me: any)=> me !== false).length === 0) {
            this.props.notification(this.props.t('notification'), this.props.t('editing is not available'), "info");
            return null
        }
        return menu
    }

    createTree() {
        const getTitle = (object: { [key: string]: any }) => {
            const possibleTitles: Array<string> = ["name", "qname", "createdBy", "code", "rdbmsFieldName", "fieldName", "title"];
            let result = null;
            for (let title of possibleTitles) {
                if (object[title]) {
                    result = object[title];
                    break
                }
            }
            return result
        };

        const generateNodes = (eClass: Ecore.EObject, json: { [key: string]: any }, parentId?: String): Array<any> => {
            return eClass.get('eAllStructuralFeatures') && eClass.get('eAllStructuralFeatures').map((feature: Ecore.EObject, pidx: number) => {
                const isContainment = Boolean(feature.get('containment'));
                const upperBound = feature.get('upperBound');
                const isVisible = getFieldAnnotationByKey(feature.get('eAnnotations'), 'invisible') !== 'true';
                const parentKey = `${parentId ? parentId : "root" }.${feature.get('name')}.${pidx}`;
                if ((upperBound === -1 || upperBound === 1) && isContainment) {
                    const targetObject: { [key: string]: any } = Array.isArray(json[feature.get('name')]) ?
                        json[feature.get('name')]
                        :
                        json[feature.get('name')] ? [json[feature.get('name')]] : [];
                    const dataTree : DataNode = {
                        key: parentKey,
                        title: feature.get('name'),
                        parentUpdater: json.updater,
                        upperBound: upperBound,
                        isArray: true,
                        arrayLength: targetObject.length,
                        eClass: feature.get('eType').eURI(),
                        propertyName: feature.get('name'),
                        targetObject: targetObject,

                    }
                    return <Tree.TreeNode
                        data={dataTree}
                        key={parentKey}
                        className={!isVisible ? "hidden-leaf" : ""}
                        title={feature.get('name')}
                        icon={upperBound === 1 ? <NeoIcon icon={"link"} style={{ color: "#d831ff", fontSize: 12 }} /> : <NeoIcon icon={"data-line"} style={{ color: "#d831ff" }} />}
                    >
                        {targetObject.map((object: { [key: string]: any }, cidx: number) => {
                            const res = Ecore.ResourceSet.create();
                            const eClass = res.getEObject(object.eClass);
                            const title = getTitle(object);
                            const dataTree2 : DataNode = {
                                key: `${parentKey}.${cidx}`,
                                parentUpdater: json.updater,
                                featureUpperBound: upperBound,
                                eClass: object.eClass ? object.eClass : feature.get('eType').eURI(),
                                propertyName: feature.get('name'),
                                targetObject: object,
                                title: <React.Fragment>{title} <span style={{ fontSize: "11px", color: "#b1b1b1" }}>{eClass.get('name')}</span></React.Fragment>

                            }
                            return  <Tree.TreeNode
                                key={`${parentKey}.${cidx}`}
                                title={<React.Fragment>{title} <span style={{ fontSize: "11px", color: "#b1b1b1" }}>{eClass.get('name')}</span></React.Fragment>}
                                data={dataTree2}
                                icon={<NeoIcon icon={"lock"} style={{ color: "#88bc51" }} />}
                            >
                                {generateNodes(eClass, object, `${parentKey}.${cidx}`)}
                            </Tree.TreeNode>
                        })}
                    </Tree.TreeNode>
                }
                return null
            })
        };

        const dataTree : DataNode = {
            key: "/",
            title: this.state.mainEObject.eClass.get('name'),
            headline: true,
            eClass: this.state.mainEObject.eClass.eURI(),
            targetObject: this.state.resourceJSON,
        }


        return(
            <Tree
                ref={this.treeRef}
                key="mainTree"
                draggable
                // onDrop={onDrop}
                blockNode
                switcherIcon={<NeoIcon icon={"download"} />}
                showIcon
                showLine //показывать линию между пунктами
                defaultExpandAll //Все пункты раскрыты (по умолчанию) при открытии дерева

                onSelect={this.onTreeSelect}
                onRightClick={this.onTreeRightClick}
                selectedKeys={this.state.selectedKeys}
                expandedKeys={[...this.state.expandedKeys]}
                onExpand={expanded => {
                    this.setState({
                        expandedKeys: [...expanded]
                    })
                }}
            >
                {
                    <Tree.TreeNode
                        key={"/"}
                        title={this.state.mainEObject.eClass.get('name')}
                        data={dataTree}
                        icon={<NeoIcon icon={"clipboard"} style={{ color: "#2484fe" }} />}
                    >
                        {generateNodes(this.state.mainEObject.eClass, this.state.resourceJSON)}
                    </Tree.TreeNode>
                }
            </Tree>
        )

    }

    render() {
        const { t } = this.props as Props & WithTranslation;
        return (
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <Helmet>
                    <title>{this.state.resource && this.state.resource.eContents ? this.state.resource.eContents()[0].get('name') : undefined}</title>
                    <link rel="shortcut icon" type="image/png" href="/developer.ico" />
                </Helmet>
                <FetchSpinner/>
                <Layout.Header className="head-panel">
                    {
                        this.state.mainEObject._id !== undefined && (this.state.edit ?
                            <NeoButton
                                className="panel-button"
                                type={"ghost"}
                                // onClick={ ()=> this.changeEdit(false)}
                                title={this.props.t("apply and quit")}
                                suffixIcon={<NeoIcon icon={"arrowLeft"}/>}
                            >
                            </NeoButton>
                            :
                            <NeoButton
                                className="panel-button"
                                type={"ghost"}
                                suffixIcon={<NeoIcon icon={"edit"}/>}
                                // onClick={ ()=> this.changeEdit(false)}
                                title={this.props.t("edit")}
                            />)
                    }
                    {
                        (this.state.edit || this.state.mainEObject._id === undefined) && (this.state.isSaving
                            ? <NeoIcon icon={"upload"} className="panel-icon"/>
                            : <NeoButton
                                className="panel-button"
                                type={"ghost"}
                                suffixIcon={<NeoIcon icon={"save"}/>}
                                // onClick={()=>this.save(false, false)}
                                title={this.props.t("save")}
                            />)
                    }
                    <NeoButton
                        className="panel-button"
                        type={"ghost"}
                        suffixIcon={<NeoIcon icon={"download"}/>}
                        // onClick={ ()=> this.refresh(true)}
                        title={this.props.t("refresh")}
                    />
                    {this.state.resource.get && this.state.resource.get('uri') &&
                    <Operations
                        translate={t}
                        save={()=>{}}
                        // save={this.save}
                        edit={this.state.edit}
                        mainEObject={this.state.mainEObject}
                        refresh={()=>{}}
                        // refresh={this.refresh}
                        notification={this.props.notification}
                    />}
                    <NeoButton
                        className="panel-button"
                        type={"ghost"}
                        suffixIcon={<NeoIcon icon={"copy"}/>}
                        onClick={this.cloneResource}
                        title={this.props.t("copy")}
                    />
                    <NeoButton
                        className="panel-button"
                        suffixIcon={<NeoIcon icon={"delete"}/>}
                        type={'ghost'}
                        // onClick={this.handleDeleteResourceModalVisible}
                        title={this.props.t("delete")}
                    />
                    {this.state.mainEObject
                    && this.state.mainEObject.eClass
                    && ["AppModule", "Application"].includes(this.state.mainEObject.eClass.get('name'))
                        ?
                        <NeoButton
                            className="panel-button"
                            type={"ghost"}
                            suffixIcon={<NeoIcon icon={"play"}/>}
                            title={this.props.t("preview")}
                            // onClick={this.run}
                        />
                        : null
                    }
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
                            const size: string = this.splitterRef.current!.panePrimary.props.style.height;
                            localStorage.setItem('resource_splitter_pos', size)
                        }}
                    >
                        <div style={{marginLeft: '20px', marginTop: '20px'}}>
                            <Row>
                                <Col span={18}>
                                    {this.state.mainEObject.eClass && this.createTree()}
                                </Col>
                                <Col span={5} >
                                    <NeoButton
                                        title={t('additem')}
                                        suffixIcon={<NeoIcon icon={"plus"}/>}
                                        type={"secondary"}
                                        size={"medium"}
                                        onClick={() => this.setState({ modalResourceVisible: true })}
                                    />
                                    <Input
                                        style={{ width: '99%'}}
                                        onChange={(e)=>{
                                            this.setState({searchResources: `${e.target.value}`})
                                        }}
                                        placeholder={this.props.t("search")}>
                                    </Input>

                                    <div className="resource-container">
                                        {this.state.mainEObject.eClass && this.state.mainEObject.eResource().eContainer.get('resources').size() > 0 &&
                                        this.state.mainEObject.eResource().eContainer.get('resources')
                                            .filter((res: { [key: string]: any }) => res.eContents()[0].get('name').toLowerCase().includes(this.state.searchResources.toLowerCase())||
                                                res.eContents()[0].eClass.get('name').toLowerCase().includes(this.state.searchResources.toLowerCase()))
                                            .map((res: { [key: string]: any }) =>
                                                <div
                                                    className="resource-container-item"
                                                    key={res.eURI()}
                                                >
                                                    <div style={{width:'85%'}}>
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
                                                                </span>
                                                        </a>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div style={{ height: '100%', width: '100%', overflow: 'auto', backgroundColor: '#fff' }}>
                            <NeoTable
                                bordered
                                size="small"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Property',
                                        dataIndex: 'property',
                                        width: '49%'
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
                {this.state.modalRefVisible && <NeoModal
                    type={'edit'}
                    key="add_ref_modal"
                    className={"modal-add-inner-ref"}
                    title={t('addreference')}
                    visible={this.state.modalRefVisible}
                    // onCancel={this.handleRefModalCancel}
                    footer={<NeoButton
                                type={this.state.selectedRefUries.length === 0 ? "disabled" : "primary"}
                                // onClick={this.handleAddNewRef}
                            >
                                    OK
                             </NeoButton>}
                >
                    <NeoSelect
                        className={'select_option_tag'}
                        mode="multiple"
                        style={{ width: '500px' }}
                        placeholder="Please select"
                        width={'100%'}
                        defaultValue={[]}
                        showSearch={true}
                        maxTagCount={this.state.selectTags}
                        maxTagTextLength={7}
                        maxTagPlaceholder={`Еще...`}
                        onChange={(uriArray: string[], option: any) => {
                            const opt = option.map((o: any) => o.key);
                            this.setState({ selectedRefUries: opt })
                        }}
                        filterOption={(input:any, option:any) => {
                            function toString(el: any): string {
                                let result: string = "";
                                if (typeof el === "string") result = el;
                                else if (Array.isArray(el)) result = el.map((c:any)=>toString(c)).join(" ");
                                else if (el.children) result = toString(el.children);
                                else if (el.props) result = toString(el.props);
                                return result
                            }
                            const value = toString(option.props).toLowerCase();
                            const test = input.toLowerCase().split(/[,]+/).every((inputAnd:any)=>
                                inputAnd.trim().split(/[ ]+/).some((inputOr:any)=>
                                    value.indexOf(inputOr) >= 0));
                            return test;
                        }}
                        onDropdownVisibleChange={()=>this.setState({selectDropdownVisible: !this.state.selectDropdownVisible})}
                    >
                        {
                            this.state.mainEObject.eClass &&
                            (this.state.mainEObject.eResource().eContainer as Ecore.ResourceSet).elements()
                                .map((eObject: Ecore.EObject, index: number) => {
                                    const possibleTypes: Array<string> = this.state.addRefPossibleTypes;
                                    const isEObjectType: boolean = possibleTypes[0] === 'EObject';
                                    let isExcluded = false;
                                    for (const [key, value] of Object.entries(this.state.targetObject)) {
                                        if (key === this.state.addRefPropertyName && (value as any).find) {
                                            isExcluded = (value as any).find((p:any)=>p.$ref === eObject.eURI())
                                        }
                                    }
                                    return isEObjectType ?
                                        <NeoOption key={eObject.eURI()} value={eObject.eURI()}>
                                            {this.state.selectDropdownVisible ?
                                                eObject.eClass.get('name') + eObject.get('name')
                                                :
                                                <NeoHint title={`${eObject.eClass.get('name')} ${eObject.get('name')}`}>
                                                    {eObject.eClass.get('name') + eObject.get('name')}
                                                </NeoHint>
                                            }
                                        </NeoOption>
                                        :
                                        possibleTypes.includes(eObject.eClass.get('name')) &&
                                        !isExcluded &&
                                        <NeoOption key={eObject.eURI()} value={eObject.eURI()}>
                                            {this.state.selectDropdownVisible ?
                                                eObject.eClass.get('name') + eObject.get('name')
                                                :
                                                <NeoHint title={`${eObject.eClass.get('name')} ${eObject.get('name')}`}>
                                                    {eObject.eClass.get('name') + eObject.get('name')}
                                                </NeoHint>
                                            }
                                        </NeoOption>
                                })}
                    </NeoSelect>
                </NeoModal>}
                {this.state.modalResourceVisible && <NeoModal
                    type={"edit"}
                    className={"modal-add-resource"}
                    key="add_resource_modal"
                    width={'1000px'}
                    title={t('addresources')}
                    visible={this.state.modalResourceVisible}
                    footer={null}
                    // onCancel={this.handleResourceModalCancel}
                >
                    <SearchGrid
                        key="search_grid_resource"
                        onSelect={()=>{}}
                        // onSelect={this.handleAddNewResource}
                        showAction={false}
                        specialEClass={undefined}
                    />

                </NeoModal>}
                <NeoModal
                    key={"delete_resource_modal"}
                    // onCancel={this.handleDeleteResourceModalVisible}
                    closable={true}
                    type={'edit'}
                    content={t("are you sure want to delete resource?")}
                    title={t('deleteResource')}
                    visible={this.state.modalDeleteResourceVisible}
                    // onLeftButtonClick={this.delete}
                    // onRightButtonClick={this.handleDeleteResourceModalVisible}
                    textOfLeftButton={t("delete")}
                    textOfRightButton={t("cancel")}>
                </NeoModal>
                <NeoModal
                    key={"apply_changes_modal"}
                    className={"modal-apply-changes"}
                    // onCancel={this.handleApplyChangesModalCancel}
                    closable={true}
                    type={'edit'}
                    content={t("unresolved changes left")}
                    title={t('apply changes')}
                    visible={this.state.modalApplyChangesVisible}
                    // onLeftButtonClick={()=>this.save(true, false)}
                    // onRightButtonClick={this.handleApplyChangesModalCancel}
                    textOfLeftButton={t("apply and run")}
                    textOfRightButton={t("back to edit")}>
                </NeoModal>
                <EClassSelection
                    key="eclass_selection"
                    translate={t}
                    modalSelectEClassVisible={this.state.modalSelectEClassVisible}
                    setSelectEClassVisible={()=>{}}
                    // setSelectEClassVisible={this.setSelectEClassVisible}
                    onOk={(EClassObject: any) => {
                        const targetObject: { [key: string]: any } = this.state.targetObject;
                        const updatedJSON = targetObject.updater({
                            [this.state.addRefPropertyName]: {
                                $ref: EClassObject.eURI(),
                                eClass: EClassObject.eClass.eURI()
                            }
                        });
                        const updatedTargetObject = findObjectById(updatedJSON, targetObject._id);
                        this.setState({ resourceJSON: updatedJSON, targetObject: updatedTargetObject })
                    }}
                />
            </div>
        );
    }
}

export default withTranslation()(ResourceEditor);
