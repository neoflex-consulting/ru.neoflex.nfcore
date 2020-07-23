import {View, ViewFactory} from './View'
import Ecore, {EObject} from 'ecore';
import * as React from 'react';
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Tabs,
    Typography,
    Collapse,
    ConfigProvider
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
import {IEventAction} from "./MainContext";
import DOMPurify from 'dompurify'
import {getNamedParams, replaceNamedParam} from "./utils/namedParamsUtils";
import {
    actionType,
    defaultDateFormat,
    defaultTimestampFormat,
    eventType,
    grantType,
    positionEnum
} from "./utils/consts";
import {getUrlParam} from "./utils/urlUtils";
import {saveAs} from "file-saver";
import {switchAntdLocale} from "./utils/antdLocalization";

const { TabPane } = Tabs;
const { Paragraph } = Typography;
const marginBottom = '20px';

let startResource: Object;

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
        return <div key={this.viewObject._id.toString() + '_2'}>{childrenView}</div>

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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        return (
            <Col span={Number(this.viewObject.get('span')) || 24}
                 key={this.viewObject._id}
                 hidden={this.state.isHidden}
                 style={{
                borderRight: this.viewObject.get('borderRight') ? '1px solid #eeeff0' : 'none',
                borderBottom: this.viewObject.get('borderBottom') ? '1px solid #eeeff0' : 'none',
                borderTop: this.viewObject.get('borderTop') ? '1px solid #eeeff0' : 'none',
                borderLeft: this.viewObject.get('borderLeft') ? '1px solid #eeeff0' : 'none'
            }}>
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        return (
            <Form style={{marginBottom: marginBottom}}
                  hidden={this.state.isHidden}
                  key={this.viewObject._id.toString() + '_4'}>
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        let children = this.viewObject.get('children').array() as Ecore.EObject[];
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const props = {
            ...this.props,
            isParentDisabled: isReadOnly
        }
        return (
            <div hidden={this.state.isHidden}>
            <Tabs
                defaultActiveKey={children[0] ? children[0]._id : undefined}
                tabPosition={this.viewObject.get('tabPosition') ? this.viewObject.get('tabPosition').toLowerCase() : 'top'}>
                {
                    children.map((c: Ecore.EObject) =>
                        <TabPane tab={c.get('name')} key={c._id} >
                            {this.viewFactory.createView(c, props)}
                        </TabPane>
                    )
                }
            </Tabs>
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const marginRight = this.viewObject.get('marginRight') === null ? '0px' : `${this.viewObject.get('marginRight')}`;
        const marginBottom = this.viewObject.get('marginBottom') === null ? '0px' : `${this.viewObject.get('marginBottom')}`;
        const marginTop = this.viewObject.get('marginTop') === null ? '0px' : `${this.viewObject.get('marginTop')}`;
        const marginLeft = this.viewObject.get('marginLeft') === null ? '0px' : `${this.viewObject.get('marginLeft')}`;
        const borderBottom = this.viewObject.get('borderBottom') === true ? '1px solid #eeeff0' : 'none';
        const height = this.viewObject.get('height');
        return (
            <Row
                key={this.viewObject._id.toString() + '_7'}
                hidden={this.state.isHidden}
                style={{
                    textAlign: this.viewObject.get('textAlign') || 'left',
                    marginRight: marginRight,
                    marginBottom: marginBottom,
                    marginTop: marginTop,
                    marginLeft: marginLeft,
                    borderBottom: borderBottom,
                    height: height,
                }}
                gutter={[this.viewObject.get('horizontalGutter') || 0, this.viewObject.get('verticalGutter') || 0]}
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        let value : string;
        const returnValueType = this.viewObject.get('returnValueType') || 'string';
        //this.props.data/this.props.getValue props из ag-grid
        if (returnValueType === 'object') {
            value = this.props.data ? this.props.data : {[this.viewObject.get('name')] : this.viewObject.get('label')}
        }
        if (returnValueType === 'string') {
            value = this.props.getValue ? this.props.getValue() : this.viewObject.get('label')
        }
        return <a
            hidden={this.state.isHidden}
            href={this.viewObject.get('ref') ? this.viewObject.get('ref') : "#"}
                  onClick={isReadOnly ? ()=>{} : ()=>{
                      const contextItemValues = this.props.context.contextItemValues;
                      contextItemValues.set(this.viewObject.eURI(), {
                          parameterName: this.viewObject.get('name'),
                          parameterValue: value
                      });
                      this.props.context.notifyAllEventHandlers({
                      type:eventType.click,
                      itemId:this.viewObject.eURI(),
                      value:value
                      })
                  }}>
            { this.viewObject.get('label')
                ? this.viewObject.get('label')
                : (this.props.getValue ? this.props.getValue() : undefined) }
        </a>
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const { t } = this.props as WithTranslation;
        const span = this.viewObject.get('span') ? `${this.viewObject.get('span')}px` : '0px';
        const label = t(this.viewObject.get('label'));
        let value : string;
        const returnValueType = this.viewObject.get('returnValueType') || 'string';
        //this.props.data/this.props.getValue props из ag-grid
        if (returnValueType === 'object') {
            value = this.props.data ? this.props.data : {[this.viewObject.get('name')] : this.viewObject.get('ref')}
        }
        if (returnValueType === 'string') {
            value = this.props.getValue ? this.props.getValue() : this.viewObject.get('ref')
        }
        return <div
            hidden={this.state.isHidden}
            key={this.viewObject._id}>
            <Button title={'Submit'} style={{ width: '100px', left: span, marginBottom: marginBottom}}
                    onClick={isReadOnly ? ()=>{} : () => {
                                    this.props.context.notifyAllEventHandlers({
                                        type:eventType.click,
                                        itemId:this.viewObject.eURI(),
                                        value:value});
                                }}>
                {(label)? label: t('submit')}
            </Button>
        </div>
    }
}

class Select_ extends ViewContainer {
    private selected = "";
    private urlCurrentValue = "";

    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            this.urlCurrentValue = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.viewObject.get('name'));
        }
        value = this.urlCurrentValue ? this.urlCurrentValue : this.viewObject.get('value') || "";

        this.state = {
            selectData: [],
            params: [],
            currentValue: undefined,
            datasetComponent: undefined,
            isHidden: this.viewObject.get('hidden'),
            isDisabled: this.viewObject.get('disabled'),
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
            hidden: this.viewObject.get('hidden')
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.selected,
            hidden: this.viewObject.get('hidden')
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
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.viewObject.eURI(), parameterObj);
        if (this.viewObject.get('isGlobal')) {
            globalValues.set(this.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.viewObject.eURI(),
                    value:this.selected
                }))
        );
    };

    componentDidMount(): void {
        if (this.viewObject.get('isDynamic')
            && this.viewObject.get('datasetComponent')) {
            this.setState({datasetComponent:this.viewObject.get('datasetComponent').eContainer});
            if (this.viewObject.get('valueItems').size() === 0) {
                this.props.context.runQuery(this.viewObject.get('datasetComponent').eContainer).then((result: string) => {
                    this.setState({
                        selectData: JSON.parse(result).map((el: any)=>{
                            return {
                                key: el[this.viewObject.get('keyColumn')],
                                value: el[this.viewObject.get('valueColumn')]
                            }
                        }),
                        currentValue: this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : "")
                    },()=> this.props.context.contextItemValues.set(this.viewObject.eURI(), {
                        parameterName: this.viewObject.get('name'),
                        parameterValue: this.state.currentValue
                    })
                    );
                });
            }
        } else if (this.viewObject.get('staticValues')) {
            this.getStaticValues(this.viewObject.get('staticValues'))
        }
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.setValue, callback: this.onChange.bind(this)},
            ]
        });

        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues);
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)
            && this.state.datasetComponent
            && this.viewObject.get('valueItems')) {
            this.setState({params: newParams});
            this.props.context.runQuery(this.state.datasetComponent, newParams).then((result: string) => {
                const resArr = JSON.parse(result).map((el: any)=>{
                    return {
                        key: el[this.viewObject.get('keyColumn')],
                        value: el[this.viewObject.get('valueColumn')]
                    }
                });
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
                this.props.context.contextItemValues.set(this.viewObject.eURI(), {
                    parameterName: this.viewObject.get('name'),
                    parameterValue: this.state.currentValue
                });
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
            currentValue: this.urlCurrentValue ? this.urlCurrentValue : (this.viewObject.get('value') ? this.viewObject.get('value') : "")
        },()=> this.props.context.contextItemValues.set(this.viewObject.eURI(), {
            parameterName: this.viewObject.get('name'),
            parameterValue: this.state.currentValue
        }))
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const width = this.viewObject.get('width') === null ? '200px' : `${this.viewObject.get('width')}px`;
            return (
                <div
                    hidden={this.state.isHidden}
                    style={{marginBottom: marginBottom}}>
                    <Select
                        key={this.viewObject._id}
                        disabled={isReadOnly}
                        showSearch={this.viewObject.get('showSearch')}
                        placeholder={this.viewObject.get('placeholder')}
                        mode={this.viewObject.get('mode') !== null ? this.viewObject.get('mode').toLowerCase() : 'default'}
                        style={{width: width}}
                        defaultValue={this.viewObject.get('value') || undefined}
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
                </div>
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
        value = value ? value : this.viewObject.get('value');
        const formatedValue:string = mask ? moment(value, format).format(mask) : value;

        this.state = {
            pickedDate: mask ? moment(formatedValue, mask) : moment(value, format),
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
            textData: this.state.pickedDate.format(this.state.format),
            hidden: this.viewObject.get('hidden')
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.state.pickedDate.format(this.state.format),
            hidden: this.viewObject.get('hidden')
        };
    }

    componentDidMount(): void {
        this.onChange(this.state.pickedDate.format(this.state.mask ? this.state.mask : this.state.format));
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.t !== this.props.t) {
            this.setState({locale:switchAntdLocale(this.props.i18n.language, this.props.t)},()=>{this.forceUpdate()})
        }
    }

    onChange = (currentValue: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        //Возвращаем формат по умолчанию
        const formattedCurrentValue = moment(currentValue, this.state.mask).format(this.state.format);
        const parameterObj = {
            parameterName: this.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : formattedCurrentValue,
            parameterDataType: this.viewObject.get('showTime') ? "Timestamp" : "Date"
        };
        contextItemValues.set(this.viewObject.eURI(), parameterObj);
        if (this.viewObject.get('isGlobal')) {
            globalValues.set(this.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.viewObject.eURI(),
                    value:formattedCurrentValue
                }))
        );
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        return (
            <div hidden={this.state.isHidden}
                 style={{marginBottom: marginBottom}}>
                <ConfigProvider locale={this.state.locale}>
                 <DatePicker
                    key={this.viewObject._id}
                    showTime={this.viewObject.get('showTime')}
                    defaultValue={this.state.pickedDate}
                    value={moment(this.state.currentValue, this.state.mask ? this.state.mask : this.state.format)}
                    disabled={isReadOnly}
                    allowClear={this.viewObject.get('allowClear') || false}
                    format={this.state.mask}
                    style={{width: this.viewObject.get('width') || "200px", display: (this.state.isHidden) ? 'none' : undefined}}
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


    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
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
        return (
            <div hidden={this.state.isHidden}
                 aria-disabled={isReadOnly}
                 style={{marginBottom: marginBottom}}
                 className="content"
                 dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.htmlContent)}}>
            </div>
        )
    }
}

class GroovyCommand_ extends ViewContainer {
    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions: [
                {actionType: actionType.execute,callback: this.execute.bind(this)},
                ]
        });
        if (this.viewObject.get('executeOnStartup')) {
            this.execute()
        }
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }


    setValue = (result: any) => {
        const contextItemValues = this.props.context.contextItemValues;
        contextItemValues.set(this.viewObject.eURI(), {
            parameterName: this.viewObject.get('name'),
            parameterValue: result
        });
        this.props.context.updateContext!({contextItemValues: contextItemValues},
            ()=>this.props.context.notifyAllEventHandlers({
                type:eventType.change,
                itemId:this.viewObject.eURI()
            }));
    };

    execute = () => {
        const commandType = this.viewObject.get('commandType')||"Eval";
        const command = this.viewObject.get('command');
        if (commandType === "Resource") {
            API.instance().fetchJson('/script/resource?path='+this.viewObject.get('gitResourcePath'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues))
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
                body: replaceNamedParam(command, getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues))
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
                body: replaceNamedParam(command, getNamedParams(this.viewObject.get('valueItems'), this.props.context.contextItemValues))
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

    onChange = (currentValue?: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.viewObject.eURI(), parameterObj);
        if (this.viewObject.get('isGlobal')) {
            globalValues.set(this.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.viewObject.eURI(),
                    value:currentValue
                }))
        );
    };

    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions: [
                {actionType: actionType.setValue,callback: this.onChange.bind(this)}
            ]
        });
        const contextItemValues = this.props.context.contextItemValues;
        contextItemValues.set(this.viewObject.eURI(), {
            parameterName: this.viewObject.get('name'),
            parameterValue: this.viewObject.get('value')
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI(),
            value: this.viewObject.get('value')
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.viewObject.get('contextWriter')) {
            const contextItem = this.props.context.contextItemValues.get(this.viewObject.get('contextWriter').eURI());
            const columnName = this.viewObject.get('groovyCommandResultColumnName');
            const currentContextValue = this.props.context.contextItemValues.get(this.viewObject.eURI());
            if (contextItem
                && contextItem.parameterValue.length >= 1
                && columnName) {
                const value = contextItem.parameterValue[0][columnName];
                if (value !== (currentContextValue ? currentContextValue.parameterValue: undefined)) {
                    this.onChange(value);
                }
            }
        }
    }

    render = () => {
        return (
            <div/>
        )
    }
}

class Input_ extends ViewContainer {
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.setValue, callback: this.onChange.bind(this)}
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    onChange = (currentValue: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.viewObject.eURI(), parameterObj);
        if (this.viewObject.get('isGlobal')) {
            globalValues.set(this.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.viewObject.eURI(),
                    value:currentValue
                }))
        );
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        const width = this.viewObject.get('width') === null ? '200px' : `${this.viewObject.get('width')}px`;
        if (this.viewObject.get('inputType') === 'InputNumber' ) {
            return(
                <div
                    key={this.viewObject._id}
                    style={{marginBottom: marginBottom}}>
                    <InputNumber
                        hidden={this.state.isHidden}
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
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.setValue,callback: this.onChange.bind(this)},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.viewObject.get('name'),
            hidden: this.viewObject.get('hidden')
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.viewObject.get('name'),
            hidden: this.viewObject.get('hidden')
        };
    }

    onChange = (str: string) => {
        this.setState({label: str},()=>this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemId:this.viewObject.eURI(),
            value:str
        }));
    };

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
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
            this.viewObject.get('eventActions').each((el: EObject) => {
                const eventAction: IEventAction = this.props.context.getEventActions().find((action: IEventAction) => {
                    return ((el.get('triggerItem')
                        && action.itemId === el.get('triggerItem').eURI())
                        || el.get('action') === actionType.showMessage
                        || el.get('action') === actionType.redirect)
                });
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
                                    "warning")
                                isHandled = true;
                            } else if (value === Object(value) && action.actionType === actionType.setValue) {
                                this.props.context.notification("Event handler warning",
                                    `Object Key is not specified in action=${el.get('action')} / event=${this.viewObject.get('name')} (${el.get('triggerItem').get('name')}) not found`,
                                    "warning")
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
                        el.get('triggerItem').get('messageType') || "success")
                    isHandled = true;
                }
                if (el.get('action') === actionType.redirect) {
                    const redirectTo = el.get('redirectTo') ? el.get('redirectTo').get('name') : null;
                    const params = getNamedParams(el.get('redirectParams'), this.props.context.contextItemValues);
                    this.props.context.changeURL(redirectTo, true, undefined, params);
                    isHandled = true;
                }
                if (!isHandled) {
                    this.props.context.notification("Event handler warning",
                        `Action ${el.get('action') || actionType.execute} is not supported for ${this.viewObject.get('name')}`,
                        "warning")
                }
            })
        }
    }

    componentDidMount(): void {
        if (this.viewObject.get('listenItem')) {
            this.props.context.addEventHandler({
                itemId: this.viewObject.get('listenItem').eURI(),
                eventType: this.viewObject.get('event') || "click",
                callback: this.handleEvent.bind(this)
            })
        }
    }

    componentWillUnmount(): void {
        if (this.viewObject.get('listenItem')) {
            this.props.context.removeEventHandler(this.viewObject.get('listenItem').eURI())
        }
        this.props.context.contextItemValues.delete(this.viewObject.eURI());
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
        this.props.context.addEventAction({
            itemId:this.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        const isReadOnly = this.viewObject.get('grantType') === grantType.read || this.state.isDisabled || this.props.isParentDisabled;
        return (
            <Drawer
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



       render = () => {

        return (
            <div>
                <Collapse
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
