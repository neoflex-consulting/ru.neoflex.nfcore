import {ViewFactory, View} from './View'
import Ecore from 'ecore';
import * as React from 'react';
import {Button, Col, Form, Input, InputNumber, Row, Select, Tabs, Typography} from 'antd';
import UserComponent from './components/app/UserComponent';
import DatasetView from './components/app/dataset/DatasetView';
import DatasetPivot from './components/app/dataset/DatasetPivot';
import DatasetDiagram from './components/app/dataset/DatasetDiagram';
import {API} from './modules/api';
import { WithTranslation } from 'react-i18next';
import {colorScheme} from './utils/consts';
import DatasetGrid from "./components/app/dataset/DatasetGrid";

const { TabPane } = Tabs;
const { Paragraph, Text } = Typography;
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
        return <div>{childrenView}</div>

    };

    render = () => {
        return <div>{this.renderChildren()}</div>
    }
}

class Col_ extends ViewContainer {
    render = () => {
        return (
            <Col span={this.props.viewObject.get('span') || 24} style={{
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
            <Form style={{marginBottom: marginBottom}}>
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
            return<UserComponent {...this.props} componentClassName={componentClassName}/>
        } else return <div>Not found</div>
    }
}

class DatasetView_ extends ViewContainer {
    render = () => {
        // if (this.props.viewObject.get('defaultDatasetGrid') !== null) {
        return <DatasetView {...this.props}/>
        // }
        // else {
            // return <div> DatasetGrid not found </div>
        // }
    }
}

class DatasetGridView_ extends ViewContainer {
    render = () => {
        return <DatasetGrid {...this.props}/>
    };
}

class DatasetPivotView_ extends ViewContainer {
    render = () => {
        return <DatasetPivot {...this.props}/>
    }
}

class DatasetDiagramView_ extends ViewContainer {
    render = () => {
        return <DatasetDiagram {...this.props}/>
    }
}

class Row_ extends ViewContainer {
    render = () => {
        const marginRight = this.props.viewObject.get('marginRight') === null ? '0px' : `${this.props.viewObject.get('marginRight')}px`;
        const marginBottom = this.props.viewObject.get('marginBottom') === null ? '0px' : `${this.props.viewObject.get('marginBottom')}px`;
        const marginTop = this.props.viewObject.get('marginTop') === null ? '0px' : `${this.props.viewObject.get('marginTop')}px`;
        const marginLeft = this.props.viewObject.get('marginLeft') === null ? '0px' : `${this.props.viewObject.get('marginLeft')}px`;
        return (
            <Row
                style={{
                    textAlign: this.props.viewObject.get('textAlign') || 'center',
                    marginRight: marginRight,
                    marginBottom: marginBottom,
                    marginTop: marginTop,
                    marginLeft: marginLeft
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
    render = () => {
        const { t } = this.props as WithTranslation;
        const span = this.props.viewObject.get('span') ? `${this.props.viewObject.get('span')}px` : '0px';
        return <div >
            {this.props.viewObject.get('buttonCancel') === true &&
            <Button title={'Cancel'} style={{ width: '100px', right: span, marginBottom: marginBottom}} onClick={() => this.cancelChange()}>
                {t('cancel')}
            </Button>}
            {this.props.viewObject.get('buttonSave') === true &&
            <Button title={'Save'} style={{ width: '100px', left: span, marginBottom: marginBottom}} onClick={() => this.saveResource()}>
                {t('save')}
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
            return (<div></div>)
        }
        else {
            const width = this.props.viewObject.get('width') === null ? '200px' : `${this.props.viewObject.get('width')}px`;
            return (
                <div style={{marginBottom: marginBottom}}>
                    <Select
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
                <div style={{marginBottom: marginBottom}}>
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
                <div style={{marginBottom: marginBottom}}>
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
        const colorScheme_: any = colorScheme;
        const step = colorScheme_.length/this.props.viewObject.get('name').length;
        if (this.props.viewObject.get('pageTitle')) {
            return (
                <div style={{
                    marginTop: '12px',
                    borderBottom: '1px solid #eeeff0',
                    fontSize: '34px',
                    textIndent: '20px',
                    height: '70px',
                    fontWeight: 'lighter',
                    textAlign: this.props.viewObject.get('textAlign') || 'center'
                }}>
                    {this.props.viewObject.get('name').split('').map( (name: string, index: any) =>
                        <Text style={{
                            color: index === 0 ? colorScheme_[1]
                                : index === this.props.viewObject.get('name').length - 1 ? colorScheme_[colorScheme_.length - 1]
                                    : colorScheme_[Math.round(1 + step*index)]
                        }}
                        >
                            {name}
                        </Text>
                    )}
                </div>
            )
        } else {
            return (
                <Paragraph
                    style={{marginBottom: marginBottom}}
                    copyable={this.props.viewObject.get('buttonCopyable')}
                    editable={this.props.viewObject.get('buttonEditable') === true ? {onChange: this.onChange} : false} //boolean | { editing: boolean, onStart: Function, onChange: Function(string) }
                    code={this.props.viewObject.get('codeStyle')}
                    delete={this.props.viewObject.get('deleteStyle')}
                    disabled={this.props.viewObject.get('disabledStyle')}
                    ellipsis={{rows: this.props.viewObject.get('ellipsisRow'), expandable: false}}
                    mark={this.props.viewObject.get('markStyle')}
                    underline={this.props.viewObject.get('underlineStyle')}
                    strong={this.props.viewObject.get('strongStyle')}
                >
                    {this.props.viewObject.get('name')}
                </Paragraph>
            )
        }
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
        this.components.set('ru.neoflex.nfcore.application#//Button', Button_);
        this.components.set('ru.neoflex.nfcore.application#//Input', Input_);
        this.components.set('ru.neoflex.nfcore.application#//Row', Row_);
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
            <Component {...props} key={viewObject.get('uri')} viewObject={viewObject} viewFactory={this} />
        )

    }

}

export default new AntdFactory()
