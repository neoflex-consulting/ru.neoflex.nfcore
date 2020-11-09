import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import { Form } from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent, DrawerState} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoRow, NeoSelect, NeoSwitch, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    allSorts?: Array<EObject>;
    componentType?: paramType;
    handleDrawerVisability?:any;
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

const SortableItem = SortableElement(({value}:any) => <div className="SortableItem">
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
                        {value.getFieldDecorator(`${value.idDatasetColumn}`,
                            {
                                initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined,
                                rules: [{
                                    required:
                                    value.operation,
                                    message: ' '
                                },{
                                    validator: (rule: any, value: any, callback: any) => {
                                        let isDuplicate: boolean = false;
                                        if (value.parametersArray !== undefined) {
                                            const valueArr = value.parametersArray
                                                .filter((currentObject: any) => {
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
                                                .map(function (currentObject: any) {
                                                    return currentObject.datasetColumn
                                                });
                                            isDuplicate = valueArr.some(function (item: any , idx:number) {
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
                                width={'259px'}
                                getPopupContainer={() => document.getElementById ('sortButton') as HTMLElement}
                                placeholder={value.t('columnname')}
                                style={{ marginRight: '10px', marginLeft: '10px' }}
                                showSearch={true}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({index: value.index, columnName: 'datasetColumn', value: undefined})
                                    value.handleChange(event)
                                }}
                            >
                                {
                                    value.columnDefs
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
                                width={'239px'}
                                getPopupContainer={() => document.getElementById ('sortButton') as HTMLElement}
                                placeholder={value.t('operation')}
                                style={{ marginLeft: '5px' }}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                    value.handleChange(event)
                                }}
                            >
                                {
                                    value.allSorts!
                                        .map((o: any) =>
                                            <option
                                                key={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                                value={JSON.stringify({index: value.index, columnName: 'operation', value: o.get('name')})}
                                            >
                                                {value.t(o.get('name'))}
                                            </option>)
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
</div>);

class ServerSort extends DrawerParameterComponent<Props, DrawerState> {

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
            <Form style={{ marginTop: '15px' }}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={12} style={{justifyContent: "flex-start"}}>
                        <NeoTypography type={'h4_medium'} style={{color:'#333333', marginTop:'4px'}}>{t('sorting')}</NeoTypography>
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
                <Form.Item style={{marginBottom:'0'}}>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((serverSort: any) => (
                                {
                                    ...serverSort,
                                    idDatasetColumn : `${JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: serverSort.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverSort.index, columnName: 'operation', value: serverSort.operation})}`,
                                    t : this.t,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs.filter((c:any)=>!c.get('hide')),
                                    allSorts: this.props.allSorts,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray
                                }))}
                            distance={3}
                            onSortEnd={this.onSortEnd}
                            helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <Form.Item>
                    <NeoButton
                        type={'link'}
                        title={t("add row")}
                        id={'createNewRowButton'}
                        onClick={this.createNewRow}
                    >
                        <NeoIcon icon={"plus"} color={'#B38136'} style={{margin:'auto 5px auto auto'}}/>
                        <NeoTypography type={'body_link'} style={{color:'#B38136'}}>{t('add')}</NeoTypography>
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
                            title={t('apply')}
                            style={{width: '144px'}}
                            onClick={this.handleOnSubmit}>
                            {t('apply')}
                        </NeoButton>
                    </div>
            </Form>

        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerSort))
