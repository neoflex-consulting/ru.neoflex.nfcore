import React, { useState, Fragment } from 'react';
import Ecore from 'ecore';
import { Input, Tag, Button, Select, DatePicker } from 'antd';
import moment from 'moment';

import { boolSelectionOption, convertPrimitiveToString } from './../utils/resourceEditorUtils';


interface EditableTextAreaProps {
    value: any,
    property?: string,
    onChange?: Function,
    type: any,
    EObject?: Ecore.EObject,
    idx?: number,
    ukey?: string
}

function EditableTextArea(props: EditableTextAreaProps): JSX.Element {
    const TextArea = Input.TextArea
    const Password = Input.Password

    const types: { [key: string]: any } = {
        text: TextArea,
        password: Password
    }

    const splitedString = props.value ? props.value.split('\n') : []
    const lines = splitedString.length
    const InputComponent = types[props.type];
    const [isEdited, setIsEdited] = useState<boolean>(false);

    const { value, idx, ukey, onChange } = props

    return (
        <Fragment key="editableTextArea">
            {isEdited ?
                <InputComponent autoFocus
                    key={`textedit_${ukey}${idx}`}
                    style={{ resize: 'none' }}
                    autosize={{ maxRows: lines <= 15 ? lines + 1.5 : 15 }}
                    defaultValue={value}
                    onBlur={(e: any) => {
                        onChange && onChange!(e)
                    }}
                />
                :
                <InputComponent readOnly
                    key={`textview_${ukey}${idx}`}
                    autosize={{ maxRows: lines <= 15 ? lines + 1.5 : 15 }}
                    value={value}
                    style={{
                        whiteSpace: 'pre',
                        overflow: 'auto',
                        resize: 'none'
                    }}
                    onClick={() => setIsEdited(true)}
                />}
        </Fragment>
    )

}

interface SelectRefObjectProps {
    value: any,
    idx?: number,
    ukey?: string,
    //the main object, where a sub EObject was retrived from.
    mainEObject: Ecore.EObject,
    EObject: Ecore.EObject,
    handleDeleteRef?: Function,
    handleDeleteSingleRef?: Function,
    onEClassBrowse?: Function,
    onBrowse?: Function
}

function SelectRefObject(props: SelectRefObjectProps): JSX.Element {
    const { EObject, value, mainEObject, idx, ukey } = props

    const getRelatedResourceByRef = (reference: string) => {
        const refObject = mainEObject.eResource().eContainer.get('resources')
            .find((res: Ecore.Resource) => res.eContents()[0].eURI() === reference)

        return (refObject && refObject.eContents()[0]) || null
    }

    const relatedResource = value && value.$ref && getRelatedResourceByRef(value!.$ref)
    const elements = value ?
        EObject.get('upperBound') === -1 ?
            value.map((el: { [key: string]: any }, idx: number) =>
                <Tag
                    onClose={(e: any) => {
                        props.handleDeleteRef && props.handleDeleteRef!(el, EObject.get('name'))
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
                    props.handleDeleteSingleRef && props.handleDeleteSingleRef!(value, EObject.get('name'))
                }}
                closable
                key={value["$ref"]}
            >
                {(relatedResource && relatedResource.get('name')) || (value.$ref && value.$ref.split('//')[1])}&nbsp;
                {(relatedResource && relatedResource.eClass.get('name')) || (value.eClass && value.eClass.split('//')[2])}&nbsp;
            </Tag>
        :
        []
    const component = <React.Fragment key={ukey + "_" + idx}>
        {elements}
        {EObject.get('eType').get('name') === 'EClass' ?
            <Button 
                style={{ display: "inline-block" }} 
                key={ukey + "_" + idx} 
                onClick={() => {
                    props.onEClassBrowse && props.onEClassBrowse!(EObject)
                }}
            >...</Button>
            :
            <Button 
                style={{ display: "inline-block" }} 
                key={ukey + "_" + idx} 
                onClick={() => {
                    props.onBrowse && props.onBrowse!(EObject)
                }}
            >...</Button>
        }
    </React.Fragment>
    return component
}

interface BooleanSelectProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string
}

function BooleanSelect(props: BooleanSelectProps): JSX.Element {
    const { value, idx, ukey, onChange } = props

    return <Select
        value={convertPrimitiveToString(value)}
        key={`boolsel_${ukey}${idx}`}
        style={{ width: "300px" }}
        onChange={(newValue: any) => {
            onChange && onChange!(newValue)
        }}
    >
        {Object.keys(boolSelectionOption).map((value: any) =>
            value !== "undefined" && <Select.Option key={ukey + "_" + value + "_" + idx} value={value}>{value}</Select.Option>)}
    </Select>
}

interface DatePickerComponentProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
}

function DatePickerComponent(props: DatePickerComponentProps): JSX.Element {
    const { value, idx, ukey, onChange } = props

    return (
        <DatePicker
            showTime
            key={ukey + "_date_" + idx}
            defaultValue={moment(value)}
            onChange={(newValue: any) => {
                onChange && onChange!(newValue)
            }}
        />
    )
}

interface SelectComponentProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    EObject: Ecore.EObject,
    targetObject: { [key: string]: any }
}

function SelectComponent(props: SelectComponentProps): JSX.Element {

    const { EObject, value, idx, ukey, targetObject, onChange } = props

    return (
        <Select mode={EObject.get('upperBound') === -1 ? "multiple" : "default"} value={value} key={ukey + "_" + idx} style={{ width: "300px" }} onChange={(newValue: any) => {
            onChange && onChange!(newValue)
        }}>
            {EObject.get('eType').eContents().map((obj: Ecore.EObject) =>
                <Select.Option key={ukey + "_opt_" + obj.get('name') + "_" + targetObject.id} value={obj.get('name')}>{obj.get('name')}</Select.Option>)}
        </Select>
    )
}


interface Props {
    value: any,
    targetObject?: { [key: string]: any },
    EObject: Ecore.EObject,
    onChange?: Function,
    type?: string,
    idx?: number,
    ukey?: string
}

export default class ComponentMapper extends React.Component<Props, any>{

    static getComponent(props: any) {
        const { targetObject, EObject, value, ukey, idx } = props
        if (EObject.isKindOf('EReference')) {
            return <SelectRefObject
                idx={idx}
                ukey={ukey}
                value={value}
                EObject={props.EObject}
                mainEObject={props.mainEObject}
                handleDeleteRef={props.handleDeleteRef}
                handleDeleteSingleRef={props.handleDeleteSingleRef}
                onEClassBrowse={props.onEClassBrowse}
                onBrowse={props.onBrowse}
            />
        } else if (EObject.get('eType') && EObject.get('eType').isKindOf('EDataType') && EObject.get('eType').get('name') === "EBoolean") {
            return <BooleanSelect
                idx={idx}
                ukey={ukey}
                value={value}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'BooleanSelect', targetObject, EObject)
                }}
            />
        } else if (EObject.get('eType') && EObject.get('eType').isKindOf('EDataType') && EObject.get('eType').get('name') === "Timestamp") {
            return value
        } else if (EObject.get('eType') && EObject.get('eType').isKindOf('EDataType') && EObject.get('eType').get('name') === "Date") {
            return <DatePickerComponent
                idx={idx}
                ukey={ukey}
                value={value}
                onChange={(newValue: any) => props.onChange && props.onChange!(newValue, 'DatePickerComponent', props.targetObject, props.EObject)}
            />
        } else if (EObject.get('eType') && EObject.get('eType').isKindOf('EDataType') && EObject.get('eType').get('name') === "Password") {
            return <EditableTextArea
                idx={idx}
                ukey={ukey}
                value={value}
                onChange={(e: any) => props.onChange && props.onChange!(e.target.value, 'EditableTextArea', props.targetObject, props.EObject)}
                type="text"
            />
        } else if (EObject.get('eType') && EObject.get('eType').isKindOf('EEnum')) {
            return <SelectComponent
                idx={idx}
                ukey={ukey}
                value={value}
                EObject={EObject}
                targetObject={targetObject}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'SelectComponent', targetObject, EObject)
                }}
            />
        } else {
            return <EditableTextArea
                idx={idx}
                ukey={ukey}
                value={value}
                onChange={(e: any) => props.onChange && props.onChange!(e.target.value, 'EditableTextArea', props.targetObject, props.EObject)}
                type="text"
            />
        }
    }

}
