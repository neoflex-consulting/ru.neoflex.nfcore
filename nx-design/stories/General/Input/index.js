import React, { Component, Fragment } from 'react';

import NXInputSearch, {NXInput, NXCheckbox, NXRadio, NXTextArea, NXDatePicker, NXSelect, NXOption} from './Input';

class InputPage extends Component {
  render() {

    return (
      <Fragment>
        <h1 className="title">Input</h1>

        <h2 className="title">When to use</h2>

        <p className="text">
          A button means an operation (or a series of operations). Clicking a button will trigger corresponding business logic.
        </p>

        <h2 className="title">Примеры:</h2>

        <section className="example">
          <h3 className="ex-title">Checkbox</h3>

          <div>
            <NXCheckbox>Checkbox</NXCheckbox>
          </div>

        </section>

        <section className="example">
          <h3 className="ex-title">Radio</h3>
          <div>
            <h4>Basic</h4>
            <NXRadio>Radio</NXRadio>
          </div>
          <br/>
          <div>
            <h4>Disabled</h4>
            <NXRadio disabled>Radio</NXRadio>
          </div>
        <br/>
          <div>
            <h4>Radio group</h4>
            <NXRadio.Group defaultValue={1}>
            <NXRadio value={1}>Radio 1</NXRadio>
            <NXRadio value={2}>Radio 2</NXRadio>
            <NXRadio value={3}>Radio 3</NXRadio>
            </NXRadio.Group>
          </div>

        </section>

        <section className="example">
          <h3 className="ex-title">Input</h3>

          <div>
            <h4>Basic input</h4>
            <NXInput width='250px' />
          </div>
        <br/>

          <div>
            <h4>Search input</h4>
            <NXInputSearch width='250px' />
          </div>

        </section>

        <section className="example">
          <h3 className="ex-title">Text Area</h3>

          <div>
            <NXTextArea width='250px' />
          </div>

        </section>

        <section className="example">
          <h3 className="ex-title">Date Picker</h3>

          <div>
            <NXDatePicker />
          </div>

        </section>

        <section className="example">
          <h3 className="ex-title">Select</h3>

          <h4>Basic</h4>
          <div>
            <NXSelect defaultValue="lucy">
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack">Jack</NXOption>
              <NXOption value="john">John</NXOption>
            </NXSelect>
          </div>
          <br/><br/>

          <h4>Disabled Select</h4>
          <div>
            <NXSelect defaultValue="lucy" disabled>
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack">Jack</NXOption>
              <NXOption value="john">John</NXOption>
            </NXSelect>
          </div>
          <br/><br/>

          <h4>With disabled options</h4>
          <div>
            <NXSelect defaultValue="lucy">
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack" disabled>Jack</NXOption>
              <NXOption value="john" disabled>John</NXOption>
            </NXSelect>
          </div>
          <br/><br/>

          <h4>With loading options</h4>
          <div>
            <NXSelect defaultValue="lucy" loading>
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack" disabled>Jack</NXOption>
              <NXOption value="john" disabled>John</NXOption>
            </NXSelect>
          </div>
        </section>

      </Fragment>
    );
  }
}

export default InputPage;
