import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import NXHint from './NXHint'
export default class ComponentsPage extends Component {
    state = {}
    render() {
        return (
            <Fragment>
                <h1 className="title">Components</h1>

                <section className="example space-between">
                    <div>
                        <h3 className="ex-title">Hint</h3>
                        <NXHint title='Hint example'>Hover me</NXHint>
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`<NXAlert.small message="Success Text" />`}
                        </SyntaxHighlighter>
                    </div>
                </section>

            </Fragment>
        );
    }
}

