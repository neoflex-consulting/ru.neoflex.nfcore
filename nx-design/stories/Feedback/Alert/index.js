import React, { Component, Fragment } from 'react';

import {NXAlert} from "./Alert";

class AlertPage extends Component {
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

        <h2 className="title">Examples:</h2>

        <section className="example">
          <h3 className="ex-title">Basic</h3>
          <NXAlert.small message="Success Text" width='233px' />
        </section>

        <section className="example">
          <h3 className="ex-title">Error</h3>
          <NXAlert.error message="Error" description='This is an error alert' />
        </section>

        <section className="example">
          <h3 className="ex-title">Info</h3>
          <NXAlert.info message="Info" description='This is an info alert' />
        </section>

        <section className="example">
          <h3 className="ex-title">Warning</h3>
          <NXAlert.warning message="Warning" description='This is a warning alert' />
        </section>

        <section className="example">
          <h3 className="ex-title">Success</h3>
          <NXAlert.success message="Success" description='This is a success alert' />
        </section>

      </Fragment>
    );
  }
}

export default AlertPage;
