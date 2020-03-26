import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Col, Form, Input, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {paramType} from "./DatasetView"

interface Props {
    serverFilters?: Array<EObject>;
    columnDefs?:  Array<any>;
    allOperations?: Array<EObject>;
    onChangeServerFilter?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    isVisible?: boolean;
}

interface State {
    serverFilters: EObject[] | undefined;
}

class ServerFilter extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverFilters: this.props.serverFilters
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (JSON.stringify(prevProps.isVisible) !== JSON.stringify(this.props.isVisible) && !this.props.isVisible
            && JSON.stringify(this.props.serverFilters) !== JSON.stringify(this.state.serverFilters)) {
            this.props.form.validateFields((err: any, values: any) => {
                if (err) {
                    this.props.context.notification('Filter notification','Please, correct the mistakes', 'error')
                }
            });
        }
        if (JSON.stringify(prevProps.serverFilters) !== JSON.stringify(this.props.serverFilters)
            && JSON.stringify(prevState.serverFilters) !== JSON.stringify(this.state.serverFilters)) {
            this.setState({serverFilters: this.props.serverFilters})
        }
        if (JSON.stringify(prevState.serverFilters) !== JSON.stringify(this.state.serverFilters) && this.props.isVisible) {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    this.props.saveChanges!(this.state.serverFilters!, paramType.filter);
                }
            });
        }
        if (this.state.serverFilters?.length === 0) {
            this.createNewRow()
        }
    }

    updateTableData(): void  {
        this.props.onChangeServerFilter!(this.state.serverFilters!, true)
    }

    handleChange(e: any) {
        const target = JSON.parse(e);
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
                    type: (targetColumn ? targetColumn.get('type') : undefined) || f.type}
            } else {
                return f
            }
        });
        this.setState({serverFilters});
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    createNewRow = () => {
        let serverFilters: any = this.state.serverFilters;
        serverFilters.push(
            {index: serverFilters.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                value: undefined,
                enable: undefined,
                type: undefined});
        this.setState({serverFilters})
    };

    reset = () => {
        this.props.onChangeServerFilter!(undefined, paramType.filter);
        this.setState({serverFilters:[]});
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeServerFilter!(this.state.serverFilters!, paramType.filter)
                }
            else {
                this.props.context.notification('Filters notification','Please, correct the mistakes', 'error')
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
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Системные фильтры</div>
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
                    this.state.serverFilters !== undefined && this.state.serverFilters!
                        .map((serverFilter: any) => {
                            const idDatasetColumn = `${JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: serverFilter.datasetColumn})}`;
                            const idOperation = `${JSON.stringify({index: serverFilter.index, columnName: 'operation', value: serverFilter.operation})}`;
                            const idValue = `${JSON.stringify({index: serverFilter.index, columnName: 'value', value: serverFilter.value})}`;
                            const idEnable = `${JSON.stringify({index: serverFilter.index, columnName: 'enable', value: serverFilter.enable})}`;
                            return (
                                <Form.Item key={serverFilter.index} style={{ marginTop: '-30px' }}>
                                    <Col span={1}>
                                        <span>{serverFilter.index}</span>
                                    </Col>
                                    <Col span={9} style={{marginLeft: '-21px'}}>
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
                                                    placeholder={t('columnname')}
                                                    style={{ width: '239px', marginRight: '10px', marginLeft: '10px' }}
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
                                    </Col>
                                    <Col span={7} style={{marginLeft: '9px'}}>
                                        <Form.Item style={{ display: 'inline-block' }}>
                                            {getFieldDecorator(`${idOperation}`,
                                                {
                                                    initialValue: `${t(serverFilter.operation)}` || undefined,
                                                    rules: [{
                                                        required:
                                                            getFieldValue(`${idDatasetColumn}`) ||
                                                            getFieldValue(`${idValue}`) ||
                                                            getFieldValue(`${idEnable}`),
                                                        message: ' '
                                                    }]
                                                })(
                                                <Select
                                                    placeholder={t('operation')}
                                                    style={{ width: '189px', marginRight: '10px' }}
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
                                                                    {t(o.get('name'))}
                                                                </Select.Option>)
                                                    }
                                                </Select>

                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={4} style={{marginLeft: '5px'}}>
                                        <Form.Item style={{ display: 'inline-block' }}>
                                            {getFieldDecorator(`${idValue}`,
                                                {
                                                    initialValue: serverFilter.value,
                                                    rules: [{
                                                        required:
                                                            (
                                                                (
                                                                    JSON.parse(idOperation)['value'] !== 'IsNotEmpty' &&
                                                                    JSON.parse(idOperation)['value'] !== 'IsEmpty')
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
                                                    placeholder={t('value')}
                                                    disabled={serverFilter.operation === 'IsEmpty' || serverFilter.operation === 'IsNotEmpty'}
                                                    style={{ width: '110px', marginRight: '10px' }}
                                                    allowClear={true}
                                                    onChange={(e: any) => this.handleChange(
                                                        JSON.stringify({index: serverFilter.index, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                                                    )}
                                                    title={serverFilter.value}
                                                    id={serverFilter.index}
                                                />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={3} style={{marginLeft: '7px'}}>
                                        <Form.Item style={{ display: 'inline-block' }}>
                                            {getFieldDecorator(`${idEnable}`,
                                                {
                                                    initialValue: serverFilter.enable !== undefined ? t(serverFilter.enable.toString()) : undefined,
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
                                                    style={{width: '82px'}}
                                                    onChange={(e: any) => {
                                                        const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'enable', value: undefined})
                                                        this.handleChange(event)
                                                    }}
                                                >
                                                    <Select.Option
                                                        key={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: false})}
                                                        value={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: false})}
                                                    >
                                                        {t('false')}
                                                    </Select.Option>
                                                    <Select.Option
                                                        key={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: true})}
                                                        value={JSON.stringify({index: serverFilter.index, columnName: 'enable', value: true})}
                                                    >
                                                        {t('true')}
                                                    </Select.Option>
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Form.Item>
                            )})
                        }
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerFilter))
