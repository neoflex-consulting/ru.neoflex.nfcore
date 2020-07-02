import React,{Component} from "react";
import {NXIcon, legend, print, arrowLeft, plus, calendar, table, NXButton, NXInputSearch, NXOption, NXSelect} from "../../../../index";
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
                  <NXIcon xs margin='8px auto' icon={arrowLeft} />
            </div>
            <div className="col-col-center">
                    <span className="col-text">Месяц</span>
            </div>
            <div className="col col-end" >
                  <NXIcon xs margin='8px auto' rotate={100} icon={arrowLeft} />
            </div>
                <NXIcon sm margin='auto' icon={legend} />
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
      <NXIcon sm icon={plus} className='NXIcon fill' />
      <div className="verticalLine" />
        <NXIcon xs icon={calendar} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
        style={{
          border: this.state.calendarVisible ? '1px solid #FFCC66' : '1px solid #424D78',
          background: this.state.calendarVisible ? '#FFF8E0' : '#FFFFFF',
          pointerEvents: this.state.calendarVisible ? 'none' : 'auto',
          marginRight: '8px'
        }}
        />
      <NXIcon xs icon={table} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #424D78' : '1px solid #FFCC66',
        background: this.state.calendarVisible ? '#FFFFFF' : '#FFF8E0',
        pointerEvents: !this.state.calendarVisible ? 'none' : 'auto'
      }}
      />
      <div className="verticalLine" />
      <NXIcon sm icon={print} className='NXIcon fill' />
      </div>
        </div>
    );
  }
}
