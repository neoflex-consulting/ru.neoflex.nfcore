import React, {Fragment, useEffect, useState} from 'react';
import Ecore from 'ecore';
import {Button, DatePicker, Input, Select} from 'antd';
import moment from 'moment';

import {boolSelectionOption, convertPrimitiveToString} from './../utils/resourceEditorUtils';
import {NeoButton, NeoModal, NeoTag} from "neo-design/lib";
import './../styles/ComponentMapper.css'
import {NeoIcon} from "neo-icon/lib";
import AceEditor from "react-ace";
import 'brace/mode/sql';
import 'brace/mode/groovy';
import {neoIconMap} from "../utils/consts";
import {SvgName} from "neo-icon/lib/icon/icon";

interface EditableSQLAreaProps {
    value: string,
    onChange?: Function,
    ukey?: string,
    edit?: boolean,
    syntax: "sql"|"groovy",
    expanded?: boolean
}

function EditableSyntaxArea(props: EditableSQLAreaProps): JSX.Element {

    const { value, ukey, onChange, edit, syntax, expanded } = props;
    const [innerValue, setInnerValue] = useState(value);

    useEffect(() => {
        setInnerValue(value)
    },[value]);

    return (
        <AceEditor
            readOnly={!edit}
            key={ukey}
            width={"100%"}
            className={`${!edit ? "disabled" : undefined} editable-syntax-area`}
            mode={syntax}
            theme={"tomorrow"}
            onChange={(text: string) => {
                setInnerValue(text)
            }}
            editorProps={{$blockScrolling: true}}
            value={innerValue}
            onBlur={() => {
                onChange && onChange!(innerValue)
            }}
            showPrintMargin={false}
            enableBasicAutocompletion={true}
            minLines={3}
            maxLines={!expanded ? 10 : undefined}
        />
    )

}

interface EditableTextAreaProps {
    value: any,
    property?: string,
    onChange?: Function,
    type: any,
    idx?: number,
    ukey?: string,
    edit?: boolean,
    expanded?: boolean
}

function EditableTextArea(props: EditableTextAreaProps): JSX.Element {
    const TextArea = Input.TextArea;
    const Password = Input.Password;

    const types: { [key: string]: any } = {
        text: TextArea,
        password: Password
    };

    const InputComponent = types[props.type];

    const { value, idx, ukey, onChange, edit, expanded } = props;
    const [innerValue, setInnerValue] = useState(value);

    useEffect(() => {
        setInnerValue(value)
    },[value]);

    return (
        <Fragment key="editableTextArea">
            {edit ?
                <InputComponent
                    key={`textedit_${ukey}${idx}`}
                    style={{ resize: 'none' }}
                    autoSize={{ maxRows: expanded ? null : 10 }}
                    value={innerValue}
                    onChange={(e: any) => {
                        setInnerValue(e.target.value)
                    }}
                    onBlur={(e: any) => {
                        onChange && onChange!(e)
                    }}
                />
                :
                <InputComponent
                    disabled
                    key={`textview_${ukey}${idx}`}
                    autosize={{ maxRows: expanded ? null : 10 }}
                    value={value}
                    style={{
                        whiteSpace: 'pre',
                        overflow: 'auto',
                        resize: 'none'
                    }}
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
    eObject: Ecore.EObject,
    handleDeleteRef?: Function,
    handleDeleteSingleRef?: Function,
    onEClassBrowse?: Function,
    onBrowse?: Function,
    upperBound: number,
    edit?: boolean
}

function SelectRefObject(props: SelectRefObjectProps): JSX.Element {
    const { eObject, upperBound, value, mainEObject, idx, ukey, edit } = props

    const getRelatedResourceByRef = (reference: string) => {
        const refObject = (mainEObject.eResource().eContainer as Ecore.ResourceSet).elements()
            .find((object: Ecore.EObject) => object.eURI() === reference || object._id === reference)

        return refObject || null
    }

    const relatedResource = value && value.$ref && getRelatedResourceByRef(value!.$ref)
    const elements = value && value !== null ?
        upperBound === -1 ? (value.length !== 0?
            value.map((el: { [key: string]: any }, idx: number) =>
                <NeoTag
                    className={`${!edit ? "disabled" : undefined} select-ref-object`}
                    onClose={(e: any) => {
                        props.handleDeleteRef && props.handleDeleteRef!(el, eObject.get('name'))
                    }}
                    closable={edit}
                    key={el["$ref"]}
                >
                    {getRelatedResourceByRef(el.$ref) && getRelatedResourceByRef(el.$ref)!.get('name')}&nbsp;
                    {getRelatedResourceByRef(el.$ref) && getRelatedResourceByRef(el.$ref)!.eClass.get('name')}&nbsp;
                </NeoTag>) : [])
            :
            <NeoTag
                className={`${!edit ? "disabled" : undefined} select-ref-object`}
                onClose={(e: any) => {
                    props.handleDeleteSingleRef && props.handleDeleteSingleRef!(value, eObject.get('name'))
                }}
                closable={edit}
                key={value["$ref"]}
            >
                {(relatedResource && relatedResource.get('name')) || (value.$ref && value.$ref.split('//')[1])}&nbsp;
                {(relatedResource && relatedResource.eClass.get('name')) || (value.eClass && value.eClass.split('//')[2])}&nbsp;
            </NeoTag>
        :
        []
    const component = <React.Fragment key={ukey + "_" + idx}>
        {elements}
        {eObject.get('eType').get('name') === 'EClass' ?
            <Button 
                style={{ display: "inline-block" }} 
                key={ukey + "_" + idx} 
                onClick={() => {
                    props.onEClassBrowse && props.onEClassBrowse!(eObject)
                }}
                disabled={!edit}
            >...</Button>
            :
            <Button 
                style={{ display: "inline-block" }} 
                key={ukey + "_" + idx} 
                onClick={() => {
                    props.onBrowse && props.onBrowse!(eObject)
                }}
                disabled={!edit}
            >...</Button>
        }
    </React.Fragment>
    return component
}

interface BooleanSelectProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    edit?: boolean
}

function BooleanSelect(props: BooleanSelectProps): JSX.Element {
    const { value, idx, ukey, onChange, edit } = props

    return <Select
        value={convertPrimitiveToString(value)}
        key={`boolsel_${ukey}${idx}`}
        style={{ width: "300px" }}
        onChange={(newValue: any) => {
            onChange && onChange!(newValue)
        }}
        disabled={!edit}
    >
        {Object.keys(boolSelectionOption).map((value: any) =>
            value !== "undefined" && value !== "null" && <Select.Option key={ukey + "_" + value + "_" + idx} value={value}>{value}</Select.Option>)}
    </Select>
}

interface DatePickerComponentProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    edit?: boolean
}

function DatePickerComponent(props: DatePickerComponentProps): JSX.Element {
    const { value, idx, ukey, onChange, edit } = props

    return (
        <DatePicker
            showTime
            key={ukey + "_date_" + idx}
            defaultValue={moment(value)}
            onChange={(newValue: any) => {
                onChange && onChange!(newValue)
            }}
            disabled={!edit}
        />
    )
}

interface SelectComponentProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    eType: any,
    upperBound: number,
    id: string,
    edit?: boolean,
    showIcon?: boolean
}

function SelectComponent(props: SelectComponentProps): JSX.Element {

    const { eType, value, idx, ukey, onChange, upperBound, id, edit, showIcon } = props;

    return (
        <Select
            className={"select-component"}
            mode={upperBound === -1 ? "multiple" : "default"}
            value={value}
            key={ukey + "_" + idx}
            style={{ width: "300px" }}
            onChange={(newValue: any) => {
                onChange && onChange!(newValue)
            }}
            disabled={!edit}
        >
            {eType.eContents()
                .filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations")
                .sort(function(a : Ecore.EObject, b : Ecore.EObject) {
                    if(a.get('name').toLowerCase() < b.get('name').toLowerCase()) return -1;
                    if(a.get('name').toLowerCase() > b.get('name').toLowerCase()) return 1;
                    return 0;
                })
                .map((obj: Ecore.EObject) =>
                <Select.Option key={ukey + "_opt_" + obj.get('name') + "_" + id} value={obj.get('name')}>
                    <div style={{display:"flex", alignItems: "center"}}>{showIcon && <NeoIcon style={{marginRight:"8px"}} icon={neoIconMap[obj.get('name')] as SvgName}/>}{obj.get('name')}</div>
                </Select.Option>)}
        </Select>
    )
}


interface SelectComponentPropsForhightLight {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    mainObject: any,
    upperBound: number,
    id: string,
    edit?: boolean,
    showIcon?: boolean
}

function SelectComponentForhightLight(props: SelectComponentPropsForhightLight): JSX.Element {

    const { mainObject, value, idx, ukey, onChange, upperBound, id, edit, showIcon } = props;

    return (
        <Select
            className={"select-component"}
            mode={upperBound === -1 ? "multiple" : "default"}
            value={value}
            key={ukey + "_" + idx}
            style={{ width: "300px" }}
            onChange={(newValue: any) => {
                onChange && onChange!(newValue)
            }}
            disabled={!edit}
        >
            {mainObject.values.column._internal
                .filter((obj: any) => obj.values.hide !== true)
                .sort(function(a : any, b : any) {
                    if(a.values.name.toLowerCase() < b.values.name.toLowerCase()) return -1;
                    if(a.values.name.toLowerCase() > b.values.name.toLowerCase()) return 1;
                    return 0;
                })
                .map((obj: any) =>
                    <Select.Option key={ukey + "_opt_" + obj.values.name + "_" + id} value={obj.values.name}>
                        <div style={{display:"flex", alignItems: "center"}}>{showIcon && <NeoIcon style={{marginRight:"8px"}} icon={neoIconMap[obj.values.name] as SvgName}/>}{obj.values.name}</div>
                    </Select.Option>)}
        </Select>
    )
}


interface TagComponentProps {
    value: any,
    onChange?: Function,
    idx?: number,
    ukey?: string,
    eType: any,
    id: string,
    edit?: boolean,
}

function TagComponent(props: TagComponentProps): JSX.Element {

    const { eType, value, idx, ukey, onChange, id, edit } = props;

    return (
        <Select
            mode={"tags"}
            value={value}
            key={ukey + "_" + idx}
            style={{ width: "300px" }}
            onChange={(newValue: any) => {
                onChange && onChange!(newValue)
            }}
            disabled={!edit}
        >
            {eType.eContents()
                .filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations")
                .map((obj: Ecore.EObject) =>
                <Select.Option key={ukey + "_opt_" + obj.get('name') + "_" + id} value={obj.get('name')}>{obj.get('name')}</Select.Option>)}
        </Select>
    )
}


interface ExpandComponentProps {
    expandedComponent: JSX.Element,
    children: JSX.Element
}

function ExpandComponent(props: ExpandComponentProps): JSX.Element {

    const { expandedComponent, children } = props;
    const [expanded, setExpanded] = useState(false);

    return <div key={"expandComponentContainer"} className={"expand-component-container"}>
        {children}
        <NeoButton type={"link"} onClick={()=>setExpanded(!expanded)}><NeoIcon icon={"search"}/></NeoButton>
        {expanded && <NeoModal
            type={'edit'}
            width={'1000px'}
            className={"expand-modal"}
            key={`ExpandModal`}
            visible={expanded}
            footer={null}
            onCancel={()=>setExpanded(!expanded)}
        >
            {expandedComponent}
        </NeoModal>}
    </div>
}

interface Props {
    value: any,
    targetObject?: { [key: string]: any },
    eObject: Ecore.EObject,
    eType: any,
    onChange?: Function,
    type?: string,
    idx?: number,
    ukey?: string,
    id?: string,
    edit?: boolean,
    expanded?: boolean,
    syntax?: string,
    showIcon?: boolean,
}

export default class ComponentMapper extends React.Component<Props, any> {

    static getComponentWrapper(props: {type:"expand", wrappedComponent: JSX.Element, expandedComponent:JSX.Element}) {
        const { type, wrappedComponent, expandedComponent} = props;
        if (type === "expand") {
            return <ExpandComponent
                expandedComponent={expandedComponent}>
                {wrappedComponent}
            </ExpandComponent>
        }
    }

    static getComponent(props: any) {
        const { targetObject, eObject, eType, value, ukey, idx, edit, expanded, syntax, showIcon } = props;
        const targetValue = value || props.eObject.get('defaultValueLiteral');
        if (syntax) {
            return <EditableSyntaxArea
                ukey={ukey}
                value={targetValue||""}
                edit={edit}
                syntax={syntax}
                expanded={expanded}
                onChange={(text: string) => props.onChange && props.onChange!(text, 'EditableTextArea', targetObject, props.eObject)}
            />
        }

        if ((eObject && eObject.isKindOf('EReference')) || (eType.eClass && eType.eClass.get('name') === 'EClass')) {
            return <SelectRefObject
                idx={idx}
                ukey={ukey}
                value={targetValue}
                eObject={props.eObject}
                mainEObject={props.mainEObject}
                handleDeleteRef={props.handleDeleteRef}
                handleDeleteSingleRef={props.handleDeleteSingleRef}
                onEClassBrowse={props.onEClassBrowse}
                onBrowse={props.onBrowse}
                upperBound={props.upperBound}
                edit={edit}
            />
        } else if (eType && eType.isKindOf('EDataType') && eType.get('name') === "EBoolean") {
            return <BooleanSelect
                idx={idx}
                ukey={ukey}
                value={targetValue}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'BooleanSelect', targetObject, eObject)
                }}
                edit={edit}
            />
        } else if (eType && eType.isKindOf('EDataType') && eType.get('name') === "Timestamp") {
            return <DatePickerComponent
                idx={idx}
                ukey={ukey}
                value={targetValue}
                onChange={(newValue: any) => props.onChange && props.onChange!(newValue && newValue.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'), 'DatePickerComponent', targetObject, props.eObject)}
                edit={edit}
            />
        } else if (eType && eType.isKindOf('EDataType') && eType.get('name') === "Date") {
            return <DatePickerComponent
                idx={idx}
                ukey={ukey}
                value={targetValue}
                onChange={(newValue: any) => props.onChange && props.onChange!(newValue && newValue.format('YYYY-MM-DD'), 'DatePickerComponent', targetObject, props.eObject)}
                edit={edit}
            />
        } else if (eType && eType.isKindOf('EDataType') && eType.get('name') === "Password") {
            return <EditableTextArea
                idx={idx}
                ukey={ukey}
                value={targetValue}
                onChange={(e: any) => props.onChange && props.onChange!(e.target.value, 'EditableTextArea', targetObject, props.eObject)}
                type="password"
                edit={edit}
            />
        } else if (eType && eType.isKindOf('EEnum')) {
            return <SelectComponent
                idx={idx}
                ukey={ukey}
                value={targetValue || (eType.eContents()[0] && eType.eContents()
                    .filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations")[0].get('name'))}
                eType={eType}
                id={props.id}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'SelectComponent', targetObject, eObject)
                }}
                upperBound={props.upperBound}
                edit={edit}
                showIcon={showIcon}
            />
        }else if (props.mainEObject &&  props.mainEObject.eClass._id === "//DatasetComponent" && eObject && (eObject.values.name === "datasetColumn"||eObject.values.name === "datasetColumnTooltip")) {
            return <SelectComponentForhightLight
                idx={idx}
                ukey={ukey}
                value={targetValue || (eType.eContents()[0] && eType.eContents()
                    .filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations")[0].get('name'))}
                mainObject={props.mainEObject}
                id={props.id}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'SelectComponent', targetObject, eObject)
                }}
                upperBound={props.upperBound}
                edit={edit}
                showIcon={showIcon}/>
        }
        else if (eType && eType.isKindOf('EDataType') && eType.get('name') === 'EString' && eObject.get('upperBound') === -1) {
            return <TagComponent
                idx={idx}
                ukey={ukey}
                value={targetValue || (eType.eContents()[0] && eType.eContents()
                    .filter((obj: Ecore.EObject) => obj.eContainingFeature.get('name') !== "eAnnotations")[0].get('name'))}
                eType={eType}
                id={props.id}
                onChange={(newValue: any) => {
                    props.onChange && props.onChange!(newValue, 'SelectComponent', targetObject, eObject)
                }}
                edit={edit}
            />
        } else {
            return <EditableTextArea
                idx={idx}
                ukey={ukey}
                value={targetValue}
                onChange={(e: any) => props.onChange && props.onChange!(e.target.value, 'EditableTextArea', targetObject, props.eObject)}
                type="text"
                edit={edit}
                expanded={expanded}
            />
        }
    }

}
