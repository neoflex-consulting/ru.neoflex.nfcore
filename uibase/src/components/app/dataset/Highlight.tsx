import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input, Modal} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPalette, faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {SliderPicker} from "react-color";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
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

class Highlight extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            backgroundColorVisible: false,
            textColorVisible: false,
            colorIndex: undefined,
            color: undefined
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
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

    SortableItem = SortableElement(({value}: any) => {
        return <div className="SortableItemHighlight">
            <Row gutter={[8, 0]}>
                <Col span={1}>
                    <span>{value.index}</span>
                </Col>
                <Col span={7}>
                    <Form.Item style={{display: 'inline-block'}}>
                        {this.getFieldDecorator(`${value.idDatasetColumn}`,
                            {
                                initialValue: value.datasetColumn,
                                rules: [{
                                    required:
                                        value.operation ||
                                        value.value,
                                    message: ' '
                                }]
                            })(
                            <Select
                                placeholder={this.t('columnname')}
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
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.props.columnDefs!
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
                                                {c.get('field')}
                                            </Select.Option>)
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item style={{display: 'inline-block'}}>
                        {this.getFieldDecorator(`${value.idOperation}`,
                            {
                                initialValue: this.t(value.operation) || undefined,
                                rules: [{
                                    required:
                                        value.datasetColumn ||
                                        value.value,
                                    message: ' '
                                }]
                            })(
                            <Select
                                disabled={value.highlightType === 'Column'}
                                placeholder={this.t('operation')}
                                style={{width: '179px', marginLeft: '5px'}}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({
                                        index: value.index,
                                        columnName: 'operation',
                                        value: undefined
                                    })
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.props.allOperations!
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
                                                {this.t(o.get('name'))}
                                            </Select.Option>)
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={5}>
                    <Form.Item style={{display: 'inline-block'}}>
                        {this.getFieldDecorator(`${value.idValue}`,
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
                                placeholder={this.t('value')}
                                disabled={value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty' || value.highlightType === 'Column'}
                                style={{width: '110px', marginRight: '10px'}}
                                allowClear={true}
                                onChange={(e: any) => this.handleChange(
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
                                this.handleChange(event)
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
                            onClick={(e: any) => {this.deleteRow({index: value.index})}}
                        >
                            <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[8, 0]}>
                <Col span={4} style={{marginLeft: '17px', marginTop: '-17px'}}>
                    {this.getFieldDecorator(`${value.idHighlightType}`,
                        {
                            initialValue: this.t(value.highlightType)
                        })(
                        <Select
                            allowClear={true}
                            style={{width: '100px', marginLeft: '21px'}}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({
                                    index: value.index,
                                    columnName: 'highlightType',
                                    value: undefined
                                })
                                this.handleChange(event)
                            }}
                        >
                            {
                                this.props.allHighlightType!
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
                                            {this.t(o.get('name'))}
                                        </Select.Option>)
                            }
                        </Select>
                    )}
                </Col>
                <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                    <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>Фон</div>
                    <FontAwesomeIcon
                        color={value.backgroundColor}
                        onClick={() => this.handleColorMenu('background', value.index)}
                        style={{fontSize: '18px', marginLeft: '13px'}}
                        icon={faPalette}
                    />
                    <Modal
                        width={'500px'}
                        title={'Выбор цвета фона'}
                        visible={this.state.backgroundColorVisible && this.state.colorIndex === value.index}
                        onCancel={() => this.handleColorMenu('background', value.index)}
                        closable={false}
                        mask={false}
                        onOk={() => {
                            return this.handleChange(JSON.stringify({
                                index: value.index,
                                columnName: 'backgroundColor',
                                value: this.state.color !== undefined ? this.state.color['hex'] : value.backgroundColor
                            }))
                        }}
                    >
                        <SliderPicker
                            onChange={(e: any) => this.changeColor(e)}
                            color={this.state.color !== undefined ? this.state.color['hex'] :
                                value.backgroundColor !== undefined ? value.backgroundColor : 'white'}
                        />
                    </Modal>
                </Col>
                <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                    <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>Текст</div>
                    <FontAwesomeIcon
                        color={value.color}
                        onClick={() => this.handleColorMenu('text', value.index)}
                        style={{fontSize: '18px', marginLeft: '13px'}}
                        icon={faPalette}
                    />
                    <Modal
                        width={'500px'}
                        title={'Выбор цвета текста'}
                        visible={this.state.textColorVisible && this.state.colorIndex === value.index}
                        onCancel={() => this.handleColorMenu('text', value.index)}
                        closable={false}
                        mask={false}
                        onOk={() => this.handleChange(JSON.stringify({
                            index: value.index,
                            columnName: 'color',
                            value: this.state.color !== undefined ? this.state.color['hex'] : value.color
                        }))}
                    >
                        <SliderPicker
                            onChange={(e: any) => this.changeColor(e)}
                            color={ this.state.color !== undefined ? this.state.color['hex'] :
                                value.color !== undefined ? value.color : 'white' }
                        />
                    </Modal>
                </Col>
            </Row>
        </div>
    });

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Пользовательские фильтры</div>
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
                        <this.SortableList items={this.state.parametersArray!
                            .map((highlights: any) => (
                                {
                                    ...highlights,
                                    idDatasetColumn : `${JSON.stringify({index: highlights.index, columnName: 'datasetColumn', value: highlights.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: highlights.index, columnName: 'operation', value: highlights.operation})}`,
                                    idValue : `${JSON.stringify({index: highlights.index, columnName: 'value', value: highlights.value})}`,
                                    idHighlightType : `${JSON.stringify({index: highlights.index, columnName: 'highlightType', value: highlights.highlightType})}`
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Highlight))
