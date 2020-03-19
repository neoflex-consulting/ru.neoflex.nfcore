import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Form, Input, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface Props {
    serverAggregates?: Array<EObject>;
    columnDefs?:  Array<any>;
    allAggregates?: Array<EObject>;
    onChangeServerFilter?: (newServerFilter: any[], updateData: boolean) => void;
}

interface State {
    serverAggregates: EObject[] | undefined;
}

class ServerAggregate extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverAggregates: this.props.serverAggregates,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (JSON.stringify(prevProps.serverAggregates) !== JSON.stringify(this.props.serverAggregates)) {
            this.setState({serverAggregates: this.props.serverAggregates})
        }
    }

    /*updateTableData(): void  {
        this.props.onChangeServerFilter!(this.state.serverAggregates!, true)
    }*/

    handleChange(e: any) {
        const target = JSON.parse(e);
        let serverAggregates = this.state.serverAggregates!.map( (f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs!.find( (c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                );
                return {index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    type: f.type || (targetColumn ? targetColumn.get('type') : undefined)}
            } else {
                return f
            }
        });
        this.setState({serverAggregates})
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    createNewRow = () => {
        let serverAggregates: any = this.state.serverAggregates;
        serverAggregates.push(
            {index: serverAggregates.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                type: undefined});
        this.setState({serverAggregates})
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeServerFilter!(this.state.serverAggregates!)
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
        <Form.Item  style={{ marginTop: '-38px', textAlign: "right", marginBottom: '40px' }}>
        <Button
            title="add row"
        style={{ width: '40px', marginRight: '10px' }}
        key={'createNewRowButton'}
        value={'createNewRowButton'}
        onClick={this.createNewRow}
        >
        <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
            </Button>
            <Button
        title="run query"
        style={{ width: '40px' }}
        key={'runQueryButton'}
        value={'runQueryButton'}
        htmlType="submit"
        >
        <FontAwesomeIcon icon={faPlay} size='xs' color="#7b7979"/>
            </Button>
            </Form.Item>
        {
            this.state.serverAggregates!
                .map((serverAggregate: any) => {
                    const idDatasetColumn = `${JSON.stringify({index: serverAggregate.index, columnName: 'datasetColumn', value: serverAggregate.datasetColumn})}`;
                    const idOperation = `${JSON.stringify({index: serverAggregate.index, columnName: 'operation', value: serverAggregate.operation})}`;
                    return (
                        <Form.Item key={serverAggregate.index} style={{ marginTop: '-30px' }}>
                    <span>{serverAggregate.index}</span>
                    <Form.Item style={{ display: 'inline-block' }}>
                    {getFieldDecorator(`${idDatasetColumn}`,
                        {
                            initialValue: serverAggregate.datasetColumn,
                            rules: [{
                                required:
                                    getFieldValue(`${idOperation}`),
                                message: ' '
                            }]
                        })(
                        <Select
                            placeholder={t('columnname')}
                        style={{ width: '239px', marginRight: '10px', marginLeft: '10px' }}
                        showSearch={true}
                        allowClear={true}
                        onChange={(e: any) => {
                        const event = e ? e : JSON.stringify({index: serverAggregate.index, columnName: 'datasetColumn', value: undefined})
                        this.handleChange(event)
                    }}
                    >
                        {
                            this.props.columnDefs!
                                .map((c: any) =>
                                    <Select.Option
                                        key={JSON.stringify({index: serverAggregate.index, columnName: 'datasetColumn', value: c.get('field')})}
                            value={JSON.stringify({index: serverAggregate.index, columnName: 'datasetColumn', value: c.get('field')})}
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
                            initialValue: `${t(serverAggregate.operation)}` || undefined,
                            rules: [{
                                required:
                                    getFieldValue(`${idDatasetColumn}`),
                                message: ' '
                            }]
                        })(
                        <Select
                            placeholder={t('operation')}
                        style={{ width: '189px', marginRight: '10px' }}
                        allowClear={true}
                        onChange={(e: any) => {
                        const event = e ? e : JSON.stringify({index: serverAggregate.index, columnName: 'operation', value: undefined})
                        this.handleChange(event)
                    }}
                    >
                        {
                            this.props.allAggregates!
                                .map((o: any) =>
                                    <Select.Option
                                        key={JSON.stringify({index: serverAggregate.index, columnName: 'operation', value: o.get('name')})}
                            value={JSON.stringify({index: serverAggregate.index, columnName: 'operation', value: o.get('name')})}
                                >
                                {t(o.get('name'))}
                            </Select.Option>)
                        }
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

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerAggregate))
