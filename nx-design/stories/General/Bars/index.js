import React, { Component, Fragment } from 'react';

import NXCalendarBar from './CalendarBar/CalendarBar';
import NXFunctionalBar from "./FunctionalBar/FunctionalBar";
import NXDiagramBar from "./DiagramBar/DiagramBar";

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import "../../../utils/helpers";
import showCode from "../../../utils/helpers";

class BarsPage extends Component {
  render() {

    return (
      <Fragment>
        <h1 className="title">Bars</h1>

        <h2 className="title">Примеры:</h2>

        <section className="example">
          <h3 className="ex-title">Calendar</h3>
          <div>
            <NXCalendarBar />
          </div>

            <div className='showCode'>
            <button id='calendar' onClick={showCode}>Show Code</button>
            <SyntaxHighlighter id='calendar' language='jsx' style={okaidia} >
                {`import React,{Component} from "react";
import {NXIcon, legend, print, arrowLeft, plus, calendar, table, NXButton, NXInputSearch, NXOption, NXSelect} from "nx-design";
import './index.css';

export default class NXCalendarBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMonth: new Date(),
      fullScreenOn: false,
      years: [],
      calendarVisible: true,
      selectedValueInGrid: 'Системные заметки',
      searchValue: undefined,
    }
  }

  getYears() {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = -10; i <= 10; i++) {
      years.push(currentYear + i)
    }
    this.setState({years});
  };

  componentDidMount() {
    this.getYears();
  }

  handleCalendarVisible = () => {
    if (this.state.calendarVisible) {
      this.setState({calendarVisible: false});
    } else {
      this.setState({calendarVisible: true});
    }
  }

  render() {
    return (
        <div className='calendar__header'>
      <div id="selectInFullScreen" className="header row flex-middle">
        {
          this.state.calendarVisible &&
          <div className='calendarVisible' style={{display: "contents"}}>
            <div className="date">
              <NXButton>Сегодня</NXButton>
              <NXSelect className='selectYear'
                      width='100px'
                      getPopupContainer={() => document.getElementById ('selectInFullScreen')}
                      value={this.state.currentMonth.getFullYear()}>
                {
                        this.state.years.map((y) =>
                      <NXOption key={y} value={y}>{y}</NXOption>
                  )
                }
              </NXSelect>
              <NXSelect
                width='120px'
                className='selectMonth'
                getPopupContainer={() => document.getElementById ('selectInFullScreen')}
                onChange={(e) => {this.handleChange(e, 'month')}}>
                Месяц
              </NXSelect>
            </div>

            <div className="col col-start">
                  <NXIcon margin='8px auto' icon={arrowLeft} />
            </div>
            <div className="col-col-center">
                    <span className="col-text">Месяц</span>
            </div>
            <div className="col col-end" >
                  <NXIcon margin='8px auto' rotate={100} icon={arrowLeft} />
            </div>
                <NXIcon big margin='auto' icon={legend} />
          </div>
        }
        {
          !this.state.calendarVisible &&
          <div className='tableVisible' style={{display: "contents"}}>
              <div style={{flexGrow: 1}}>
                <NXInputSearch width='185px'/>
              </div>
              <NXSelect
                width='180px'
                getPopupContainer={() => document.getElementById('selectInFullScreen')}
                value={this.state.selectedValueInGrid}>
                <NXOption key={'Системные заметки'} value={'Системные заметки'}>Системные заметки</NXOption>
              </NXSelect>
          </div>
        }
      <div className="verticalLine" />
      <NXIcon big icon={plus} fill='#5E6785' />
      <div className="verticalLine" />
        <NXIcon icon={calendar} fill='#5E6785' className='handleCalendarVisible' onClick={this.handleCalendarVisible}
        style={{
          border: this.state.calendarVisible ? '1px solid #FFCC66' : '1px solid #424D78',
          background: this.state.calendarVisible ? '#FFF8E0' : '#FFFFFF',
          pointerEvents: this.state.calendarVisible ? 'none' : 'auto',
          marginRight: '8px'
        }}
        />
      <NXIcon icon={table} fill='#5E6785' className='handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #424D78' : '1px solid #FFCC66',
        background: this.state.calendarVisible ? '#FFFFFF' : '#FFF8E0',
        pointerEvents: !this.state.calendarVisible ? 'none' : 'auto'
      }}
      />
      <div className="verticalLine" />
      <NXIcon icon={print} big fill='#5E6785' />
      </div>
        </div>
    );
  }
}

`}
            </SyntaxHighlighter>
            </div>

        </section>
          <section className="example">
              <h3 className="ex-title">FunctionalBar</h3>
              <div>
                  <NXFunctionalBar />
              </div>

              <div className='showCode'>
                  <button id='functionalBar' onClick={showCode}>Show Code</button>
              <SyntaxHighlighter id='functionalBar' language='jsx' style={okaidia} >
                  {`import React, {Component} from 'react';
import {NXIcon, filter, plus, sort, calculator, plusBlock, barChart, add, mark, download, fullScreen, print, NXInputSearch, NXSelect, NXOption} from 'nx-design';
import './index.css';

export default class NXFunctionalBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>

                <div className='block'>
                    <NXInputSearch width='192px' />
                        <div className='verticalLine' />
                    <NXIcon big icon={plus} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={filter} fill='#5E6785' />
                    <NXIcon big icon={sort} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={calculator} fill='#5E6785' />
                    <NXIcon big icon={plusBlock} fill='#5E6785' />
                    <NXIcon big icon={barChart} fill='#5E6785' />
                    <NXIcon big icon={add} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={mark} fill='#5E6785' />
                        <div className='verticalLine' />
                </div>

                <div className='block'>
                    <span className='caption'>Версия</span>
                    <NXSelect width='185px' defaultValue='default'>
                        <NXOption value='default'>
                            По умолчанию
                        </NXOption>
                    </NXSelect>
                <div className='verticalLine' />
                <NXIcon big icon={download} fill='#5E6785' />
                <NXIcon big icon={print} fill='#5E6785' />
                <NXIcon big icon={fullScreen} fill='#5E6785' />
                </div>

            </div>
        );
    }
}

`}
              </SyntaxHighlighter>
              </div>

          </section>
          <section className="example">
              <h3 className="ex-title">DiagramBar</h3>
              <div>
                  <NXDiagramBar />
              </div>

              <div className='showCode'>
                  <button id='diagramBar' onClick={showCode}>Show Code</button>
                  <SyntaxHighlighter id='diagramBar' language='jsx' style={okaidia} >
                      {`import {arrowLong, edit, rubbish, NXIcon, plus, mark, download, fullScreen, print, NXSelect, NXOption} from '../../../../index';

export default class NXDiagramBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>
                <div className='block'>
                    <a>
                    <NXIcon icon={arrowLong} margin='0 12px 0 0' fill='#5E6785' />
                    <span>Вернуться к таблице</span>
                    </a>
                    <div className='verticalLine' />
                    <NXIcon big icon={plus} fill='#5E6785' />
                    <NXIcon big icon={edit} fill='#5E6785' />
                    <div className='verticalLine' />
                    <NXIcon big icon={mark} fill='#5E6785' />
                    <NXIcon big icon={rubbish} fill='#5E6785' />
                    <div className='verticalLine' />
                </div>

                <div className='block'>
                    <span className='caption'>Версия</span>
                    <NXSelect width='185px' defaultValue='default'>
                        <NXOption value='default'>
                            По умолчанию
                        </NXOption>
                    </NXSelect>
                    <div className='verticalLine' />
                    <NXIcon big icon={download} fill='#5E6785' />
                    <NXIcon big icon={print} fill='#5E6785' />
                    <NXIcon big icon={fullScreen} fill='#5E6785' />
                </div>
            </div>
        );
    }
}
`}
                  </SyntaxHighlighter>
              </div>

          </section>
      </Fragment>
    );
  }
}

export default BarsPage;
