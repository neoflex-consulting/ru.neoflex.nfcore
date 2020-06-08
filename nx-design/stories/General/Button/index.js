import React, { Component, Fragment } from 'react';

import Disabled from './Disabled';
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
            <div className='exampleStyle ml20'>
              <span style={{color: 'blue'}}>import</span> {'{NXButton}'} <span style={{color: 'red'}}>from</span> <span>'nx-design';</span>
              <br/>
              &lt;<span style={{color: 'red'}}>NXButton</span> <span style={{color: 'green'}}>primary</span> /&gt;
            </div>
              <br/><br/>

            <NXButton className="ml20">
              Default
            </NXButton>
            <div className='exampleStyle ml20'>
              <span style={{color: 'blue'}}>import</span> {'{NXButton}'} <span style={{color: 'red'}}>from</span> <span>'nx-design';</span>
              <br/>
              &lt;<span style={{color: 'red'}}>NXButton</span> /&gt;
            </div>
              <br/><br/>

            <NXButton className="ml20" disabled>
              Disabled
            </NXButton>
            <div className='exampleStyle ml20'>
              <span style={{color: 'blue'}}>import</span> {'{NXButton}'} <span style={{color: 'red'}}>from</span> <span>'nx-design';</span>
              <br/>
              &lt;<span style={{color: 'red'}}>NXButton</span> <span style={{color: 'green'}}>disabled</span> /&gt;
            </div>
            <br/><br/>
          </div>
        </section>
        <section>
          <Disabled />
        </section>

      </Fragment>
    );
  }
}

export default ButtonPage;
