import React, { Component, Fragment } from 'react';
import {NXIcon, notification,
  question,
  person,
  exit,
  calendar,
  arrowUp,
  arrowDown,
  arrowLeft,
  deleteIcon,
  plus,
  close,
  switchIcon,
  rubbish,
  fill,
  letter,
  diagram,
  diagramCircle,
  diagramBlock,
  gear,
  settings,
  filter,
  plusBlock,
  calculator,
  barChart,
  sort,
  add,
  update,
  mark,
  download,
  print,
  fullScreen,
  undo,
  list,
  more,
  table,
  tableUp,
  arrowLong,
  edit,
  menuOpen,
  search,
  legend,
  tiles,
  alert,
  info,
  warning} from "./Icon";

class IconPage extends Component {

  groupIcon(arr){
  return arr.map((icon, i) => <div className="icon">
      <NXIcon key={i} icon={icon} />
      <br/>
      <span>{icon.name}</span>
    </div>)
  }

  render() {
    const exampleStyle = {
      display: 'inline-block',
      marginLeft: '20px',
      padding: '10px 20px',
      background: '#eee'
    };

    const header = [notification,
      question,
      person,
      exit,
      settings
    ]

    const functionalBar = [
      filter,
      plusBlock,
      calculator,
      barChart,
      sort,
      add,
      update,
      mark,
      undo,
      fullScreen
    ]

    const diagrams = [
      diagram,
      diagramCircle,
      diagramBlock
    ]

    const arrows = [
      arrowUp,
      arrowDown,
      arrowLeft
    ]

    const tables = [
      more,
      table,
      tableUp
    ]

    const alerts = [
      alert,
      info,
      warning
    ]

    const icons = [
      calendar,
      deleteIcon,
      plus,
      close,
      switchIcon,
      rubbish,
      fill,
      letter,
      gear,
      settings,
      download,
      print,
      list,
      arrowLong,
      edit,
      menuOpen,
      search,
      legend,
      tiles
    ]

    return (
      <Fragment>
        <h1 className="title">Icon</h1>

        <h2 className="title">How To Use</h2>
        <p className="text">
          Use tag to create an icon and set its type in the type prop, for example:
        </p>

        <div style={exampleStyle}>
          &lt;<span style={{color: 'red'}}>NXIcon</span> <span style={{color: 'green'}}>icon</span>="<span style={{color: 'blue'}}>iconName</span>" /&gt;
        </div>

        <h3 className="title">Header</h3>
        <section className="icons ml20">
          {
            this.groupIcon(header)
          }
        </section>
        <br/><br/>

        <h3 className="title">Functional bar</h3>
        <section className="icons ml20">
          {
            this.groupIcon(functionalBar)
          }
        </section>
        <br/><br/>

        <h3 className="title">Diagram</h3>
        <section className="icons ml20">
          {
            this.groupIcon(diagrams)
          }
        </section>
        <br/><br/>

        <h3 className="title">Arrows</h3>
        <section className="icons ml20">
          {
            this.groupIcon(arrows)
          }
        </section>
        <br/><br/>

        <h3 className="title">Table</h3>
        <section className="icons ml20">
          {
            this.groupIcon(tables)
          }
        </section>
        <br/><br/>

        <h3 className="title">Alerts</h3>
        <section className="icons ml20">
          {
            this.groupIcon(alerts)
          }
        </section>
        <br/><br/>

        <h3 className="title">Others</h3>
        <section className="icons ml20">
          {
            this.groupIcon(icons)
          }
        </section>
      </Fragment>
    );
  }
}

export default IconPage;
