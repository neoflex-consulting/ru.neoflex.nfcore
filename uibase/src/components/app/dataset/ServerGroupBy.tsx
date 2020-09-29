import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoInput, NeoRow, NeoSelect, NeoSwitch} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";


interface Props {
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



const SortableItem = SortableElement(({value}: any) => {
    return <div>
        <div className="SortableItem">
        <NeoRow style={{height:'100%'}}>
            <NeoCol span={1}>
                {value.index}
            </NeoCol>
            <NeoCol span={2}>
                <Form.Item style={{ margin: 'auto' }}>
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
                    {value.getFieldDecorator(`${value.idOperation}`,
                        {
                            initialValue: value.t(value.operation) || undefined,
                            rules: [{
                                required:
                                value.datasetColumn,
                                message: ' '
                            }]
                        })(
                        <NeoSelect
                            width={'250px'}
                            getPopupContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                            placeholder={value.t('operation')}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.allAggregates!
                                    .map((o: any) =>
                                        <Select.Option
                                            key={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                            value={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                        >
                                            {value.t(o.get('name'))}
                                        </Select.Option>)
                            }
                        </NeoSelect>

                    )}
                </Form.Item>
            </NeoCol>
            <NeoCol span={10}>
                <Form.Item style={{ margin: 'auto' }}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined,
                            rules: [{
                                required:value.operation,
                                message: ' '
                            },{
                                validator: (rule: any, value: any, callback: any) => {
                                    let isDuplicate: boolean = false;
                                    if (value.parametersArray !== undefined) {
                                        const valueArr = value.parametersArray
                                            .filter((currentObject:IServerQueryParam) => {
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
                                            .map(function (currentObject:IServerQueryParam) {
                                                return currentObject.datasetColumn
                                            });
                                        isDuplicate = valueArr.some(function (item:any, idx:number) {
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
                        <NeoSelect
                            width={'250px'}
                            getPopupContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                            placeholder={value.t('columnname')}
                            // style={{ marginRight: '30px', marginLeft: '10px' }}
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
                        </NeoSelect>
                    )}
                </Form.Item>
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
            <div className="SortableItem">

            <NeoRow style={{height:'100%'}}>
            <NeoCol span={1}>
            </NeoCol>
            <NeoCol span={2}>
            </NeoCol>
            <NeoCol span={20}>
                <Form.Item style={{ margin: 'auto' }}>
                    {value.getFieldDecorator(`${value.idValue}`,
                        {
                            initialValue: value.value,
                            rules: [{
                                required: value.operation,
                                message: ' '
                            }]
                        })(
                        <NeoInput
                            width={'525px'}
                            placeholder={value.t('label')}
                            allowClear={true}
                            onChange={(e: any) => value.handleChange(
                                JSON.stringify({index: value.index, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                            )}
                            title={value.value}
                            id={value.index.toString()}
                        />
                    )}
                </Form.Item>


                {/*<Input placeholder={value.t('label')}*/}
                {/*       onChange={(e: any) => {*/}
                {/*           const event = JSON.stringify({index: value.index, columnName: 'value', value: e.target.value});*/}
                {/*           value.handleChange(event)*/}
                {/*       }}*/}
                {/*/>*/}
            </NeoCol>
            <NeoCol span={1}>
            </NeoCol>
        </NeoRow>
        </div>
    </div>
});

class ServerGroupBy extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    }

    render() {
        return (
            <Form style={{ marginTop: '15px' }} onSubmit={this.handleOnSubmit}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                </Form.Item>
                <Form.Item style={{marginBottom:'0'}}>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((serverGroupBy: any) => (
                                {
                                    ...serverGroupBy,
                                    idDatasetColumn : `${JSON.stringify({index: serverGroupBy.index, columnName: 'datasetColumn', value: serverGroupBy.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverGroupBy.index, columnName: 'operation', value: serverGroupBy.operation})}`,
                                    idValue: `${JSON.stringify({index: serverGroupBy.index, columnName: 'value', value: serverGroupBy.value})}`,
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
                <NeoButton
                    type={'link'}
                    title={this.t("add row")}
                    id={'createNewRowButton'}
                    onClick={this.createNewRow}
                >
                    <NeoIcon icon={"plus"} color={'#B38136'} size={'m'} style={{margin:'auto 5px auto auto'}}/>
                    <h4 style={{color: '#B38136', textDecorationLine:'underline'}}>Добавить</h4>
                </NeoButton>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerGroupBy))
