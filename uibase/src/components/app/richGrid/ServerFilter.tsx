import * as React from 'react';
import {withTranslation} from "react-i18next";
import {EObject} from "ecore";
import {Button, Form, Input, Select} from "antd";
import {API} from "../../../modules/api";
import {operationsMapper} from "../../../utils/consts";

const operationsMapper_: any = operationsMapper;

interface Props {
    serverFilters?: Array<EObject>;
    columnDefs?:  Array<any>;
}

class ServerFilter extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            allColumns: [],
            serverFilters: [],
            allOperations: []
        };

        this.handleChange = this.handleChange.bind(this);
    }

    getAllOperations() {
        API.instance().findEnum('dataset', 'Operations')
            .then((result: EObject[]) => {
                let allOperations = result.map( (o: any) => {return o});
                this.setState({allOperations})
            })
    };

    componentDidMount(): void {
        if (this.state.allOperations.length === 0) {this.getAllOperations()}
        if (this.state.allColumns.length === 0 && this.props.columnDefs !== undefined) {
            let allColumns = this.props.columnDefs.map( (c: any) => {
                return c.get('field')
            });
            this.setState({allColumns})
        }
        if (this.state.serverFilters.length === 0 && this.props.serverFilters !== undefined) {
            let serverFilters = this.props.serverFilters.map( (f: any, index: any) => {
                return {index: index + 1,
                    column: f['datasetColumn'],
                    operation: f['operation'],
                    value: f['value'],
                    enable: f['enable'] !== null ? f['enable'] : false}
            });
            if (serverFilters.length < 9) {
                for (let i = serverFilters.length + 1; i <= 9; i++) {
                    serverFilters.push(
                        {index: i,
                            column: undefined,
                            operation: undefined,
                            value: undefined,
                            enable: undefined}
                    )
                }
            }
            this.setState({serverFilters})
        }
    }

    updateTableData(pathFull: any): void  {
        const appModule = pathFull[pathFull.length - 1];
        let params: Object[] = this.state.serverFilters
            .filter( (f:any) => f['column'] !== undefined && f['operation'] !== undefined && f['enable'] !== undefined)
            .map( (f:any) => {
                return {
                    datasetColumn: f['column'],
                    operation: f['operation'],
                    value: f['value'],
                    enable: f['enable']
                }
            });
        this.props.context.changeURL!(appModule.appModule, undefined, params)
    }

    handleChange(e: any) {
        const target = JSON.parse(e)[0];
            let serverFilters = this.state.serverFilters.map( (f: any) => {
            if (f.index.toString() === target["index"].toString()) {
                return {index: f.index,
                    column: target["columnName"] === "column" ? target["value"] : f.column,
                    operation: target["columnName"] === "operation" ? target["value"] : f.operation,
                    value: target["columnName"] === "value" ? target["value"] : f.value,
                    enable: target["columnName"] === "enable" ? target["value"] : f.enable}
            } else {
                return f
            }
        });
        this.setState({serverFilters})
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
                                    defaultValue={serverFilter.column}
                                    showSearch={true}
                                    allowClear={true}
                                    onChange={(e: any) => this.handleChange(e)}
                                >
                                    {
                                        this.state.allColumns
                                            .map((c: any) =>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: "column", value: c})}
                                                    value={JSON.stringify([{index: serverFilter.index, columnName: "column", value: c}])}
                                                >
                                                    {c}
                                                </Select.Option>)
                                    }
                                </Select>
                                <Select
                                    style={{ width: '100px', marginRight: '10px' }}
                                    defaultValue={operationsMapper_[serverFilter.operation]}
                                    allowClear={true}
                                    onChange={(e: any) => this.handleChange(e)}
                                >
                                    {
                                        this.state.allOperations
                                            .map((o: any) =>
                                                <Select.Option
                                                    key={JSON.stringify({index: serverFilter.index, columnName: "operation", value: o.get('name')})}
                                                    value={JSON.stringify([{index: serverFilter.index, columnName: "operation", value: o.get('name')}])}
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
                                        JSON.stringify([{index: e.target.id, columnName: "value", value: e.target.value}])
                                    )}
                                    id={serverFilter.index}
                                />
                                <Select
                                    style={{ width: '75px' }}
                                    defaultValue={serverFilter.enable !== undefined ? serverFilter.enable.toString() : undefined}
                                    allowClear={true}
                                    onChange={(e: any) => this.handleChange(e)}
                                >
                                    <Select.Option
                                        key={JSON.stringify({index: serverFilter.index, columnName: "enable", value: false})}
                                        value={JSON.stringify([{index: serverFilter.index, columnName: "enable", value: false}])}
                                    >
                                        false
                                    </Select.Option>
                                    <Select.Option
                                        key={JSON.stringify({index: serverFilter.index, columnName: "enable", value: true})}
                                        value={JSON.stringify([{index: serverFilter.index, columnName: "enable", value: true}])}
                                    >
                                        true
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        )
                }
                <Button key={'serverFilter'} value={'serverFilter'} onClick={ () => this.updateTableData(this.props.pathFull)} >Apply</Button>
            </Form>
        )
    }
}

export default withTranslation()(ServerFilter)
