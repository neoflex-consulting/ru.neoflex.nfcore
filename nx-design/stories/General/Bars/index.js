import React, { Component, Fragment } from 'react';

import NXCalendarBar from './CalendarBar/CalendarBar';
import NXFunctionalBar from "./FunctionalBar/FunctionalBar";

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
import NXButton from "nx-design";
import NXInputSearch, {NXOption, NXSelect} from "nx-design";
import {NXIcon, legend, print, arrowLeft, plus, calendar, table} from "nx-design";
import './index.css'

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

  changeSearchValue = (e) => {
    this.setState({searchValue: e})
  };

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
                  <NXIcon icon={arrowLeft} />
            </div>
            <div className="col-col-center">
                    <span className="col-text">Месяц</span>
            </div>
            <div className="col col-end" >
                  <NXIcon icon={arrowLeft} />
            </div>
                <NXIcon icon={legend} />
          </div>
        }
        {
          !this.state.calendarVisible &&
          <div className='tableVisible' style={{display: "contents", marginTop: '2px'}}>
              <div style={{flexGrow: 1, marginLeft: '21px', marginTop: this.state.fullScreenOn ? '8px' : '0px'}}>
                <NXInputSearch width='185px'
                  onChange={(e) => {this.changeSearchValue(e.target.value)}}/>
              </div>
              <NXSelect
                width='180px'
                getPopupContainer={() => document.getElementById('selectInFullScreen')}
                value={this.state.selectedValueInGrid}
                style={{ marginTop: this.state.fullScreenOn ?'8px' : '0px'}}>
                <NXOption key={'Системные заметки'} value={'Системные заметки'}>Системные заметки</NXOption>
              </NXSelect>
          </div>
        }
      <div className="verticalLine" />
      <NXIcon icon={plus} className='NXIcon fill' />
      <div className="verticalLine" />
      <NXIcon icon={calendar} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #FFCC66' : '1px solid #424D78',
        borderRadius: '2px',
        background: this.state.calendarVisible ? '#FFF8E0' : '#FFFFFF',
        pointerEvents: this.state.calendarVisible ? 'none' : 'auto',
        marginRight: '8px'
      }}/>
      <NXIcon icon={table} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #424D78' : '1px solid #FFCC66',
        borderRadius: '2px',
        background: this.state.calendarVisible ? '#FFFFFF' : '#FFF8E0',
        pointerEvents: !this.state.calendarVisible ? 'none' : 'auto'
      }}/>
      <div className="verticalLine" />
      <NXIcon icon={print} className='NXIcon fill' />
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
                  {`import NXInputSearch, {NXSelect, NXOption} from "../../Input/Input";
import {NXIcon, filter, plus, sort, calculator, plusBlock, barChart, add, mark, download, fullScreen, print} from '../../../../index';
import './index.css';

export default class NXFunctionalBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>

                <div className='block'>
                    <NXInputSearch width='192px' />
                        <div className='verticalLine' />
                    <NXIcon icon={plus} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={filter} className='NXIcon fill' />
                    <NXIcon icon={sort} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={calculator} className='NXIcon fill' />
                    <NXIcon icon={plusBlock} className='NXIcon fill' />
                    <NXIcon icon={barChart} className='NXIcon fill' />
                    <NXIcon icon={add} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={mark} className='NXIcon fill' />
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
                <NXIcon icon={download} className='NXIcon fill' />
                <NXIcon icon={print} className='NXIcon fill' />
                <NXIcon icon={fullScreen} className='NXIcon fill' />
                </div>

            </div>
        );
    }
}`}
              </SyntaxHighlighter>
              </div>

          </section>
      </Fragment>
    );
  }
}

export default BarsPage;
