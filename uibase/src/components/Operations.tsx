import React, {Fragment, useState} from 'react';
import {Button, Dropdown, Menu, Modal, Select} from 'antd'
import Ecore from 'ecore';

import {API} from '../modules/api'
import FormComponentMapper from './FormComponentMapper';
import {TFunction} from 'i18next';
import {getFieldAnnotationByKey} from "../utils/eCoreUtil";
import {NeoButton, NeoHint, NeoSelect} from "neo-design/lib";
import {IMainContext} from "../MainContext";
import {NeoIcon} from "neo-icon/lib";

interface Props {
    translate: TFunction,
    save: (redirectAfterSave:boolean, saveAndExit:boolean, callback?:Function) => void,
    edit: boolean,
    mainEObject: Ecore.EObject,
    refresh: (refresh: boolean) => void;
    notification: IMainContext['notification'];
}


export default function Operations(props: Props): JSX.Element {

    const t  = props.translate;
    const refresh = props.refresh;
    const notification = props.notification;
    const [ paramModalVisible, setParamModalVisible ] = useState<boolean>(false);
    const [ refModalVisible, setRefModalVisible ] = useState<boolean>(false);
    const [ selectedRefUries, setSelectedRefUries ] = useState<string[]>([]);
    const [ addRefPossibleTypes, setAddRefPossibleTypes ] = useState<string[]>([]);
    const [ addRefProperty, setAddRefProperty ] = useState<string>('');
    const [ targetOperationObject, setTargetOperationObject ] = useState<Ecore.EObject|null>(null);
    const [ parameters, setParameters ] = useState<Object>({});
    const [ methodName, setMethodName ] = useState<string>('');

    function runAction(methodName: string, eOperation: Ecore.EObject|null = null) {
        if (!props.edit) {
            notification!(t('notification'), t("edit resource first"), "info")
        } else {
            const paramList:{[key: string]: any} = parameters;
            const targetOperation = eOperation || targetOperationObject;
            if (methodName){
                props.save(false, false, () => {
                    const ref = `${props.mainEObject.eResource().get('uri')}?rev=${props.mainEObject.eResource().rev}`;
                    API.instance().call(ref, methodName, targetOperation!.get('eParameters').map((p: any)=>paramList[p.get('name')])).then(result => {
                        const obj = JSON.parse(result);
                        let key;
                        if (JSON.stringify(obj, null, 4).length > 1000) {
                            key = JSON.stringify(obj, null, 4).slice(0, 1000) + "..."
                        } else {
                            key = JSON.stringify(obj, null, 4)
                        }
                        notification!(t('notification'), key.split('\\n').join('\n'), "info");
                        refresh(true)
                    }).catch(()=> refresh(false));
                    setParamModalVisible(false)
                })
            }
        }
    }

    function eAllOperations(eClass: Ecore.EClass): any[] {
        var eOperations = eClass.get('eOperations').array().filter((o: Ecore.EObject)=>getFieldAnnotationByKey(o.get('eAnnotations'), 'invisible') !== 'true');
        var superTypes = eClass.get('eAllSuperTypes');
        return (eOperations || []).concat((superTypes || []).flatMap((c: Ecore.EClass)=>eAllOperations(c)))
    }

    function onMenuSelect(e:any){
        const operations = eAllOperations(props.mainEObject.eClass);
        const eOperation = operations.find((op:any) => op.get('name') === e.key);
        if(eOperation) {
            setTargetOperationObject(eOperation);
            if(eOperation.get('eParameters').size() > 0){
                setParamModalVisible(true);
                setMethodName(e.key)
            } else {
                runAction(e.key, eOperation)
            }

        }
    }

    function handleDeleteRef(deletedObject: any, propertyName: string) {
        //TODO: test!
        console.log(deletedObject);
        const paramList:{[key: string]: any} = parameters;
        const filteredParameters = paramList[propertyName].filter((refObj: any) => refObj.$ref !== deletedObject.$ref);
        setParameters({ ...parameters, [propertyName]: filteredParameters })
    }

    function handleDeleteSingleRef(deletedObject: any, propertyName: string) {
        //TODO: test!
        const paramList: {[key: string]: any} = { ...parameters };
        delete paramList[propertyName];
        setParameters(paramList)
    }

    function handleAddNewRef() {
        const resources: any = [];
        let refsArray: Array<Object> = [];
        props.mainEObject.eContents().forEach((res: { [key: string]: any }) => {
            const isFound = selectedRefUries.indexOf(res.eURI() as never);
            isFound !== -1 && resources.push(res)
        });

        if (resources.length > 0) {
            if (targetOperationObject!.get('upperBound') === -1) {
                resources.forEach((res:any) => {
                    refsArray.push({
                        $ref: res.eContents()[0].eURI(),
                        eClass: res.eContents()[0].eClass.eURI()
                    })
                });
                setParameters({
                    ...parameters, 
                    [addRefProperty]: refsArray
                })
            } else {
                const firstResource = resources.find((res: Ecore.Resource) => res.eURI() === selectedRefUries[0]);
                //if a user choose several resources for the adding, but upperBound === 1, we put only first resource
                setParameters({
                    ...parameters, 
                    [addRefProperty]: {
                        $ref: firstResource!.eURI(),
                        eClass: firstResource!.eClass.eURI()
                    } 
                })
            }
        }
        setRefModalVisible(false)
    }

    function onBrowse(EObject: Ecore.EObject){
        const addRefPossibleTypes = [];
        if (EObject.get('name') === "parameters"){
            addRefPossibleTypes.push("//QueryParameter");
        }
        else if (EObject.get('name') === "filters"){
            addRefPossibleTypes.push("//QueryFilter");
        }
        else if (EObject.get('name') === "aggregations"){
            addRefPossibleTypes.push("//QueryAggregate");
        }
        else if (EObject.get('name') === "sorts"){
            addRefPossibleTypes.push("//QuerySort");
        }
        else if (EObject.get('name') === "groupBy"){
            addRefPossibleTypes.push("//QueryGroupBy");
        }
        else if (EObject.get('name') === "CalculatedExpression"){
            addRefPossibleTypes.push("//QueryCalculatedExpression");
        }
        else if (EObject.get('name') === "groupByColumn"){
            addRefPossibleTypes.push("//QueryGroupByColumn");
        }
        /*EObject.get('eType').get('eAllSubTypes').forEach((subType: Ecore.EObject) =>
            addRefPossibleTypes.push(subType.get('name'))
        );*/
        setRefModalVisible(true);
        setAddRefProperty(EObject.get('name'));
        setAddRefPossibleTypes(addRefPossibleTypes)
    }

    function onParameterChange(newValue: any, componentName: string, targetObject: any, EObject: Ecore.EObject){
        // if (componentName === 'DatePickerComponent') {
        //     newValue = newValue ? newValue.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : ''
        // }
        setParameters({...parameters, [EObject.get('name')]: newValue })
    }

    function renderParameters() {
        const paramList: { [key: string]: any } = parameters;
        return (
            targetOperationObject!.get('eParameters').map((param: Ecore.EObject, idx: number) => {
                const component = FormComponentMapper.getComponent({
                    idx: idx,
                    ukey: 'run',
                    eObject: param,
                    eType: param.get('eType'),
                    id: param.get('name'),
                    onChange: onParameterChange,
                    value: paramList[param.get('name')],
                    upperBound: targetOperationObject!.get('upperBound'),
                    mainEObject: props.mainEObject,
                    onBrowse: onBrowse,
                    onEClassBrowse: onBrowse,
                    handleDeleteSingleRef: handleDeleteSingleRef,
                    handleDeleteRef: handleDeleteRef,
                    edit: true
                });
                return (
                    <div style={{ marginBottom: '5px' }}>
                        <div style={{ marginBottom: '5px' }}>{param.get('name')}</div>{component}
                    </div>
                )
            })
        )
    }

    function renderMenu(){
        const menu = (
            <Menu onClick={onMenuSelect}>
                {eAllOperations(props.mainEObject.eClass).map((oper: Ecore.EObject)=>{
                   return <Menu.Item key={oper.get('name')}>
                        <NeoHint placement={"right"} title={getFieldAnnotationByKey(oper.get('eAnnotations'), "documentation")}>{t(oper.get('name'))}</NeoHint>
                    </Menu.Item>
                })}
            </Menu>)
        return <Dropdown overlay={menu}>
                        <NeoButton className="panel-button"
                            type={"ghost-icon"}
                            title={t("operations")}
                           titlePos={'left'}
                     >
                            <NeoIcon icon={"lightbulbt"}/>
                        </NeoButton>
            </Dropdown>
    }

    return (
        <Fragment>
            {props.mainEObject.eClass && eAllOperations(props.mainEObject.eClass).length > 0 && renderMenu()}
            {paramModalVisible && <Modal
                key="run_param_modal"
                width={'500px'}
                title={t('operationsettings')}
                visible={paramModalVisible}
                onCancel={()=>setParamModalVisible(false)}
                onOk={() => {
                    setParamModalVisible(false);
                    runAction(methodName, targetOperationObject)
                }}
            >
                {renderParameters()}
            </Modal>}
            {refModalVisible && <Modal
                    key="add_ref_modal"
                    width={'700px'}
                    title={t('addreference')}
                    visible={refModalVisible}
                    onCancel={()=>setRefModalVisible(false)}
                    footer={selectedRefUries.length > 0 ? 
                        <NeoButton type="primary" onClick={handleAddNewRef}>OK</NeoButton>: null}
                >
                    <NeoSelect
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        defaultValue={[]}
                        onChange={(uriArray: string[]) => {
                            setSelectedRefUries(uriArray)
                        }}
                    >
                        {props.mainEObject.eClass && props.mainEObject.eContents().map((res: { [key: string]: any }, index: number) => {
                            const possibleTypes: Array<string> = addRefPossibleTypes;
                            const isEObjectType: boolean = possibleTypes[0] === 'EObject';
                            return isEObjectType ?
                                <Select.Option key={index} value={res.eURI()}>
                                    {<b>
                                        {`${res.eClass.get('name')}`}
                                    </b>}
                                    &nbsp;
                                    {`${res.eClass.get('name')}`}
                                </Select.Option>
                                :
                                possibleTypes.includes(res.eClass._id) && <Select.Option key={index} value={res.eURI()}>
                                    {<b>
                                        {`${res.eClass.get('name')}`}
                                    </b>}
                                    &nbsp;
                                    {`${res.eClass.get('name')}`}
                                </Select.Option>
                        })}
                    </NeoSelect>
                </Modal>}
        </Fragment>
    )

}
