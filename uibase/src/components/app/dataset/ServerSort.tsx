import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"

interface Props {
    serverSorts?: Array<EObject>;
    columnDefs?:  Array<any>;
    allSorts?: Array<EObject>;
    onChangeServerSort?: (newServerSort: any[], paramName: paramType) => void;
}

interface State {
    serverSorts: {
        index: string,
        datasetColumn: string,
        operation: string,
        enable: boolean,
        type: string
    }[] | undefined;
}



class ServerSort extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverSorts: this.props.serverSorts,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (JSON.stringify(prevProps.serverSorts) !== JSON.stringify(this.props.serverSorts)) {
            this.setState({serverSorts: this.props.serverSorts})
        }
    }

    handleChange(e: any) {
        const target = JSON.parse(e);
        let serverSorts = this.state.serverSorts!.map( (f: any) => {
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
        this.setState({serverSorts})
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    createNewRow = () => {
        let serverSorts: any = this.state.serverSorts;
        serverSorts.push(
            {index: serverSorts.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                enable: undefined,
                type: undefined});
        this.setState({serverSorts})
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeServerSort!(this.state.serverSorts!, paramType.sort)
            }
            else {
                this.props.context.notification('Sort notification','Please, correct the mistakes', 'error')
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
                    this.state.serverSorts!
                        .map((serverSort: any) => {
                            const idDatasetColumn = `${JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: serverSort.datasetColumn})}`;
                            const idOperation = `${JSON.stringify({index: serverSort.index, columnName: 'operation', value: serverSort.operation})}`;
                            const idEnable = `${JSON.stringify({index: serverSort.index, columnName: 'enable', value: serverSort.enable})}`;
                            return (
                                <Form.Item key={serverSort.index} style={{ marginTop: '-30px' }}>
                                    <span>{serverSort.index}</span>
                                    <Form.Item style={{ display: 'inline-block' }}>
                                        {getFieldDecorator(`${idDatasetColumn}`,
                                            {
                                                initialValue: serverSort.datasetColumn,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idOperation}`)||
                                                        getFieldValue(`${idEnable}`),
                                                    message: ' '
                                                },{
                                                    validator: (rule: any, value: any, callback: any) => {
                                                        let isDuplicate: boolean = false;
                                                        if (this.state.serverSorts !== undefined) {
                                                            const valueArr = this.state.serverSorts
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
                                                                return valueArr.indexOf(item) != idx
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
                                                    const event = e ? e : JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.columnDefs!
                                                        .map((c: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                                value={JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: c.get('field')})}
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
                                                initialValue: `${t(serverSort.operation)}` || undefined,
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
                                                    const event = e ? e : JSON.stringify({index: serverSort.index, columnName: 'operation', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                {
                                                    this.props.allSorts!
                                                        .map((o: any) =>
                                                            <Select.Option
                                                                key={JSON.stringify({index: serverSort.index, columnName: 'operation', value: o.get('name')})}
                                                                value={JSON.stringify({index: serverSort.index, columnName: 'operation', value: o.get('name')})}
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
                                                initialValue: serverSort.enable !== undefined ? serverSort.enable.toString() : undefined,
                                                rules: [{
                                                    required:
                                                        getFieldValue(`${idDatasetColumn}`) ||
                                                        getFieldValue(`${idOperation}`),
                                                    message: ' '
                                                }]
                                            })(
                                            <Select
                                                allowClear={true}
                                                style={{width: '66px'}}
                                                onChange={(e: any) => {
                                                    const event = e ? e : JSON.stringify({index: serverSort.index, columnName: 'enable', value: undefined})
                                                    this.handleChange(event)
                                                }}
                                            >
                                                <Select.Option
                                                    key={JSON.stringify({index: serverSort.index, columnName: 'enable', value: false})}
                                                    value={JSON.stringify({index: serverSort.index, columnName: 'enable', value: false})}
                                                >
                                                    false
                                                </Select.Option>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverSort.index, columnName: 'enable', value: true})}
                                                    value={JSON.stringify({index: serverSort.index, columnName: 'enable', value: true})}
                                                >
                                                    true
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

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerSort))
