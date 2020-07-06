import React, { Component, Fragment } from 'react';
import {NXCol, NXRow} from "../../../../index";

export default class MainColorPageDoc extends Component {
    state = {}
    render() {
        return (
            <Fragment>
                    <h1 className="title">Цвет</h1>
                    <h2 className="title">Основные цвета</h2>
                <section className="example">

                    <p className="text">
                        Фиолетовый используются в качестве основного цвета хедера, кнопок, иконок.
                    </p>

                    <NXRow gutter={16}>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-6</h4>
                            <div
                                style={{backgroundColor:'#2A356C', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <h4 style={{color:'white'}}>Hover</h4>
                            </div>
                            <h5>#2A356C</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-5</h4>
                            <div
                                style={{backgroundColor:'#424D78', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <h4 style={{color:'white'}}>Default</h4>
                            </div>
                            <h5>#424D78</h5>
                        </NXCol>
                    </NXRow>

                </section>
                <section className="example">

                    <p className="text">
                        Цветовая раскладка фиолетового цвета
                    </p>

                    <NXRow gutter={16}>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-8</h4>
                            <div
                                style={{backgroundColor:'#090B1F', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#090B1F</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-7</h4>
                            <div
                                style={{backgroundColor:'#171D45', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#171D45</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-6</h4>
                            <div
                                style={{backgroundColor:'#2A356C', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <h4 style={{color:'white'}}>Hover</h4>
                            </div>
                            <h5>#2A356C</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-5</h4>
                            <div
                                style={{backgroundColor:'#424D78', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <h4 style={{color:'white'}}>Default</h4>
                            </div>
                            <h5>#424D78</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-4</h4>
                            <div
                                style={{backgroundColor:'#5E6785', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#5E6785</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-3</h4>
                            <div
                                style={{backgroundColor:'#7E8391', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#7E8391</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>violete-2</h4>
                            <div
                                style={{backgroundColor:'rgba(66, 77, 120, 0.15)', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#424D78(15%)</h5>
                        </NXCol>
                    </NXRow>

                </section>
                <section className="example">

                    <p className="text">
                        Графит используются как основной шрифтовой цвет.
                    </p>
                    <p className="text">
                        Основной цвет - grey-9
                        Цвет текста возле инпутов в боковом меню(фильтры, сортировки) - grey-8
                    </p>

                    <NXRow gutter={16}>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-9</h4>
                            <div
                                style={{backgroundColor:'#333333', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#333333</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-8</h4>
                            <div
                                style={{backgroundColor:'#404040', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#404040</h5>
                        </NXCol>
                    </NXRow>

                </section>
                <section className="example">

                    <p className="text">
                        Цветовая раскладка серого цвета.
                    </p>

                    <NXRow gutter={16}>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-9</h4>
                            <div
                                style={{backgroundColor:'#333333', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#333333</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-8</h4>
                            <div
                                style={{backgroundColor:'#404040', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#404040</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-7</h4>
                            <div
                                style={{backgroundColor:'#666666', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#666666</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-6</h4>
                            <div
                                style={{backgroundColor:'#8C8C8C', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#8C8C8C</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-5</h4>
                            <div
                                style={{backgroundColor:'#B3B3B3', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#B3B3B3</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-4</h4>
                            <div
                                style={{backgroundColor:'#D9D9D9', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#D9D9D9</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-3</h4>
                            <div
                                style={{backgroundColor:'#E6E6E6', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#E6E6E6</h5>
                        </NXCol>
                        <NXCol span={2} direction='column' align='center'>
                            <h4>grey-2</h4>
                            <div
                                style={{backgroundColor:'#F2F2F2', width:'auto', height:'96px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            </div>
                            <h5>#F2F2F2</h5>
                        </NXCol>
                    </NXRow>

                </section>
            </Fragment>
        );
    }
}

