import {Component, View, ViewFactory} from './View'
import Ecore, {EList, EObject} from 'ecore';
import * as React from 'react';
import {Col, Collapse, ConfigProvider, Drawer, Form, Input, InputNumber, Row, Select} from 'antd';

import DatasetView from './components/app/dataset/DatasetView';
import MasterdataEditor from './components/app/masterdata/MasterdataEditor';
import {API} from './modules/api';
import {WithTranslation} from 'react-i18next';
import {docxElementExportType, docxExportObject} from "./utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "./utils/excelExportUtils";
import Calendar from "./components/app/calendar/Calendar";
import moment from 'moment';
import {IAction, IEventAction} from "./MainContext";
import DOMPurify from 'dompurify'
import {getNamedParamByName, getNamedParams, replaceNamedParam} from "./utils/namedParamsUtils";
import {
    actionType,
    contextStringSeparator,
    defaultDateFormat,
    defaultTimestampFormat,
    eventType,
    grantType,
    positionEnum
} from "./utils/consts";
import {getUrlParam} from "./utils/urlUtils";
import {saveAs} from "file-saver";
import {switchAntdLocale} from "./utils/antdLocalization";
import {NeoButton, NeoDatePicker, NeoInput, NeoParagraph, NeoTabs} from "neo-design/lib";
import _ from "lodash";
import {NeoIcon} from "neo-icon/lib";
import {SvgName} from "neo-icon/lib/icon/icon";

const marginBottom = '20px';

let startResource: Object;

export enum AntdFactoryClasses {
    Column='ru.neoflex.nfcore.application#//Column',
    Form='ru.neoflex.nfcore.application#//Form',
    TabsViewReport='ru.neoflex.nfcore.application#//TabsViewReport',
    DatasetView='ru.neoflex.nfcore.application#//DatasetView',
    Typography='ru.neoflex.nfcore.application#//Typography',
    Select='ru.neoflex.nfcore.application#//Select',
    DatePicker='ru.neoflex.nfcore.application#//DatePicker',
    HtmlContent='ru.neoflex.nfcore.application#//HtmlContent',
    Button='ru.neoflex.nfcore.application#//Button',
    Input='ru.neoflex.nfcore.application#//Input',
    Row='ru.neoflex.nfcore.application#//Row',
    Calendar='ru.neoflex.nfcore.application#//Calendar',
    GroovyCommand='ru.neoflex.nfcore.application#//GroovyCommand',
    ValueHolder='ru.neoflex.nfcore.application#//ValueHolder',
    MasterdataView='ru.neoflex.nfcore.application#//MasterdataView',
    EventHandler='ru.neoflex.nfcore.application#//EventHandler',
    Drawer='ru.neoflex.nfcore.application#//Drawer',
    Href='ru.neoflex.nfcore.application#//Href',
    Collapse='ru.neoflex.nfcore.application#//Collapse',
    Region='ru.neoflex.nfcore.application#//Region',
    Checkbox='ru.neoflex.nfcore.application#//Checkbox',
    NeoIcon='ru.neoflex.nfcore.application#//NeoIcon',
    RadioGroup='ru.neoflex.nfcore.application#//RadioGroup'
}

function getAgGridValue(this: any, returnValueType: string, defaultValue: string) {
    if (returnValueType === 'object') {
        return this.props.data ? this.props.data : {[this.viewObject.get('name')] : this.viewObject.get(defaultValue)}
    }
    if (returnValueType === 'string') {
        return this.props.getValue ? this.props.getValue() : this.props.value ? this.props.value : this.viewObject.get(defaultValue)
    }
    return ""
}

function getRenderConditionResult(this: any, notificationTitle: string) {
    let componentRenderCondition = false;
    try {
        componentRenderCondition = !this.props.componentRenderCondition
            // eslint-disable-next-line
            || eval(this.props.componentRenderCondition)
    } catch (e) {
        this.props.context.notification(notificationTitle,
            this.props.t("exception while evaluating") + ` ${this.props.componentRenderCondition}`,
            "warning")
    }
    return componentRenderCondition
}

function mountComponent(this: any, isExportable: boolean = false, additionalActions: IAction[]|undefined = undefined) {
    if (isExportable) {
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
    }
    let actions = [
        {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
        {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
        {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
        {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
    ] as IAction[];
    actions = additionalActions ? actions.concat(additionalActions) : actions;
    this.props.context.addEventAction({
        itemId:this.viewObject.get('name')+this.viewObject._id,
        actions:actions
    });
    this.props.context.notifyAllEventHandlers({
        type:eventType.componentLoad,
        itemId:this.viewObject.get('name')+this.viewObject._id,
        value: this.viewObject.get('value')
    });
}

function unmountComponent(this: any, isExportable = false, isCleanContext = false) {
    if (isExportable) {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
    }
    this.props.context.removeEventAction();
    if (isCleanContext) {
        this.props.context.contextItemValues.delete(this.viewObject.get('name') + this.viewObject._id);
    }
}

function handleContextChange(this: any, currentValue: string, contextValue: string|undefined = undefined, dataType:string = "String", callback?: ()=>void) {
    let contextItemValues = this.props.context.contextItemValues;
    let globalValues = this.props.context.globalValues;
    const parameterObj = {
        parameterName: this.viewObject.get('name'),
        parameterValue: (currentValue === undefined) ? null : contextValue ? contextValue : currentValue,
        parameterDataType: dataType
    };
    contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, parameterObj);
    if (this.viewObject.get('isGlobal')) {
        globalValues.set(this.viewObject.get('name'), parameterObj)
    }
    this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
        callback);
}

function handleChange(this: any, currentValue: string, contextValue: string|undefined = undefined, dataType:string = "String") {
    handleContextChange.bind(this)(currentValue, contextValue, dataType, ()=>this.props.context.notifyAllEventHandlers({
        type:eventType.change,
        itemId:this.viewObject.get('name')+this.viewObject._id,
        value: contextValue ? contextValue : currentValue
    }));
    this.setState({currentValue:currentValue});
}

function handleClick(this: any, currentValue: string, contextValue: string|undefined = undefined, dataType:string = "String") {
    handleContextChange.bind(this)(currentValue, contextValue, dataType, ()=>    this.props.context.notifyAllEventHandlers({
        type: eventType.click,
        itemId:this.viewObject.get('name')+this.viewObject._id,
        value: contextValue ? contextValue : currentValue
    }));
}

function createCssClass(viewObject: any){
    let resultCss: any = "";
    if (viewObject.get('cssClass').array().length !== 0) {
        viewObject.get('cssClass').array().forEach((cl: any)=> {
            let cssClass = undefined;
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${cl.get('name')} { ${cl.get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
            resultCss = resultCss + `${cl.get('name')} `
        });
    }
    return resultCss
}

abstract class ViewContainer extends View {
    renderChildren = (isParentDisabled:boolean = false, isParentHidden:boolean = false) => {
        let children = this.props.viewObject.get('children') as Ecore.EObject[];
        const props = {
            ...this.props,
            isParentDisabled: isParentDisabled,
            isParentHidden: isParentHidden,
        };
        let childrenView = children.map(
            (c: Ecore.EObject) => {
                return this.viewFactory.createView(c, props)
            }
        );
        return childrenView

    };

    render = () => {
        return <div key={this.viewObject._id.toString() + '_3'}>{
            this.renderChildren()
        }</div>
    }
}

class Col_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <Col span={Number(this.viewObject.get('span')) || 24}
                 key={this.viewObject._id}
                 hidden={this.state.isHidden || this.props.isParentHidden}
                 className={cssClass}
            >
                {this.renderChildren(isReadOnly, this.state.isHidden)}
            </Col>
        )
    }
}

class Form_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <Form style={{marginBottom: marginBottom}}
                  hidden={this.state.isHidden || this.props.isParentHidden}
                  key={this.viewObject._id.toString() + '_4'}
                  className={cssClass}
            >
                {this.renderChildren(isReadOnly, this.state.isHidden)}
            </Form>
        )
    }
}

class TabsViewReport_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)();
    }

    render = () => {
        let children = this.viewObject.get('children').array() as Ecore.EObject[];
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const props = {
            ...this.props,
            isParentDisabled: isReadOnly
        };
        const cssClass = createCssClass(this.viewObject);
        return (
            <div hidden={this.state.isHidden || this.props.isParentHidden}>
                <NeoTabs
                    className={cssClass}
                    defaultActiveKey={children[0] ? children[0]._id : undefined}
                    tabPosition={this.viewObject.get('tabPosition') ? this.viewObject.get('tabPosition').toLowerCase() : 'top'}>
                    {
                        children.map((c: Ecore.EObject) =>
                            <NeoTabs.NeoTabPane tab={c.get('name')} key={c._id} >
                                {this.viewFactory.createView(c, props)}
                            </NeoTabs.NeoTabPane>
                        )
                    }
                </NeoTabs>
            </div>
        )
    }
}

class Row_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }


    componentDidMount(): void {
        mountComponent.bind(this)(false);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <Row
                key={this.viewObject._id.toString() + '_7'}
                hidden={this.state.isHidden || this.props.isParentHidden}
                className={cssClass}
                gutter={[this.viewObject.get('horizontalGutter') || 0, this.viewObject.get('verticalGutter') || 0]}
            >
                {this.renderChildren(isReadOnly, this.state.isHidden)}
            </Row>
        )
    }
}

class Region_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)(false);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <Row
                hidden={this.state.isHidden || this.props.isParentHidden}
                style={{
                    background: '#FFFFFF',
                    boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.05), 2px 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '16px',
                    margin: '16px'}}
                className={cssClass}
            >
                {this.renderChildren(isReadOnly, this.state.isHidden)}
            </Row>
        )
    }
}

export class Href_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden'),
            isDisabled: this.viewObject.get('disabled'),
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const componentRenderCondition = getRenderConditionResult.bind(this)("Href.componentRenderCondition");
        const cssClass = createCssClass(this.viewObject);
        return componentRenderCondition ? <a
            className={cssClass}
            hidden={this.state.isHidden || this.props.isParentHidden}
            style={{justifyContent: this.props.getValue ?  "inherit" : undefined, textDecorationLine: "underline"}}
            href={this.viewObject.get('ref') ? this.viewObject.get('ref') : "#"}
                  onClick={isReadOnly ? ()=>{} : ()=>{
                      //this.props.data/this.props.getValue props из ag-grid
                      const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'label');
                      handleClick.bind(this)(value)
                  }}>
            { this.viewObject.get('label')
                ? this.viewObject.get('label')
                : (this.props.getValue ? this.props.getValue() : undefined) }
        </a> : <div> {this.props.getValue()} </div>
    }
}

export class Button_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden'),
            isDisabled: this.viewObject.get('disabled'),
            isEnter: false,
        };
        this.enterCheck = this.enterCheck.bind(this);
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
        window.addEventListener('keydown', this.enterCheck);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
        window.removeEventListener('keydown', this.enterCheck);
    }

    enterCheck(e: KeyboardEvent): void{
        if (e.key && e.key === "Enter") {
            this.setState({isEnter: true})
        }
    }


    render = () => {
        const cssClass = createCssClass(this.viewObject);
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const { t } = this.props as WithTranslation;
        const label = t(this.viewObject.get('label'));
        const componentRenderCondition = getRenderConditionResult.bind(this)("Button.componentRenderCondition");
        return componentRenderCondition ? <div
            hidden={this.state.isHidden || this.props.isParentHidden}
            key={this.viewObject._id}>
            <NeoButton
                className={cssClass}
                onClick={isReadOnly ? ()=>{} : (e) => {
                        if (!this.state.isEnter) {
                            const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'ref');
                            handleClick.bind(this)(value);
                        }
                    this.setState({isEnter: false})
                }}>
                {(label)? label: t('submit')}
            </NeoButton>
        </div> : <div> {this.props.getValue()} </div>
    }
}

export class Select_ extends ViewContainer {
    private selected = "";
    private urlCurrentValue:string|undefined = "";

    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            this.urlCurrentValue = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }

        let agValue = "";
        if (this.props.isAgEdit) {
            agValue = this.props.data[this.props.colData]
        } else {
            agValue = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', '');
        }
        value = this.urlCurrentValue
            ? this.urlCurrentValue
            : this.viewObject.get('value')
                ? this.viewObject.get('value')
                : agValue;
        this.state = {
            selectData: [],
            params: [],
            currentValue: undefined,
            dataset: undefined,
            isHidden: this.viewObject.get('hidden'),
            isDisabled: this.viewObject.get('disabled'),
            defaultAgGridValue: agValue,
            isFirstLoad: true
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.selected,
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.selected,
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    prepareString = (currentValue: string|string[]) => {
        if (typeof currentValue === 'string') {
            const found = this.state.selectData.find((d: { value: string }) => d.value === currentValue)
            this.selected = found && found.key
        } else if (Array.isArray(currentValue)) {
            let temp = this.state.selectData.filter((el:{key:string,value:string})=>{
                return currentValue.includes(el.value)
            }).map((el:{key:string,value:string})=>{
                return el.key
            });
            this.selected = temp.join(",");
            currentValue = currentValue.join(",");
        }
        return currentValue
    };

    onChange = (currentValue: string|string[], isSetValueCall = false) => {
        handleChange.bind(this)(this.prepareString(currentValue));
        this.setState({
            currentValue: currentValue
        });
        //Emulate click event
        if (!isSetValueCall) {
            this.props.context.notifyAllEventHandlers({
                type: eventType.click,
                itemId:this.viewObject.get('name')+this.viewObject._id,
                value: this.prepareString(currentValue)
            })

        }
    };


    componentDidMount(): void {
        if (this.viewObject.get('isDynamic')
            && this.viewObject.get('dataset')) {
            this.setState({dataset:this.viewObject.get('dataset').eContainer});
        }
        if (this.viewObject.get('isDynamic')
            && this.viewObject.get('dataset')
            && this.viewObject.get('valueItems').size() === 0) {
            this.props.context.runQueryDataset(this.viewObject.get('dataset').eContainer).then((result: string) => {
                this.setState({
                        selectData: JSON.parse(result).map((el: any)=>{
                            return {
                                key: el[this.viewObject.get('datasetKeyColumn').get('name')],
                                value: el[this.viewObject.get('datasetValueColumn').get('name')]
                            }
                        }),
                        currentValue: this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : "")
                    },()=> this.onChange(this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : ""))
                );
            });
        } else if (this.viewObject.get('isDynamic')
            && this.viewObject.get('valueItems').size() !== 0
            && this.props.isAgEdit) {
            this.onChange(this.state.defaultAgGridValue)
        } else if (this.viewObject.get('staticValues')) {
            this.getStaticValues(this.viewObject.get('staticValues'))
        }
        mountComponent.bind(this)(true,[{actionType: actionType.setValue, callback: (value:string)=>{
                this.onChange.bind(this)(value.includes(',') ? value.split(',') : value, true)
            }}] as IAction[]);
    }


    componentWillUnmount(): void {
        unmountComponent.bind(this)(true, true)
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues);
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)
            && this.state.dataset
            && this.viewObject.get('valueItems')) {
            this.setState({params: newParams});
            this.props.context.runQueryDataset(this.state.dataset, newParams).then((result: string) => {
                const resArr = JSON.parse(result).map((el: any)=>{
                    return {
                        key: el[this.viewObject.get('datasetKeyColumn').get('name')],
                        value: el[this.viewObject.get('datasetValueColumn').get('name')]
                    }
                });
                if (!_.isEqual(resArr, this.state.selectData)) {
                    let currentValue: string;
                    if (this.urlCurrentValue) {
                        currentValue = this.urlCurrentValue;
                        //Чтобы не восстанавливать значение при смене параметров
                        this.urlCurrentValue = "";
                    } else {
                        currentValue = this.state.currentValue
                    }
                    const isContainsValue = resArr.find((obj:any) => {
                        return obj.key === currentValue
                    });
                    this.setState({
                        params: newParams,
                        selectData: resArr
                    },()=> {
                        this.onChange(this.state.isFirstLoad && this.viewObject.get('value') ? this.viewObject.get('value') : isContainsValue ? currentValue : "")
                        this.setState({isFirstLoad: false})
                    });
                }
            });
        }
    }

    getStaticValues(stringValues: string) {
        const staticValues = stringValues
            .replace("\\;","-//-")
            .replace("\\:","-\\-")
            .split(";")
            .map((e:string)=>{
                const keyValue = e
                    .replace("-//-",";")
                    .split(":");
                return {
                    key: keyValue[0] ? keyValue[0].replace("-\\-",":") : undefined,
                    value: keyValue[1] ? keyValue[1].replace("-\\-",":") : undefined
                }
            });
        if (staticValues.length > 0) {
            this.selected = staticValues[0].key!;
        }
        this.setState({
            selectData:staticValues,
            currentValue: this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : "")
        },()=> this.props.context.contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, {
            parameterName: this.viewObject.get('name'),
            parameterValue: this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.state.currentValue
        }))
    }

    //ag-grid
    getValue() {
        return this.state.currentValue && Array.isArray(this.state.currentValue)
            ? this.state.currentValue.join(',')
            : this.state.currentValue;
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const width = '200px';
        const componentRenderCondition = getRenderConditionResult.bind(this)("Select.componentRenderCondition");
        const cssClass = createCssClass(this.viewObject);
        return (
            componentRenderCondition ? <div
                hidden={this.state.isHidden || this.props.isParentHidden}
                style={{marginBottom: marginBottom}}>
                <Select
                    key={this.viewObject._id}
                    className={cssClass}
                    disabled={isReadOnly}
                    showSearch={this.viewObject.get('showSearch')}
                    placeholder={this.viewObject.get('placeholder')}
                    mode={this.viewObject.get('mode') !== null ? this.viewObject.get('mode').toLowerCase() : 'default'}
                    style={{width: this.props.isAgEdit ? undefined : width}}
                    defaultValue={this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.viewObject.get('value') || undefined}
                    value={(this.state.currentValue)? this.state.currentValue: undefined}
                    onChange={(currentValue: string|string[]) => {
                        this.onChange(currentValue);
                    }}
                >
                    {
                        (this.state.selectData.length > 0)
                            ?
                            this.state.selectData.map((data: {key:string,value:string}) =>
                                <Select.Option key={data.key}
                                               value={data.value}>
                                    {data.key}
                                </Select.Option>
                            )
                            :
                            <Select.Option key={this.viewObject.get('name') + 'Select'}
                                           value={this.viewObject.get('name') + 'Select'}>

                            </Select.Option>
                    }
                </Select>
            </div> : <div>{this.props.getValue()}</div>
        )
    }
}

export class DatePicker_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        let value, mask;
        const format = this.viewObject.get('showTime') ? defaultTimestampFormat : defaultDateFormat;
        if (this.viewObject.get('formatMask')) {
            mask = this.viewObject.get('formatMask').get('value')
        }
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        const agValue = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', '1900-01-01');
        value = value
            ? value
            : this.viewObject.get('value')
                ? this.viewObject.get('value')
                : agValue
                    ? agValue
                    : moment().format(this.viewObject.get('showTime') ? defaultTimestampFormat : defaultDateFormat);
        const formatedValue:string = mask ? moment(value, format).format(mask) : value;
        this.state = {
            defaultDate: mask ? moment(formatedValue, mask) : moment(value, format),
            currentValue: formatedValue,
            format: format,
            mask: mask,
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            locale: switchAntdLocale(this.props.i18n.language, this.props.t)
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format).format(this.state.format),
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format).format(this.state.format),
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)(true, [{actionType: actionType.setValue, callback: (value)=>{
                this.onChange.bind(this)(value ? value : "", true)
            }}] as IAction[]);
        const value = this.state.defaultDate.format(this.state.mask ? this.state.mask : this.state.format);
        const formattedCurrentValue = moment(value, this.state.mask).format(this.state.format);
        handleContextChange.bind(this)(value, formattedCurrentValue, this.viewObject.get('showTime') ? "Timestamp" : "Date");
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(true, true)
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.t !== this.props.t) {
            this.setState({locale:switchAntdLocale(this.props.i18n.language, this.props.t)},()=>{this.forceUpdate()})
        }
    }

    onChange = (currentValue: string, isSetValueCall: boolean = false) => {
        //Возвращаем формат по умолчанию
        const formattedCurrentValue = moment(currentValue, this.state.mask).format(this.state.format);
        handleChange.bind(this)(currentValue, formattedCurrentValue, this.viewObject.get('showTime') ? "Timestamp" : "Date");
        if (!isSetValueCall) {
            //Emulate click
            this.props.context.notifyAllEventHandlers({
                type: eventType.click,
                itemId:this.viewObject.get('name')+this.viewObject._id,
                value: currentValue
            })
        }
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <div hidden={this.state.isHidden || this.props.isParentHidden}
                 style={{marginBottom: marginBottom}}
            >
                <ConfigProvider locale={this.state.locale}>
                    <NeoDatePicker
                        key={this.viewObject._id}
                        className={cssClass}
                        showTime={this.viewObject.get('showTime')}
                        defaultValue={this.state.defaultDate}
                        value={moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format)}
                        disabled={isReadOnly}
                        allowClear={this.viewObject.get('allowClear') || false}
                        format={this.state.mask}
                        width={'200px'}
                        onChange={(date: any, dateString: string) => {
                            this.onChange(dateString)
                        }}/>
                </ConfigProvider>
            </div>
        )
    }
}

class HtmlContent_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        const params = getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues).map(obj => {
            return {
                ...obj,
                parameterValue: obj.parameterValue ? obj.parameterValue : ""
            }
        });
        this.state = {
            htmlContent: replaceNamedParam(this.viewObject.get('htmlContent'),params),
            params: params,
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    onChange = (value:string) => {
        this.setState({htmlContent:value})
    };

    componentDidMount(): void {
        mountComponent.bind(this)(false, [{actionType: actionType.setValue, callback: this.onChange.bind(this)}] as IAction[]);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues).map(obj => {
            return {
                ...obj,
                parameterValue: obj.parameterValue ? obj.parameterValue : ""
            }
        });
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)) {
            this.setState({
                params: newParams,
                htmlContent: replaceNamedParam(this.viewObject.get('htmlContent'), newParams) ,
            })
        }
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <div hidden={false}
                     aria-disabled={isReadOnly}
                     className={`${cssClass} content`}
                     onClick={isReadOnly ? ()=>{} : () => {
                         const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'ref');
                         handleClick.bind(this)(value);
                     }}
            >
                <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.htmlContent)}}>
            </div>
            </div>
        )
    }
}

class GroovyCommand_ extends Component {
    componentDidMount(): void {
        if (this.viewObject.get('executeOnStartup')) {
            this.execute()
        }
        mountComponent.bind(this)(false, [{actionType: actionType.execute,callback: this.execute.bind(this)}] as IAction[]);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
    }

    setValue = (result: any) => {
        handleChange.bind(this)(result)
    };

    execute = () => {
        const commandType = this.viewObject.get('commandType')||"Eval";
        const command = this.viewObject.get('command');
        const body = replaceNamedParam(command, getNamedParams(this.viewObject.get('valueItems')
            , this.props.context.contextItemValues
            , this.props.pathFull[this.props.pathFull.length - 1].params))
        if (commandType === "Resource") {

            API.instance().fetchJson('/script/resource?path='+this.viewObject.get('gitResourcePath'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => {
                this.setValue(res);
                if (this.viewObject.get('downloadFile')) {
                    saveAs(new Blob([res]), "file.txt");
                    console.log("Document created successfully");
                }
            }).catch(reason => this.props.context.notification("EventHandler.condition",
                this.props.t("exception while evaluating") + ` GroovyCommand.${this.viewObject.get('name')} \nreason=${reason}`,
                "error"))
        } else if (commandType === "Static") {
            API.instance().fetchJson('/script/static/'+this.viewObject.get('gitStaticClass')+'/'+this.viewObject.get('gitStaticMethod'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => {
                this.setValue(res);
                if (this.viewObject.get('downloadFile')) {
                    saveAs(new Blob([res]), "file.txt");
                    console.log("Document created successfully");
                }
            }).catch(reason => this.props.context.notification("EventHandler.condition",
                this.props.t("exception while evaluating") + ` GroovyCommand.${this.viewObject.get('name')} \nreason=${reason}`,
                "error"))
        } else {
            API.instance().fetchJson('/script/eval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => {
                this.setValue(res);
                if (this.viewObject.get('downloadFile')) {
                    saveAs(new Blob([res]), "file.txt");
                    console.log("Document created successfully");
                }
            }).catch(reason => this.props.context.notification("EventHandler.condition",
                this.props.t("exception while evaluating") + ` GroovyCommand.${this.viewObject.get('name')} \nreason=${reason}`,
                "error"))
        }
    };

    render = () => {
        return null
    }
}

class ValueHolder_ extends Component {
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        value = value ? value : this.viewObject.get('value') || "";
        this.state = {
            currentValue: value
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    onChange = (currentValue: string) => {
        handleChange.bind(this)(currentValue);
    };

    componentDidMount(): void {
        this.onChange(this.viewObject.get('value'));
        mountComponent.bind(this)(false, [{actionType: actionType.setValue,callback: this.onChange.bind(this)}] as IAction[]);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
    }

    render = () => {
        return null
    }
}

export class Input_ extends ViewContainer {
    private timer : number;
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        const agValue = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', '');
        value = value
            ? value
            : this.viewObject.get('value')
                ? this.viewObject.get('value')
                : agValue;
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            currentValue: value
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    componentDidMount(): void {
        mountComponent.bind(this)(false, [{actionType: actionType.setValue, callback: this.onChange.bind(this)}] as IAction[]);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if(prevState.currentValue !== this.state.currentValue) {
            this.handleOnChange(this.state.currentValue);
        }
    }

    onChange = (currentValue: string) => {
        this.setState({currentValue:currentValue});
    };

    handleOnChange = (currentValue: string) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.onChangeDebounced(currentValue);
        }, 500);
    };

    onChangeDebounced = (currentValue: string) => {
        handleChange.bind(this)(currentValue)
    };

    onClick = (currentValue: string) => {
        handleClick.bind(this)(currentValue)
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        const width = "200px";
        if (this.viewObject.get('inputType') === 'InputNumber' ) {
            return(
                <div
                    key={this.viewObject._id}
                    style={{marginBottom: marginBottom}}>
                    <InputNumber
                        hidden={this.state.isHidden || this.props.isParentHidden}
                        className={cssClass}
                        style={{width: width}}
                        disabled={isReadOnly}
                        min={this.viewObject.get('minValue') || 1}
                        max={this.viewObject.get('maxValue') || 99}
                        step={this.viewObject.get('step') || 1}
                        placeholder={this.viewObject.get('placeholder')}
                        defaultValue={Number(this.viewObject.get('value') || this.viewObject.get('minValue') || 1)}
                        onChange={(currentValue: any) => {
                            this.onChange(String(currentValue))
                        }}
                        onClick={(event: any) => {
                            this.onClick(String(event.target.value))
                        }}
                        value={this.state.currentValue}
                    />
                </div>
            )
        } else {
            return(
                <div key={this.viewObject._id}
                     style={{marginBottom: marginBottom}}>
                    <Input
                        hidden={this.state.isHidden}
                        className={cssClass}
                        style={{width: width, display: (this.state.isHidden) ? 'none' : undefined}}
                        disabled={isReadOnly}
                        placeholder={this.viewObject.get('placeholder')}
                        defaultValue={this.viewObject.get('value')}
                        onChange={(currentValue: any) => {
                            this.onChange(currentValue.target.value)
                        }}
                        value={this.state.currentValue}
                    />
                </div>
            )
        }
    }
}

export class Checkbox_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        value = value ? value : this.viewObject.get('value') || "default";
        const agValue = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'label');
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            currentValue: value,
            defaultValue: value,
            checked: value === agValue ? true : this.viewObject.get('isChecked')
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    componentDidMount(): void {
        mountComponent.bind(this)(false, [{actionType: actionType.setValue, callback: (value)=>{
                this.onChange.bind(this)(value ? value : "", true)
            }}] as IAction[]);
        const currentContextValue = this.props.context.contextItemValues.get(this.viewObject.get('name')+this.viewObject._id);
        if (this.viewObject.get('isChecked')) {
            if (this.props.isAgComponent) {
                const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'label');
                handleContextChange.bind(this)(this.changeSelection(currentContextValue ? currentContextValue.parameterValue : undefined, value));
            } else {
                handleContextChange.bind(this)(this.changeSelection(currentContextValue ? currentContextValue.parameterValue : undefined, this.state.defaultValue));
            }
            this.setState({checked: true});
        } else {
            handleContextChange.bind(this)(this.changeSelection(currentContextValue ? currentContextValue.parameterValue : undefined, ''));
        }
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
    }

    getValue() {
        return this.state.checked ? this.state.currentValue : undefined;
    }

    changeSelection = (currentValue: string, newValue: string) => {
        let textArr = currentValue ? currentValue.split(contextStringSeparator) : [];
        if (!textArr.includes(newValue)) {
            textArr.push(newValue)
        } else {
            textArr = textArr.filter(a => a !== newValue)
        }
        return textArr.join(contextStringSeparator)
    };

    onChecked = (isChecked: boolean) => {
        if (this.props.isAgComponent) {
            const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'label');
            this.onChange(value)
        } else {
            this.onChange(this.state.defaultValue)
        }
        this.setState({checked: isChecked});
    };

    onChange = (currentValue: string, isSetValueCall = false) => {
        const currentContextValue = this.props.context.contextItemValues.get(this.viewObject.get('name')+this.viewObject._id);
        const newContextValue = this.changeSelection(currentContextValue ? currentContextValue.parameterValue : undefined, currentValue)
        handleChange.bind(this)(newContextValue);
        if (isSetValueCall) {
            this.setState({checked: newContextValue.length >= currentValue.length});
        } else {
            //Emulate click
            this.props.context.notifyAllEventHandlers({
                type: eventType.click,
                itemId:this.viewObject.get('name')+this.viewObject._id,
                value: newContextValue
            })
        }
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return(
            <div
                key={this.viewObject._id}
                hidden={this.state.isHidden || this.props.isParentHidden}
                style={{marginBottom: marginBottom}}>
                <NeoInput
                    name={"checkbox"}
                    className={cssClass}
                    type={'checkbox'}
                    checked={this.state.checked}
                    value={this.state.currentValue}
                    onChange={isReadOnly ? ()=>{} : (e:any) => {
                        this.onChecked(e.currentTarget.checked);
                    }}
                    disabled={isReadOnly}
                >{this.viewObject.get('label')}</NeoInput>
            </div>
        )
    }
}

class Typography_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            label: "",
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)(true, [{actionType: actionType.setValue,callback: this.onChange.bind(this)}] as IAction[]);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(true, true)
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.viewObject.get('name'),
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.viewObject.get('name'),
            hidden: this.state.isHidden || this.props.isParentHidden
        };
    }

    onChange = (str: string) => {
        this.setState({label: str},()=>this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemId:this.viewObject.get('name')+this.viewObject._id,
            value:str
        }));
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        let drawObject = this.viewObject;
        let typographyType = drawObject.get('typographyType')
        if (typographyType === null) {
            typographyType = 'capture_regular'
        }
        return (
            <div hidden={this.state.isHidden || this.props.isParentHidden}>
                <NeoParagraph
                    type={typographyType}
                    className={cssClass}
                    copyable={drawObject.get('buttonCopyable')}
                    editable={drawObject.get('buttonEditable') === true ? {onChange: this.onChange} : false} //boolean | { editing: boolean, onStart: Function, onChange: Function(string) }
                    code={drawObject.get('codeStyle')}
                    delete={drawObject.get('deleteStyle')}
                    disabled={isReadOnly}
                    ellipsis={{rows: drawObject.get('ellipsisRow'), expandable: false}}
                    mark={drawObject.get('markStyle')}
                    underline={drawObject.get('underlineStyle')}
                    strong={drawObject.get('strongStyle')}
                    required={drawObject.get('required')}
                >
                    {(this.state.label) ? this.state.label : this.viewObject.get('name')}
                </NeoParagraph>
            </div>
        )
    }
}

class EventHandler_ extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    handleEvent(value:any) {
        if (!this.state.isDisabled) {
            let isHandled = false;
            let componentCondition = true;
            this.viewObject.get('eventActions').each((el: EObject) => {
                const eventAction: IEventAction = this.props.context.getEventActions().find((action: IEventAction) => {
                    return ((el.get('triggerItem')
                        && action.itemId === el.get('triggerItem').get('name')+el.get('triggerItem')._id)
                        || el.get('action') === actionType.showMessage
                        || el.get('action') === actionType.redirect)
                });
                if (this.viewObject.get('condition')) {
                    let params = [];
                    if (this.viewObject.get('conditionItems').size() > 0) {
                        params = getNamedParams(this.viewObject.get('conditionItems')
                            , this.props.context.contextItemValues
                            , this.props.pathFull[this.props.pathFull.length - 1].params).map(obj => {
                            return {
                                ...obj,
                                parameterValue: obj.parameterValue !== undefined && obj.parameterValue !== null ? obj.parameterValue : ""
                            }
                        });
                    } else {
                        const paramNames:string[] = this.viewObject.get('condition').match(/:[_а-яa-z0-9]+/gi);
                        params = paramNames.map(paramName => {
                            return getNamedParamByName(paramName.replace(":","")
                                , this.props.context.contextItemValues
                                , this.props.pathFull[this.props.pathFull.length - 1].params)
                        });
                    }
                    try {
                        // eslint-disable-next-line
                        componentCondition = eval(replaceNamedParam(this.viewObject.get('condition'), params))
                    } catch (e) {
                        componentCondition = false;
                        this.props.context.notification("EventHandler.condition",
                            this.props.t("exception while evaluating") + ` ${replaceNamedParam(this.viewObject.get('condition'), params)}`,
                            "warning")
                    }
                }
                if (componentCondition) {
                    //ViewObject handler
                    if (eventAction) {
                        eventAction.actions.forEach((action) => {
                            if (action.actionType === (el.get('action') || actionType.execute)
                                && action.actionType !== actionType.showMessage
                                && action.actionType !== actionType.redirect) {
                                if (el.get('valueObjectKey') && value === Object(value)) {
                                    (value[el.get('valueObjectKey')]
                                        //Если запрос вернул null
                                        || value[el.get('valueObjectKey')] === null)
                                        ? action.callback(value[el.get('valueObjectKey')])
                                        : this.props.context.notification("Event handler warning",
                                        `Object Key ${el.get('valueObjectKey')} in action=${el.get('action')} / event=${this.viewObject.get('name')} (${el.get('triggerItem').get('name')}) not found`,
                                        "warning");
                                    isHandled = true;
                                } else if (value === Object(value) && action.actionType === actionType.setValue) {
                                    this.props.context.notification("Event handler warning",
                                        `Object Key is not specified in action=${el.get('action')} / event=${this.viewObject.get('name')} (${el.get('triggerItem').get('name')}) not found`,
                                        "warning");
                                    isHandled = true;
                                } else {
                                    action.callback(value);
                                    isHandled = true;
                                }
                            }
                        });
                    }
                    //Other events
                    if (el.get('action') === actionType.showMessage
                        && el.get('triggerItem')
                        && el.get('triggerItem').get('message')) {
                        this.props.context.notification(el.get('triggerItem').get('header'),
                            el.get('triggerItem').get('message'),
                            el.get('triggerItem').get('messageType') || "success");
                        isHandled = true;
                    }
                    if (el.get('action') === actionType.redirect) {
                        const redirectTo = el.get('redirectTo') ? el.get('redirectTo').get('name') : null;
                        const params = getNamedParams(el.get('redirectParams'), this.props.context.contextItemValues);
                        this.props.context.changeURL(redirectTo, true, undefined, params);
                        isHandled = true;
                    }
                    if (el.get('action') === actionType.backToLastPage) {
                        if (this.props.pathFull.length >= 2) {
                            const appModule = this.props.pathFull[this.props.pathFull.length - 2];
                            let params: Object[] = appModule.params;
                            this.props.context.changeURL!(appModule.appModule, true, undefined, params);
                        }
                        isHandled = true;
                    }
                    if (!isHandled) {
                        this.props.context.notification("Event handler warning",
                            `Action ${el.get('action') || actionType.execute} is not supported for ${this.viewObject.get('name')}`,
                            "warning")
                    }
                }
            })
        }
    }

    componentDidMount(): void {
        if (this.viewObject.get('listenItem')) {
            (this.viewObject.get('listenItem') as EList).each(eObject => {
                this.props.context.addEventHandler({
                    itemId: eObject.get('name')+eObject._id,
                    eventType: this.viewObject.get('event') || "click",
                    callback: this.handleEvent.bind(this)
                })
            });
        }
        mountComponent.bind(this)(false)
    }

    componentWillUnmount(): void {
        if (this.viewObject.get('listenItem')) {
            (this.viewObject.get('listenItem') as EList).each(eObject => {
                this.props.context.removeEventHandler(eObject.get('name')+eObject._id)
            });
        }
        unmountComponent.bind(this)(false, true)
    }

    render() {
        return null
    }
}

class Drawer_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        return (
            <Drawer
                className={cssClass}
                placement={positionEnum[(this.viewObject.get('position') as "Top"|"Left"|"Right"|"Bottom") || 'Top']}
                width={'700px'}
                height={'500px'}
                visible={!this.state.isHidden && !this.props.isParentHidden}
                onClose={()=>{this.setState({isHidden:true})}}
                mask={false}
                maskClosable={false}
                getContainer={false}
                style={{
                    position: 'absolute',
                }}
            >
                {this.renderChildren(isReadOnly, this.state.isHidden)}
            </Drawer>
        )
    }
}

export class NeoIcon_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    render = () => {
        const cssClass = createCssClass(this.viewObject);
        const icon = ((this.viewObject.get('iconCode') || 'notification') as string).replace('updateClock','update-clock');
        return (
             <NeoIcon style={{display: this.state.isHidden && 'none'}} className={cssClass} icon={icon as SvgName}/>
        )
    }
}

export class RadioGroup_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        value = value ? value : this.viewObject.get('value') || "";
        const agValue = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'label');
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            currentValue: value,
            gridBoxes: agValue
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    componentDidMount(): void {
        mountComponent.bind(this)(false, [{actionType: actionType.setValue, callback: (value) => {
                this.onChange.bind(this)(value ? value : "", true)
            }}] as IAction[]);
        handleContextChange.bind(this)(this.state.currentValue);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    onChange = (currentValue: string, isSetValueCall = false) => {
        handleChange.bind(this)(currentValue);
        if (!isSetValueCall) {
            //Emulate click
            this.props.context.notifyAllEventHandlers({
                type: eventType.click,
                itemId:this.viewObject.get('name')+this.viewObject._id,
                value: currentValue
        })
        }
    };

    onClick  = (currentValue: string) => {
        handleClick.bind(this)(currentValue)
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const cssClass = createCssClass(this.viewObject);
        const contextValue = this.props.context.contextItemValues.get(this.viewObject.get('name')+this.viewObject._id);
        return (<div style={{display: "flex", flexDirection: this.viewObject.get('isVerticalGroup') ? "column" : "row"}}
                     hidden={this.state.isHidden || this.props.isParentHidden}>
                {this.props.isAgComponent
                    ? this.state.gridBoxes && this.state.gridBoxes.split(',').map((box:string, index:number)=>{
                        return <NeoInput
                            key={`${this.viewObject.eURI()}${box}${index}`}
                            disabled={isReadOnly}
                            checked={contextValue && contextValue.parameterValue === box}
                            className={cssClass}
                            type={"radio"}
                            name={this.viewObject.get('name')}
                            onChange={isReadOnly ? ()=>{} : (event:any)=>{
                                this.onChange(event.currentTarget.labels[0].outerText)
                            }}
                        >{box}
                        </NeoInput>
                    })
                    : this.viewObject.get('radioBoxes').map((box:string, index:number)=>{
                    return <NeoInput
                        key={`${this.viewObject.eURI()}${box}${index}`}
                        disabled={isReadOnly}
                        checked={this.state.currentValue === box}
                        className={cssClass}
                        type={"radio"}
                        name={this.viewObject.get('name')}
                        onChange={isReadOnly ? ()=>{} : (event:any)=>{
                            this.onChange(event.currentTarget.labels[0].outerText)
                        }}
                    >{box}
                    </NeoInput>
                })}
            </div>
        )
    }
}

class Collapse_ extends ViewContainer {

    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    render = () => {
        const cssClass = createCssClass(this.viewObject);
        return (
            <div hidden={this.state.isHidden || this.props.isParentHidden}>
                <Collapse
                    className={cssClass}
                    defaultActiveKey={['1']}
                    expandIconPosition={'left'}
                >
                    <Collapse.Panel header={this.viewObject.get("name")} key={"1"}>
                        {this.renderChildren()}
                    </Collapse.Panel>
                </Collapse>


            </div>
        )
    }
}

class DatasetView_ extends ViewContainer {
    render = () => {
        const hidden = this.viewObject.get('hidden') || false;
        const disabled = this.viewObject.get('disabled') || false;
        const grantType = this.viewObject.get('grantType');
        const cssClass = createCssClass(this.viewObject);
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden,
            isParentHidden: this.props.isParentHidden,
            grantType: grantType,
            className: cssClass
        };
        return <DatasetView {...props} key={this.viewObject._id.toString() + '_5'}/>
    }
}

class Calendar_ extends ViewContainer {
    render = () => {
        const hidden = this.viewObject.get('hidden') || false;
        const disabled = this.viewObject.get('disabled') || false;
        const grantType = this.viewObject.get('grantType');
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden || this.props.isParentHidden,
            grantType: grantType,
        };
        return <Calendar {...props} key={this.viewObject._id}/>
    }
}

class MasterdataView_ extends ViewContainer {
    render = () => {
        const hidden = this.viewObject.get('hidden') || false;
        const disabled = this.viewObject.get('disabled') || false;
        const grantType = this.viewObject.get('grantType');
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden || this.props.isParentHidden,
            grantType: grantType,
        };
        return <MasterdataEditor {...props} key={this.viewObject._id} entityType={this.viewObject.get('entityType')}/>
    }
}

class AntdFactory implements ViewFactory {
    name = 'antd';
    components = new Map<string, typeof Component>();

    constructor() {
        this.components.set(AntdFactoryClasses.Column, Col_);
        this.components.set(AntdFactoryClasses.Form, Form_);
        this.components.set(AntdFactoryClasses.TabsViewReport, TabsViewReport_);
        this.components.set(AntdFactoryClasses.DatasetView, DatasetView_);
        this.components.set(AntdFactoryClasses.Typography, Typography_);
        this.components.set(AntdFactoryClasses.Select, Select_);
        this.components.set(AntdFactoryClasses.DatePicker, DatePicker_);
        this.components.set(AntdFactoryClasses.HtmlContent, HtmlContent_);
        this.components.set(AntdFactoryClasses.Button, Button_);
        this.components.set(AntdFactoryClasses.Input, Input_);
        this.components.set(AntdFactoryClasses.Row, Row_);
        this.components.set(AntdFactoryClasses.Calendar, Calendar_);
        this.components.set(AntdFactoryClasses.GroovyCommand, GroovyCommand_);
        this.components.set(AntdFactoryClasses.ValueHolder, ValueHolder_);
        this.components.set(AntdFactoryClasses.MasterdataView, MasterdataView_);
        this.components.set(AntdFactoryClasses.EventHandler, EventHandler_);
        this.components.set(AntdFactoryClasses.Drawer, Drawer_);
        this.components.set(AntdFactoryClasses.Href, Href_);
        this.components.set(AntdFactoryClasses.Collapse, Collapse_);
        this.components.set(AntdFactoryClasses.Region, Region_);
        this.components.set(AntdFactoryClasses.Checkbox, Checkbox_);
        this.components.set(AntdFactoryClasses.NeoIcon, NeoIcon_);
        this.components.set(AntdFactoryClasses.RadioGroup, RadioGroup_);
    }

    createView(viewObject: Ecore.EObject, props: any, ref?: any): JSX.Element {
        if (startResource === undefined) {
            startResource = viewObject.eResource().to()
        }
        let Component = this.components.get(viewObject.eClass.eURI());
        if (!Component) {
            Component = View
        }
        const isAccessDenied = viewObject.get('grantType') === grantType.denied;
        return (
            isAccessDenied ? <div/> : <Component {...props} key={viewObject._id.toString() + '_1'} viewObject={viewObject} viewFactory={this} ref={ref}/>
        )
    }


}

export default new AntdFactory()
