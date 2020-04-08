import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    isVisible?: boolean;
    allOperations?: Array<EObject>;
    componentType?: paramType;
}


interface State {
    parametersArray: IServerQueryParam[] | undefined;
}

class ServerFilter extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    SortableItem = SortableElement(({value}: any) => {
        return <div className="SortableItem">
            <Row gutter={[8, 0]}>
                <Col span={1}>
                    <span>{value.index}</span>
                </Col>
                <Col span={7}>
                    <Form.Item style={{ display: 'inline-block' }}>
                        {this.getFieldDecorator(`${value.idDatasetColumn}`,
                            {
                                initialValue: (value.datasetColumn)?this.translate(value.datasetColumn):undefined,
                                rules: [{
                                    required:
                                        value.operation ||
                                        value.value,
                                    message: ' '
                                }]
                            })(
                            <Select
                                placeholder={this.t('columnname')}
                                style={{ width: '179px', marginRight: '10px', marginLeft: '10px' }}
                                showSearch={true}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({index: value.index, columnName: 'datasetColumn', value: undefined})
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.props.columnDefs!
                                        .map((c: any) =>
                                            <Select.Option
                                                key={JSON.stringify({index: value.index, columnName: 'datasetColumn', value: c.get('field')})}
                                                value={JSON.stringify({index: value.index, columnName: 'datasetColumn', value: c.get('field')})}
                                            >
                                                {c.get('headerName')}
                                            </Select.Option>)
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item style={{ display: 'inline-block' }}>
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
                                placeholder={this.t('operation')}
                                style={{ width: '179px', marginLeft: '5px' }}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.props.allOperations!
                                        .map((o: any) =>
                                            <Select.Option
                                                key={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                                value={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                            >
                                                {this.t(o.get('name'))}
                                            </Select.Option>)
                                }
                            </Select>

                        )}
                    </Form.Item>
                </Col>
                <Col span={5}>
                    <Form.Item style={{ display: 'inline-block' }}>
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
                                disabled={value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty'}
                                style={{ width: '110px', marginRight: '10px' }}
                                allowClear={true}
                                onChange={(e: any) => this.handleChange(
                                    JSON.stringify({index: value.index, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                                )}
                                title={value.value}
                                id={value.index.toString()}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col  span={2}>
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
                    <Form.Item style={{ display: 'inline-block' , marginLeft: '6px'}}>
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
        </div>
    });

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Системные фильтры</div>
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
                            .map((serverFilter: any) => (
                                {
                                    ...serverFilter,
                                    idDatasetColumn : `${JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: serverFilter.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverFilter.index, columnName: 'operation', value: serverFilter.operation})}`,
                                    idValue : `${JSON.stringify({index: serverFilter.index, columnName: 'value', value: serverFilter.value})}`
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerFilter))
