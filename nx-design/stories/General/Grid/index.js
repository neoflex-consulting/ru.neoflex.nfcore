import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import NXTable from "./Table/NXTable";

export default class TablesPage extends Component {
    render() {
        return (
            <Fragment>
                <h1 className="title">Таблицы</h1>

                <h2 className="title">Как использовать</h2>
                <SyntaxHighlighter language='jsx' style={okaidia} >
                    {`import NXButton from 'nx-design';`}
                </SyntaxHighlighter>

                <h2 className="title">Примеры:</h2>
                <section className="example">
                    <div>
                        <NXTable />

                    </div>
                    <SyntaxHighlighter language='jsx' style={okaidia} >
                        {`<NXButton primary> Primary </NXButton>

<NXButton> Default </NXButton>

<NXButton disabled> Disabled </NXButton>`}
                    </SyntaxHighlighter>
                </section>
            </Fragment>
        );
    }
}

