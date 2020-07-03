import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input, Modal, Radio} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPalette, faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {CirclePicker, SketchPicker} from "react-color";

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
    const circlePicker = () => {
        return <CirclePicker
            circleSize={24}
            circleSpacing={3}
            width='100%'
            onChange={(e: any) => value.changeColor(e)}
            color={ value.stateColor !== undefined ? value.stateColor['hex'] :
                value.color !== undefined ? value.color : 'white' }
            colors={['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3','#ffffff',
                '#8b1a10', '#eb3223', '#f29d38', '#fffd54', '#75f94c', '#73fbfd', '#5687e1', '#0023f5', '#8b2ef5', '#ea3ff7',
                '#dfbab1', '#eecdcd', '#f8e5d0', '#fdf2d0', '#dce9d5', '#d3e0e3', '#ccdaf5', '#d2e2f1', '#d8d3e7', '#e6d2dc',
                '#d18270', '#df9d9b', '#f2cca2', '#fbe5a3', '#bdd5ac', '#a8c3c8', '#a9c2f0', '#a6c5e5', '#b2a8d3', '#cea8bc',
                '#bd4b31', '#d16d6a', '#ecb476', '#f9d978', '#9dc284', '#80a4ae', '#769ee5', '#7ba8d7', '#8b7ebe', '#b87f9e',
                '#992a15', '#bc261a', '#db944b', '#eac251', '#78a55a', '#53808c', '#4979d1', '#4e85c1', '#6252a2', '#9b5377',
                '#7b2817', '#8c1a11', '#a96324', '#b89130', '#48742c', '#254e5a', '#2358c5', '#22538f', '#312170', '#6b2346',
                '#531607', '#5d0e07', '#714116', '#7b601d', '#314c1c', '#18333c', '#254683', '#153760', '#1d154a', '#46162f']}
        />
    }
    const sketchPicker = () => {
        return <SketchPicker
            disableAlpha={true}
            onChange={(e: any) => value.changeColor(e)}
            color={ value.stateColor !== undefined ? value.stateColor['hex'] :
                value.color !== undefined ? value.color : 'white' }
        />
    }
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
                                    value.value,
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
                                })
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
                                    value.datasetColumn ||
                                    value.value,
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
                                    value.datasetColumn ||
                                    value.operation,
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
                <FontAwesomeIcon
                    color={value.backgroundColor}
                    onClick={() => value.handleColorMenu('background', value.index)}
                    style={{fontSize: '18px', marginLeft: '13px'}}
                    icon={faPalette}
                />
                <Modal
                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    width={'320px'}
                    title={'Выбор цвета фона'}
                    visible={value.backgroundColorVisible && value.colorIndex === value.index}
                    onCancel={() => value.handleColorMenu('background', value.index)}
                    closable={false}
                    mask={false}
                    onOk={() => {
                        return value.handleChange(JSON.stringify({
                            index: value.index,
                            columnName: 'backgroundColor',
                            value: value.stateColor !== undefined ? value.stateColor['hex'] : value.backgroundColor
                        }))
                    }}>
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
                        circlePicker()
                    )}
                    {!value.solidPicker && (
                        sketchPicker()
                    )}
                </Modal>
            </Col>
            <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>{value.t('text')}</div>
                <FontAwesomeIcon
                    color={value.color}
                    onClick={() => value.handleColorMenu('text', value.index)}
                    style={{fontSize: '18px', marginLeft: '13px'}}
                    icon={faPalette}
                />
                <Modal
                    getContainer={() => document.getElementById ('filterButton') as HTMLElement}
                    width={'320px'}
                    title={'Выбор цвета текста'}
                    visible={value.textColorVisible && value.colorIndex === value.index}
                    onCancel={() => value.handleColorMenu('text', value.index)}
                    closable={false}
                    mask={false}
                    onOk={() => value.handleChange(JSON.stringify({
                        index: value.index,
                        columnName: 'color',
                        value: value.stateColor !== undefined ? value.stateColor['hex'] : value.color
                    }))}
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
                        circlePicker()
                    )}
                    {!value.solidPicker && (
                        sketchPicker()
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

    private changeColor(e: any) {
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
