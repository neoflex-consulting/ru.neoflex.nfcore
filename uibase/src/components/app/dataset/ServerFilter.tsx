import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    allOperations?: Array<EObject>;
    componentType?: paramType;
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
}

const SortableList = SortableContainer(({items}:any) => {
    return (
        <ul className="SortableList">
            {items.map((value:any) => (
                <SortableItem key={`item-${value.index}`} index={value.index-1} value={value} />
            ))}
        </ul>
    );
});

const SortableItem = SortableElement(({value}: any) => {
    return <div>
        <Row gutter={[8, 0]}>
            <Col span={1}>
                <span>{value.index}</span>
            </Col>
            <Col span={7}>
                <Form.Item style={{ display: 'inline-block' }}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined,
                            rules: [{
                                required:
                                    value.operation ||
                                    value.value,
                                message: ' '
                            }]
                        })(
                        <Select
                           getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
                            placeholder={value.t('columnname')}
                            style={{ width: '179px', marginRight: '10px', marginLeft: '10px' }}
                            showSearch={true}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({index: value.index, columnName: 'datasetColumn', value: undefined})
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.columnDefs!
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
                    {value.getFieldDecorator(`${value.idOperation}`,
                        {
                            initialValue: value.t(value.operation) || undefined,
                            rules: [{
                                required:
                                    value.datasetColumn ||
                                    value.value,
                                message: ' '
                            }]
                        })(
                        <Select
                            getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
                            placeholder={value.t('operation')}
                            style={{ width: '179px', marginLeft: '5px' }}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.allOperations!
                                    .map((o: any) =>
                                        <Select.Option
                                            key={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                            value={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                        >
                                            {value.t(o.get('name'))}
                                        </Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
            </Col>
            <Col span={5}>
                <Form.Item style={{ display: 'inline-block' }}>
                    {value.getFieldDecorator(`${value.idValue}`,
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
                            placeholder={value.t('value')}
                            disabled={value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty'}
                            style={{ width: '110px', marginRight: '10px' }}
                            allowClear={true}
                            onChange={(e: any) => value.handleChange(
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
                            value.handleChange(event)
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
                        onClick={(e: any) => {value.deleteRow({index: value.index})}}
                    >
                        <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                    </Button>
                </Form.Item>
            </Col>
        </Row>
    </div>
});

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
                        <SortableList items={this.state.parametersArray!
                            .map((serverFilter: any) => (
                                {
                                    ...serverFilter,
                                    idDatasetColumn : `${JSON.stringify({index: serverFilter.index, columnName: 'datasetColumn', value: serverFilter.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverFilter.index, columnName: 'operation', value: serverFilter.operation})}`,
                                    idValue : `${JSON.stringify({index: serverFilter.index, columnName: 'value', value: serverFilter.value})}`,
                                    t : this.t,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    allOperations: this.props.allOperations,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerFilter))
