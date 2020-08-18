import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {Col, Form, Row, Switch, Typography} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';

const { Paragraph } = Typography;

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
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

const SortableItem = SortableElement(({value}:any) => <div className="SortableHiddenColumnItem">
    <Row gutter={[8, 0]}>
        <Col span={20}>
            <Form.Item style={{ display: 'inline-block' }}>
                <Paragraph
                    key={`Paragraph ${value}`}
                    editable={false}>
                    {
                        value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn)
                            ? value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn).get('headerName')
                            : value.datasetColumn
                    }
                </Paragraph>
            </Form.Item>
        </Col>
        <Col span={2}>
            <Form.Item style={{ display: 'inline-block' }}>
                <Switch
                    defaultChecked={value.enable !== undefined ? value.enable : true}
                    onChange={(e: any) => {
                        const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                        value.handleChange(event, true)
                    }}>
                </Switch>
            </Form.Item>
        </Col>
    </Row>
</div>);

class HiddenColumn extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
        };
        this.handleChange = this.handleChange.bind(this);
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((serverSort: any) => (
                                {
                                    ...serverSort,
                                    idDatasetColumn : `${JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: serverSort.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverSort.index, columnName: 'operation', value: serverSort.operation})}`,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    handleChange: this.handleChange,
                                    parametersArray: this.state.parametersArray
                                }))}
                                      distance={3}
                                      onSortEnd={this.onSortEnd}
                                      helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(HiddenColumn))
