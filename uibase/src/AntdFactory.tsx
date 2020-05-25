import {View, ViewFactory} from './View'
import Ecore, {EObject} from 'ecore';
import * as React from 'react';
import {Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Tabs, Typography, Drawer} from 'antd';
import UserComponent from './components/app/UserComponent';
import DatasetView from './components/app/dataset/DatasetView';
import DatasetPivot from './components/app/dataset/DatasetPivot';
import DatasetDiagram from './components/app/dataset/DatasetDiagram';
import MasterdataEditor from './components/app/masterdata/MasterdataEditor';
import {API} from './modules/api';
import {WithTranslation} from 'react-i18next';
import DatasetGrid from "./components/app/dataset/DatasetGrid";
import {docxElementExportType, docxExportObject} from "./utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "./utils/excelExportUtils";
import Calendar from "./components/app/calendar/Calendar";
import moment from 'moment';
import {IEventAction} from "./MainContext";
import DOMPurify from 'dompurify'
import {getNamedParams, replaceNamedParam} from "./utils/namedParamsUtils";
import {eventType, actionType, positionEnum} from "./utils/consts";

const { TabPane } = Tabs;
const { Paragraph } = Typography;
const marginBottom = '20px';

let startResource: Object;

interface State {
    datasetGridName: string
}

abstract class ViewContainer extends View {
    renderChildren = () => {
        let children = this.props.viewObject.get('children') as Ecore.EObject[];
        let childrenView = children.map(
            (c: Ecore.EObject) => this.viewFactory.createView(c, this.props));
        return <div key={this.viewObject._id.toString() + '_2'}>{childrenView}</div>

    };

    render = () => {
        return <div key={this.viewObject._id.toString() + '_3'}>{this.renderChildren()}</div>
    }
}

class Col_ extends ViewContainer {
    render = () => {
        return (
            <Col span={this.props.viewObject.get('span') || 24}
                 key={this.viewObject._id}
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
    render = () => {
        return (
            <Form style={{marginBottom: marginBottom}} key={this.viewObject._id.toString() + '_4'}>
                {this.renderChildren()}
            </Form>
        )
    }
}

class TabsViewReport_ extends ViewContainer {
    render = () => {
        let children = this.viewObject.get('children').array() as Ecore.EObject[];
        return (
            <Tabs defaultActiveKey={children[0]._id} tabPosition={this.props.viewObject.get('tabPosition') ? this.props.viewObject.get('tabPosition').toLowerCase() : 'top'}>
                {
                    children.map((c: Ecore.EObject) =>
                        <TabPane tab={c.get('name')} key={c._id} >
                            {this.viewFactory.createView(c, this.props)}
                        </TabPane>
                    )
                }
            </Tabs>
        )
    }
}

class ComponentElement_ extends ViewContainer {
    render = () => {
        if (this.props.viewObject.eClass.get('name') === 'ComponentElement' && this.props.viewObject.get('component')) {
            const componentClassName = this.props.viewObject.get('component').get('componentClassName')
            return<UserComponent key={this.viewObject._id} {...this.props} componentClassName={componentClassName}/>
        } else return <div>Not found</div>
    }
}

class Row_ extends ViewContainer {
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
                style={{
                    textAlign: this.props.viewObject.get('textAlign') || 'left',
                    marginRight: marginRight,
                    marginBottom: marginBottom,
                    marginTop: marginTop,
                    marginLeft: marginLeft,
                    borderBottom: borderBottom,
                    height: height
                }}
                gutter={[this.props.viewObject.get('horizontalGutter') || 0, this.props.viewObject.get('verticalGutter') || 0]}
            >
                {this.renderChildren()}
            </Row>
        )
    }
}

export class Href_ extends ViewContainer {
    render = () => {
        return <a href={this.props.viewObject.get('ref') ? this.props.viewObject.get('ref') : "#"}
                  onClick={()=>{
                      this.props.context.notifyAllEventHandlers({
                      type:eventType.click,
                      itemName:this.props.viewObject.get('name'),
                      //this.props.getValue props из ag-grid
                      value:(this.props.getValue)? this.props.getValue(): undefined
                      })
                  }}>
            {this.props.viewObject.get('label')}
        </a>
    }
}

export class Button_ extends ViewContainer {

    saveResource = () => {
        API.instance().saveResource(this.props.viewObject.eResource(), 99999)
            .then((newResource: Ecore.Resource) => {
                startResource = newResource.to()
                const newViewObject: Ecore.EObject[] = (newResource.eContainer as Ecore.ResourceSet).elements()
                    .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                    .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                    .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
                this.props.context.updateContext!(({viewObject: newViewObject[0]}))
            })};

    cancelChange = () => {
        const resource: Ecore.Resource = this.props.viewObject.eResource();
        resource.clear();
        const oldResource = resource.parse(startResource as Ecore.EObject);
        const oldViewObject: Ecore.EObject[] = (oldResource.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
        this.props.context.updateContext!(({viewObject: oldViewObject[0]}))
    };

    backStartPage = () => {
        const appModule = this.props.pathFull[this.props.pathFull.length - 1];
        let params: Object[] = appModule.params;
        this.props.context.changeURL!(appModule.appModule, false, undefined, params);
    };

    getCancelButton = (t: any, label: any, span: any) => {
        return <Button title={'Cancel'} style={{ width: '100px', right: span, marginBottom: marginBottom}} onClick={() => this.cancelChange()}>
        {(label)? label: t('cancel')}
    </Button>
    };

    getSaveButton = (t: any, label: any, span: any) => {
        return <Button title={'Save'} style={{ width: '100px', left: span, marginBottom: marginBottom}} onClick={() => this.saveResource()}>
            {(label)? label: t('save')}
        </Button>
    };

    getSubmitButton = (t: any, label: any, span: any) => {
        return <Button title={'Submit'} style={{ width: '100px', left: span, marginBottom: marginBottom}} onClick={() => {
            this.props.context.notifyAllEventHandlers({
                type:eventType.click,
                itemName:this.props.viewObject.get('name'),
                //this.props.getValue props из ag-grid
                value:(this.props.getValue)? this.props.getValue(): undefined});
        }}>
            {(label)? label: t('submit')}
        </Button>
    };

    getBackButton = (t: any, label: any, span: any) => {
        return <Button title={'Back Start Page'} style={{ width: '170px', left: span, marginBottom: marginBottom}} onClick={() => this.backStartPage()}>
            {(label)? label: t('backStartPage')}
        </Button>
    };

    render = () => {
        const { t } = this.props as WithTranslation;
        const span = this.props.viewObject.get('span') ? `${this.props.viewObject.get('span')}px` : '0px';
        const label = t(this.props.viewObject.get('label'));
        return <div key={this.viewObject._id}>
            {this.props.viewObject.get('buttonCancel') === true && this.getCancelButton(t, label, span)}
            {this.props.viewObject.get('buttonSave') === true && this.getSaveButton(t, label, span)}
            {this.props.viewObject.get('buttonSubmit') === true &&  this.getSubmitButton(t, label, span)}
            {this.props.viewObject.get('backStartPage') === true && this.getBackButton(t, label, span)}
        </div>
    }
}

class Select_ extends ViewContainer {
    private selected = "";

    constructor(props: any) {
        super(props);
        this.state = {
            selectData: [],
            params: [],
            currentValue: "",
            datasetComponent: undefined,
            isVisible: true,
            isDisabled: this.props.viewObject.get('disabled'),
        };
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
        this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemName:this.props.viewObject.get('name')
        });
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
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}));
    };

    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
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
                        })});
                });
            }
        } else if (this.props.viewObject.get('staticValues')) {
            this.getStaticValues(this.props.viewObject.get('staticValues'))
        }
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            name:this.props.viewObject.get('name'),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isVisible:true})},
                {actionType: actionType.hide, callback: ()=>this.setState({isVisible:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.props.viewObject.get('valueItems'));
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
                this.setState({
                    params: newParams,
                    currentValue: undefined,
                    selectData: resArr
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
            selectData:staticValues
        })
    }

    render = () => {
        const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
            return (
                <div style={{marginBottom: marginBottom}}>
                    <Select
                        key={this.viewObject._id}
                        disabled={this.state.isDisabled}
                        showSearch={this.props.viewObject.get('showSearch')}
                        placeholder={this.props.viewObject.get('placeholder')}
                        mode={this.props.viewObject.get('mode') !== null ? this.props.viewObject.get('mode').toLowerCase() : 'default'}
                        style={{width: width, display: (this.state.isVisible)? undefined: 'none'}}
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
        this.state = {
            pickedDate: moment(),
            format: this.props.viewObject.get('format') || "YYYY-MM-DD",
            isVisible: true,
            isDisabled: this.props.viewObject.get('disabled') || false
        };
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
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.onChange(this.state.pickedDate.format(this.state.format));
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            name:this.props.viewObject.get('name'),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isVisible:true})},
                {actionType: actionType.hide, callback: ()=>this.setState({isVisible:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
    }

    onChange = (currentValue: string) => {
        this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemName:this.props.viewObject.get('name')
        });
        this.props.viewObject.set('value', currentValue);
        this.props.viewObject.set('format', this.state.format);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
    };

    render = () => {
        return (
            <div style={{marginBottom: marginBottom}}>
                <DatePicker
                    key={this.viewObject._id}
                    defaultValue={this.state.pickedDate}
                    disabled={this.state.isDisabled}
                    allowClear={this.props.viewObject.get('allowClear') || false}
                    format={this.state.format}
                    style={{width: this.props.viewObject.get('width') || "200px", display: (this.state.isVisible)? undefined: 'none'}}
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
        const params = getNamedParams(this.props.viewObject.get('valueItems'));
        this.state = {
            htmlContent: replaceNamedParam(this.props.viewObject.get('htmlContent'),params),
            params: params
        };
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const newParams = getNamedParams(this.props.viewObject.get('valueItems'));
        if (JSON.stringify(this.state.params) !== JSON.stringify(newParams)) {
            this.setState({
                params: newParams,
                htmlContent: replaceNamedParam(this.props.viewObject.get('htmlContent'), newParams),
            })
        }
    }

    render = () => {
        return (
            <div style={{marginBottom: marginBottom}}
                 className="content"
                 dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.htmlContent)}}>
            </div>
        )
    }
}

class GroovyCommand_ extends ViewContainer {
    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.props.context.addEventAction({
            name: this.props.viewObject.get('name'),
            actions: [
                {actionType: actionType.refresh,callback: this.execute.bind(this)}
                ]
        });
        if (this.props.viewObject.get('executeOnStartup')) {
            this.execute()
        }
    }

    componentWillUnmount(): void {
        this.props.context.removeEventAction()
    }

    execute = () => {
        const commandType = this.props.viewObject.get('commandType')||"Eval";
        const command = this.props.viewObject.get('command');
        if (commandType === "Resource") {
            API.instance().fetchJson('/script/resource?path='+this.props.viewObject.get('gitResourcePath'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems')))
            }).then(res => {
                this.props.context.contextItemValues.set(this.props.viewObject.get('name'), res);
            })
        } else if (commandType === "Static") {
            API.instance().fetchJson('/script/static/'+this.props.viewObject.get('gitStaticClass')+'/'+this.props.viewObject.get('gitStaticMethod'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems')))
            }).then(res => {
                this.props.context.contextItemValues.set(this.props.viewObject.get('name'), res);
            })
        } else {
            API.instance().fetchJson('/script/eval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: replaceNamedParam(command, getNamedParams(this.props.viewObject.get('valueItems')))
            }).then(res => {
                this.props.context.contextItemValues.set(this.props.viewObject.get('name'), res);
            })
        }
    };
    render = () => {
        return (
            <div style={{marginBottom: marginBottom}}>
            </div>
        )
    }
}

class ValueHolder_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    onChange = (currentValue: string) => {
        this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemName:this.props.viewObject.get('name')
        });
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
    };

    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.props.context.addEventAction({
            name: this.props.viewObject.get('name'),
            actions: [
                {actionType: actionType.setValue,callback: this.onChange.bind(this)}
            ]
        });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.viewObject.get('contextWriter')) {
            const contextItem = this.props.context.contextItemValues.get(this.props.viewObject.get('contextWriter').get('name'));
            const columnName = this.props.viewObject.get('groovyCommandResultColumnName');
            if (contextItem
                && contextItem.length >= 1
                && columnName) {
                const value = contextItem[0][columnName];
                if (value !== this.props.viewObject.get('value')) {
                    this.onChange(value);
                }
            }
        }
    }

    render = () => {
        return (
            <div style={{marginBottom: marginBottom}}>
            </div>
        )
    }
}

class Input_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isVisible: true,
            isDisabled: false
        };
    }

    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.props.context.addEventAction({
            name:this.props.viewObject.get('name'),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isVisible:true})},
                {actionType: actionType.hide, callback: ()=>this.setState({isVisible:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
            ]
        });
    }

    onChange = (currentValue: string) => {
        this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemName:this.props.viewObject.get('name')
        });
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
    };

    render = () => {
        const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
        if (this.props.viewObject.get('inputType') === 'InputNumber' ) {
            return(
                <div
                    key={this.viewObject._id}
                    style={{marginBottom: marginBottom}}>
                    <InputNumber
                        style={{width: width, display: (this.state.isVisible) ? undefined : 'none'}}
                        disabled={this.state.isDisabled}
                        min={this.props.viewObject.get('minValue') || 1}
                        max={this.props.viewObject.get('maxValue') || 99}
                        step={this.props.viewObject.get('step') || 1}
                        placeholder={this.props.viewObject.get('placeholder')}
                        defaultValue={Number(this.props.viewObject.get('value') || this.props.viewObject.get('minValue') || 1)}
                        onChange={(currentValue: any) => {
                            this.onChange(String(currentValue))
                        }}
                    />
                </div>
            )
        } else {
            return(
                <div key={this.viewObject._id}
                     style={{marginBottom: marginBottom}}>
                    <Input
                        style={{width: width}}
                        placeholder={this.props.viewObject.get('placeholder')}
                        defaultValue={this.props.viewObject.get('value')}
                        onChange={(currentValue: any) => {
                            this.onChange(currentValue.target.value)
                        }}
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
            isVisible: true,
        };
    }

    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
        this.props.context.addEventAction({
            name:this.props.viewObject.get('name'),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isVisible:true})},
                {actionType: actionType.hide, callback: ()=>this.setState({isVisible:false})},
            ]
        });
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
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
        this.props.context.notifyAllEventHandlers({
            type:eventType.change,
            itemName:this.props.viewObject.get('name')
        });
        this.props.viewObject.set('name', str);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
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
            <Paragraph
                key={this.viewObject._id}
                style={{
                    marginTop: drawObject.get('marginTop') === null ? '0px' : `${drawObject.get('marginTop')}`,
                    marginBottom: drawObject.get('marginBottom') === null ? '0px' : `${drawObject.get('marginBottom')}`,
                    fontSize: drawObject.get('fontSize') === null ? 'inherit' : `${drawObject.get('fontSize')}`,
                    textIndent: drawObject.get('textIndent') === null ? '0px' : `${drawObject.get('textIndent')}`,
                    height: drawObject.get('height') === null ? '0px' : `${drawObject.get('height')}`,
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
                    display: (this.state.isVisible) ? undefined : 'none'
                }}
                copyable={drawObject.get('buttonCopyable')}
                editable={drawObject.get('buttonEditable') === true ? {onChange: this.onChange} : false} //boolean | { editing: boolean, onStart: Function, onChange: Function(string) }
                code={drawObject.get('codeStyle')}
                delete={drawObject.get('deleteStyle')}
                disabled={drawObject.get('disabledStyle')}
                ellipsis={{rows: drawObject.get('ellipsisRow'), expandable: false}}
                mark={drawObject.get('markStyle')}
                underline={drawObject.get('underlineStyle')}
                strong={drawObject.get('strongStyle')}
            >
                {this.props.viewObject.get('name')}
            </Paragraph>
        )
    }
}

class EventHandler_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    handleEvent(value:string|undefined) {
        this.props.viewObject.get('eventActions').each((el: EObject)=>{
            const eventAction = this.props.context.getEventActions().find((action: IEventAction) => {
                return el.get('triggerItem')
                    && action.name === el.get('triggerItem').get('name')
            });
            if (eventAction) {
                eventAction.actions.forEach((action:{actionType: actionType, callback: (value:string|undefined) => void}) => {
                    if (action.actionType === (el.get('action') || actionType.refresh)) {
                        action.callback(value)
                    }
                })
            } else {
                this.props.context.notification("Event handler warning",
                    `Action ${el.get('action')} not supported for ${this.props.viewObject.get('name')} (${el.get('triggerItem').get('name')})`,
                    "warning")
            }
        })
    }

    componentDidMount(): void {
        if (this.props.viewObject.get('listenItem')) {
            this.props.context.addEventHandler({
                name: this.props.viewObject.get('listenItem').get('name'),
                eventType: this.props.viewObject.get('event') || "click",
                callback: this.handleEvent.bind(this)
            })
        }
    }

    componentWillUnmount(): void {
        this.props.context.removeEventHandler(this.props.viewObject.get('listenItem').get('name'))
    }

    render = () => {
        return <div/>
    }
}

class Drawer_ extends ViewContainer {
    constructor(props: any) {
        super(props);
        this.state = {
            isVisible: this.viewObject.get('isVisible'),
        };
    }

    componentDidMount(): void {
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemName:this.props.viewObject.get('name')
        });
        this.props.context.addEventAction({
            name:this.props.viewObject.get('name'),
            actions:[
                {actionType: actionType.show, callback: ()=>this.setState({isVisible:true})},
                {actionType: actionType.hide, callback: ()=>this.setState({isVisible:false})},
            ]
        });
    }

    render = () => {
        return (
            <Drawer
                placement={positionEnum[(this.viewObject.get('position') as "Top"|"Left"|"Right"|"Bottom") || 'Top']}
                width={'700px'}
                height={'500px'}
                visible={this.state.isVisible}
                onClose={()=>{this.setState({isVisible:false})}}
                mask={false}
                maskClosable={false}
                getContainer={false}
                style={{ position: 'absolute' }}
            >
                {this.renderChildren()}
            </Drawer>
        )
    }
}

class DatasetView_ extends ViewContainer {
    render = () => {
        return <DatasetView {...this.props} key={this.viewObject._id.toString() + '_5'}/>
    }
}

class DatasetGridView_ extends ViewContainer {
    render = () => {
        return <DatasetGrid {...this.props} key={this.viewObject._id.toString() + '_6'}/>
    };
}

class DatasetPivotView_ extends ViewContainer {
    render = () => {
        return <DatasetPivot {...this.props} key={this.viewObject._id}/>
    }
}

class DatasetDiagramView_ extends ViewContainer {
    render = () => {
        return <DatasetDiagram {...this.props} key={this.viewObject._id}/>
    }
}

class Calendar_ extends ViewContainer {
    render = () => {
        return <Calendar {...this.props} key={this.viewObject._id}/>
    }
}

class MasterdataView_ extends ViewContainer {
    render = () => {
        return <MasterdataEditor {...this.props} key={this.viewObject._id} entityType={this.viewObject.get('entityType')}/>
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
        this.components.set('ru.neoflex.nfcore.application#//DatasetGridView', DatasetGridView_);
        this.components.set('ru.neoflex.nfcore.application#//DatasetPivotView', DatasetPivotView_);
        this.components.set('ru.neoflex.nfcore.application#//DatasetDiagramView', DatasetDiagramView_);
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
