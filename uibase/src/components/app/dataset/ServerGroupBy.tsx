import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Col, Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"

interface Props {
    serverGroupBy?: Array<EObject>;
    columnDefs?:  Array<any>;
    allAggregates?: Array<EObject>;
    onChangeServerGroupBy?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    isVisible?: boolean;
}

interface State {
    serverGroupBy: {
        index: number,
        datasetColumn?: string,
        operation?: string,
        enable?: boolean,
        type?: string
    }[] | undefined;
}



class ServerGroupBy extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverGroupBy: this.props.serverGroupBy,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        //on change props.isVisible
        if (JSON.stringify(prevProps.isVisible) !== JSON.stringify(this.props.isVisible) && !this.props.isVisible
            && JSON.stringify(this.props.serverGroupBy) !== JSON.stringify(this.state.serverGroupBy)) {
            this.props.form.validateFields((err: any, values: any) => {
                if (err) {
                    this.props.context.notification('Aggregation notification','Please, correct the mistakes', 'error');
                }
            });
        }
        //load from profile
        if (JSON.stringify(prevProps.serverGroupBy) !== JSON.stringify(this.props.serverGroupBy)
            && JSON.stringify(prevState.serverGroupBy) !== JSON.stringify(this.state.serverGroupBy)) {
            this.setState({serverGroupBy: this.props.serverGroupBy})
        }
        //handleChange on form
        if (JSON.stringify(prevState.serverGroupBy) !== JSON.stringify(this.state.serverGroupBy) && this.props.isVisible) {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    this.props.saveChanges!(this.state.serverGroupBy!, paramType.group);
                }
            });
        }
        //reset
        if (this.state.serverGroupBy?.length === 0) {
            this.createNewRow()
        }
    }

    handleChange(e: any) {
        const target = JSON.parse(e);
        let serverGroupBy = this.state.serverGroupBy!.map( (f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs!.find( (c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                );
                return {index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    enable: target['columnName'] === 'enable' ? target['value'] : f.enable,
                    type: f.type || (targetColumn ? targetColumn.get('type') : undefined)}
            } else {
                return f
            }
        });
        this.setState({serverGroupBy});
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    createNewRow = () => {
        let serverGroupBy: any = this.state.serverGroupBy;
        serverGroupBy.push(
            {index: serverGroupBy.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                enable: undefined,
                type: undefined});
        this.setState({serverGroupBy})
    };

    reset = () => {
        this.props.onChangeServerGroupBy!(undefined, paramType.group);
        this.setState({serverGroupBy:[]});
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeServerGroupBy!(this.state.serverGroupBy!, paramType.group)
            }
            else {
                this.props.context.notification('Aggregates notification','Please, correct the mistakes', 'error')
            }
        });
    };

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { t } = this.props;
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Серверная группировка</div>
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
                {
                    this.state.serverGroupBy !== undefined && this.state.serverGroupBy!
                        .map((serverGroupBy: any) => {
                            const idDatasetColumn = `${JSON.stringify({index: serverGroupBy.index, columnName: 'datasetColumn', value: serverGroupBy.datasetColumn})}`;
                            const idOperation = `${JSON.stringify({index: serverGroupBy.index, columnName: 'operation', value: serverGroupBy.operation})}`;
                            const idEnable = `${JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: serverGroupBy.enable})}`;
                            return (
                                <Form.Item key={serverGroupBy.index} style={{ marginTop: '-30px' }}>
                                    <span>{serverGroupBy.index}</span>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idDatasetColumn}`,
                                            {
                                                initialValue: serverGroupBy.datasetColumn,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idOperation}`)||
                                                        getFieldValue(`${idEnable}`),
                                                    message: ' '
                                                },{
                                                    validator: (rule: any, value: any, callback: any) => {
                                                        let isDuplicate: boolean = false;
                                                        if (this.state.serverGroupBy !== undefined) {
                                                            const valueArr = this.state.serverGroupBy
                                                                .filter((currentObject) => {
                                                                    let currentField: string;
                                                                    try {
                                                                        //Либо объект при валидации отдельного поля
                                                                        currentField = JSON.parse(rule.value).value
                                                                    } catch (e) {
                                                                        //Либо значение этого поля при валидации перед запуском
                                                                        currentField = value
                                                                    }
                                                                    return (currentField)? currentObject.datasetColumn === currentField: false
                                                                })
                                                                .map(function (currentObject) {
                                                                    return currentObject.datasetColumn
                                                                });
                                                            isDuplicate = valueArr.some(function (item, idx) {
                                                                return valueArr.indexOf(item) !== idx
                                                            });
                                                        }
                                                        if (isDuplicate) {
                                                            callback('Error message');
                                                            return;
                                                        }
                                                        callback();
                                                    },
                                                    message: 'duplicate row',
                                                }]
                                            })(
                                            <Select
                                                placeholder={t('columnname')}
                                                style={{ width: '239px', marginRight: '10px', marginLeft: '10px' }}
                                                showSearch={true}
                                                allowClear={true}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverGroupBy.index, columnName: 'datasetColumn', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.columnDefs!
                                                        .map((c: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverGroupBy.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                                value={JSON.stringify({index: serverGroupBy.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                            >
                                                                {c.get('field')}
                                                            </Select.Option>)
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idOperation}`,
                                            {
                                                initialValue: `${t(serverGroupBy.operation)}` || undefined,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idDatasetColumn}`)||
                                                        getFieldValue(`${idEnable}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                placeholder={t('operation')}
                                                style={{ width: '189px', marginRight: '10px' }}
                                                allowClear={true}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverGroupBy.index, columnName: 'operation', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.allAggregates!
                                                        .map((o: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverGroupBy.index, columnName: 'operation', value: o.get('name')})}
                                                                value={JSON.stringify({index: serverGroupBy.index, columnName: 'operation', value: o.get('name')})}
                                                            >
                                                                {t(o.get('name'))}
                                                            </Select.Option>)
                                                }
                                            </Select>

                                        )}
                                    </Form.Item>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idEnable}`,
                                            {
                                                initialValue: serverGroupBy.enable !== undefined ? t(serverGroupBy.enable.toString()) : undefined,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idDatasetColumn}`) ||
                                                        getFieldValue(`${idOperation}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                allowClear={true}
                                                style={{width: '82px'}}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                <Select.Option
                                                    key={JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: false})}
                                                    value={JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: false})}
                                                >
                                                    {t('false')}
                                                </Select.Option>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: true})}
                                                    value={JSON.stringify({index: serverGroupBy.index, columnName: 'enable', value: true})}
                                                >
                                                    {t('true')}
                                                </Select.Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Form.Item>
                            )})
                }
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerGroupBy))
