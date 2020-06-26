import React, { Component, Fragment } from 'react';

import NXInputSearch, {NXInput, NXCheckbox, NXRadio, NXTextArea, NXDatePicker, NXSelect, NXOption} from './Input';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';

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
          <div>
          <h3 className="ex-title">Checkbox</h3>

            <NXCheckbox>Checkbox</NXCheckbox>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXCheckbox } from "nx-design";

<NXCheckbox>Checkbox</NXCheckbox>`}
          </SyntaxHighlighter>
        </section>

        <section className="example">
          <h3 className="ex-title">Radio</h3>
          <div>
            <h4>Basic</h4>
            <NXRadio>Radio</NXRadio>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXRadio } from "nx-design";

<NXRadio>Radio</NXRadio>`}
          </SyntaxHighlighter>
          <br/>
          <div>
            <h4>Disabled</h4>
            <NXRadio disabled>Radio</NXRadio>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXRadio } from "nx-design";

<NXRadio disabled>Radio</NXRadio>`}
          </SyntaxHighlighter>
        <br/>
          <div>
            <h4>Radio group</h4>
            <NXRadio.Group defaultValue={1}>
            <NXRadio value={1}>Radio 1</NXRadio>
            <NXRadio value={2}>Radio 2</NXRadio>
            <NXRadio value={3}>Radio 3</NXRadio>
            </NXRadio.Group>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXRadio } from "nx-design";

<NXRadio.Group defaultValue={1}>
<NXRadio value={1}>Radio 1</NXRadio>
<NXRadio value={2}>Radio 2</NXRadio>
<NXRadio value={3}>Radio 3</NXRadio>
</NXRadio.Group>`}
          </SyntaxHighlighter>
        </section>

        <section className="example">
          <h3 className="ex-title">Input</h3>

          <div>
            <h4>Basic input</h4>
            <NXInput width='250px' />
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXInput } from "nx-design";

<NXInput width='250px' />`}
          </SyntaxHighlighter>
          <br/>

          <div>
            <h4>Search input</h4>
            <NXInputSearch width='250px' />
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import NXInputSearch from "nx-design";

<NXInputSearch width='250px' />`}
          </SyntaxHighlighter>
        </section>

        <section className="example">
          <h3 className="ex-title">Text Area</h3>

          <div>
            <NXTextArea width='250px' />
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXTextArea } from "nx-design";

<NXTextArea width='250px' />`}
          </SyntaxHighlighter>
        </section>

        <section className="example">
          <h3 className="ex-title">Date Picker</h3>

          <div>
            <NXDatePicker />
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXDatePicker } from "nx-design";

<NXDatePicker />`}
          </SyntaxHighlighter>
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
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXSelect, NXOption } from "nx-design";

<NXSelect defaultValue="lucy">
<NXOption value="lucy">Lucy</NXOption>
<NXOption value="jack">Jack</NXOption>
<NXOption value="john">John</NXOption>
</NXSelect>`}
          </SyntaxHighlighter>
          <br/><br/>

          <h4>Disabled Select</h4>
          <div>
            <NXSelect defaultValue="lucy" disabled>
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack">Jack</NXOption>
              <NXOption value="john">John</NXOption>
            </NXSelect>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXSelect, NXOption } from "nx-design";

<NXSelect defaultValue="lucy" disabled>
<NXOption value="lucy">Lucy</NXOption>
<NXOption value="jack">Jack</NXOption>
<NXOption value="john">John</NXOption>
</NXSelect>`}
          </SyntaxHighlighter>
          <br/><br/>

          <h4>With disabled options</h4>
          <div>
            <NXSelect defaultValue="lucy">
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack" disabled>Jack</NXOption>
              <NXOption value="john" disabled>John</NXOption>
            </NXSelect>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXSelect, NXOption } from "nx-design";

<NXSelect defaultValue="lucy">
<NXOption value="lucy">Lucy</NXOption>
<NXOption value="jack" disabled>Jack</NXOption>
<NXOption value="john" disabled>John</NXOption>
</NXSelect>`}
          </SyntaxHighlighter>
          <br/><br/>

          <h4>With loading options</h4>
          <div>
            <NXSelect defaultValue="lucy" loading>
              <NXOption value="lucy">Lucy</NXOption>
              <NXOption value="jack" disabled>Jack</NXOption>
              <NXOption value="john" disabled>John</NXOption>
            </NXSelect>
          </div>
          <SyntaxHighlighter language='jsx' style={okaidia} >
            {`import { NXSelect, NXOption } from "nx-design";

<NXSelect defaultValue="lucy" loading>
<NXOption value="lucy">Lucy</NXOption>
<NXOption value="jack" disabled>Jack</NXOption>
<NXOption value="john" disabled>John</NXOption>
</NXSelect>`}
          </SyntaxHighlighter>
        </section>

      </Fragment>
    );
  }
}

export default InputPage;
