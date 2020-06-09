import React, { Component, Fragment } from 'react';

// import { NXCalendarBar } from './Bars';

class InputPage extends Component {
  render() {

    return (
      <Fragment>
        <h1 className="title">Bars</h1>

        <h2 className="title">When to use</h2>

        <p className="text">
          A button means an operation (or a series of operations). Clicking a button will trigger corresponding business logic.
        </p>

        <h2 className="title">Examples:</h2>

        <section className="example">
          <h3 className="ex-title">Calendar</h3>

          <div>
            {/*<NXCalendarBar />*/}
          </div>

        </section>
      </Fragment>
    );
  }
}

export default InputPage;
