import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {NXHint} from '../../../index'
export default class ComponentsPage extends Component {
    state = {}
    render() {
        return (
            <Fragment>
                <h1 className="title">Components</h1>

                <section className="example">
                    <div className='flex-column'>
                        <h3 className="ex-title">Hint</h3><br/>
                        <NXHint title='Hint example'>Hover me</NXHint>
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`import { NXHint } from "nx-design";

<NXHint title='Hint example'>Hover me</NXHint>
`}
                        </SyntaxHighlighter>
                    </div>
                </section>

            </Fragment>
        );
    }
}

