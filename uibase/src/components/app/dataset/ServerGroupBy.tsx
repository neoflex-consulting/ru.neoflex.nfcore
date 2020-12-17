import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent, DrawerState, ParameterDrawerProps} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoInput, NeoRow, NeoSelect, NeoSwitch, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";


interface Props extends ParameterDrawerProps {
    allAggregates?: Array<EObject>;
    handleDrawerVisability?: any;
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
        <div className="SortableItem" style={{borderBottom:'none'}}>
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
                            getPopupContainer={() => document.getElementById (value.popUpContainerId) as HTMLElement}
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
                            getPopupContainer={() => document.getElementById (value.popUpContainerId) as HTMLElement}
                            placeholder={value.t('Column')}
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
            <div className="SortableItem"  style={{borderTop:'none'}}>

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
                            placeholder={value.t("new group by column name")}
                            allowClear={true}
                            onChange={(e: any) => value.handleChange(
                                JSON.stringify({index: value.index, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                            )}
                            title={value.value}
                            id={value.index.toString()}
                            onPressEnter={(e: { preventDefault: () => any; })=>{
                                e.preventDefault();
                                value.handleOnSubmit(e);
                            }}
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

class ServerGroupBy extends DrawerParameterComponent<Props, DrawerState> {

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
        const {t} = this.props;
        return (
            <Form style={{ marginTop: '40px' }}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={12} style={{justifyContent: "flex-start"}}>
                        <NeoTypography type={'h4_medium'} style={{marginBottom:'10px', marginTop:'20px', color:'#333333'}}>{t('select operation')}</NeoTypography>
                    </NeoCol>
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
                                    parametersArray: this.state.parametersArray,
                                    handleOnSubmit: this.handleOnSubmit,
                                    popUpContainerId: this.props.popUpContainerId
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <NeoButton
                    type={'link'}
                    title={this.t("add row")}
                    id={'createNewRowButton'}
                    onClick={this.createNewRow}
                >
                    <NeoIcon icon={"plus"} color={'#B38136'} style={{margin:'auto 5px auto auto'}}/>
                    <NeoTypography type={'body_link'} style={{color:'#B38136'}}>{t('add')}</NeoTypography>
                </NeoButton>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerGroupBy))
