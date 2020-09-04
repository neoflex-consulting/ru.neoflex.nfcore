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
import {NeoButton, NeoCol, NeoInput, NeoRow, NeoSelect} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
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
    return <div className="SortableItem">
        <NeoRow style={{height:'100%'}}>
            <NeoCol span={1}>
                <span>{value.index}</span>
            </NeoCol>
            <NeoCol  span={2}>
                <Form.Item style={{ display: 'inline-block', margin: 'auto' }}>
                    <Switch
                        defaultChecked={value.enable !== undefined ? value.enable : true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                            value.handleChange(event)
                        }}>
                    </Switch>
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
                           getPopupContainer={() => document.getElementById ('filterButton') as HTMLElement}
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
                                    value.datasetColumn ||
                                    value.operation,
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
                            title={value.value}
                            id={value.index.toString()}
                        />
                    )}
                </Form.Item>
            </NeoCol>

            <NeoCol span={1}>
                <Form.Item style={{ display: 'inline-block' , marginTop: '35px'}}>
                    <NeoButton
                        type={'link'}
                        title={value.t("delete row")}
                        key={'deleteRowButton'}
                        /*value={'deleteRowButton'}*/
                        onClick={(e: any) => {value.deleteRow({index: value.index})}}
                    >
                        <NeoIcon icon={'rubbish'} color="#B3B3B3"/>
                    </NeoButton>
                </Form.Item>
            </NeoCol>
        </NeoRow>
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
        const {t} = this.props;
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, color: '#878787'}}>{t('sysfilters')}</div>
                    </Col>
                    <Col span={12} style={{textAlign: "right"}}>
                        <Button
                            title={t("reset")}
                            style={{width: '40px', marginRight: '10px'}}
                            key={'resetButton'}
                            value={'resetButton'}
                            onClick={this.reset}
                        >
                            <FontAwesomeIcon icon={faRedo} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title={t("add row")}
                            style={{width: '40px', marginRight: '10px'}}
                            key={'createNewRowButton'}
                            value={'createNewRowButton'}
                            onClick={this.createNewRow}
                        >
                            <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title={t("run query")}
                            style={{width: '40px'}}
                            key={'runQueryButton'}
                            value={'runQueryButton'}
                            htmlType="submit"
                        >
                            <FontAwesomeIcon icon={faPlay} size='xs' color="#7b7979"/>
                        </Button>
                    </Col>
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
                                    parametersArray: this.state.parametersArray
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <Form.Item>
                    <NeoButton
                        type={'link'}
                        title={t("add row")}
                        key={'createNewRowButton'}
                        /*value={'createNewRowButton'}*/
                        onClick={this.createNewRow}
                    >
                        <NeoIcon icon={"plus"} color={'#B38136'} style={{margin:'auto'}}/>
                        <h4 style={{color: '#B38136'}}>Добавить</h4>
                    </NeoButton>
                </Form.Item>
                <Form.Item>
                    <div className={'filter__acceptButton'}>
                        <NeoButton
                            title={t('apply')}
                            onClick={()=> {}}>
                            {t('apply')}
                        </NeoButton>
                    </div>
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerFilter))
