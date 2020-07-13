import * as React from "react";
import {Button, Row, Col, Form, Input, Select} from "antd";
import {withTranslation, WithTranslation} from 'react-i18next';
import {FormComponentProps} from "antd/lib/form";
import {EObject} from "ecore";
import {IDiagram} from "./DatasetView";
import {diagramAnchorMap} from "../../../utils/consts";
import * as _ from 'lodash';
import lineIcon from "../../../icons/lineIcon.svg";
import barIcon from "../../../icons/barIcon.svg";
import pieIcon from "../../../icons/pieIcon.svg";
import lineHighlightIcon from "../../../icons/lineHighlightIcon.svg";
import barHighlightIcon from "../../../icons/barHighlightIcon.svg";
import pieHighlightIcon from "../../../icons/pieHighlightIcon.svg";

const diagramAnchorMap_: any = diagramAnchorMap;

interface Props {
    id?: number,
    action?: string;
    columnDefs?: Array<EObject>;
    allAxisXPosition?: Array<EObject>;
    allAxisYPosition?: Array<EObject>;
    allLegendPosition?: Array<EObject>;
    allSorts?: Array<EObject>;
    allAggregates?: Array<EObject>;
    saveChanges?: (action: string, newDiagram?: IDiagram) => void;
    currentDiagram?: IDiagram;

}

interface State {
    diagramType?: string,
    action?: string,
    Xposition?: string,
    Yposition?: string,
    LegenedPosition?: string,
}

class DrawerDiagram extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            diagramType: "Line"
        };
    }

    handleSubmit = () => {
        this.props.form.validateFields((err: any) => {
            if (!err) {
                let xPosition, yPosition, legenedPosition: any;
                if (this.state.diagramType! === "Bar") {
                    xPosition = "Bottom"
                    yPosition = "Left"
                    legenedPosition = "BottomRight"
                }

                else if (this.state.diagramType! === "Line"){
                    xPosition = "Bottom"
                    yPosition = "Left"
                    legenedPosition = "BottomRight"
                }
                else{
                    xPosition = undefined
                    yPosition = undefined
                    legenedPosition = "Bottom"
                }
                const diagramParam: IDiagram = {
                    id: this.props.id,
                    keyColumn: this.props.form.getFieldValue("axisXColumnName"),
                    valueColumn: this.props.form.getFieldValue("axisYColumnName"),
                    diagramName: this.props.form.getFieldValue("diagramName"),
                    diagramLegend: this.props.form.getFieldValue("diagramLegend"),
                    legendAnchorPosition: legenedPosition,
                    axisXPosition: xPosition,
                    axisXLegend: this.props.form.getFieldValue("axisXLabel"),
                    axisYPosition: yPosition,
                    axisYLegend: this.props.form.getFieldValue("axisYLabel"),
                    diagramType: this.state.diagramType!,
                    colorSchema: "accent",
                    isSingle: true
                };
                this.props.saveChanges(this.props.action, diagramParam);
                if (this.props.action === "add") {
                    this.resetFields()
                }
            }
            else {
                //TODO Error in console
                this.props.context.notification('Diagram notification','Please, correct the mistakes', 'error')
            }
        });
    };

    resetFields = () => {
        this.props.form.setFieldsValue({
            axisXColumnName: undefined,
            axisYColumnName: undefined,
            diagramName: undefined,
            axisXPosition: undefined,
            axisXLabel:  undefined,
            axisYPosition: undefined,
            axisYLabel: undefined,
            diagramLegend: undefined,
            legendPosition: undefined,
        });
    };

    getColumnSelectOptions(id:string, placeHolder:string) {
        return <div>
        <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Select getPopupContainer={() => document.getElementById ('diagramButton') as HTMLElement}
                    placeholder={this.props.t(placeHolder)}>
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
        </div>
    };

    getEnumSelectOptions(id:string, placeHolder:string, selectEnum: Array<EObject>) {
        return  <div>
        <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Select getPopupContainer={() => document.getElementById ('diagramButton') as HTMLElement}
                    placeholder={this.props.t(placeHolder)}>
                    {selectEnum!.map((c: any) =>
                        <Select.Option
                            key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('name')})}
                            value={c.get('name')}
                        >
                            {this.props.t(diagramAnchorMap_[c.get('name')])}
                        </Select.Option>)}
                </Select>
            )}
        </Form.Item>
        </div>
    };

    getInput(id:string, placeHolder:string, disabled:boolean = false) {
        return <Form.Item>
            {this.props.form.getFieldDecorator(id,
                {
                    rules: [{
                        required: true,
                        message: ' '
                    }]
                }
            )(
                <Input disabled={disabled} placeholder={this.props.t(placeHolder)}/>
            )}
        </Form.Item>
    };

    loadFields() {
        this.props.form.setFieldsValue({
            axisXColumnName: this.props.currentDiagram.keyColumn,
            axisYColumnName:this.props.currentDiagram.valueColumn,
            diagramName: this.props.currentDiagram.diagramName,
            axisXPosition: this.props.currentDiagram.axisXPosition,
            axisXLabel:  this.props.currentDiagram.axisXLegend,
            axisYPosition: this.props.currentDiagram.axisYPosition,
            axisYLabel: this.props.currentDiagram.axisYLegend,
            diagramLegend: this.props.currentDiagram.diagramLegend,
            legendPosition: this.props.currentDiagram.legendAnchorPosition,
        });
    };



    componentDidMount() {
        if (this.props.action === "edit") {
            this.setState({
                diagramType: this.props.currentDiagram.diagramType
            },() => {
                this.loadFields()
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (!_.isEqual(this.props.currentDiagram, prevProps.currentDiagram)
            && this.props.currentDiagram) {
            this.setState({
                diagramType: this.props.currentDiagram.diagramType
            },() => {
                this.loadFields()
            });
        }
    }


    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Row>
                    {this.props.action === "edit"
                        ?<Col span={6}><Button htmlType="submit">{this.props.t('edit')}</Button></Col>
                        :<Col span={6}><Button htmlType="submit">{this.props.t('create')}</Button></Col>}
                    <Col span={6}><Button onClick={this.resetFields}>{this.props.t('reset')}</Button></Col>
                </Row>
                {this.props.t('choose diagram type')}
                <Row>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Bar"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Bar")?barHighlightIcon:barIcon} alt="barIcon" /></Button></Col>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Pie"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Pie")?pieHighlightIcon:pieIcon} alt="pieIcon" /></Button></Col>
                    <Col span={4}><Button onClick={()=>{this.setState({diagramType:"Line"})}}><img style={{width: '24px', height: '24px'}} src={(this.state.diagramType==="Line")?lineHighlightIcon:lineIcon} alt="lineIcon" /></Button></Col>
                </Row>
                <Row>
                    {this.getInput("diagramName",this.props.t("diagram name"))}
                </Row>
                <Row>
                    {(this.state.diagramType==="Line")?this.getInput("diagramLegend",this.props.t("diagram legend")):""}
                </Row>
                <Row>
                    <Col span={12}>
                        {this.getColumnSelectOptions("axisXColumnName", this.props.t("axis X column name"))}
                    </Col>
                    <Col span={12}>
                        {this.getColumnSelectOptions("axisYColumnName", this.props.t("axis Y column name"))}
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
                        {(this.state.diagramType!=="Pie")?this.getInput("axisXLabel",this.props.t("axis X label")):""}
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        {(this.state.diagramType!=="Pie")?this.getInput("axisYLabel",this.props.t("axis Y label")):""}
                    </Col>
                </Row>
                <Row>
                </Row>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(DrawerDiagram))