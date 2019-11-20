import React, { Fragment, useState } from 'react';
import { Modal, Dropdown, Menu, Button } from 'antd'
import Ecore from 'ecore';
import i18next from 'i18next';

import { API } from './../modules/api' 
import FormComponentMapper from './FormComponentMapper';

interface Props {
    translate: i18next.TFunction,
    EObject: Ecore.EObject,
}

export default function Operations(props: Props): JSX.Element {

    const t  = props.translate
    const [ paramModalVisible, setParamModalVisible ] = useState<boolean>(false)
    const [ targetOperationObject, setTargetOperationObject ] = useState<Ecore.EObject|null>(null)
    const [ parameters, setParameters ] = useState<Object>({})
    const [ methodName, setMethodName ] = useState<string>('')

    function runAction() {
        if(methodName){
            const ref = `${props.EObject.eResource().get('uri')}?rev=${props.EObject.eResource().rev}`;
            API.instance().call(ref, methodName, Object.values(parameters)).then(result => 
                console.log(result)
            )
            setParamModalVisible(false)
        }
    }

    function onMenuSelect(e:any){
        const operations = props.EObject.eClass.get('eOperations').array()
        const targetOperationObject = operations.find((op:any) => op.get('name') === e.key)
        if(targetOperationObject && targetOperationObject.get('eParameters').size() > 0){
            setParamModalVisible(true)
            setTargetOperationObject(targetOperationObject)
            setMethodName(e.key)
        }else{

        }
    }

    function onParameterChange(newValue: any, componentName: string, targetObject: any, EObject: Ecore.EObject){
        if (componentName === 'DatePickerComponent') {
            newValue = newValue ? newValue.format() : ''
        }
        setParameters({...parameters, [EObject.get('name')]: newValue })
    }

    function renderParameters() {
        const paramList: { [key: string]: any } = parameters
        return (
            targetOperationObject!.get('eParameters').map((param: Ecore.EObject, idx: number) => {
                const component = FormComponentMapper.getComponent({
                    idx: idx,
                    ukey: 'run',
                    eObject: param,
                    eType: param.get('eType'),
                    id: param.get('name'),
                    onChange: onParameterChange,
                    value: paramList[param.get('name')]
                })
                return (
                    <div style={{ marginBottom: '5px' }}>
                        <div style={{ marginBottom: '5px' }}>{param.get('name')}</div>{component}
                    </div>
                )
            })
        )
    }

    function renderMenu(){
        const menu = () => {
            return <Menu onClick={onMenuSelect}> 
                {props.EObject.eClass.get('eOperations').map((oper: Ecore.EObject)=>{
                    return <Menu.Item key={oper.get('name')}>
                        {oper.get('name')}
                    </Menu.Item>
                })}
            </Menu>
        }

        return <Dropdown placement="bottomCenter" overlay={menu}>
            <Button className="panel-button" icon="bulb" />
        </Dropdown>
    }

    return (
        <Fragment>
            {props.EObject.eClass && props.EObject.eClass.get('eOperations').size() > 0 && renderMenu()}
            {paramModalVisible && <Modal
                key="run_param_modal"
                width={'500px'}
                title={t('runparameters')}
                visible={paramModalVisible}
                onCancel={()=>setParamModalVisible(false)}
                onOk={() => {
                    setParamModalVisible(false)
                    runAction()
                }}
                footer={<Button type="primary" onClick={runAction}>{t('run')}</Button>}
            >
                {renderParameters()}
            </Modal>}
        </Fragment>
    )

}