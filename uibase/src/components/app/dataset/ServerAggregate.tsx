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
import {DrawerParameterComponent} from './DrawerParameterComponent';

interface Props {
    distance?: number;
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    allAggregates?: Array<EObject>;
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

function isValid(parametersArray : any, index: any, columndef: any) : boolean{
        if (getColumnType(columndef, parametersArray[index].datasetColumn) === undefined){
            return false
        }
        else if (getColumnType(columndef, parametersArray[index].datasetColumn) === "Integer"
            || getColumnType(columndef, parametersArray[index].datasetColumn) === "Decimal"){
            if ((parametersArray[index].operation === "Count" || parametersArray[index].operation === "CountDistinct"
                || parametersArray[index].operation === "Maximum" || parametersArray[index].operation === "Minimum"
                || parametersArray[index].operation === "Sum" || parametersArray[index].operation === "Average" || parametersArray[index].operation === undefined)) {
                return false
            }
        } else if (getColumnType(columndef, parametersArray[index].datasetColumn) === "String") {
            if (parametersArray[index].operation === "Count" || parametersArray[index].operation === "CountDistinct" || parametersArray[index].operation === undefined) {
                return false
            }
        } else if (getColumnType(columndef, parametersArray[index].datasetColumn) === "Date") {
            if (parametersArray[index].operation === "Count" || parametersArray[index].operation === "CountDistinct"
                || parametersArray[index].operation === "Maximum" || parametersArray[index].operation === "Minimum" || parametersArray[index].operation === undefined) {
                return false
            }
        }

    return true;
};

function getColumnType(columnDef: any[], columnName: string) : string | undefined{
    if (columnDef.length !== 0)
    {
        for (let i = 0; i < columnDef.length; i++) {
            if (columnDef[i].get("field") === columnName) {
                return columnDef[i].get("type")
            }
        }
        return undefined
    }
}

function isDublicatee(parametersArray :any, index: number) : boolean{
    for (let i = 0; i < parametersArray.length; i++){
        if (i !== index){
            if (parametersArray[i].datasetColumn === parametersArray[index].datasetColumn &&
                parametersArray[i].operation === parametersArray[index].operation){
                return true
            }
        }
    }
    return false
}

const SortableItem = SortableElement(({value}: any) => {
    return <div className="SortableTotalItem">
        <Row gutter={[8, 0]}>
            <Form>
            <Col span={1}>
                {value.index}
            </Col>
            <Col span={10}>
                <Form.Item style={{ display: 'inline-block' }}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined,
                            rules: [{
                                required:
                                value.operation,
                                message: ' '
                            },{
                                validator: (rule: any, values: any, callback: any) => {
                                    let isDuplicate: boolean = false;
                                    isDuplicate = isDublicatee(value.parametersArray, value.index - 1)
                                    if (isDuplicate) {
                                        callback('Error message');
                                        return;
                                    }
                                    callback();
                                },
                                message: value.t('duplicateRow'),
                            }]
                        })(
                        <Select
                            getPopupContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                            placeholder={value.t('columnname')}
                            style={{ width: '239px', marginRight: '10px', marginLeft: '10px' }}
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
            <Col span={9}>
                {
                    <Form.Item style={{display: 'inline-block'}}>
                        {value.getFieldDecorator(`${value.idOperation}`,
                            {
                                initialValue: value.t(value.operation) || undefined,
                                rules: [{
                                    required:
                                    value.datasetColumn,
                                    message: ' '
                                }
                                ,{

                            validator: (rule: any, values: any, callback: any) => {
                                let isDuplicate: boolean = false;
                                isDuplicate = isValid(value.parametersArray, value.index - 1, value.columnDefs)
                                if (isDuplicate) {
                                    callback('Error message');
                                    return;
                                    }
                            callback();
                        },
                            message: value.t('wrongOperation'),
                        }]
                            })(
                            <Select
                                getPopupContainer={() => document.getElementById('aggregationButton') as HTMLElement}
                                placeholder={value.t('operation')}
                                style={{width: '219px', marginRight: '10px'}}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({
                                        index: value.index,
                                        columnName: 'operation',
                                        value: undefined
                                    })
                                    value.handleChange(event)
                                }}
                            >
                                {  value.parametersArray[value.index - 1].datasetColumn === undefined || getColumnType(value.columnDefs, value.parametersArray[value.index-1].datasetColumn) === ("Decimal") || getColumnType(value.columnDefs, value.parametersArray[value.index-1].datasetColumn) === ("Integer")?
                                    value.allAggregates!
                                        .map((o: any) =>

                                            <Select.Option
                                                key={JSON.stringify({
                                                    index: value.index,
                                                    columnName: 'operation',
                                                    value: o.get('name')
                                                })}
                                                value={JSON.stringify({
                                                    index: value.index,
                                                    columnName: 'operation',
                                                    value: o.get('name')
                                                })}
                                            >
                                                {value.t(o.get('name'))}
                                            </Select.Option>)
                                    :
                                    getColumnType(value.columnDefs, value.parametersArray[value.index-1].datasetColumn)=== "String" ?
                                    value.allAggregates!.filter((a: any) => a.get('name') === "Count" || a.get('name') === "CountDistinct")
                                        .map((o: any) =>

                                            <Select.Option
                                                key={JSON.stringify({
                                                    index: value.index,
                                                    columnName: 'operation',
                                                    value: o.get('name')
                                                })}
                                                value={JSON.stringify({
                                                    index: value.index,
                                                    columnName: 'operation',
                                                    value: o.get('name')
                                                })}
                                            >
                                                {value.t(o.get('name'))}
                                            </Select.Option>)
                                        :

                                        value.allAggregates!.filter((a: any) => a.get('name') === "Count" || a.get('name') === "CountDistinct" || a.get('name') === "Maximum" || a.get('name') === "Minimum")
                                            .map((o: any) =>

                                                <Select.Option
                                                    key={JSON.stringify({
                                                        index: value.index,
                                                        columnName: 'operation',
                                                        value: o.get('name')
                                                    })}
                                                    value={JSON.stringify({
                                                        index: value.index,
                                                        columnName: 'operation',
                                                        value: o.get('name')
                                                    })}
                                                >
                                                    {value.t(o.get('name'))}
                                                </Select.Option>)


                                }
                            </Select>
                        )}
                    </Form.Item>

                }
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
                </Form>
        </Row>
    </div>
});

class ServerAggregate extends DrawerParameterComponent<Props, State> {

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
        const {t} = this.props
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>{t('total')}</div>
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
                            .map((serverAggregate: any) => (
                                {
                                    ...serverAggregate,
                                    idDatasetColumn : `${JSON.stringify({index: serverAggregate.index, columnName: 'datasetColumn', value: serverAggregate.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverAggregate.index, columnName: 'operation', value: serverAggregate.operation})}`,
                                    t : this.t,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    allAggregates: this.props.allAggregates,
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

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerAggregate))
