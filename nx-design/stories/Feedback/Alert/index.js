import React, { Component, Fragment } from 'react';
import {NXAlert} from "./Alert";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default class AlertPage extends Component {
  state = {}
  render() {
    return (
      <Fragment>
        <h1 className="title">Alert</h1>

        <p className="text">
          Alert component for feedback.
        </p>

        <h2 className="title">When To Use</h2>

        <ul>
          <li>When you need to show alert messages to users.</li>
          <li>
            When you need a persistent static container which is closable by user actions.
          </li>
        </ul>

          <h2 className="title">Как использовать</h2>
          <SyntaxHighlighter language='javascript' style={docco} >
              {`import { NXAlert } from "nx-design";`}
          </SyntaxHighlighter>

        <h2 className="title">Примеры:</h2>

        <section className="example">
          <h3 className="ex-title">Basic</h3>
          <NXAlert.small message="Success Text" width='233px' />
            <SyntaxHighlighter language='javascript' style={docco} >
                {`<NXAlert.small message="Success Text" />`}
            </SyntaxHighlighter>

        </section>

        <section className="example">
          <h3 className="ex-title">Error</h3>
          <NXAlert.error message="Error" description='This is an error alert' />

            <SyntaxHighlighter language='javascript' style={docco} >
                {`<NXAlert.error message='Error' description='This is an error alert' />`}
            </SyntaxHighlighter>

        </section>

        <section className="example">
          <h3 className="ex-title">Info</h3>
          <NXAlert.info message="Info" description='This is an info alert' />

            <SyntaxHighlighter language='javascript' style={docco} >
                {`<NXAlert.info message="Info" description='This is an info alert' />`}
            </SyntaxHighlighter>

        </section>

        <section className="example">
          <h3 className="ex-title">Warning</h3>
          <NXAlert.warning message="Warning" description='This is a warning alert' />

            <SyntaxHighlighter language='javascript' style={docco} >
                {`<NXAlert.warning message="Warning" description='This is a warning alert' />`}
            </SyntaxHighlighter>

        </section>

        <section className="example">
          <h3 className="ex-title">Success</h3>
          <NXAlert.success message="Success" description='This is a success alert' />

            <SyntaxHighlighter language='javascript' style={docco} >
                {`<NXAlert.success message="Success" description='This is a success alert' />`}
            </SyntaxHighlighter>

        </section>

      </Fragment>
    );
  }
}

