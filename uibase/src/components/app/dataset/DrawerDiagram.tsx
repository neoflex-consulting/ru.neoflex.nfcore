import * as React from "react";
import {Button, Row, Col, Form, Input, Select} from "antd";
import {withTranslation, WithTranslation} from 'react-i18next';
import {FormComponentProps} from "antd/lib/form";
import {EObject} from "ecore";
import {IDiagram} from "./DatasetView";
import {diagramAnchorMap} from "../../../utils/consts";
import lineIcon from "../../../images/lineIcon.svg";
import barIcon from "../../../images/barIcon.svg";
import pieIcon from "../../../images/pieIcon.svg";
import lineHighlightIcon from "../../../images/lineHighlightIcon.svg";
import barHighlightIcon from "../../../images/barHighlightIcon.svg";
import pieHighlightIcon from "../../../images/pieHighlightIcon.svg";

const diagramAnchorMap_: any = diagramAnchorMap;

interface Props {
    columnDefs?: Array<EObject>;
    allAxisXPosition?: Array<EObject>;
    allAxisYPosition?: Array<EObject>;
    allLegendPosition?: Array<EObject>;
    allSorts?: Array<EObject>;
    allAggregates?: Array<EObject>;
    saveChanges?: (newParam: any, paramName: string) => void;
}

interface State {
    diagramType?: string
}

class DrawerDiagram extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            diagramType: "Line"
        };
    }

    handleReset = () => {
        this.props.saveChanges(undefined, "currentDiagram");
    };

    handleSubmit = () => {
        this.props.form.validateFields((err: any) => {
            if (!err) {
                const diagramParam: IDiagram = {
                    keyColumn: this.props.form.getFieldValue("axisXColumnName"),
                    valueColumn: this.props.form.getFieldValue("axisYColumnName"),
                    diagramLegend: this.props.form.getFieldValue("diagramName"),
                    legendAnchorPosition: diagramAnchorMap_[this.props.form.getFieldValue("legendPosition")],
                    axisXPosition: this.props.form.getFieldValue("axisXPosition"),
                    axisXLegend: this.props.form.getFieldValue("axisXLabel"),
                    axisYPosition: this.props.form.getFieldValue("axisYPosition"),
                    axisYLegend: this.props.form.getFieldValue("axisYLabel"),
                    diagramType: this.state.diagramType!,
                    colorSchema: "accent",
                    isSingle: true
                };
                this.props.saveChanges(diagramParam, "currentDiagram");
            }
            else {
                //TODO Error in console
                this.props.context.notification('Diagram notification','Please, correct the mistakes', 'error')
            }
        });
    };

    getColumnSelectOptions = (id:string, placeHolder:string) => {
        return <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Select placeholder={this.props.t(placeHolder)}>
                    {this.props.columnDefs!.map((c: any) =>
                        <Select.Option
                            key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('field')})}
                            value={c.get('field')}
                        >
                            {c.get('headerName')}
                        </Select.Option>)}
                </Select>
            )}
        </Form.Item>
    };

    getEnumSelectOptions = (id:string, placeHolder:string, selectEnum: Array<EObject>) => {
        return <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Select placeholder={this.props.t(placeHolder)}>
                    {selectEnum!.map((c: any) =>
                        <Select.Option
                            key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('name')})}
                            value={c.get('name')}
                        >
                            {c.get('name')}
                        </Select.Option>)}
                </Select>
            )}
        </Form.Item>
    };

    getInput = (id:string, placeHolder:string) => {
        return <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Input placeholder={this.props.t(placeHolder)}/>
            )}
        </Form.Item>
    };

    componentDidMount() {
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    }

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={6}><Button htmlType="submit">{this.props.t('create')}</Button></Col>
                    <Col span={6}><Button>{this.props.t('delete')}</Button></Col>
                    <Col span={6}><Button onClick={this.handleReset}>{this.props.t('reset')}</Button></Col>
                </Row>
                {this.props.t('Choose diagram type')}
                <Row>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Bar"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Bar")?barHighlightIcon:barIcon} alt="barIcon" /></Button></Col>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Pie"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Pie")?pieHighlightIcon:pieIcon} alt="pieIcon" /></Button></Col>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Line"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Line")?lineHighlightIcon:lineIcon} alt="lineIcon" /></Button></Col>
                </Row>
                <Row>
                    {(this.state.diagramType==="Line")?this.getInput("diagramName","diagram legend"):""}
                </Row>
                <Row>
                    <Col span={12}>
                        {this.getColumnSelectOptions("axisXColumnName", "axis X column name")}
                    </Col>
                    <Col span={12}>
                        {this.getColumnSelectOptions("axisYColumnName", "axis Y column name")}
                    </Col>
                </Row>
                {/*Временно отключено, пока через фильтры в datasetView*/}
                {/*<Row>
                    <Col span={12}>
                        {this.getEnumSelectOptions("aggregates","aggregates", this.props.allAggregates)}
                    </Col>
                    <Col span={12}>
                        {this.getEnumSelectOptions("orderBy","order by", this.props.allSorts)}
                    </Col>
                </Row>*/}
                <Row>
                    <Col span={12}>
                        {(this.state.diagramType!=="Pie")?this.getInput("axisXLabel","axis X label"):""}
                    </Col>
                    <Col span={12}>
                        {(this.state.diagramType!=="Pie")?this.getEnumSelectOptions("axisXPosition","axis X position", this.props.allAxisXPosition):""}
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        {(this.state.diagramType!=="Pie")?this.getInput("axisYLabel","axis Y label"):""}
                    </Col>
                    <Col span={12}>
                        {(this.state.diagramType!=="Pie")?this.getEnumSelectOptions("axisYPosition","axis Y position", this.props.allAxisYPosition):""}
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        {this.getEnumSelectOptions("legendPosition","legend position", this.props.allLegendPosition)}
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(DrawerDiagram))