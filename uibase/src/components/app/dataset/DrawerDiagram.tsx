import * as React from "react";
import {Form, Select} from "antd";
import {withTranslation, WithTranslation} from 'react-i18next';
import {EObject} from "ecore";
import {IDiagram} from "./DatasetView";
import {diagramAnchorMap} from "../../../utils/consts";
import * as _ from 'lodash';
import {NeoButton, NeoCol, NeoInput, NeoRow, NeoSelect} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {FormInstance} from "antd/lib/form";

const diagramAnchorMap_: any = diagramAnchorMap;

interface Props {
    id?: number,
    action?: string;
    columnDefs?: Map<String,any>[];
    allAxisXPosition?: Array<EObject>;
    allAxisYPosition?: Array<EObject>;
    allLegendPosition?: Array<EObject>;
    allSorts?: Array<EObject>;
    allAggregates?: Array<EObject>;
    saveChanges?: (action: string, newDiagram?: IDiagram) => void;
    currentDiagram?: IDiagram;
    popUpContainerId: String;
}

interface State {
    diagramType?: string,
    action?: string,
    Xposition?: string,
    Yposition?: string,
    LegenedPosition?: string,
}

class DrawerDiagram extends React.Component<Props & WithTranslation & any, State> {
    formRef = React.createRef<FormInstance>();

    constructor(props: any) {
        super(props);
        this.state = {
            diagramType: "Line"
        };
    }

    handleSubmit = () => {
        this.formRef.current!.validateFields().then((values: any) => {

            const diagramParam: IDiagram = {
                id: this.props.id,
                keyColumn: this.formRef.current!.getFieldValue("axisXColumnName"),
                valueColumn: this.formRef.current!.getFieldValue("axisYColumnName"),
                diagramName: this.formRef.current!.getFieldValue("diagramName"),
                diagramLegend: this.formRef.current!.getFieldValue("diagramLegend"),
                axisXLegend: this.formRef.current!.getFieldValue("axisXLabel"),
                axisYLegend: this.formRef.current!.getFieldValue("axisYLabel"),
                diagramType: this.state.diagramType!,
                colorSchema: "accent",
                isSingle: true
            };
            this.props.saveChanges(this.props.action, diagramParam);
            if (this.props.action === "add") {
                this.resetFields()
            }

        }).catch(info => {
            //TODO Error in console
            this.props.context.notification('Diagram notification','Please, correct the mistakes', 'error')

        });
    };

    resetFields = () => {
        this.formRef.current!.setFieldsValue({
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
        <Form.Item rules={[
            {
                required:
                    true,
                message: ' '
            }
        ]}
       name={id}>
            {
                    placeHolder === "Column for Pie graph" || placeHolder === "Столбец для Кругового графика" ?
                        <NeoSelect width= '100%' getPopupContainer={() => document.getElementById (this.props.popUpContainerId) as HTMLElement}
                                   placeholder={this.props.t(placeHolder)}>
                            {this.props.columnDefs!.filter((c: any) => !c.get('hide')).map((c: any) =>
                                <Select.Option
                                    key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('field')})}
                                    value={c.get('field')}
                                >
                                    {c.get('headerName')}
                                </Select.Option>)}
                        </NeoSelect>

                    :
                    id === "axisYColumnName" ?
                        <NeoSelect width= '100%' getPopupContainer={() => document.getElementById (this.props.popUpContainerId) as HTMLElement}
                                   placeholder={this.props.t(placeHolder)}>
                            {this.props.columnDefs!.filter((c: any) => !c.get('hide')).filter((c: any) => c.get('type') === 'Integer' || c.get('type') === 'Decimal')
                                .map((c: any) =>
                                    <Select.Option
                                        key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('field')})}
                                        value={c.get('field')}
                                    >
                                        {c.get('headerName')}
                                    </Select.Option>)}
                        </NeoSelect>

                        :
                    <NeoSelect width= '100%' getPopupContainer={() => document.getElementById (this.props.popUpContainerId) as HTMLElement}
                               placeholder={this.props.t(placeHolder)}>
                        {this.props.columnDefs!.filter((c: any) => !c.get('hide')).map((c: any) =>
                            <Select.Option
                                key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('field')})}
                                value={c.get('field')}
                            >
                                {c.get('headerName')}
                            </Select.Option>)}
                    </NeoSelect>
            }
        </Form.Item>
        </div>
    };

    getEnumSelectOptions(id:string, placeHolder:string, selectEnum: Array<EObject>) {
        return  <div>
        <Form.Item rules={[
            {
                required:
                    true,
                message: ' '
            }
        ]}
        name={id}>
                <NeoSelect width= '100%' getPopupContainer={() => document.getElementById (this.props.popUpContainerId) as HTMLElement}
                    placeholder={this.props.t(placeHolder)}>
                    {selectEnum!.map((c: any) =>
                        <Select.Option
                            key={JSON.stringify({index: id, columnName: 'datasetColumn', value: c.get('name')})}
                            value={c.get('name')}
                        >
                            {this.props.t(diagramAnchorMap_[c.get('name')])}
                        </Select.Option>)}
                </NeoSelect>
        </Form.Item>
        </div>
    };

    getInput(id:string, placeHolder:string, disabled:boolean = false) {
        return <Form.Item rules={[
            {
                required: true,
                message: ' '
            }
        ]}
       name={id}>
                <NeoInput
                    width= 'none'
                    disabled={disabled}
                    placeholder={this.props.t(placeHolder)}
                    onPressEnter={(e: { preventDefault: () => any; })=>{
                        e.preventDefault();
                        this.handleSubmit()
                    }}
                />
        </Form.Item>
    };

    loadFields() {
        this.formRef.current!.setFieldsValue({
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
            <Form ref={this.formRef}>
                <div style={{display:'flex', alignItems: 'center', height:'53px', justifyContent:'space-between', padding: '16px 40px'}}>
                <span style={{fontFamily: "Roboto", fontStyle: "normal", fontWeight: 500, fontSize: "16px", lineHeight: "19px", color: "#333333", marginTop: "10px"}}>{this.props.t('choose diagram type')}</span>
                </div>
                    <div style={{height:'53px', padding:'0px 40px'}}>
                    <NeoRow className={'chooseRow'}>
                        <NeoCol span={7} className={'chooseCol'}>
                            <NeoButton className={'chooseButton'} size={'medium'} type={'link'} style={{background: this.state.diagramType === "Bar" ? "#FFF8E0" : "white", border: this.state.diagramType === "Bar" ? "1px solid #FFCC66": "1px solid #424D78"}}
                                       onClick={()=>{this.setState({diagramType:"Bar"})}}>
                                <NeoIcon icon={"barChart"} color={'#424D78'} style={{marginTop: "4px"}}/>
                            </NeoButton>
                            <h4 className={'types'}>{this.props.t("bar chart")}</h4>
                        </NeoCol>
                        <NeoCol span={6} className={'chooseCol'}>
                            <NeoButton className={'chooseButton'} size={'medium'} type={'link'} style={{background: this.state.diagramType === "Pie" ? "#FFF8E0" : "white", border: this.state.diagramType === "Pie" ? "1px solid #FFCC66": "1px solid #424D78"}}
                                       onClick={()=>{this.setState({diagramType:"Pie"})}}>
                                <NeoIcon icon={"diagramCircle"} color={'#424D78'} style={{marginTop: "4px"}}/>
                            </NeoButton>
                            <h4 className={'types'}>{this.props.t("pie chart")}</h4>
                        </NeoCol>
                        <NeoCol span={4} className={'chooseCol'}>
                            <NeoButton className={'chooseButton'} size={'medium'} type={'link'} style={{background: this.state.diagramType === "Line" ? "#FFF8E0" : "white", border: this.state.diagramType === "Line" ? "1px solid #FFCC66": "1px solid #424D78"}}
                                       onClick={()=>{this.setState({diagramType:"Line"})}}>
                                <NeoIcon icon={"diagram"} color={'#424D78'} style={{marginTop: "4px"}}/>
                            </NeoButton>
                            <h4 className={'types'}>{this.props.t("graph")}</h4>
                        </NeoCol>
                    </NeoRow>
                </div>
                <div style={{border: 'solid 1px #F2F2F2', maxHeight:'298px', padding:'12px 40px'}}>
                <NeoRow className={'Selects'}>
                    {this.getInput("diagramName",this.props.t("diagram name"))}
                </NeoRow>
                <NeoRow className={'Selects'}>
                    {(this.state.diagramType==="Line")?this.getInput("diagramLegend",this.props.t("diagram legend")):""}
                </NeoRow>
                    {(this.state.diagramType==="Pie") ?
                <NeoRow gutter={16} className={'Selects'}>
                    <NeoCol className={'Selectss'} span={24}>
                        {(this.state.diagramType==="Pie")?this.getColumnSelectOptions("axisYColumnName", this.props.t("column for pie")):this.getColumnSelectOptions("axisYColumnName", this.props.t("axis Y column name"))}
                    </NeoCol>
                </NeoRow>
                        :
                <NeoRow gutter={16} className={'Selects'}>
                    <NeoCol span={12} className={'Selectss'}>
                        {this.getColumnSelectOptions("axisXColumnName", this.props.t("axis X column name"))}
                    </NeoCol>
                    <NeoCol className={'Selectss'} span={12}>
                        {(this.state.diagramType==="Pie")?this.getColumnSelectOptions("axisYColumnName", this.props.t("column for pie")):this.getColumnSelectOptions("axisYColumnName", this.props.t("axis Y column name"))}
                    </NeoCol>
                </NeoRow>}
                {/*Временно отключено, пока через фильтры в datasetView*/}
                {/*<Row>
                    <Col span={12}>
                        {this.getEnumSelectOptions("aggregates","aggregates", this.props.allAggregates)}
                    </Col>
                    <Col span={12}>
                        {this.getEnumSelectOptions("orderBy","order by", this.props.allSorts)}
                    </Col>
                </Row>*/}
                <NeoRow gutter={16} className={'Selects'}>
                    <NeoCol span={12} className={'Selectss'} >
                        {(this.state.diagramType!=="Pie")?this.getInput("axisXLabel",this.props.t("axis X label")):""}
                    </NeoCol>
                    <NeoCol className={'Selects'} span={12}>
                        {(this.state.diagramType!=="Pie")?this.getInput("axisYLabel",this.props.t("axis Y label")):""}
                    </NeoCol>
                </NeoRow>
                </div>
                <NeoRow className={'nameOfDiagram'}>
                </NeoRow>
                    {/*<div style={{minHeight:'34%'}}>

                    </div>*/}
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
                    {/*<NeoRow className={'Bottom'}>*/}
                    {this.props.action === "edit"
                        ?<NeoButton className={'Buttons'} title={this.props.t('edit')} onClick={this.handleSubmit}>{this.props.t('edit')}</NeoButton>
                        :<NeoButton className={'Buttons'} title={this.props.t('create')} onClick={this.handleSubmit}>{this.props.t('create')}</NeoButton>}
                     <NeoButton className={'Buttons'} title={this.props.t('reset')} style={{marginLeft: '16px'}} type={'secondary'} onClick={this.resetFields}>{this.props.t('reset')}</NeoButton>
                {/*</NeoRow>*/}
                    </div>
            </Form>
        )
    }
}

export default withTranslation()(DrawerDiagram)