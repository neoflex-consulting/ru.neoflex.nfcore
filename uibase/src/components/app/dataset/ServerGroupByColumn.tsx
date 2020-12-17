import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent, DrawerState, ParameterDrawerProps} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoRow, NeoSelect, NeoSwitch, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props extends ParameterDrawerProps {
    allAggregates?: Array<EObject>;
    handleDrawerVisability?:any;
    onReset?: ()=>void;
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
    return <div className="SortableItem">
        <NeoRow style={{height:'100%', marginBottom:'0'}}>
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
            <NeoCol span={20}>
                <Form.Item style={{ margin: 'auto' }}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined
                        })(
                        <NeoSelect
                            width={'525px'}
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
                                    .filter((c:any) => !value.parametersArray.find((f:any)=>f.datasetColumn === c.get('field')))
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
});

class ServerGroupByColumn extends DrawerParameterComponent<Props, DrawerState> {

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    };

    render() {
        const {t} = this.props;
        return (
            <Form style={{ marginTop: '25px' }}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={12} style={{justifyContent: "flex-start"}}>
                        <NeoTypography type={'h4_medium'} style={{color:'#333333'}}>{t('total')}</NeoTypography>
                    </NeoCol>
                    <NeoCol span={12} style={{justifyContent: "flex-end"}}>
                        <NeoButton type={'link'}
                                   title={t("reset")}
                                   id={'resetButton'}
                                   style={{top:'-6px'}}
                                   onClick={this.props.onReset}>
                            <span style={{color: '#B38136', fontSize: '14px', fontWeight:'normal', textDecorationLine:'underline'}}>{t('is default')}</span>
                        </NeoButton>
                    </NeoCol>
                </Form.Item>
                <Form.Item style={{marginBottom:'0'}}>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((serverGroupByColumn: any) => (
                                {
                                    ...serverGroupByColumn,
                                    idDatasetColumn : `${JSON.stringify({index: serverGroupByColumn.index, columnName: 'datasetColumn', value: serverGroupByColumn.datasetColumn})}`,
                                    t : this.t,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs.filter((c:any)=>!c.get('hide')),
                                    allAggregates: this.props.allAggregates,
                                    handleChange: this.handleChange,
                                    deleteRow: this.deleteRow,
                                    translate: this.translate,
                                    parametersArray: this.state.parametersArray,
                                    popUpContainerId: this.props.popUpContainerId
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <NeoButton
                    type={'link'}
                    title={t("add row")}
                    id={'createNewRowButton'}
                    onClick={this.createNewRow}
                >
                    <NeoIcon icon={"plus"} color={'#B38136'} style={{margin:'auto 5px auto auto'}}/>
                    <NeoTypography type={'body_link'} style={{color:'#B38136'}}>{t('add')}</NeoTypography>
                </NeoButton>
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

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerGroupByColumn))
