import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import showCode from "../../../utils/helpers";
import {NXCol, NXRow} from "../../../index";

export default class GridPage extends Component {
    render() {
        return (
            <Fragment>
                <h1 className="title">Сетка</h1>

                <h2 className="title">Примеры:</h2>
                <section className="example">
                    <NXRow gutter={16} style={{height:'350px'}}>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                        <NXCol span={2}><div style={{width:'100%', height:'100%', backgroundColor:"rgba(51, 51, 51, 0.2)"}}></div></NXCol>
                    </NXRow>
                    <div className='showCode'>
                        <button id='table' onClick={showCode}>Show Code</button>
                        <SyntaxHighlighter id='table' language='jsx' style={okaidia}>
                            {`import {NXCol, NXRow} from 'nx-design';

<NXRow style={{height:'350px'}}>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
    <NXCol span={2}></NXCol>
</NXRow>`}
                        </SyntaxHighlighter>
                    </div>
                </section>
            </Fragment>
        );
    }
}

