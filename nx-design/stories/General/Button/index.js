import React, { Component, Fragment } from 'react';

import Type from './Types';
import Size from './Size';
import Icon from './Icon';
import Disabled from './Disabled';
import Multiple from './Multiple';
import Loading from './Loading';
import Group from './Group';
import Ghost from './Ghost';
import NXButton from './NXButton'

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
              <br/>

          </div>
        </section>

        <section className="example">
          <Type />
        </section>

        <section className="example">
          <Icon />
        </section>

        <section className="example">
          <Size />
        </section>

        <section className="example">
          <Disabled />
        </section>

        <section className="example">
          <Loading />
        </section>

        <section className="example">
          <Multiple />
        </section>

        <section className="example">
          <Group />
        </section>

        <section className="example">
          <Ghost />
        </section>
      </Fragment>
    );
  }
}

export default ButtonPage;
