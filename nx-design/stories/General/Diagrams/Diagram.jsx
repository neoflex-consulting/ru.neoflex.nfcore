import * as React from "react";
import {NXIcon, diagramBlock, diagramCircle, barChart, diagram, NXButton, NXCol, NXRow, NXInput, NXSelect, NXOption, NXForm, close} from "../../../index.js";

export default class NXDiagram extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diagramType: "Block"
        };
    }

    getColumnSelectOptions(id, placeHolder) {
         return <NXSelect width='100%' placeholder={placeHolder}>
                    <NXOption
                    value='parameter'
                    >
                        Опции
                    </NXOption>
                </NXSelect>
    };

    getInput(id, placeHolder, disabled = false) {
        return <NXInput width='100%' disabled={disabled} placeholder={placeHolder}/>
    };

render() {
    return (
        <NXForm style={{ height:'100vh', boxShadow:'0 0 5px #F2F2F2' }}
                width='700px'>
            <div style={{display:'flex', alignItems: 'center', height:'53px', justifyContent:'space-between', padding: '16px 40px', border: '1px solid #F2F2F2'}}>
                <h3 style={{margin:'0'}}>Диаграммы</h3>
                <NXIcon icon={close} xs/>
            </div>
            <div style={{height:'106px', padding:'24px 40px'}}>
                <NXRow><h3>Выберите тип диаграммы</h3></NXRow>
                <NXRow margin='5px 0 0 0' content='space-between'>
                    <NXCol span={5}>
                        <NXButton
                        onClick={()=>{this.setState({diagramType:"Block"})}}
                        padding='0'
                        isIcon='24px'>
                        <NXIcon icon={diagramBlock} xs/>
                        </NXButton>
                        <h4>Гистограмма</h4>
                    </NXCol>
                    <NXCol span={5}>
                        <NXButton
                        onClick={()=>{this.setState({diagramType:"Bar"})}}
                        padding='0'
                        isIcon='24px'>
                            <NXIcon icon={barChart} xs/>
                        </NXButton>
                        <h4>Линейчатая</h4>
                    </NXCol>
                    <NXCol span={4}>
                        <NXButton
                        onClick={()=>{this.setState({diagramType:"Pie"})}}
                        padding='0'
                        isIcon='24px'>
                            <NXIcon icon={diagramCircle} xs/>
                        </NXButton>
                        <h4>Круговая</h4>
                    </NXCol>
                    <NXCol span={4}>
                        <NXButton
                        onClick={()=>{this.setState({diagramType:"Line"})}}
                        padding='0'
                        isIcon='24px'>
                            <NXIcon icon={diagram} xs/>
                        </NXButton>
                        <h4>График</h4>
                    </NXCol>
                </NXRow>
            </div>
            <div style={{border: 'solid 1px #F2F2F2', maxHeight:'298px', padding:'12px 40px'}}>
            <NXRow margin='8px 0'>
                <NXInput placeholder='Название диаграммы' />
            </NXRow>
                {(this.state.diagramType==="Line")?
            <NXRow margin='16px 0'>
                    <NXInput placeholder='Легенда'/>
            </NXRow>
                    :""}
            <NXRow gutter={16} margin='16px 0'>
                <NXCol span={12}>
                    {this.getColumnSelectOptions("axisXColumnName", "Ось X")}
                </NXCol>
                <NXCol span={12}>
                    {this.getColumnSelectOptions("axisYColumnName", "Ось Y")}
                </NXCol>
            </NXRow>
                    {
                        (this.state.diagramType!=="Pie")?
            <NXRow gutter={16} margin='16px 0'>
                <NXCol span={12}>
                    {this.getInput("axisXLabel", "Подпись оси X")}
                </NXCol>
                <NXCol span={12}>
                    {this.getColumnSelectOptions("axisXPosition","Положение оси X")}
                </NXCol>
            </NXRow>
                        :""}
                    {
                        (this.state.diagramType!=="Pie")?
            <NXRow gutter={16} margin='16px 0'>
                <NXCol span={12}>
                    {this.getInput("axisYLabel", "Подпись оси Y")}
                </NXCol>
                <NXCol span={12}>
                    {this.getColumnSelectOptions("axisYPosition","Положение оси Y")}
                </NXCol>
            </NXRow>
                        :""
                    }
            <NXRow margin='8px 0'>
                <NXCol span={24}>
                    {this.getColumnSelectOptions("legendPosition", 'Положение легенды')}
                </NXCol>
            </NXRow>
            </div>
            <div style={{minHeight:'34%'}}>

            </div>
            <div style={{backgroundColor: '#F2F2F2', padding:'16px 40px', height:'64px'}}>
            <NXRow content='flex-start'>
                {this.props.action === "edit"
                    ?<NXCol span={5}><NXButton htmlType="submit">Редактировать</NXButton></NXCol>
                    :<NXCol span={5}><NXButton htmlType="submit" primary>Добавить</NXButton></NXCol>}
                <NXCol span={5}><NXButton>Очистить</NXButton></NXCol>
            </NXRow>
            </div>
        </NXForm>
    )
}
}