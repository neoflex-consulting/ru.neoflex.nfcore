import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Checkbox, Col, Form, Input, Modal, Row, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPalette, faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SliderPicker} from 'react-color';
import {paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";

interface Props {
    highlights?: Array<any>;
    columnDefs?: Array<any>;
    allOperations?: Array<EObject>;
    onChangeHighlights?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    allHighlightType?: Array<EObject>;
    isVisible?: boolean;
}

interface State {
    highlights: IServerQueryParam[] | undefined;
    backgroundColorVisible: boolean;
    textColorVisible: boolean;
    colorIndex: any;
    color: any;
}

class Highlight extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            highlights: this.props.highlights,
            backgroundColorVisible: false,
            textColorVisible: false,
            colorIndex: undefined,
            color: undefined
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        //on change props.isVisible
        if (JSON.stringify(prevProps.isVisible) !== JSON.stringify(this.props.isVisible) && !this.props.isVisible
            && JSON.stringify(this.props.highlights) !== JSON.stringify(this.state.highlights)) {
            this.props.form.validateFields((err: any, values: any) => {
                if (err) {
                    this.props.context.notification('Filter notification','Please, correct the mistakes', 'error');
                }
            });
        }
        //load from profile
        if (JSON.stringify(prevProps.highlights) !== JSON.stringify(this.props.highlights)) {
            this.setState({highlights: this.props.highlights})
        }
        //handleChange on form
        if (JSON.stringify(prevState.highlights) !== JSON.stringify(this.state.highlights)
            && this.props.isVisible
            && this.state.highlights?.length !== 0) {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    this.props.saveChanges!(this.state.highlights!, paramType.highlights);
                }
            });
        }
        //reset
        if (this.state.highlights?.length === 0) {
            this.createNewRow()
        }
    }

    updateTableData(): void {
        this.props.onChangeHighlights!(this.state.highlights!, paramType.highlights)
    }

    handleChange(e: any) {
        const target = JSON.parse(e);
        let highlights = this.state.highlights!.map((f: any) => {
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
        this.setState({highlights, backgroundColorVisible: false, textColorVisible: false, color: undefined, colorIndex: undefined})
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    deleteRow = (e: any) => {
        this.props.form.resetFields();
        let newFilter: IServerQueryParam[] = [];
        this.state.highlights?.forEach((element:IServerQueryParam, index:number) => {
            if (element.index != e.index) {
                newFilter.push({
                    index: newFilter.length + 1,
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
        this.setState({highlights: newFilter})
    };

    createNewRow = () => {
        let highlights: any = this.state.highlights;
        highlights.push(
            {
                index: highlights.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                value: undefined,
                enable: undefined,
                type: undefined,
                highlightType: undefined,
                backgroundColor: undefined,
                color: undefined
            });
        this.setState({highlights})
    };

    reset = () => {
        this.props.onChangeHighlights!(undefined, paramType.highlights);
        this.setState({highlights:[]});
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeHighlights!(this.state.highlights!, paramType.highlights)
            } else {
                this.props.context.notification('Filters notification', 'Please, correct the mistakes', 'error')
            }
        });
    };

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

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const {t} = this.props;
        return (
            <Form style={{marginTop: '30px'}} onSubmit={this.handleSubmit}>

                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{
                            display: "inherit",
                            fontSize: '17px',
                            fontWeight: 500,
                            marginLeft: '18px',
                            color: '#878787'
                        }}>Пользовательские фильтры
                        </div>
                    </Col>
                    <Col span={12} style={{textAlign: "right", marginLeft: '-2px'}}>
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
                {
                    this.state.highlights !== undefined && this.props.allHighlightType.length !== 0 && this.state.highlights!
                        .map((highlight: any) => {
                            const idDatasetColumn = `${JSON.stringify({index: highlight.index, columnName: 'datasetColumn', value: highlight.datasetColumn})}`;
                            const idOperation = `${JSON.stringify({index: highlight.index, columnName: 'operation', value: highlight.operation})}`;
                            const idValue = `${JSON.stringify({index: highlight.index, columnName: 'value', value: highlight.value})}`;
                            const idEnable = `${JSON.stringify({index: highlight.index, columnName: 'enable', value: highlight.enable})}`;
                            const idHighlightType = `${JSON.stringify({index: highlight.index, columnName: 'highlightType', value: highlight.highlightType})}`;
                            return (
                                <Form.Item key={highlight.index} style={{marginTop: '-30px'}}>
                                    <Form.Item>
                                        <Col span={1}>
                                            <span>{highlight.index}</span>
                                        </Col>
                                        <Col span={9} style={{marginLeft: '-21px'}}>
                                            <Form.Item style={{display: 'inline-block'}}>
                                                {getFieldDecorator(`${idDatasetColumn}`,
                                                    {
                                                        initialValue: highlight.datasetColumn,
                                                        rules: [{
                                                            required:
                                                                highlight.operation ||
                                                                highlight.value,
                                                            message: ' '
                                                        }]
                                                    })(
                                                    <Select
                                                        placeholder={t('columnname')}
                                                        style={{
                                                            width: '239px',
                                                            marginRight: '10px',
                                                            marginLeft: '10px'
                                                        }}
                                                        showSearch={true}
                                                        allowClear={true}
                                                        onChange={(e: any) => {
                                                            const event = e ? e : JSON.stringify({
                                                                index: highlight.index,
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
                                                                            index: highlight.index,
                                                                            columnName: 'datasetColumn',
                                                                            value: c.get('field')
                                                                        })}
                                                                        value={JSON.stringify({
                                                                            index: highlight.index,
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
                                        <Col span={7} style={{marginLeft: '9px'}}>
                                            <Form.Item style={{display: 'inline-block'}}>
                                                {getFieldDecorator(`${idOperation}`,
                                                    {
                                                        initialValue: `${t(highlight.operation)}` || undefined,
                                                        rules: [{
                                                            required:
                                                                highlight.datasetColumn ||
                                                                highlight.value,
                                                            message: ' '
                                                        }]
                                                    })(
                                                    <Select
                                                        disabled={highlight.highlightType === 'Column'}
                                                        placeholder={t('operation')}
                                                        style={{width: '189px', marginRight: '10px'}}
                                                        allowClear={true}
                                                        onChange={(e: any) => {
                                                            const event = e ? e : JSON.stringify({
                                                                index: highlight.index,
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
                                                                            index: highlight.index,
                                                                            columnName: 'operation',
                                                                            value: o.get('name')
                                                                        })}
                                                                        value={JSON.stringify({
                                                                            index: highlight.index,
                                                                            columnName: 'operation',
                                                                            value: o.get('name')
                                                                        })}
                                                                    >
                                                                        {t(o.get('name'))}
                                                                    </Select.Option>)
                                                        }
                                                    </Select>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={4} style={{marginLeft: '5px'}}>
                                            <Form.Item style={{display: 'inline-block'}}>
                                                {getFieldDecorator(`${idValue}`,
                                                    {
                                                        initialValue: highlight.value,
                                                        rules: [{
                                                            required:
                                                                highlight.datasetColumn ||
                                                                highlight.operation,
                                                            message: ' '
                                                        }]
                                                    })(
                                                    <Input
                                                        placeholder={t('value')}
                                                        disabled={highlight.operation === 'IsEmpty' || highlight.operation === 'IsNotEmpty' || highlight.highlightType === 'Column'}
                                                        style={{width: '110px', marginRight: '10px'}}
                                                        allowClear={true}
                                                        onChange={(e: any) => this.handleChange(
                                                            JSON.stringify({
                                                                index: highlight.index,
                                                                columnName: 'value',
                                                                value: e.target.value === "" ? undefined : e.target.value
                                                            })
                                                        )}
                                                        title={highlight.value}
                                                        id={highlight.index.toString()}
                                                    />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={1} style={{marginLeft: '7px'}}>
                                            <Form.Item style={{ display: 'inline-block' }}>
                                                {getFieldDecorator(`${idEnable}`,
                                                    {
                                                        initialValue: highlight.enable !== undefined ? highlight.enable : true,
                                                        valuePropName: 'checked',
                                                    })(
                                                    <Checkbox
                                                        onChange={(e: any) => {
                                                            const event = JSON.stringify({index: highlight.index, columnName: 'enable', value: e.target?.checked});
                                                            this.handleChange(event)
                                                        }}>
                                                    </Checkbox>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col  span={1} style={{marginLeft: '7px'}}>
                                            <Form.Item style={{ display: 'inline-block' }}>
                                                    <Button
                                                        title="delete row"
                                                        style={{width: '40px'}}
                                                        key={'deleteRowButton'}
                                                        value={'deleteRowButton'}
                                                        onClick={(e: any) => {this.deleteRow({index: highlight.index})}}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                                                    </Button>
                                            </Form.Item>
                                        </Col>
                                    </Form.Item>
                                    <Form.Item style={{marginTop: '-17px'}}>
                                        <Row>
                                            <Col span={4} style={{marginLeft: '17px', marginTop: '-17px'}}>
                                                {getFieldDecorator(`${idHighlightType}`,
                                                    {
                                                        initialValue: t(highlight.highlightType)
                                                    })(
                                                    <Select
                                                        allowClear={true}
                                                        style={{width: '100px'}}
                                                        onChange={(e: any) => {
                                                            const event = e ? e : JSON.stringify({
                                                                index: highlight.index,
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
                                                                            index: highlight.index,
                                                                            columnName: 'highlightType',
                                                                            value: o.get('name')
                                                                        })}
                                                                        value={JSON.stringify({
                                                                            index: highlight.index,
                                                                            columnName: 'highlightType',
                                                                            value: o.get('name')
                                                                        })}
                                                                    >
                                                                        {t(o.get('name'))}
                                                                    </Select.Option>)
                                                        }
                                                    </Select>
                                                )}
                                            </Col>
                                            <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                                                <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>Фон</div>
                                                <FontAwesomeIcon
                                                    color={highlight.backgroundColor}
                                                    onClick={() => this.handleColorMenu('background', highlight.index)}
                                                    style={{fontSize: '18px', marginLeft: '13px'}}
                                                    icon={faPalette}
                                                />
                                                <Modal
                                                    width={'500px'}
                                                    title={'Выбор цвета фона'}
                                                    visible={this.state.backgroundColorVisible && this.state.colorIndex === highlight.index}
                                                    onCancel={() => this.handleColorMenu('background', highlight.index)}
                                                    closable={false}
                                                    mask={false}
                                                    onOk={() => {
                                                        return this.handleChange(JSON.stringify({
                                                            index: highlight.index,
                                                            columnName: 'backgroundColor',
                                                            value: this.state.color !== undefined ? this.state.color['hex'] : highlight.backgroundColor
                                                        }))
                                                    }}
                                                >
                                                    <SliderPicker
                                                        onChange={(e: any) => this.changeColor(e)}
                                                        color={this.state.color !== undefined ? this.state.color['hex'] :
                                                            highlight.backgroundColor !== undefined ? highlight.backgroundColor : 'white'}
                                                    />
                                                </Modal>
                                            </Col>
                                            <Col span={8} style={{marginRight: '20px', marginLeft: '20px', textAlign: 'center', marginTop: '-17px'}}>
                                                <div style={{display: "inline-block", fontSize: '17px', fontWeight: 500, color: '#878787'}}>Текст</div>
                                                <FontAwesomeIcon
                                                    color={highlight.color}
                                                    onClick={() => this.handleColorMenu('text', highlight.index)}
                                                    style={{fontSize: '18px', marginLeft: '13px'}}
                                                    icon={faPalette}
                                                />
                                                <Modal
                                                    width={'500px'}
                                                    title={'Выбор цвета текста'}
                                                    visible={this.state.textColorVisible && this.state.colorIndex === highlight.index}
                                                    onCancel={() => this.handleColorMenu('text', highlight.index)}
                                                    closable={false}
                                                    mask={false}
                                                    onOk={() => this.handleChange(JSON.stringify({
                                                        index: highlight.index,
                                                        columnName: 'color',
                                                        value: this.state.color !== undefined ? this.state.color['hex'] : highlight.color
                                                    }))}
                                                >
                                                    <SliderPicker
                                                        onChange={(e: any) => this.changeColor(e)}
                                                        color={ this.state.color !== undefined ? this.state.color['hex'] :
                                                            highlight.color !== undefined ? highlight.color : 'white' }
                                                    />
                                                </Modal>
                                            </Col>
                                        </Row>
                                    </Form.Item>
                                </Form.Item>
                            )
                        })
                }
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Highlight))
