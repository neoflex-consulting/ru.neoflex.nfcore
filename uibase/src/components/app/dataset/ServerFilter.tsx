import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Form, Input, Select} from 'antd';
import {operationsMapper} from '../../../utils/consts';
import {FormComponentProps} from "antd/lib/form";
//import './../../../styles/ServerFilter.css';

const operationsMapper_: any = operationsMapper;

interface Props {
    serverFilters?: Array<EObject>;
    columnDefs?:  Array<any>;
    allOperations?: Array<EObject>;
    onChangeServerFilter?: (newServerFilter: any[], updateData: boolean) => void;
}

interface State {
    serverFilters: EObject[] | undefined;
}

class ServerFilter extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverFilters: this.props.serverFilters,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.serverFilters !== this.props.serverFilters) {
            this.setState({serverFilters: this.props.serverFilters})
        }
    }

    updateTableData(): void  {
        this.props.onChangeServerFilter!(this.state.serverFilters!, true)
    }

    handleChange(e: any) {
        const target = JSON.parse(e)
        let serverFilters = this.state.serverFilters!.map( (f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs!.find( (c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                 );
                return {index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    value: target['columnName'] === 'value' ? target['value'] : f.value,
                    enable: target['columnName'] === 'enable' ? target['value'] : f.enable,
                    type: f.type || (targetColumn ? targetColumn.get('type') : undefined)}
            } else {
                return f
            }
        });

        this.setState({serverFilters})
        this.props.onChangeServerFilter!(serverFilters, false)
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeServerFilter!(this.state.serverFilters!, true)
                this.props.context.notification('Filters notification','Request started', 'success')
            }
            else {
                this.props.context.notification('Filters notification','Please, correct the mistakes', 'error')
            }
        });
    };

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                {
                    this.state.serverFilters!
                        .map((serverFilter: any) => {
                            const idDatasetColumn = `${JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: serverFilter.datasetColumn})}`;
                            const idOperation = `${JSON.stringify({index: serverFilter.index, columnName: 'operation', value: serverFilter.operation})}`;
                            const idValue = `${JSON.stringify({index: serverFilter.index, columnName: 'value', value: serverFilter.value})}`;
                            const idEnable = `${JSON.stringify({index: serverFilter.index, columnName: 'enable', value: serverFilter.enable})}`;

                            return (
                                <Form.Item key={serverFilter.index} style={{ marginTop: '-30px' }}>
                                    <span>{serverFilter.index}</span>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idDatasetColumn}`,
                                            {
                                                initialValue: serverFilter.datasetColumn,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idOperation}`) ||
                                                        getFieldValue(`${idValue}`) ||
                                                        getFieldValue(`${idEnable}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                style={{ width: '300px', marginRight: '10px', marginLeft: '10px' }}
                                                showSearch={true}
                                                allowClear={true}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.columnDefs!
                                                        .map((c: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                                value={JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: c.get('field')})}
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
                                                initialValue: operationsMapper_[serverFilter.operation],
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idDatasetColumn}`) ||
                                                        getFieldValue(`${idValue}`) ||
                                                        getFieldValue(`${idEnable}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                style={{ width: '100px', marginRight: '10px' }}
                                                allowClear={true}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'operation', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.allOperations!
                                                        .map((o: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverFilter.index, columnName: 'operation', value: o.get('name')})}
                                                                value={JSON.stringify({index: serverFilter.index, columnName: 'operation', value: o.get('name')})}
                                                            >
                                                                {operationsMapper_[o.get('name')]}
                                                            </Select.Option>)
                                                }
                                            </Select>

                                        )}
                                    </Form.Item>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idValue}`,
                                            {
                                                initialValue: serverFilter.value,
                                                rules: [{
                                                    required:
                                                        (
                                                            (
                                                                JSON.parse(idOperation)['value'] !== 'IsNotNull' &&
                                                                JSON.parse(idOperation)['value'] !== 'IsNull')
                                                            &&
                                                            (
                                                               getFieldValue(`${idOperation}`) ||
                                                               getFieldValue(`${idDatasetColumn}`) ||
                                                               getFieldValue(`${idEnable}`)
                                                            )
                                                        ),
                                                    message: ' '
                                                }]
                                            })(
                                            <Input
                                                disabled={serverFilter.operation === 'IsNull' || serverFilter.operation === 'IsNotNull'}
                                                style={{ width: '110px', marginRight: '10px' }}
                                                allowClear={true}
                                                onChange={(e: any) => this.handleChange(
                                                    JSON.stringify({index: e.target.id, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                                                )}
                                                id={serverFilter.index}
                                            />

                                        )}
                                    </Form.Item>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idEnable}`,
                                            {
                                                initialValue: serverFilter.enable !== undefined ? serverFilter.enable.toString() : undefined,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idDatasetColumn}`) ||
                                                        getFieldValue(`${idOperation}`) ||
                                                        getFieldValue(`${idValue}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                allowClear={true}
                                                style={{width: '75px'}}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'enable', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: false})}
                                                    value={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: false})}
                                                >
                                                    false
                                                </Select.Option>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: true})}
                                                    value={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: true})}
                                                >
                                                    true
                                                </Select.Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Form.Item>
                            )})
                        }
                        <Form.Item  style={{ marginTop: '-30px', marginLeft: '30px' }}>
                            <Button key={'buttonServerFilter'} value={'buttonServerFilter'} htmlType="submit">Apply</Button>
                        </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerFilter))
