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
        let selectWidth
        (id==='legendPosition') ? selectWidth='100%' : selectWidth='300px'
         return <NXSelect width={selectWidth} placeholder={placeHolder}>
                    <NXOption
                    value='parameter'
                    >
                        Опции
                    </NXOption>
                </NXSelect>
    };

    getInput(id, placeHolder, disabled = false) {
        return <NXInput width='300px' disabled={disabled} placeholder={placeHolder}/>
    };

render() {
    return (
        <NXForm style={{ marginTop: '30px', height:'100%', boxShadow:'0 0 5px #F2F2F2' }}
                width='700px'>
            <div style={{display:'flex', justifyContent:'space-between', padding: '16px 40px', border: '1px solid #F2F2F2'}}>
                <h1>Диаграммы</h1>
                <NXIcon icon={close}/>
            </div>
            <NXRow margin='24px 40px'><h3>Выберите тип диаграммы</h3></NXRow>
            <NXRow content='space-between' margin='15px 40px'>
                <NXCol span={4}>
                    <NXButton
                    onClick={()=>{this.setState({diagramType:"Block"})}}
                    padding='0'>
                    <NXIcon icon={diagramBlock} />
                    </NXButton>
                    <h4>Гистограмма</h4>
                </NXCol>
                <NXCol span={4}>
                    <NXButton
                    onClick={()=>{this.setState({diagramType:"Bar"})}}
                    padding='0'>
                        <NXIcon icon={barChart} />
                    </NXButton>
                    <h4>Линейчатая</h4>
                </NXCol>
                <NXCol span={4}>
                    <NXButton
                    onClick={()=>{this.setState({diagramType:"Pie"})}}
                    padding='0'>
                        <NXIcon icon={diagramCircle} />
                    </NXButton>
                    <h4>Круговая</h4>
                </NXCol>
                <NXCol span={4}>
                    <NXButton
                    onClick={()=>{this.setState({diagramType:"Line"})}}
                    padding='0'>
                        <NXIcon icon={diagram} />
                    </NXButton>
                    <h4>График</h4>
                </NXCol>
            </NXRow>
            <div style={{border: 'solid 1px #F2F2F2'}}>
            <NXRow margin='8px 40px'>
                <NXInput placeholder='Название диаграммы' />
            </NXRow>
            <NXRow margin='8px 40px'>
                {(this.state.diagramType==="Line")?<NXInput placeholder='Легенда'/>:""}
            </NXRow>
            <NXRow content='space-between' margin='8px 40px'>
                <NXCol span={11.5}>
                    {this.getColumnSelectOptions("axisXColumnName", "Ось X")}
                </NXCol>
                <NXCol span={11.5}>
                    {this.getColumnSelectOptions("axisYColumnName", "Ось Y")}
                </NXCol>
            </NXRow>
            <NXRow content='space-between' margin='8px 40px'>
                <NXCol span={11.5}>
                    {(this.state.diagramType!=="Pie")?this.getInput("axisXLabel", "Подпись оси X"):""}
                </NXCol>
                <NXCol span={11.5}>
                    {(this.state.diagramType!=="Pie")?this.getColumnSelectOptions("axisXPosition","Положение оси X"):""}
                </NXCol>
            </NXRow>
            <NXRow content='space-between' margin='8px 40px'>
                <NXCol span={11.5}>
                    {(this.state.diagramType!=="Pie")?this.getInput("axisYLabel", "Подпись оси Y"):""}
                </NXCol>
                <NXCol span={11.5}>
                    {(this.state.diagramType!=="Pie")?this.getColumnSelectOptions("axisYPosition","Положение оси Y"):""}
                </NXCol>
            </NXRow>
            <NXRow margin='8px 40px'>
                <NXCol span={24}>
                    {this.getColumnSelectOptions("legendPosition", 'Положение легенды')}
                </NXCol>
            </NXRow>
            </div>
            <div style={{backgroundColor: '#F2F2F2', padding:'16px 40px'}}>
            <NXRow content='flex-start'>
                {this.props.action === "edit"
                    ?<NXCol span={6}><NXButton htmlType="submit">Редактировать</NXButton></NXCol>
                    :<NXCol span={6}><NXButton htmlType="submit" primary>Добавить</NXButton></NXCol>}
                <NXCol span={6}><NXButton>Очистить</NXButton></NXCol>
            </NXRow>
            </div>
            <NXRow />
        </NXForm>
    )
}
}