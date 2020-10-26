import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Form} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoRow, NeoSelect, NeoSwitch} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props {
    distance?: number;
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    allAggregates?: Array<EObject>;
    componentType?: paramType;
    handleDrawerVisability?: any;
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
    return <div className="SortableItem">
        <NeoRow style={{height:'100%'}}>
            <NeoCol span={1}>
                {value.index}
            </NeoCol>
            <NeoCol  span={2}>
                <Form.Item style={{ display: 'inline-block', margin: 'auto' }}>
                    <NeoSwitch
                        defaultChecked={value.enable !== undefined ? value.enable : true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                            value.handleChange(event)
                        }}/>
                </Form.Item>
            </NeoCol>
            <NeoCol span={10}>
                <Form.Item style={{ margin: 'auto' }}>
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
                        <NeoSelect
                            width={'259px'}
                            getPopupContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                            placeholder={value.t('columnname')}
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
                                        <option
                                            key={JSON.stringify({index: value.index, columnName: 'datasetColumn', value: c.get('field')})}
                                            value={JSON.stringify({index: value.index, columnName: 'datasetColumn', value: c.get('field')})}
                                        >
                                            {c.get('headerName')}
                                        </option>)

                            }
                        </NeoSelect>
                    )}
                </Form.Item>
            </NeoCol>
            <NeoCol span={10}>
                {
                    <Form.Item style={{margin: 'auto'}}>
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
                            <NeoSelect
                                width={'239px'}
                                getPopupContainer={() => document.getElementById('aggregationButton') as HTMLElement}
                                placeholder={value.t('operation')}
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

                                            <option
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
                                            </option>)
                                    :
                                    getColumnType(value.columnDefs, value.parametersArray[value.index-1].datasetColumn)=== "String" ?
                                    value.allAggregates!.filter((a: any) => a.get('name') === "Count" || a.get('name') === "CountDistinct")
                                        .map((o: any) =>

                                            <option
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
                                            </option>)
                                        :

                                        value.allAggregates!.filter((a: any) => a.get('name') === "Count" || a.get('name') === "CountDistinct" || a.get('name') === "Maximum" || a.get('name') === "Minimum")
                                            .map((o: any) =>

                                                <option
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
                                                </option>)


                                }
                            </NeoSelect>
                        )}
                    </Form.Item>
                }
            </NeoCol>
            <NeoCol span={1}>
                <Form.Item style={{ marginTop: '35px' }}>
                    <NeoButton
                        type={'link'}
                        title={value.t("delete row")}
                        id={'deleteRowButton'}
                        onClick={(e: any) => {value.deleteRow({index: value.index})}}
                    >
                        <NeoIcon icon={'rubbish'} size={'m'} color="#B3B3B3"/>
                    </NeoButton>
                </Form.Item>
            </NeoCol>
        </NeoRow>
    </div>
});

class ServerAggregate extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    }

    render() {
        const {t} = this.props
        return (
            <Form style={{ marginTop: '15px' }}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={12} style={{justifyContent: "flex-start"}}>
                        <div style={{display: "inherit", fontSize: '16px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>{t('total')}</div>
                    </NeoCol>
                    <NeoCol span={12} style={{justifyContent: "flex-end"}}>
                        <NeoButton type={'link'}
                                   title={t("reset")}
                                   id={'resetButton'}
                                   onClick={this.reset}>
                            <span style={{color: '#B38136', fontSize: '14px', fontWeight:'normal', textDecorationLine:'underline'}}>{t('is default')}</span>
                        </NeoButton>
                    </NeoCol>
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
                                    columnDefs: this.props.columnDefs.filter((c:any)=>!c.get('hide')),
                                    allAggregates: this.props.allAggregates,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <Form.Item>
                    <NeoButton
                        type={'link'}
                        title={t("add row")}
                        id={'createNewRowButton'}
                        onClick={this.createNewRow}
                    >
                        <NeoIcon icon={"plus"} color={'#B38136'} size={'m'} style={{margin:'auto 5px auto auto'}}/>
                        <h4 style={{color: '#B38136', textDecorationLine:'underline'}}>{t('add')}</h4>
                    </NeoButton>
                </Form.Item>
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '80px',
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '16px 40px',
                    background: '#F2F2F2',
                    textAlign: 'left',
                }}>
                    <NeoButton
                        id={'runQueryButton'}
                        title={t("run query")}
                        style={{width: '144px'}}
                        onClick={this.handleOnSubmit}>
                        {t('apply')}
                    </NeoButton>
                </div>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerAggregate))
