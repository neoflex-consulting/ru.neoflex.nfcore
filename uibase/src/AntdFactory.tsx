import {View, ViewFactory} from './View'
import Ecore, {EList, EObject} from 'ecore';
import * as React from 'react';
import {
    Col,
    Collapse,
    ConfigProvider,
    DatePicker,
    Drawer,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Typography
} from 'antd';
import UserComponent from './components/app/UserComponent';
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
import {NeoButton, NeoInput, NeoTabs} from "neo-design/lib";
import _ from "lodash";

const { Paragraph } = Typography;
const marginBottom = '20px';

let startResource: Object;

function getAgGridValue(this: any, returnValueType: string, defaultValue: string) {
    if (returnValueType === 'object') {
        return this.props.data ? this.props.data : {[this.viewObject.get('name')] : this.viewObject.get(defaultValue)}
    }
    if (returnValueType === 'string') {
        return this.props.getValue ? this.props.getValue() : this.viewObject.get(defaultValue)
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

function handleChange(this: any, currentValue: string, contextValue: string|undefined = undefined, dataType:string = "String") {
    let contextItemValues = this.props.context.contextItemValues;
    let globalValues = this.props.context.globalValues;
    contextValue = contextValue ? contextValue : currentValue;
    const parameterObj = {
        parameterName: this.viewObject.get('name'),
        parameterValue: (currentValue === undefined) ? null : contextValue,
        parameterDataType: dataType
    };
    contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, parameterObj);
    if (this.viewObject.get('isGlobal')) {
        globalValues.set(this.viewObject.get('name'), parameterObj)
    }
    this.setState({currentValue:currentValue});
    this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
        ()=>this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemId:this.viewObject.get('name')+this.viewObject._id,
            value:contextValue
        }));
}

function handleClick(this: any, currentValue: string, contextValue: string|undefined = undefined, dataType:string = "String") {
    let contextItemValues = this.props.context.contextItemValues;
    let globalValues = this.props.context.globalValues;
    contextValue = contextValue ? contextValue : currentValue;
    const parameterObj = {
        parameterName: this.viewObject.get('name'),
        parameterValue: (currentValue === undefined) ? null : contextValue,
        parameterDataType: dataType
    };
    contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, parameterObj);
    if (this.viewObject.get('isGlobal')) {
        globalValues.set(this.viewObject.get('name'), parameterObj)
    }
    this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
        ()=>this.props.context.notifyAllEventHandlers({
            type:eventType.click,
            itemId:this.viewObject.get('name')+this.viewObject._id,
            value:contextValue
        }));
}

abstract class ViewContainer extends View {
    renderChildren = (isParentDisabled:boolean = false) => {
        let children = this.viewObject.get('children') as Ecore.EObject[];
        const props = {
            ...this.props,
            isParentDisabled: isParentDisabled
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <Col span={Number(this.viewObject.get('span')) || 24}
                 key={this.viewObject._id}
                 hidden={this.state.isHidden}
                 className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
            >
                {this.renderChildren(isReadOnly)}
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <Form style={{marginBottom: marginBottom}}
                  hidden={this.state.isHidden}
                  key={this.viewObject._id.toString() + '_4'}
                  className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
            >
                {this.renderChildren(isReadOnly)}
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <div hidden={this.state.isHidden}>
                <NeoTabs
                    className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
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

class ComponentElement_ extends ViewContainer {
    render = () => {
        if (this.viewObject.eClass.get('name') === 'ComponentElement' && this.viewObject.get('component')) {
            const componentClassName = this.viewObject.get('component').get('componentClassName');
            return<UserComponent key={this.viewObject._id} {...this.props} componentClassName={componentClassName}/>
        } else return <div>Not found</div>
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <Row
                key={this.viewObject._id.toString() + '_7'}
                hidden={this.state.isHidden}
                className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                gutter={[this.viewObject.get('horizontalGutter') || 0, this.viewObject.get('verticalGutter') || 0]}
            >
                {this.renderChildren(isReadOnly)}
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <Row
                hidden={this.state.isHidden}
                style={{
                    background: '#FFFFFF',
                    boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.05), 2px 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '16px',
                    margin: '16px'}}
                className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
            >
                {this.renderChildren(isReadOnly)}
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return componentRenderCondition ? <a
            className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
            hidden={this.state.isHidden}
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
        };
    }

    componentDidMount(): void {
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)()
    }

    render = () => {
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const { t } = this.props as WithTranslation;
        const span = this.viewObject.get('span') ? `${this.viewObject.get('span')}px` : '0px';
        const label = t(this.viewObject.get('label'));
        const componentRenderCondition = getRenderConditionResult.bind(this)("Button.componentRenderCondition");
        return componentRenderCondition ? <div
            hidden={this.state.isHidden}
            key={this.viewObject._id}>
            <NeoButton
                className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                onClick={isReadOnly ? ()=>{} : () => {
                    const value = getAgGridValue.bind(this)(this.viewObject.get('returnValueType') || 'string', 'ref');
                    handleClick.bind(this)(value);
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
        value = this.urlCurrentValue ? this.urlCurrentValue : this.viewObject.get('value') || "";

        let defaultAgGridValue = "";
        if (this.props.isAgEdit) {
            defaultAgGridValue = this.props.data[this.props.colData]
        }
        this.state = {
            selectData: [],
            params: [],
            currentValue: undefined,
            dataset: undefined,
            isHidden: this.viewObject.get('hidden'),
            isDisabled: this.viewObject.get('disabled'),
            defaultAgGridValue: defaultAgGridValue
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
            hidden: this.state.isHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.selected,
            hidden: this.state.isHidden
        };
    }

    onChange = (currentValue: string|string[]) => {
        if (typeof currentValue === 'string') {
            this.selected = currentValue
        } else if (Array.isArray(currentValue)) {
            let temp = this.state.selectData.filter((el:{key:string,value:string})=>{
                return currentValue.includes(el.value)
            }).map((el:{key:string,value:string})=>{
                return el.key
            });
            this.selected = temp.join(",");
            currentValue = currentValue.join(",");
        }
        handleChange.bind(this)(currentValue)
    };

    componentDidMount(): void {
        if (this.viewObject.get('isDynamic')
            && this.viewObject.get('dataset')) {
            this.setState({dataset:this.viewObject.get('dataset').eContainer});
            if (this.viewObject.get('valueItems').size() === 0) {
                this.props.context.runQueryDataset(this.viewObject.get('dataset').eContainer).then((result: string) => {
                    this.setState({
                        selectData: JSON.parse(result).map((el: any)=>{
                            return {
                                key: el[this.viewObject.get('datasetKeyColumn').get('name')],
                                value: el[this.viewObject.get('datasetValueColumn').get('name')]
                            }
                        }),
                        currentValue: this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : "")
                    },()=> this.props.context.contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, {
                        parameterName: this.viewObject.get('name'),
                        parameterValue: this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.state.currentValue
                    })
                    );
                });
            }
        } else if (this.viewObject.get('staticValues')) {
            this.getStaticValues(this.viewObject.get('staticValues'))
        }
        mountComponent.bind(this)(true,[{actionType: actionType.setValue, callback: this.onChange.bind(this)}] as IAction[]);
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
                        currentValue: isContainsValue ? currentValue : "",
                        selectData: resArr
                    });
                    this.props.context.contextItemValues.set(this.viewObject.get('name')+this.viewObject._id, {
                        parameterName: this.viewObject.get('name'),
                        parameterValue: this.state.currentValue
                    });
                }
            });
        }
    }

    getStaticValues(stringValues: string) {
        const staticValues = stringValues
            .split("\\;")
            .map((e:string)=>{
                const keyValue = e.split("\\:");
                return {
                    key: keyValue[0],
                    value: keyValue[1]
                }
            });
        if (staticValues.length > 0) {
            this.selected = staticValues[0].key;
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
        return this.state.currentValue;
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const width = '200px';
        const componentRenderCondition = getRenderConditionResult.bind(this)("Select.componentRenderCondition");
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            componentRenderCondition ? <div
                hidden={this.state.isHidden}
                style={{marginBottom: marginBottom}}>
                <Select
                    key={this.viewObject._id}
                    className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                    disabled={isReadOnly}
                    showSearch={this.viewObject.get('showSearch')}
                    placeholder={this.viewObject.get('placeholder')}
                    mode={this.viewObject.get('mode') !== null ? this.viewObject.get('mode').toLowerCase() : 'default'}
                    style={{width: width}}
                    defaultValue={this.state.defaultAgGridValue ? this.state.defaultAgGridValue : this.viewObject.get('value') || undefined}
                    value={(this.state.currentValue)? this.state.currentValue: undefined}
                    onChange={(currentValue: string|string[]) => {
                        this.onChange(currentValue);
                        this.setState({
                            currentValue: currentValue
                        })
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
        value = value
            ? value
            : this.viewObject.get('value')
            ? this.viewObject.get('value')
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
            hidden: this.state.isHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format).format(this.state.format),
            hidden: this.state.isHidden
        };
    }

    componentDidMount(): void {
        this.onChange(this.state.defaultDate.format(this.state.mask ? this.state.mask : this.state.format));
        mountComponent.bind(this)(true);
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(true, true)
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.t !== this.props.t) {
            this.setState({locale:switchAntdLocale(this.props.i18n.language, this.props.t)},()=>{this.forceUpdate()})
        }
    }

    onChange = (currentValue: string) => {
        //Возвращаем формат по умолчанию
        const formattedCurrentValue = moment(currentValue, this.state.mask).format(this.state.format);
        handleChange.bind(this)(currentValue, formattedCurrentValue, this.viewObject.get('showTime') ? "Timestamp" : "Date");
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <div hidden={this.state.isHidden}
                 style={{marginBottom: marginBottom}}>
                <ConfigProvider locale={this.state.locale}>
                    <DatePicker
                        key={this.viewObject._id}
                        className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                        showTime={this.viewObject.get('showTime')}
                        defaultValue={this.state.defaultDate}
                        value={moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format)}
                        disabled={isReadOnly}
                        allowClear={this.viewObject.get('allowClear') || false}
                        format={this.state.mask}
                        style={{width: "200px", display: (this.state.isHidden) ? 'none' : undefined}}
                        onChange={(date, dateString) => {
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <div hidden={this.state.isHidden}
                 aria-disabled={isReadOnly}
                 style={{marginBottom: marginBottom}}
                 className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')} content` : 'content'}
                 dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.htmlContent)}}>
            </div>
        )
    }
}

class GroovyCommand_ extends ViewContainer {
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
        const body = replaceNamedParam(command, getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues))
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
            })
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
            })
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
            })
        }
    };
    render = () => {
        return (
            <div/>
        )
    }
}

class ValueHolder_ extends ViewContainer {
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
        return (
            <div/>
        )
    }
}

class Input_ extends ViewContainer {
    private timer : number;
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        value = value ? value : this.viewObject.get('value') || "";
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

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        const width = "200px";
        if (this.viewObject.get('inputType') === 'InputNumber' ) {
            return(
                <div
                    key={this.viewObject._id}
                    style={{marginBottom: marginBottom}}>
                    <InputNumber
                        hidden={this.state.isHidden}
                        className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
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
                        className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
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
        value = value ? value : this.viewObject.get('value') || "";
        this.state = {
            isHidden: this.viewObject.get('hidden') || false,
            isDisabled: this.viewObject.get('disabled') || false,
            currentValue: value,
            checked: this.viewObject.get('isChecked')
        };
        if (this.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.viewObject.get('name'),{
                parameterName: this.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    componentDidMount(): void {
        if (this.viewObject.get('isChecked')) {
            this.onChecked(this.state.checked);
        } else {
            this.onChange('');
        }
        mountComponent.bind(this)();
    }

    componentWillUnmount(): void {
        unmountComponent.bind(this)(false, true)
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
            this.onChange(this.state.currentValue)
        }
        this.setState({checked:isChecked});
    };

    onChange = (currentValue: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let currentContextValue = contextItemValues.get(this.viewObject.get('name')+this.viewObject._id);
        let newContextValue = this.changeSelection(currentContextValue ? currentContextValue.parameterValue : undefined, currentValue);
        handleChange.bind(this)(newContextValue);
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return(
            <div
                key={this.viewObject._id}
                hidden={this.state.isHidden}
                style={{marginBottom: marginBottom}}>
                <NeoInput
                    className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                    type={'checkbox'}
                    checked={this.state.checked}
                    onChange={isReadOnly ? ()=>{} : (e:any) => {
                        this.onChecked(e.currentTarget.checked);
                    }}
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
            hidden: this.state.isHidden
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.viewObject.get('name'),
            hidden: this.state.isHidden
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        let drawObject = this.viewObject;
        if (this.viewObject.get('typographyStyle') !== null) {
            drawObject = this.viewObject.get('typographyStyle')
        }
        let gradients: string = "";
        if (drawObject.get('gradientStyle') !== null) {
            drawObject.get('gradientStyle').get('colors').array().forEach( (c: any) => {
                if (gradients === "") {gradients = c.get('name')}
                else {gradients = gradients + ',' + c.get('name')}
            })
        }
        return (
            <div hidden={this.state.isHidden}>
                <Paragraph
                    key={this.viewObject._id}
                    className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                    style={{
                        marginTop: drawObject.get('marginTop') === null ? '0px' : `${drawObject.get('marginTop')}`,
                        marginBottom: drawObject.get('marginBottom') === null ? '0px' : `${drawObject.get('marginBottom')}`,
                        fontSize: drawObject.get('fontSize') === null ? 'inherit' : `${drawObject.get('fontSize')}`,
                        textIndent: drawObject.get('textIndent') === null ? '0px' : `${drawObject.get('textIndent')}`,
                        height: drawObject.get('height') === null ? 'auto' : `${drawObject.get('height')}`,
                        fontWeight: drawObject.get('fontWeight') || "inherit",
                        textAlign: drawObject.get('textAlign') || "left",
                        color: drawObject.get('color') !== null && drawObject.get('gradientStyle') === null ?
                            drawObject.get('color') : undefined,
                        background: drawObject.get('backgroundColor') !== null && drawObject.get('gradientStyle') === null
                            ?
                            drawObject.get('backgroundColor')
                            :
                            drawObject.get('gradientStyle') !== null
                                ? `linear-gradient(${drawObject.get('gradientStyle').get('position')}, ${gradients})`
                                : undefined,
                        WebkitBackgroundClip: gradients !== "" ? "text" : "unset",
                        WebkitTextFillColor: gradients !== "" ? "transparent" : "unset",
                        display: (this.state.isHidden) ? 'none' : undefined
                    }}
                    copyable={drawObject.get('buttonCopyable')}
                    editable={drawObject.get('buttonEditable') === true ? {onChange: this.onChange} : false} //boolean | { editing: boolean, onStart: Function, onChange: Function(string) }
                    code={drawObject.get('codeStyle')}
                    delete={drawObject.get('deleteStyle')}
                    disabled={isReadOnly}
                    ellipsis={{rows: drawObject.get('ellipsisRow'), expandable: false}}
                    mark={drawObject.get('markStyle')}
                    underline={drawObject.get('underlineStyle')}
                    strong={drawObject.get('strongStyle')}
                >
                    {(this.state.label) ? this.state.label : this.viewObject.get('name')}
                </Paragraph>
            </div>
        )
    }
}

class EventHandler_ extends ViewContainer {
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
                                    (value[el.get('valueObjectKey')])
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
                        if (this.props.pathFull.length > 2) {
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

    render = () => {
        return <div/>
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <Drawer
                className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
                placement={positionEnum[(this.viewObject.get('position') as "Top"|"Left"|"Right"|"Bottom") || 'Top']}
                width={'700px'}
                height={'500px'}
                visible={!this.state.isHidden}
                onClose={()=>{this.setState({isHidden:true})}}
                mask={false}
                maskClosable={false}
                getContainer={false}
                style={{
                    position: 'absolute',
                }}
            >
                {this.renderChildren(isReadOnly)}
            </Drawer>
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
        let cssClass = undefined;
        if (this.viewObject.get('cssClass') !== null) {
            cssClass = document.createElement('style');
            cssClass.innerHTML = `.${this.viewObject.get('cssClass').get('name')} { ${this.viewObject.get('cssClass').get('style')} }`;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
        return (
            <div hidden={this.state.isHidden}>
                <Collapse
                    className={cssClass !== undefined ?`${this.viewObject.get('cssClass').get('name')}` : undefined}
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
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden,
            grantType: grantType,
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
            hidden: hidden,
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
            hidden: hidden,
            grantType: grantType,
        };
        return <MasterdataEditor {...props} key={this.viewObject._id} entityType={this.viewObject.get('entityType')}/>
    }
}

class AntdFactory implements ViewFactory {
    name = 'antd';
    components = new Map<string, typeof View>();

    constructor() {
        this.components.set('ru.neoflex.nfcore.application#//Column', Col_);
        this.components.set('ru.neoflex.nfcore.application#//ComponentElement', ComponentElement_);
        this.components.set('ru.neoflex.nfcore.application#//Form', Form_);
        this.components.set('ru.neoflex.nfcore.application#//TabsViewReport', TabsViewReport_);
        this.components.set('ru.neoflex.nfcore.application#//DatasetView', DatasetView_);
        this.components.set('ru.neoflex.nfcore.application#//Typography', Typography_);
        this.components.set('ru.neoflex.nfcore.application#//Select', Select_);
        this.components.set('ru.neoflex.nfcore.application#//DatePicker', DatePicker_);
        this.components.set('ru.neoflex.nfcore.application#//HtmlContent', HtmlContent_);
        this.components.set('ru.neoflex.nfcore.application#//Button', Button_);
        this.components.set('ru.neoflex.nfcore.application#//Input', Input_);
        this.components.set('ru.neoflex.nfcore.application#//Row', Row_);
        this.components.set('ru.neoflex.nfcore.application#//Calendar', Calendar_);
        this.components.set('ru.neoflex.nfcore.application#//GroovyCommand', GroovyCommand_);
        this.components.set('ru.neoflex.nfcore.application#//ValueHolder', ValueHolder_);
        this.components.set('ru.neoflex.nfcore.application#//MasterdataView', MasterdataView_);
        this.components.set('ru.neoflex.nfcore.application#//EventHandler', EventHandler_);
        this.components.set('ru.neoflex.nfcore.application#//Drawer', Drawer_);
        this.components.set('ru.neoflex.nfcore.application#//Href', Href_);
        this.components.set('ru.neoflex.nfcore.application#//Collapse', Collapse_);
        this.components.set('ru.neoflex.nfcore.application#//Region', Region_);
        this.components.set('ru.neoflex.nfcore.application#//Checkbox', Checkbox_);
    }

    createView(viewObject: Ecore.EObject, props: any): JSX.Element {
        if (startResource === undefined) {
            startResource = viewObject.eResource().to()
        }
        let Component = this.components.get(viewObject.eClass.eURI());
        if (!Component) {
            Component = View
        }
        const isAccessDenied = viewObject.get('grantType') === grantType.denied;
        return (
            isAccessDenied ? <div/> : <Component {...props} key={viewObject._id.toString() + '_1'} viewObject={viewObject} viewFactory={this} />
        )

    }

}

export default new AntdFactory()
