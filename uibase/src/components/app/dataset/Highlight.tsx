import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input, Modal, Radio} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {ColorPicker, SketchColorPicker} from "./ColorPicker";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    allOperations?: Array<EObject>;
    componentType?: paramType;
    allHighlightType?: Array<EObject>;
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
    backgroundColorVisible: boolean;
    textColorVisible: boolean;
    colorIndex: any;
    color: any;
}

const SortableList = SortableContainer(({items}:any) => {
    return (
        <ul className="SortableList">
            {items.map((value:any) => (
                <SortableItem key={`item-${value.index}`} index={value.index-1} value={value} />
            ))}
        </ul>
    );
});

const SortableItem = SortableElement(({value}: any) => {
    return <div className="SortableItemHighlight">
        <Row gutter={[8, 0]}>
            <Col span={1}>
                <span>{value.index}</span>
            </Col>
            <Col span={7}>
                <Form.Item style={{display: 'inline-block'}}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined,
                            rules: [{
                                required:
                                    value.operation ||
                                    value.value ||
                                    value.highlightType,
                                message: ' '
                            }]
                        })(
                        <Select
                            getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
                            placeholder={value.t('columnname')}
                            style={{
                                width: '179px',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}
                            showSearch={true}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({
                                    index: value.index,
                                    columnName: 'datasetColumn',
                                    value: undefined
                                });
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.columnDefs!
                                    .map((c: any) =>
                                        <Select.Option
                                            key={JSON.stringify({
                                                index: value.index,
                                                columnName: 'datasetColumn',
                                                value: c.get('field')
                                            })}
                                            value={JSON.stringify({
                                                index: value.index,
                                                columnName: 'datasetColumn',
                                                value: c.get('field')
                                            })}
                                        >
                                            {c.get('headerName')}
                                        </Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
            </Col>
            <Col span={7}>
                <Form.Item style={{display: 'inline-block'}}>
                    {value.getFieldDecorator(`${value.idOperation}`,
                        {
                            initialValue: value.t(value.operation) || undefined,
                            rules: [{
                                required:
                                    (value.datasetColumn && value.highlightType !== 'Column') ||
                                    (value.value && value.highlightType !== 'Column')||
                                    (value.highlightType && value.highlightType !== 'Column'),
                                message: ' '
                            }]
                        })(
                        <Select
                            getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
                            disabled={value.highlightType === 'Column'}
                            placeholder={value.t('operation')}
                            style={{width: '179px', marginLeft: '5px'}}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({
                                    index: value.index,
                                    columnName: 'operation',
                                    value: undefined
                                })
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.allOperations!
                                    .map((o: any) =>
                                        <Select.Option
                                            key={JSON.stringify({
                                                index: value.index,
                                                columnName: 'operation',
                                                value: o.get('name')
                                            })}
                                            value={JSON.stringify({
                                                index: value.index,
                                                columnName: 'operation',
                                                value: o.get('name')
                                            })}
                                        >
                                            {value.t(o.get('name'))}
                                        </Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
            </Col>
            <Col span={5}>
                <Form.Item style={{display: 'inline-block'}}>
                    {value.getFieldDecorator(`${value.idValue}`,
                        {
                            initialValue: value.value,
                            rules: [{
                                required:
                                    (value.datasetColumn && value.highlightType !== 'Column') ||
                                    (value.operation && value.highlightType !== 'Column')||
                                    (value.highlightType && value.highlightType !== 'Column'),
                                message: ' '
                            }]
                        })(
                        <Input
                            placeholder={value.t('value')}
                            disabled={value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty' || value.highlightType === 'Column'}
                            style={{width: '110px', marginRight: '10px'}}
                            allowClear={true}
                            onChange={(e: any) => value.handleChange(
                                JSON.stringify({
                                    index: value.index,
                                    columnName: 'value',
                                    value: e.target.value === "" ? undefined : e.target.value
                                })
                            )}
                            title={value.value}
                            id={value.index.toString()}
                        />
                    )}
                </Form.Item>
            </Col>
            <Col span={2}>
                <Form.Item style={{ display: 'inline-block' }}>
                    <Switch
                        defaultChecked={value.enable !== undefined ? value.enable : true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                            value.handleChange(event)
                        }}>
                    </Switch>
                </Form.Item>
            </Col>
            <Col span={2}>
                <Form.Item style={{ display: 'inline-block', marginLeft: '6px' }}>
                    <Button
                        title="delete row"
                        key={'deleteRowButton'}
                        value={'deleteRowButton'}
                        onClick={(e: any) => {value.deleteRow({index: value.index})}}
                    >
                        <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                    </Button>
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[8, 0]}>
            <Col span={4} style={{marginLeft: '17px', marginTop: '-17px'}}>
                {value.getFieldDecorator(`${value.idHighlightType}`,
                    {
                        initialValue: value.t(value.highlightType)
                    })(
                    <Select
                        getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
                        allowClear={true}
                        style={{width: '100px', marginLeft: '21px'}}
                        onChange={(e: any) => {
                            const event = e ? e : JSON.stringify({
                                index: value.index,
                                columnName: 'highlightType',
                                value: undefined
                            })
                            value.handleChange(event)
                        }}
                    >
                        {
                            value.allHighlightType!
                                .map((o: any) =>
                                    <Select.Option
                                        key={JSON.stringify({
                                            index: value.index,
                                            columnName: 'highlightType',
                                            value: o.get('name')
                                        })}
                                        value={JSON.stringify({
                                            index: value.index,
                                            columnName: 'highlightType',
                                            value: o.get('name')
                                        })}
                                    >
                                        {value.t(o.get('name'))}
                                    </Select.Option>)
                        }
                    </Select>
                )}
            </Col>
                <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>{value.t('background')}</div>
                <div onClick={() => value.handleColorMenu('background', value.index)}
                    style={{
                    backgroundColor: value.backgroundColor, height: '18px', width: '38px',
                    display: 'inline-block', verticalAlign: '-0.2em', marginLeft:'13px',
                    borderRadius:'4px', border: '1px solid grey'}}
                />
                <Modal
                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    width={'320px'}
                    title={'Выбор цвета фона'}
                    visible={value.backgroundColorVisible && value.colorIndex === value.index}
                    onCancel={() => value.handleColorMenu('background', value.index)}
                    closable={false}
                    mask={false}
                    footer={[<Form onSubmit={value.handleSubmit}>
                        <Button key="back" onClick={() => value.handleColorMenu('background', value.index)}>
                            Отменить
                        </Button>
                        <Button
                            title="run query"
                            key={'runQueryButton'}
                            value={'runQueryButton'}
                            htmlType="submit"
                            type="primary"
                            onClick={() => {
                                return value.handleChange(JSON.stringify({
                                    index: value.index,
                                    columnName: 'backgroundColor',
                                    value: value.stateColor !== undefined ? value.stateColor : value.backgroundColor
                                }))
                            }}>
                            ОК
                        </Button></Form>,
                    ]}>
                    <Radio.Group defaultValue="solid" buttonStyle="solid">
                        <Radio.Button
                            style={{color:'black', backgroundColor: '#ffffff', border:'none', outline:'none'}}
                            onClick={()=>value.handleColorPicker('solid')} value="solid"
                            checked={value.solidPicker}>Основной</Radio.Button>
                        <Radio.Button
                            onClick={()=>value.handleColorPicker('gradient')} value="gradient"
                            checked={!value.solidPicker}>Расширенный</Radio.Button>
                    </Radio.Group>
                    {value.solidPicker && (
                        <ColorPicker value={value} type={'background'}/>
                    )}
                    {!value.solidPicker && (
                        <SketchColorPicker value={value} type={'background'} />
                    )}
                </Modal>
            </Col>
            <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>{value.t('text')}</div>
                <div
                    onClick={() => value.handleColorMenu('text', value.index)}
                    style={{
                        backgroundColor: value.color, height: '18px', width: '38px',
                        display: 'inline-block', verticalAlign: '-0.2em', marginLeft:'13px',
                        borderRadius:'4px', border: '1px solid grey'}}
                />
                <Modal
                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    width={'320px'}
                    title={'Выбор цвета текста'}
                    visible={value.textColorVisible && value.colorIndex === value.index}
                    onCancel={() => value.handleColorMenu('text', value.index)}
                    closable={false}
                    mask={false}
                    footer={[<Form onSubmit={value.handleSubmit}>
                        <Button key="back" onClick={() => value.handleColorMenu('text', value.index)}>
                            Отменить
                        </Button>
                        <Button
                            title="run query"
                            key={'runQueryButton'}
                            value={'runQueryButton'}
                            htmlType="submit"
                            type="primary"
                            onClick={() => value.handleChange(JSON.stringify({
                            index: value.index,
                            columnName: 'color',
                            value: value.stateColor !== undefined ? value.stateColor : value.color
                        }))}>
                            ОК
                        </Button></Form>,
                    ]}
                >
                    <Radio.Group defaultValue="solid" buttonStyle="solid">
                    <Radio.Button
                        style={{color:'black', backgroundColor: '#ffffff', border:'none', outline:'none'}}
                        onClick={()=>value.handleColorPicker('solid')} value="solid"
                        checked={value.solidPicker}>Основной</Radio.Button>
                    <Radio.Button
                        onClick={()=>value.handleColorPicker('gradient')} value="gradient"
                        checked={!value.solidPicker}>Расширенный</Radio.Button>
                </Radio.Group>
                    {value.solidPicker && (
                        <ColorPicker value={value} type={'text'} />
                    )}
                    {!value.solidPicker && (
                        <SketchColorPicker value={value} type={'text'} />
                    )}
                </Modal>
            </Col>
        </Row>
    </div>
});



class Highlight extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            backgroundColorVisible: false,
            textColorVisible: false,
            colorIndex: undefined,
            color: undefined,
            solidPicker: true
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleColorPicker = (type: string) => {
        if (type === 'solid') {
            this.setState({solidPicker: true})
        } else if (type === 'gradient') {
            this.setState({solidPicker: false})
        }
    }

    handleColorMenu = (type: string, index: string) => {
        if (type === 'background') {
            this.state.backgroundColorVisible ? this.setState({backgroundColorVisible: false}) : this.setState({backgroundColorVisible: true})
            this.setState({colorIndex: index})
        } else if (type === 'text') {
            this.state.textColorVisible ? this.setState({textColorVisible: false}) : this.setState({textColorVisible: true})
            this.setState({colorIndex: index})
        }
    };

    private changeColor(e: any, index: any) {
        this.setState({color: e})
    }

    handleChange(e: any) {
        const target = JSON.parse(e);
        let parametersArray = this.state.parametersArray!.map((f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs!.find((c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                );
                return {
                    index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    value: target['columnName'] === 'value' ? target['value'] : f.value,
                    enable: target['columnName'] === 'enable' ? target['value'] : f.enable,
                    type: (targetColumn ? targetColumn.get('type') : undefined) || f.type,
                    highlightType: target['columnName'] === 'highlightType' ? target['value'] : f.highlightType,
                    backgroundColor: target['columnName'] === 'backgroundColor' ? target['value'] : f.backgroundColor,
                    color: target['columnName'] === 'color' ? target['value'] : f.color
                }
            } else {
                return f
            }
        });
        this.setState({parametersArray, backgroundColorVisible: false, textColorVisible: false, color: undefined, colorIndex: undefined})
    }

    reset = () => {
        this.props.onChangeParameters!(undefined, this.props.componentType);
        this.setState({parametersArray:[]});
        this.props.saveChanges(true, "isHighlightsUpdated");
    };

    deleteRow = (e: any) => {
        this.props.form.resetFields();
        let newServerParam: IServerQueryParam[] = [];
        this.state.parametersArray?.forEach((element:IServerQueryParam, index:number) => {
            if (element.index !== e.index) {
                newServerParam.push({
                    index: newServerParam.length + 1,
                    datasetColumn: element.datasetColumn,
                    operation: element.operation,
                    value: element.value,
                    enable: (element.enable !== null ? element.enable : false),
                    type: element.type,
                    highlightType: element.highlightType,
                    backgroundColor: element.backgroundColor,
                    color: element.color
                })}
        });
        this.props.onChangeParameters!(newServerParam, this.props.componentType);
        this.props.saveChanges(true, "isHighlightsUpdated");
    };

    render() {
        const {t} = this.props;
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>{t('highlight')}</div>
                    </Col>
                    <Col span={12} style={{textAlign: "right"}}>
                        <Button
                            title="reset"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'resetButton'}
                            value={'resetButton'}
                            onClick={this.reset}
                        >
                            <FontAwesomeIcon icon={faRedo} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="add row"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'createNewRowButton'}
                            value={'createNewRowButton'}
                            onClick={this.createNewRow}
                        >
                            <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="run query"
                            style={{width: '40px'}}
                            key={'runQueryButton'}
                            value={'runQueryButton'}
                            htmlType="submit"
                        >
                            <FontAwesomeIcon icon={faPlay} size='xs' color="#7b7979"/>
                        </Button>
                    </Col>
                </Form.Item>
                <Form.Item>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((highlights: any) => (
                                {
                                    ...highlights,
                                    idDatasetColumn : `${JSON.stringify({index: highlights.index, columnName: 'datasetColumn', value: highlights.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: highlights.index, columnName: 'operation', value: highlights.operation})}`,
                                    idValue : `${JSON.stringify({index: highlights.index, columnName: 'value', value: highlights.value})}`,
                                    idHighlightType : `${JSON.stringify({index: highlights.index, columnName: 'highlightType', value: highlights.highlightType})}`,
                                    t : this.t,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    allOperations: this.props.allOperations,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray,
                                    allHighlightType: this.props.allHighlightType,
                                    handleColorMenu: this.handleColorMenu.bind(this),
                                    backgroundColorVisible: this.state.backgroundColorVisible,
                                    colorIndex: this.state.colorIndex,
                                    stateColor: this.state.color,
                                    changeColor: this.changeColor.bind(this),
                                    textColorVisible: this.state.textColorVisible,
                                    handleColorPicker: this.handleColorPicker.bind(this),
                                    solidPicker: this.state.solidPicker
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Highlight))
