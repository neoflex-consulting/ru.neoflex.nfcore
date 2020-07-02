import {View, ViewFactory} from './View'
import Ecore, {EObject} from 'ecore';
import * as React from 'react';
import {Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Tabs, Typography, Collapse} from 'antd';
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
import {actionType, eventType, positionEnum} from "./utils/consts";
import {getUrlParam} from "./utils/urlUtils";

const { TabPane } = Tabs;
const { Paragraph } = Typography;
const marginBottom = '20px';

let startResource: Object;

abstract class ViewContainer extends View {
    renderChildren = () => {
        let children = this.props.viewObject.get('children') as Ecore.EObject[];
        let childrenView = children.map(
            (c: Ecore.EObject) => {
                return this.viewFactory.createView(c, this.props)
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
            itemId:this.props.viewObject.eURI(),
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
        return (
            <Col span={this.props.viewObject.get('span') || 24}
                 key={this.viewObject._id}
                 hidden={this.state.isHidden}
                 style={{
                borderRight: this.props.viewObject.get('borderRight') ? '1px solid #eeeff0' : 'none',
                borderBottom: this.props.viewObject.get('borderBottom') ? '1px solid #eeeff0' : 'none',
                borderTop: this.props.viewObject.get('borderTop') ? '1px solid #eeeff0' : 'none',
                borderLeft: this.props.viewObject.get('borderLeft') ? '1px solid #eeeff0' : 'none'
            }}>
                {this.renderChildren()}
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
            itemId:this.props.viewObject.eURI(),
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
        return (
            <Form style={{marginBottom: marginBottom}}
                  hidden={this.state.isHidden}
                  key={this.viewObject._id.toString() + '_4'}>
                {this.renderChildren()}
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
            itemId:this.props.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
        let children = this.viewObject.get('children').array() as Ecore.EObject[];
        return (
            <div hidden={this.state.isHidden}>
            <Tabs
                defaultActiveKey={children[0] ? children[0]._id : undefined}
                tabPosition={this.props.viewObject.get('tabPosition') ? this.props.viewObject.get('tabPosition').toLowerCase() : 'top'}>
                {
                    children.map((c: Ecore.EObject) =>
                        <TabPane tab={c.get('name')} key={c._id} >
                            {this.viewFactory.createView(c, this.props)}
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
        if (this.props.viewObject.eClass.get('name') === 'ComponentElement' && this.props.viewObject.get('component')) {
            const componentClassName = this.props.viewObject.get('component').get('componentClassName');
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
            itemId:this.props.viewObject.eURI(),
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
        const marginRight = this.props.viewObject.get('marginRight') === null ? '0px' : `${this.props.viewObject.get('marginRight')}`;
        const marginBottom = this.props.viewObject.get('marginBottom') === null ? '0px' : `${this.props.viewObject.get('marginBottom')}`;
        const marginTop = this.props.viewObject.get('marginTop') === null ? '0px' : `${this.props.viewObject.get('marginTop')}`;
        const marginLeft = this.props.viewObject.get('marginLeft') === null ? '0px' : `${this.props.viewObject.get('marginLeft')}`;
        const borderBottom = this.props.viewObject.get('borderBottom') === true ? '1px solid #eeeff0' : 'none';
        const height = this.props.viewObject.get('height');
        return (
            <Row
                key={this.viewObject._id.toString() + '_7'}
                hidden={this.state.isHidden}
                style={{
                    textAlign: this.props.viewObject.get('textAlign') || 'left',
                    marginRight: marginRight,
                    marginBottom: marginBottom,
                    marginTop: marginTop,
                    marginLeft: marginLeft,
                    borderBottom: borderBottom,
                    height: height,
                }}
                gutter={[this.props.viewObject.get('horizontalGutter') || 0, this.props.viewObject.get('verticalGutter') || 0]}
            >
                {this.renderChildren()}
            </Row>
        )
    }
}

export class Href_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.props.viewObject.get('hidden'),
            isDisabled: this.props.viewObject.get('disabled'),
        };
    }

    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    render = () => {
        let value : string;
        const returnValueType = this.props.viewObject.get('returnValueType') || 'string';
        //this.props.data/this.props.getValue props из ag-grid
        if (returnValueType === 'object') {
            value = this.props.data ? this.props.data : {[this.props.viewObject.get('name')] : this.props.viewObject.get('label')}
        }
        if (returnValueType === 'string') {
            value = this.props.getValue ? this.props.getValue() : this.props.viewObject.get('label')
        }
        return <a
            hidden={this.state.isHidden}
            href={this.props.viewObject.get('ref') ? this.props.viewObject.get('ref') : "#"}
                  onClick={this.state.isDisabled ? ()=>{} : ()=>{
                      const contextItemValues = this.props.context.contextItemValues;
                      contextItemValues.set(this.props.viewObject.eURI(), {
                          parameterName: this.props.viewObject.get('name'),
                          parameterValue: value
                      });
                      this.props.context.notifyAllEventHandlers({
                      type:eventType.click,
                      itemId:this.props.viewObject.eURI(),
                      value:value
                      })
                  }}>
            { this.props.viewObject.get('label')
                ? this.props.viewObject.get('label')
                : (this.props.getValue ? this.props.getValue() : undefined) }
        </a>
    }
}

export class Button_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.props.viewObject.get('hidden'),
            isDisabled: this.props.viewObject.get('disabled'),
        };
    }

    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
        const { t } = this.props as WithTranslation;
        const span = this.props.viewObject.get('span') ? `${this.props.viewObject.get('span')}px` : '0px';
        const label = t(this.props.viewObject.get('label'));
        let value : string;
        const returnValueType = this.props.viewObject.get('returnValueType') || 'string';
        //this.props.data/this.props.getValue props из ag-grid
        if (returnValueType === 'object') {
            value = this.props.data ? this.props.data : {[this.props.viewObject.get('name')] : this.props.viewObject.get('ref')}
        }
        if (returnValueType === 'string') {
            value = this.props.getValue ? this.props.getValue() : this.props.viewObject.get('ref')
        }
        return <div
            hidden={this.state.isHidden}
            key={this.viewObject._id}>
            <Button title={'Submit'} style={{ width: '100px', left: span, marginBottom: marginBottom}}
                    onClick={this.state.isDisabled ? ()=>{} : () => {
                                    this.props.context.notifyAllEventHandlers({
                                        type:eventType.click,
                                        itemId:this.props.viewObject.eURI(),
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
            this.urlCurrentValue = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.props.viewObject.get('name'));
        }
        value = this.urlCurrentValue ? this.urlCurrentValue : this.props.viewObject.get('value') || "";

        this.state = {
            selectData: [],
            params: [],
            currentValue: undefined,
            datasetComponent: undefined,
            isHidden: this.props.viewObject.get('hidden'),
            isDisabled: this.props.viewObject.get('disabled'),
        };
        if (this.props.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.props.viewObject.get('name'),{
                parameterName: this.props.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.selected
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.selected
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
            parameterName: this.props.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.props.viewObject.eURI(), parameterObj);
        if (this.props.viewObject.get('isGlobal')) {
            globalValues.set(this.props.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.props.viewObject.eURI(),
                    value:this.selected
                }))
        );
    };

    componentDidMount(): void {
        if (this.props.viewObject.get('isDynamic')
            && this.props.viewObject.get('datasetComponent')) {
            this.setState({datasetComponent:this.props.viewObject.get('datasetComponent').eContainer});
            if (this.props.viewObject.get('valueItems').size() === 0) {
                this.props.context.runQuery(this.props.viewObject.get('datasetComponent').eContainer).then((result: string) => {
                    this.setState({
                        selectData: JSON.parse(result).map((el: any)=>{
                            return {
                                key: el[this.props.viewObject.get('keyColumn')],
                                value: el[this.props.viewObject.get('valueColumn')]
                            }
                        }),
                        currentValue: this.urlCurrentValue ? this.urlCurrentValue : (this.props.viewObject.get('value') ? this.props.viewObject.get('value') : "")
                    },()=> this.props.context.contextItemValues.set(this.props.viewObject.eURI(), {
                        parameterName: this.props.viewObject.get('name'),
                        parameterValue: this.state.currentValue
                    })
                    );
                });
            }
        } else if (this.props.viewObject.get('staticValues')) {
            this.getStaticValues(this.props.viewObject.get('staticValues'))
        }
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues);
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)
            && this.state.datasetComponent
            && this.props.viewObject.get('valueItems')) {
            this.setState({params: newParams});
            this.props.context.runQuery(this.state.datasetComponent, newParams).then((result: string) => {
                const resArr = JSON.parse(result).map((el: any)=>{
                    return {
                        key: el[this.props.viewObject.get('keyColumn')],
                        value: el[this.props.viewObject.get('valueColumn')]
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
                this.props.context.contextItemValues.set(this.props.viewObject.eURI(), {
                    parameterName: this.props.viewObject.get('name'),
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
            currentValue: this.urlCurrentValue ? this.urlCurrentValue : (this.props.viewObject.get('value') ? this.props.viewObject.get('value') : "")
        },()=> this.props.context.contextItemValues.set(this.props.viewObject.eURI(), {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: this.state.currentValue
        }))
    }

    render = () => {
        const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
            return (
                <div
                    hidden={this.state.isHidden}
                    style={{marginBottom: marginBottom}}>
                    <Select
                        key={this.viewObject._id}
                        disabled={this.state.isDisabled}
                        showSearch={this.props.viewObject.get('showSearch')}
                        placeholder={this.props.viewObject.get('placeholder')}
                        mode={this.props.viewObject.get('mode') !== null ? this.props.viewObject.get('mode').toLowerCase() : 'default'}
                        style={{width: width}}
                        defaultValue={this.props.viewObject.get('value') || undefined}
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
                            <Select.Option key={this.props.viewObject.get('name') + 'Select'}
                                           value={this.props.viewObject.get('name') + 'Select'}>

                            </Select.Option>
                        }
                    </Select>
                </div>
            )
        }
}

class DatePicker_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        let value;
        if (this.props.pathFull[this.props.pathFull.length - 1].params !== undefined) {
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.props.viewObject.get('name'));
        }
        value = value ? value : this.props.viewObject.get('value');

        this.state = {
            pickedDate: value ? moment(value, this.props.viewObject.get('format') || "YYYY-MM-DD") : moment(),
            currentValue: value,
            format: this.props.viewObject.get('format') || "YYYY-MM-DD",
            isHidden: this.props.viewObject.get('hidden') || false,
            isDisabled: this.props.viewObject.get('disabled') || false
        };
        if (this.props.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.props.viewObject.get('name'),{
                parameterName: this.props.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.state.pickedDate.format(this.state.format)
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.state.pickedDate.format(this.state.format)
        };
    }

    componentDidMount(): void {
        this.onChange(this.state.pickedDate.format(this.state.format));
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    onChange = (currentValue: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue,
            parameterDataType: "Date",
            parameterDateFormat: this.props.viewObject.get('format') || "YYYY-MM-DD"
        };
        contextItemValues.set(this.props.viewObject.eURI(), parameterObj);
        if (this.props.viewObject.get('isGlobal')) {
            globalValues.set(this.props.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.props.viewObject.eURI(),
                    value:currentValue
                }))
        );
    };

    render = () => {
        return (
            <div hidden={this.state.isHidden}
                 style={{marginBottom: marginBottom}}>
                 <DatePicker
                    key={this.viewObject._id}
                    defaultValue={this.state.pickedDate}
                    value={moment(this.state.currentValue, this.props.viewObject.get('format') || "YYYY-MM-DD")}
                    disabled={this.state.isDisabled}
                    allowClear={this.props.viewObject.get('allowClear') || false}
                    format={this.state.format}
                    style={{width: this.props.viewObject.get('width') || "200px", display: (this.state.isHidden) ? 'none' : undefined}}
                    onChange={(date, dateString) => {
                        this.onChange(dateString)
                    }}/>
            </div>
        )
    }
}

class HtmlContent_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        const params = getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues).map(obj => {
            return {
                ...obj,
                parameterValue: obj.parameterValue ? obj.parameterValue : ""
            }
        });
        this.state = {
            htmlContent: replaceNamedParam(this.props.viewObject.get('htmlContent'),params),
            params: params,
            isHidden: this.props.viewObject.get('hidden') || false,
            isDisabled: this.props.viewObject.get('disabled') || false,
        };
    }


    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
        const newParams = getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues).map(obj => {
            return {
                ...obj,
                parameterValue: obj.parameterValue ? obj.parameterValue : ""
            }
        });
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)) {
            this.setState({
                params: newParams,
                htmlContent: replaceNamedParam(this.props.viewObject.get('htmlContent'), newParams) ,
            })
        }
    }

    render = () => {
        return (
            <div hidden={this.state.isHidden}
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
            itemId:this.props.viewObject.eURI(),
            actions: [
                {actionType: actionType.execute,callback: this.execute.bind(this)},
                ]
        });
        if (this.props.viewObject.get('executeOnStartup')) {
            this.execute()
        }
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }


    setValue = (result: any) => {
        const contextItemValues = this.props.context.contextItemValues;
        contextItemValues.set(this.props.viewObject.eURI(), {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: result
        });
        this.props.context.updateContext!({contextItemValues: contextItemValues},
            ()=>this.props.context.notifyAllEventHandlers({
                type:eventType.change,
                itemId:this.props.viewObject.eURI()
            }));
    };

    execute = () => {
        const commandType = this.props.viewObject.get('commandType')||"Eval";
        const command = this.props.viewObject.get('command');
        if (commandType === "Resource") {
            API.instance().fetchJson('/script/resource?path='+this.props.viewObject.get('gitResourcePath'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues))
            }).then(res => {
                this.setValue(res)
            })
        } else if (commandType === "Static") {
            API.instance().fetchJson('/script/static/'+this.props.viewObject.get('gitStaticClass')+'/'+this.props.viewObject.get('gitStaticMethod'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues))
            }).then(res => {
                this.setValue(res)
            })
        } else {
            API.instance().fetchJson('/script/eval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems'), this.props.context.contextItemValues))
            }).then(res => {
                this.setValue(res)
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
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.props.viewObject.get('name'));
        }
        value = value ? value : this.props.viewObject.get('value') || "";
        this.state = {
            currentValue: value
        };
        if (this.props.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.props.viewObject.get('name'),{
                parameterName: this.props.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    onChange = (currentValue?: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.props.viewObject.eURI(), parameterObj);
        if (this.props.viewObject.get('isGlobal')) {
            globalValues.set(this.props.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.props.viewObject.eURI(),
                    value:currentValue
                }))
        );
    };

    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
            actions: [
                {actionType: actionType.setValue,callback: this.onChange.bind(this)}
            ]
        });
        const contextItemValues = this.props.context.contextItemValues;
        contextItemValues.set(this.props.viewObject.eURI(), {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: this.props.viewObject.get('value')
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI(),
            value: this.props.viewObject.get('value')
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.viewObject.get('contextWriter')) {
            const contextItem = this.props.context.contextItemValues.get(this.props.viewObject.get('contextWriter').eURI());
            const columnName = this.props.viewObject.get('groovyCommandResultColumnName');
            const currentContextValue = this.props.context.contextItemValues.get(this.props.viewObject.eURI());
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
            value = getUrlParam(this.props.pathFull[this.props.pathFull.length - 1].params, this.props.viewObject.get('name'));
        }
        value = value ? value : this.props.viewObject.get('value') || "";
        this.state = {
            isHidden: this.props.viewObject.get('hidden') || false,
            isDisabled: this.props.viewObject.get('disabled') || false,
            currentValue: value
        };
        if (this.props.viewObject.get('isGlobal')) {
            this.props.context.globalValues.set(this.props.viewObject.get('name'),{
                parameterName: this.props.viewObject.get('name'),
                parameterValue: value
            })
        }
    }

    componentDidMount(): void {
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    onChange = (currentValue: string) => {
        let contextItemValues = this.props.context.contextItemValues;
        let globalValues = this.props.context.globalValues;
        const parameterObj = {
            parameterName: this.props.viewObject.get('name'),
            parameterValue: (currentValue === undefined) ? null : currentValue
        };
        contextItemValues.set(this.props.viewObject.eURI(), parameterObj);
        if (this.props.viewObject.get('isGlobal')) {
            globalValues.set(this.props.viewObject.get('name'), parameterObj)
        }
        this.setState({currentValue:currentValue},()=>
            this.props.context.updateContext!({contextItemValues: contextItemValues, globalValues: globalValues},
                ()=>this.props.context.notifyAllEventHandlers({
                    type:eventType.change,
                    itemId:this.props.viewObject.eURI(),
                    value:currentValue
                }))
        );
    };

    render = () => {
        const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
        if (this.props.viewObject.get('inputType') === 'InputNumber' ) {
            return(
                <div
                    key={this.viewObject._id}
                    style={{marginBottom: marginBottom}}>
                    <InputNumber
                        hidden={this.state.isHidden}
                        style={{width: width}}
                        disabled={this.state.isDisabled}
                        min={this.props.viewObject.get('minValue') || 1}
                        max={this.props.viewObject.get('maxValue') || 99}
                        step={this.props.viewObject.get('step') || 1}
                        placeholder={this.props.viewObject.get('placeholder')}
                        defaultValue={Number(this.props.viewObject.get('value') || this.props.viewObject.get('minValue') || 1)}
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
                        disabled={this.state.isDisabled}
                        placeholder={this.props.viewObject.get('placeholder')}
                        defaultValue={this.props.viewObject.get('value')}
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
            isHidden: this.props.viewObject.get('hidden') || false,
            isDisabled: this.props.viewObject.get('disabled') || false,
            label: "",
        };
    }

    componentDidMount(): void {
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
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
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
        this.props.context.removeEventAction();
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.text,
            textData: this.props.viewObject.get('name')
        };
    }

    private getExcelData(): excelExportObject {
        return {
            excelComponentType : excelElementExportType.text,
            textData: this.props.viewObject.get('name')
        };
    }

    onChange = (str: string) => {
        this.setState({label: str},()=>this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemId:this.props.viewObject.eURI(),
            value:str
        }));
    };

    render = () => {
        let drawObject = this.props.viewObject;
        if (this.props.viewObject.get('typographyStyle') !== null) {
            drawObject = this.props.viewObject.get('typographyStyle')
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
                    disabled={this.state.isDisabled}
                    ellipsis={{rows: drawObject.get('ellipsisRow'), expandable: false}}
                    mark={drawObject.get('markStyle')}
                    underline={drawObject.get('underlineStyle')}
                    strong={drawObject.get('strongStyle')}
                >
                    {(this.state.label) ? this.state.label : this.props.viewObject.get('name')}
                </Paragraph>
            </div>
        )
    }
}

class EventHandler_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isHidden: this.props.viewObject.get('hidden') || false,
            isDisabled: this.props.viewObject.get('disabled') || false,
        };
    }

    handleEvent(value:any) {
        if (!this.state.isDisabled) {
            let isHandled = false;
            this.props.viewObject.get('eventActions').each((el: EObject) => {
                const eventAction: IEventAction = this.props.context.getEventActions().find((action: IEventAction) => {
                    return (el.get('triggerItem')
                        && (action.itemId === el.get('triggerItem').eURI())
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
                                    `Object Key ${el.get('valueObjectKey')} in action=${el.get('action')} / event=${this.props.viewObject.get('name')} (${el.get('triggerItem').get('name')}) not found`,
                                    "warning")
                                isHandled = true;
                            } else if (value === Object(value) && action.actionType === actionType.setValue) {
                                this.props.context.notification("Event handler warning",
                                    `Object Key is not specified in action=${el.get('action')} / event=${this.props.viewObject.get('name')} (${el.get('triggerItem').get('name')}) not found`,
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
                        `Action ${el.get('action') || actionType.execute} is not supported for ${this.props.viewObject.get('name')}`,
                        "warning")
                }
            })
        }
    }

    componentDidMount(): void {
        if (this.props.viewObject.get('listenItem')) {
            this.props.context.addEventHandler({
                itemId: this.props.viewObject.get('listenItem').eURI(),
                eventType: this.props.viewObject.get('event') || "click",
                callback: this.handleEvent.bind(this)
            })
        }
    }

    componentWillUnmount(): void {
        if (this.props.viewObject.get('listenItem')) {
            this.props.context.removeEventHandler(this.props.viewObject.get('listenItem').eURI())
        }
        this.props.context.contextItemValues.delete(this.props.viewObject.eURI());
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
            itemId:this.props.viewObject.eURI(),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction();
    }

    render = () => {
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
                {this.renderChildren()}
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
                </Collapse>

            </div>
        )
    }
}

class DatasetView_ extends ViewContainer {
    render = () => {
        const hidden = this.props.viewObject.get('hidden') || false;
        const disabled = this.props.viewObject.get('disabled') || false;
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden,
        };
        return <DatasetView {...props} key={this.viewObject._id.toString() + '_5'}/>
    }
}

class Calendar_ extends ViewContainer {
    render = () => {
        const hidden = this.props.viewObject.get('hidden') || false;
        const disabled = this.props.viewObject.get('disabled') || false;
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden,
        };
        return <Calendar {...props} key={this.viewObject._id}/>
    }
}

class MasterdataView_ extends ViewContainer {
    render = () => {
        const hidden = this.props.viewObject.get('hidden') || false;
        const disabled = this.props.viewObject.get('disabled') || false;
        const props = {
            ...this.props,
            disabled: disabled,
            hidden: hidden,
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

        return (
            <Component {...props} key={viewObject._id.toString() + '_1'} viewObject={viewObject} viewFactory={this} />
        )

    }

}

export default new AntdFactory()
