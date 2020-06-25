import React, { Component, Fragment } from 'react';

import NXDiagram from './Diagram';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import "../../../utils/helpers";
import showCode from "../../../utils/helpers";

class BarsPage extends Component {
    render() {

        return (
            <Fragment>
                <h1 className="title">Bars</h1>

                <h2 className="title">Примеры:</h2>

                <section className="example">
                    <h3 className="ex-title">Diagram</h3>
                    <div>
                        <NXDiagram />
                    </div>

                    <div className='showCode'>
                        <button id='diagram' onClick={showCode}>Show Code</button>
                        <SyntaxHighlighter id='diagram' language='jsx' style={okaidia} >
                            {`import * as React from "react";
import {NXIcon, diagramBlock, diagramCircle, barChart, diagram, NXButton, NXCol, NXRow, NXInput, NXSelect, NXOption, NXForm, close} from "nx-design";

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
            <div style={{display:'flex', alignItems: 'center', height:'53px', justifyContent:'space-between', padding: '16px 40px', border: '1px solid #F2F2F2'}}>
                <h1 style={{margin:'0'}}>Диаграммы</h1>
                <NXIcon icon={close} xs/>
            </div>
            <NXRow margin='24px 40px'><h3>Выберите тип диаграммы</h3></NXRow>
            <NXRow content='space-between' margin='15px 40px'>
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
}`}
                        </SyntaxHighlighter>
                    </div>

                </section>
            </Fragment>
        );
    }
}

export default BarsPage;