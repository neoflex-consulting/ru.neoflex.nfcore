import React, { Component, Fragment } from 'react';

import {NXButton} from '../../../index'

class ButtonPage extends Component {
  render() {
    return (
      <Fragment>
        <h1 className="title">Button</h1>

        <h2 className="title">When to use</h2>

        <p className="text">
          A button means an operation (or a series of operations). Clicking a button will trigger corresponding business logic.
        </p>

        <h2 className="title">Examples:</h2>
        <section className="example">
          <h3 className="ex-title">Buttons</h3>

          <div>
            <NXButton primary className='ml20'>
              Primary
            </NXButton>

            <NXButton className="ml20">
              Default
            </NXButton>

            <NXButton className="ml20" disabled>
              Disabled
            </NXButton>

          </div>
        </section>
      </Fragment>
    );
  }
}

export default ButtonPage;
