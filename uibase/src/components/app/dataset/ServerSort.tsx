import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import arrayMove from "array-move";

interface Props {
    serverSorts?: Array<EObject>;
    columnDefs?:  Array<any>;
    allSorts?: Array<EObject>;
    onChangeServerSort?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    isVisible?: boolean;
}

interface State {
    serverSorts: IServerQueryParam[] | undefined;
}

class ServerSort extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {

    /*const { getFieldDecorator } = this.props.form;
    const { t } = this.props;*/

    t: any;
    getFieldDecorator: any;

    constructor(props: any) {
        super(props);
        this.state = {
            serverSorts: this.props.serverSorts,
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (JSON.stringify(prevProps.isVisible) !== JSON.stringify(this.props.isVisible) && !this.props.isVisible
            && JSON.stringify(this.props.serverSorts) !== JSON.stringify(this.state.serverSorts)) {
            this.props.form.validateFields((err: any, values: any) => {
                if (err) {
                    this.props.context.notification('Sort notification','Please, correct the mistakes', 'error')
                }
            });
        }
        if (JSON.stringify(prevProps.serverSorts) !== JSON.stringify(this.props.serverSorts)) {
            this.setState({serverSorts: this.props.serverSorts})
        }
        if (JSON.stringify(prevState.serverSorts) !== JSON.stringify(this.state.serverSorts)
            && this.props.isVisible
            && this.state.serverSorts?.length !== 0) {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    this.props.saveChanges!(this.state.serverSorts!, paramType.sort);
                }
            });
        }
        if (this.state.serverSorts?.length === 0) {
            this.createNewRow()
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
    };

    deleteRow = (e: any) => {
        this.props.form.resetFields();
        let newServerParam: IServerQueryParam[] = [];
        this.state.serverSorts?.forEach((element:IServerQueryParam, index:number) => {
            if (element.index != e.index) {
                newServerParam.push({
                    index: newServerParam.length + 1,
                    datasetColumn: element.datasetColumn,
                    operation: element.operation,
                    enable: (element.enable !== null ? element.enable : false),
                    type: element.type
                })}
        });
        this.setState({serverSorts: newServerParam})
    };

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
                enable: true,
                type: undefined});
        this.setState({serverSorts})
    };

    reset = () => {
        this.props.onChangeServerSort!(undefined, paramType.sort);
        this.setState({serverSorts:[]});
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

    SortableItem = SortableElement(({value}: any) => {
        return <li className="SortableItem">
            <Row gutter={[8, 0]}>
                <Col span={1}>
                    {value.index}
                </Col>
                <Col span={10}>
                    <Form.Item style={{ display: 'inline-block' }}>
                        {this.getFieldDecorator(`${value.idDatasetColumn}`,
                            {
                                initialValue: value.datasetColumn,
                                rules: [{
                                    required:
                                    value.operation,
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
                                placeholder={this.t('columnname')}
                                style={{ width: '239px', marginRight: '10px', marginLeft: '10px' }}
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
                                                {c.get('field')}
                                            </Select.Option>)
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={9}>
                    <Form.Item style={{ display: 'inline-block' }}>
                        {this.getFieldDecorator(`${value.idOperation}`,
                            {
                                initialValue: `${this.t(value.operation)}` || undefined,
                                rules: [{
                                    required:
                                    value.datasetColumn,
                                    message: ' '
                                }]
                            })(
                            <Select
                                placeholder={this.t('operation')}
                                style={{ width: '219px', marginRight: '10px' }}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.props.allSorts!
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
                <Col span={2}>
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
        </li>
    });

    onSortEnd = ({oldIndex, newIndex}:any) => {
        let newState: IServerQueryParam[] = arrayMove(this.state.serverSorts!, oldIndex, newIndex)
        newState.forEach( (serverSort, index) => serverSort.index = index+1 );
        this.setState({serverSorts: newState});
    };

    SortableList = SortableContainer(({items}:any) => {
        return (
            <ul className="SortableList">
                {items.map((value:any) => (
                    <this.SortableItem key={`item-${value}`} index={value.index-1} value={value} />
                ))}
            </ul>
        );
    });

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Сортировка</div>
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
                        <this.SortableList items={this.state.serverSorts!
                            .map((serverSort: any) => (
                                {
                                    ...serverSort,
                                    idDatasetColumn : `${JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: serverSort.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverSort.index, columnName: 'operation', value: serverSort.operation})}`,
                                }))} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerSort))
