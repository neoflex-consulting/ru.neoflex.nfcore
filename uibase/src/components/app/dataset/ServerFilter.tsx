import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import { Form } from 'antd';
import {FormInstance} from "antd/lib/form";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent, DrawerState, ParameterDrawerProps} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoInput, NeoRow, NeoSelect, NeoSwitch, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props extends ParameterDrawerProps {
    allOperations?: Array<EObject>;
    handleDrawerVisability?: any;
}

const dateOperations = ["EqualTo","NotEqual","IsEmpty","IsNotEmpty","LessThan","LessThenOrEqualTo","GreaterThan","GreaterThanOrEqualTo"];

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
    return <div className="SortableItem">
        <NeoRow style={{height:'100%'}}>
            <NeoCol span={1}>
                <span>{value.index}</span>
            </NeoCol>
            <NeoCol span={2}>
                <Form.Item style={{ display: 'inline-block', margin: 'auto' }}>
                    <NeoSwitch
                        defaultChecked={value.enable !== undefined ? value.enable : true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                            value.handleChange(event)
                        }}
                    />

                </Form.Item>
            </NeoCol>
            <NeoCol span={8}>
                <Form.Item
                    style={{ margin: 'auto' }}
                >
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
                        <NeoSelect
                           width={'208px'}
                           getPopupContainer={() => document.getElementById (value.popUpContainerId) as HTMLElement}
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
            <NeoCol span={8}>
                <Form.Item style={{ margin: 'auto' }}>
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
                        <NeoSelect
                            width={'208px'}
                            getPopupContainer={() => document.getElementById (value.popUpContainerId) as HTMLElement}
                            placeholder={value.t('operation')}
                            style={{ marginLeft: '5px' }}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = e ? e : JSON.stringify({index: value.index, columnName: 'operation', value: undefined})
                                value.handleChange(event)
                            }}
                        >
                            {
                                value.allOperations!
                                    .filter((o:any)=> {
                                        return value.columnDefs.find((c:any)=>c.get('headerName') === value.getFieldValue(`${value.idDatasetColumn}`))?.get('convertDataType') === "Date"
                                            ? dateOperations.includes(o.get('name'))
                                            : true
                                    })
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
            <NeoCol span={4}>
                <Form.Item style={{  margin: 'auto' }}>
                    {value.getFieldDecorator(`${value.idValue}`,
                        {
                            initialValue: value.value,
                            rules: [{
                                required:
                                    (value.datasetColumn ||
                                    value.operation) && !(value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty'),
                                message: ' '
                            }]
                        })(
                        <NeoInput
                            width={'90px'}
                            placeholder={value.t('value')}
                            disabled={value.operation === 'IsEmpty' || value.operation === 'IsNotEmpty'}
                            style={{ width: '110px', marginRight: '10px' }}
                            allowClear={true}
                            onChange={(e: any) => value.handleChange(
                                JSON.stringify({index: value.index, columnName: 'value', value: e.target.value === "" ? undefined : e.target.value})
                            )}
                            id={value.index.toString()}
                            onPressEnter={(e: { preventDefault: () => any; })=>{
                                e.preventDefault();
                                value.handleOnSubmit(e);
                            }}
                        />
                    )}
                </Form.Item>
            </NeoCol>

            <NeoCol span={1}>
                <Form.Item style={{ display: 'inline-block' , marginTop: '35px'}}>
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

class ServerFilter extends DrawerParameterComponent<Props, DrawerState> {

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.formRef.current?.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    }

    render() {
        const {t} = this.props;
        return (
            <Form style={{ marginTop: '25px' }} ref={this.props.formRef}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={12} style={{justifyContent: "flex-start"}}>
                        <NeoTypography type={'h4_medium'} style={{color:'#333333'}}>{t('sysfilters')}</NeoTypography>
                    </NeoCol>
                    <NeoCol span={12} style={{justifyContent: "flex-end"}}>
                        <NeoButton type={'link'}
                                   title={t("reset")}
                                   id={'resetButton'}
                                   onClick={this.reset}
                                   style={{top:'-6px'}}>
                            <span style={{color: '#B38136', fontSize: '14px', fontWeight:'normal', textDecorationLine:'underline'}}>{t('is default')}</span>
                        </NeoButton>
                    </NeoCol>
                </Form.Item>
                <Form.Item style={{marginBottom:'0'}}>
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
                                    columnDefs: this.props.columnDefs.filter((c:any)=>!c.get('hide')),
                                    allOperations: this.props.allOperations,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray,
                                    handleOnSubmit: this.handleOnSubmit,
                                    getFieldValue: this.getFieldValue,
                                    popUpContainerId: this.props.popUpContainerId
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

export default withTranslation()(ServerFilter)
