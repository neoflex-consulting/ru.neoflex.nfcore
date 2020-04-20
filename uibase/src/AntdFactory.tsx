import {ViewFactory, View} from './View'
import Ecore, {EObject} from 'ecore';
import * as React from 'react';
import {Button, Col, Form, Input, InputNumber, Row, Select, Tabs, Typography, DatePicker} from 'antd';
import UserComponent from './components/app/UserComponent';
import DatasetView from './components/app/dataset/DatasetView';
import DatasetPivot from './components/app/dataset/DatasetPivot';
import DatasetDiagram from './components/app/dataset/DatasetDiagram';
import {API} from './modules/api';
import { WithTranslation } from 'react-i18next';
import DatasetGrid from "./components/app/dataset/DatasetGrid";
import {docxElementExportType, docxExportObject} from "./utils/docxExportUtils";
import {excelElementExportType, excelExportObject} from "./utils/excelExportUtils";
import CalendarWrapper from "./components/app/CalendarWrapper";
import moment from 'moment';
import {ISubmitHandlers} from "./MainContext";

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
                    textAlign: this.props.viewObject.get('textAlign') || 'center',
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

class Button_ extends ViewContainer {
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
        this.props.context.changeURL!(appModule.appModule, undefined, params);
    };
    submitItems = () => {
        if (this.props.viewObject.get('datasetViewToSubmit')) {
            let checkItems: String[] = [];
            this.props.viewObject.get('datasetViewToSubmit').each((item: EObject) => {
                checkItems.push(item.get('name'))
            });
            this.props.context.submitHandlers.forEach((obj:ISubmitHandlers)=>{
                if (checkItems.includes(obj.name)) {
                    obj.handler()
                }
            })
        }
    };
    render = () => {
        const { t } = this.props as WithTranslation;
        const span = this.props.viewObject.get('span') ? `${this.props.viewObject.get('span')}px` : '0px';
        return <div key={this.viewObject._id}>
            {this.props.viewObject.get('buttonCancel') === true &&
            <Button title={'Cancel'} style={{ width: '100px', right: span, marginBottom: marginBottom}} onClick={() => this.cancelChange()}>
                {t('cancel')}
            </Button>}
            {this.props.viewObject.get('buttonSave') === true &&
            <Button title={'Save'} style={{ width: '100px', left: span, marginBottom: marginBottom}} onClick={() => this.saveResource()}>
                {t('save')}
            </Button>
            }
            {this.props.viewObject.get('buttonSubmit') === true &&
            <Button title={'Submit'} style={{ width: '100px', left: span, marginBottom: marginBottom}} onClick={() => this.submitItems()}>
                {t('submit')}
            </Button>
            }
            {this.props.viewObject.get('backStartPage') === true &&
            <Button title={'Back Start Page'} style={{ width: '170px', left: span, marginBottom: marginBottom}} onClick={() => this.backStartPage()}>
                {t('backStartPage')}
            </Button>
            }
        </div>
    }
}

class Select_ extends ViewContainer {
    state = {
        selectData: []
    };
    onChange = (currentValue: string[]) => {
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
    };
    getSelectData() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === this.props.viewObject.get('ClassToShow')._id);
            if (temp !== undefined) {
                API.instance().findByKind(temp, {contents: {eClass: temp.eURI()}}, 999)
                    .then((resources) => {
                        this.setState({selectData: resources})
                    })
            }
        })
    };
    render = () => {
        if (this.state.selectData.length === 0) {
            this.getSelectData();
            return (<div key={this.viewObject._id}></div>)
        }
        else {
            const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
            return (
                <div style={{marginBottom: marginBottom}}>
                    <Select
                        key={this.viewObject._id}
                        disabled={this.props.viewObject.get('disabled')}
                        showSearch={this.props.viewObject.get('showSearch')}
                        placeholder={this.props.viewObject.get('placeholder')}
                        mode={this.props.viewObject.get('mode') !== null ? this.props.viewObject.get('mode').toLowerCase() : 'default'}
                        style={{width: width}}
                        value={this.props.viewObject.get('value') || undefined}
                        onChange={(currentValue: string[]) => {
                            this.onChange(currentValue)
                        }}
                    >
                        {
                            this.state.selectData.map((data: Ecore.Resource) =>
                                <Select.Option key={data.get('uri')}
                                               value={data.eContents()[0].get('name')}>
                                    {data.eContents()[0].get('name')}
                                </Select.Option>
                            )
                        }
                    </Select>
                </div>
            )
        }
    }
}

class DatePicker_ extends ViewContainer {
    state = {
        pickedDate: moment(),
        disabled: this.props.viewObject.get('disabled') || false,
        allowClear: this.props.viewObject.get('allowClear') || false,
        format: this.props.viewObject.get('format') || "YYYY-MM-DD",
        width: this.props.viewObject.get('width') || "200px"
    };

    componentDidMount(): void {
        //Инициализация value
        this.onChange(this.state.pickedDate.format(this.state.format))
    }

    onChange = (currentValue: string) => {
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
        this.props.context.updateContext!(({viewObject: newViewObject[0]}))
    };
    render = () => {
        return (
            //TODO перейти на antd v4?
            //В 4й весрии можно через props выбирать тип пикера и больше возможных типов (квартал, год)
            <div style={{marginBottom: marginBottom}}>
                <DatePicker
                    key={this.viewObject._id}
                    defaultValue={this.state.pickedDate}
                    disabled={this.state.disabled}
                    allowClear={this.state.allowClear}
                    format={this.state.format}
                    style={{width: this.state.width}}
                    onChange={(date, dateString) => {
                        this.onChange(dateString)
                    }}/>
            </div>
        )
    }
}

class Input_ extends ViewContainer {
    onChange = (currentValue: string) => {
        this.props.viewObject.set('value', currentValue);
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
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
                        style={{width: width}}
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

    componentDidMount(): void {
        if (this.props.context.docxHandlers !== undefined) {
            this.props.context.docxHandlers.push(this.getDocxData.bind(this))
        }
        if (this.props.context.excelHandlers !== undefined) {
            this.props.context.excelHandlers.push(this.getExcelData.bind(this))
        }
    }

    componentWillUnmount(): void {
        if (this.props.context.docxHandlers !== undefined && this.props.context.docxHandlers.length > 0) {
            this.props.context.docxHandlers.pop()
        }
        if (this.props.context.excelHandlers !== undefined && this.props.context.excelHandlers.length > 0) {
            this.props.context.excelHandlers.pop()
        }
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
                    fontSize: drawObject.get('fontSize') === null ? 'inherit' : `${drawObject.get('fontSize')}`,
                    textIndent: drawObject.get('textIndent') === null ? '0px' : `${drawObject.get('textIndent')}`,
                    height: drawObject.get('height') === null ? '0px' : `${drawObject.get('height')}`,
                    fontWeight: drawObject.get('fontWeight') || "inherit",
                    textAlign: drawObject.get('textAlign') || "center",
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
                    WebkitTextFillColor: gradients !== "" ? "transparent" : "unset"
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
        return <CalendarWrapper {...this.props} key={this.viewObject._id}/>
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
        this.components.set('ru.neoflex.nfcore.application#//Button', Button_);
        this.components.set('ru.neoflex.nfcore.application#//Input', Input_);
        this.components.set('ru.neoflex.nfcore.application#//Row', Row_);
        this.components.set('ru.neoflex.nfcore.application#//Calendar', Calendar_);
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
