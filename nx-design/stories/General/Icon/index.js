import React, { Component, Fragment } from 'react';
import {NXIcon, notification,question,person,exit,calendar,arrowUp,arrowDown,arrowLeft,deleteIcon,plus,close,
  switchIcon,rubbish,fill,letter,diagram,diagramCircle,diagramBlock,gear,settings,filter,plusBlock,
  calculator,barChart,sort,add,update,mark,download,print,fullScreen,undo,list,more,table,tableUp,arrowLong,
  edit,menuOpen,search,legend,tiles,success,info,warning
} from "../../../index";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {PropsTab} from "../../../utils/helpers";

class IconPage extends Component {
    copyToClipboard(e) {
        const str = e.currentTarget.innerText.trim()
        const el = document.createElement('textarea');
        el.value = `<NXIcon icon={${str}} />`;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };

  groupIcon(arr){
  return arr.map((icon, i) => <div className="icon" onClick={this.copyToClipboard}>
      <NXIcon key={i} icon={icon} />
      <br/>
      <span>{icon.name}</span>
    </div>)
  }

  render() {

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
      success,
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
        <h1 className="title">Иконки</h1>

        <h2 className="title">Как использовать</h2>
            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`import { NXIcon, iconName } from "nx-design";`}
            </SyntaxHighlighter>
          <h2 className="title">Размеры</h2>
          <section className="icons ml20">
              <div className="icon">
                  <NXIcon big icon={notification} />
                  <br/>
                  <span>Big</span>
              </div>
              <div className="icon">
                  <NXIcon icon={notification} />
                  <br/>
                  <span>Default</span>
              </div>
              <div className="icon">
                  <NXIcon small icon={notification} />
                  <br/>
                  <span>Small</span>
              </div>
          </section>
        <p className="text">
          При нажатии на необходимую иконку, ее код будет скопирован в буффер.
        </p>

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
          <PropsTab Props={
              [
                  {name:'icon', default:'-', description:'Имя иконки'},
                  {name:'small', default:'16px', description:'Размер иконки - 8px'},
                  {name:'big', default:'16px', description:'Размер иконки - 24px'},
                  {name:'margin', default:'auto 3px', description:'Внешний отступ'},
                  {name:'fill', default:'-', description:'Цвет иконки'},
                  {name:'noPoint', default:'pointer', description:'При наведении на иконку будет установлен cursor: default'}

              ]
          }/>
      </Fragment>
    );
  }
}

export default IconPage;
