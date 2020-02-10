import * as React from 'react';
import {withTranslation} from 'react-i18next';
import Ecore, {EObject} from 'ecore';
import {Button, Form, Input, notification, Select} from 'antd';
import {operationsMapper} from '../../../utils/consts';
//import './../../../styles/ServerFilter.css';

const operationsMapper_: any = operationsMapper;

interface Props {
    serverFilters?: Array<EObject>;
    columnDefs?:  Array<any>;
    allOperations?: Array<EObject>;
    onChangeServerFilter?: (newServerFilter: any[], updateData: boolean) => void;
}

class ServerFilter extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            serverFilters: this.props.serverFilters
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.serverFilters !== this.props.serverFilters) {
            this.setState({serverFilters: this.props.serverFilters})
        }
    }

    updateTableData(): void  {
        this.props.onChangeServerFilter(this.state.serverFilters, true)
    }

    handleChange(e: any) {
        const target = JSON.parse(e)
        let serverFilters = this.state.serverFilters.map( (f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs.find( (c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                 );
                return {index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    value: target['columnName'] === 'value' ? target['value'] : f.value,
                    enable: target['columnName'] === 'enable' ? target['value'] : f.enable,
                    type: f.type || targetColumn ? targetColumn.get('type') : undefined}
            } else {
                return f
            }
        });

        this.setState({serverFilters})
        this.props.onChangeServerFilter(serverFilters, false)
    }

    render() {
        return (
            <Form style={{ marginTop: '20px' }}>
                {
                    this.state.serverFilters
                        .map((serverFilter: any) =>
                            <Form.Item key={serverFilter.index} style={{ marginTop: '-20px' }}>
                                <span>{serverFilter.index}</span>
                                <Select
                                    style={{ width: '300px', marginRight: '10px', marginLeft: '10px' }}
                                    value={serverFilter.datasetColumn}
                                    showSearch={true}
                                    allowClear={true}
                                    onChange={(e: any) => {
                                        const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: undefined})
                                        this.handleChange(event)
                                    }}
                                >
                                    {
                                        this.props.columnDefs
                                            .map((c: any) =>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                    value={JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                >
                                                    {c.get('field')}
                                                </Select.Option>)
                                    }
                                </Select>
                                <Select
                                    style={{ width: '100px', marginRight: '10px' }}
                                    defaultValue={operationsMapper_[serverFilter.operation]}
                                    allowClear={true}
                                    onChange={(e: any) => {
                                        const event = e ? e : JSON.stringify({index: serverFilter.index, columnName: 'operation', value: undefined})
                                        this.handleChange(event)
                                    }}
                                >
                                    {
                                        this.props.allOperations
                                            .map((o: any) =>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: 'operation', value: o.get('name')})}
                                                    value={JSON.stringify({index: serverFilter.index, columnName: 'operation', value: o.get('name')})}
                                                >
                                                    {operationsMapper_[o.get('name')]}
                                                </Select.Option>)
                                    }
                                </Select>
                                <Input
                                    disabled={serverFilter.operation === 'IsNull' || serverFilter.operation === 'IsNotNull'}
                                    style={{ width: '110px', marginRight: '10px' }}
                                    defaultValue={serverFilter.value}
                                    allowClear={true}
                                    onChange={(e: any) => this.handleChange(
                                        JSON.stringify({index: e.target.id, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                                    )}
                                    id={serverFilter.index}
                                />
                                <Select
                                    value={serverFilter.enable !== undefined ? serverFilter.enable.toString() : undefined}
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

                            </Form.Item>
                        )
                }
                <Button key={'serverFilter'} value={'serverFilter'} onClick={ () => this.updateTableData()} >Apply</Button>
            </Form>
        )
    }
}

export default withTranslation()(ServerFilter)
