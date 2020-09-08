import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {NeoSwitch} from "neo-design/lib";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
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



const SortableItem = SortableElement(({value}: any) => {
    return <div className="SortableItemColumn">
        <Row gutter={[8, 0]}>
            <Col span={1}>
                {value.index}
            </Col>
            <Col span={19}>
                <Form.Item style={{ display: 'inline-block' }}>
                    {value.getFieldDecorator(`${value.idDatasetColumn}`,
                        {
                            initialValue: (value.datasetColumn)?value.translate(value.datasetColumn):undefined
                        })(
                        <Select
                            getPopupContainer={() => document.getElementById ('aggregationButton') as HTMLElement}
                            placeholder={value.t('columnname')}
                            style={{ width: '475px', marginRight: '30px', marginLeft: '10px' }}
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
                        </Select>
                    )}
                </Form.Item>
            </Col>
            <Col span={2}>
                <Form.Item style={{ display: 'inline-block' }}>
                    <NeoSwitch
                        defaultChecked={value.enable !== undefined ? value.enable : true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                            value.handleChange(event)
                        }}/>
                </Form.Item>
            </Col>
            <Col span={2}>
                <Form.Item style={{ display: 'inline-block' , marginLeft: '6px'}}>
                    <Button
                        title={value.t("delete row")}
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

class ServerGroupByColumn extends DrawerParameterComponent<Props, State> {

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
                    <Col span={24} style={{textAlign: "left"}}>
                        <Button
                            title={this.t("reset")}
                            style={{width: '40px', marginRight: '10px'}}
                            key={'resetButton'}
                            value={'resetButton'}
                            onClick={this.reset}
                        >
                            <FontAwesomeIcon icon={faRedo} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title={this.t("run query")}
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
                                    parametersArray: this.state.parametersArray
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <Button
                    title="add row"
                    style={{width: '40px', marginRight: '10px'}}
                    key={'createNewRowButton'}
                    value={'createNewRowButton'}
                    onClick={this.createNewRow}
                >
                    <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
                </Button>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(ServerGroupByColumn))
