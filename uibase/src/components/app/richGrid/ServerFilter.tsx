import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import Ecore, {EObject} from "ecore";
import {Button, Form, Input, Select} from "antd";
import {API} from "../../../modules/api";
import {operationsMapper} from "../../../utils/consts";

const operationsMapper_: any = operationsMapper;

interface Props {
    serverFilters?: Array<EObject>;
    columnDefs?:  Array<any>;
}

class ServerFilter extends React.Component<Props & WithTranslation, any> {

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
                let allOperations = result.map( (o: any) => {
                    return o.get('name')
                });
                this.setState({allOperations})
            })
    };

    componentDidMount(): void {
        if (this.state.allOperations.length === 0) {
            this.getAllOperations()
        }
        if (this.state.allColumns.length === 0 && this.props.columnDefs !== undefined) {
            let allColumns = this.props.columnDefs.map( (c: any) => {
                return c.get('field')
            });
            this.setState({allColumns})
        }
        if (this.state.serverFilters.length === 0 && this.props.serverFilters !== undefined) {
            let serverFilters = this.props.serverFilters.map( (f: any, index: any) => {
                return {index: index + 1,
                    column: f.get('datasetColumn').get('name'),
                    operation: operationsMapper_[f.get('operation')],
                    value: f.get('value'),
                    active: f.get('enable') !== null ? f.get('enable') : false}
            });
            if (serverFilters.length < 9) {
                for (let i = serverFilters.length + 1; i <= 9; i++) {
                    serverFilters.push(
                        {index: i,
                            column: undefined,
                            operation: undefined,
                            value: undefined,
                            active: undefined}
                    )
                }
            }
            this.setState({serverFilters})
        }
    }

    handleChange(event: any) {
        // const target = event.target;
        // const value = target.value;
        // const name = target.name;

        // this.setState({
        //     [name]: value
        // });
    }

    render() {
       // const { t } = this.props
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
                                >
                                    {
                                        this.state.allColumns
                                            .map((c: any) =>
                                                <Select.Option key={serverFilter.index + c} value={serverFilter.index + c}>
                                                    {c}
                                                </Select.Option>)
                                    }
                                </Select>
                                <Select style={{ width: '115px', marginRight: '10px' }} defaultValue={serverFilter.operation}>
                                    {
                                        this.state.allOperations
                                            .map((o: any) =>
                                                <Select.Option key={serverFilter.index + o} value={serverFilter.index + o}>
                                                    {operationsMapper_[o]}
                                                </Select.Option>)
                                    }
                                </Select>
                                <Input style={{ width: '110px', marginRight: '10px' }} defaultValue={serverFilter.value}/>
                                <Select style={{ width: '75px' }} defaultValue={serverFilter.active !== undefined ? serverFilter.active.toString() : undefined}>
                                    <Select.Option key={serverFilter.index + "false"} value={serverFilter.index + "false"}>
                                        false
                                    </Select.Option>
                                    <Select.Option key={serverFilter.index + "true"} value={serverFilter.index + "true"}>
                                        true
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        )
                }
                <Button>Apply</Button>
            </Form>
        )
    }
}

export default withTranslation()(ServerFilter)
