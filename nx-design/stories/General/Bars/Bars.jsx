import React,{Component} from "react";
import NXButton from "../../../index";
import {NXInput, NXOption, NXSelect} from "../Input/Input";
import {NXIcon, legend, print, arrowLeft, plus, calendar, table, search} from "../Icon/Icon";
import styled from "styled-components";



export default class NXCalendarBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMonth: new Date(),
      selectedDate: new Date(),
      notificationStatus: [],
      notificationInstancesDTO: [],
      calendarLanguage: "",
      legendMenuVisible: false,
      createMenuVisible: false,
      editMenuVisible: false,
      fullScreenOn: false,
      periodicity: [],
      paginationPageSize: 10,
      isGridReady: false,
      years: [],
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      calendarVisible: true,
      editableNotification: {},
      gridOptions: {
        defaultColDef: {
          resizable: true,
          filter: true,
          sortable: true
        }
      },
      columnDefs: [],
      rowData: [],
      filteredRowData: undefined,
      spinnerVisible: false,
      selectedValueInGrid: 'Системные заметки',

      myNotificationVisible: false,
      searchValue: undefined,
      deletedItem: false,
      classAppModule: undefined
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
    const StyledCalendar = styled.div`
    display: block;
    position: relative;
    width: 100%;
    background: var(--neutral-color);
    border: 1px solid var(--border-color);
    background-color: rgb(243, 244, 251);
    height: 56px;

   .header{
       text-transform: capitalize;
    font-weight: 700;
    border-bottom: 1px solid var(--border-color);
    height: 56px;
   }
   .row {
    padding: 12px 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
}
.row:last-child {
     border-bottom: none;
 }
.date button {
    font-weight: 600;
    align-items: center;
}
.NXIcon {
    display: inline-block;
    vertical-align: middle;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    cursor: pointer;
    transition: .15s ease-out;
    margin: auto;
    height: 24px;
}
.col {
    flex-basis: 0;
    max-width: 100%;
}
.col-start {
    flex-grow: 3;
    justify-content: flex-start;
    text-align: end;
}
.col-center {
    flex-grow: 1;
    justify-content: center;
    text-align: center;
    text-transform: capitalize;
}

.col-end {
    flex-grow: 3;
    justify-content: flex-end;
    text-align: start;
}

.col-col-center {
    margin: 0 30px;
}

.col-text {
    color: rgba(0, 0, 0, 0.65);
    font-weight: 600;
    text-transform: uppercase;
}

.date div {
    font-weight: 600;
    align-items: center;
}
.date > div, button {
margin-right: 8px;
}
.fill path{
  fill: #424D78
}
.handleCalendarVisible svg{
padding: 3px;
}

`
    return (
        <StyledCalendar>
      <div id="selectInFullScreen" className="header row flex-middle">
        {
          this.state.calendarVisible &&
          <div style={{display: "contents"}}>
            <div className="date">

              <NXButton className='buttonToday'>
                Сегодня
              </NXButton>

              <NXSelect className='selectYear'
                      width='100px'
                      getPopupContainer={() => document.getElementById ('selectInFullScreen')}
                      value={this.state.currentMonth.getFullYear()}>
                {
                        this.state.years.map((y) =>
                      <NXOption
                          key={y}
                          value={y}
                      >
                        {y}
                      </NXOption>
                  )
                }
              </NXSelect>

              <NXSelect
                width='120px'
                className='selectMonth'
                getPopupContainer={() => document.getElementById ('selectInFullScreen')}
                onChange={(e) => {this.handleChange(e, 'month')}}
              >
                Месяц
              </NXSelect>
            </div>

            <div className="col col-start">
                  <NXIcon style={{transform: 'scale(0.5)'}} icon={arrowLeft} />
            </div>
            <div className="col-col-center">
                    <span className="col-text" style={{fontSize: "120%"}}>
                     Месяц
                    </span>
            </div>
            <div className="col col-end" >
                  <NXIcon style={{transform: 'scale(-0.5)'}} icon={arrowLeft} />
            </div>

                <NXIcon icon={legend} />
          </div>
        }

        {
          !this.state.calendarVisible &&
          <div
            style={{display: "contents", marginTop: '2px'}}
          >
            <div style={{flexGrow: 1, marginLeft: '21px', marginTop: this.state.fullScreenOn ? '8px' : '0px'}}>
              <NXInput
                style={{
                  width: '186px',
                  borderRadius: '4px',
                  fill: '#ffffff',
                  strokeWidth: 1,
                  height: '32px'
                }}
                placeholder="Поиск"
                onChange={(e) => {
                  this.changeSearchValue(e.target.value)
                }}
              />
            </div>


            <NXSelect
              getPopupContainer={() => document.getElementById('selectInFullScreen')}
              value={this.state.selectedValueInGrid}
              style={{width: '180px', marginRight: '-2px', fontWeight: "normal", marginTop: this.state.fullScreenOn ?'8px' : '1px'}}
            >
              <NXOption
                key={'Системные заметки'}
                value={'Системные заметки'}
              >
                Системные заметки
              </NXOption>
            </NXSelect>


          </div>
        }

      <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', marginRight: '6px', height: '32px'}}/>

      <NXIcon icon={plus} className='NXIcon fill' />
      <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '6px', marginRight: '10px', height: '32px'}}/>
      <NXIcon icon={calendar} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #FFCC66' : '1px solid #424D78',
        borderRadius: '2px',
        background: this.state.calendarVisible ? '#FFF8E0' : '#FFFFFF',
        pointerEvents: this.state.calendarVisible ? 'none' : 'auto',
        marginRight: '8px'
      }}
      />
      <NXIcon icon={table} className='NXIcon fill handleCalendarVisible' onClick={this.handleCalendarVisible}
      style={{
        border: this.state.calendarVisible ? '1px solid #424D78' : '1px solid #FFCC66',
        borderRadius: '2px',
        background: this.state.calendarVisible ? '#FFFFFF' : '#FFF8E0',
        pointerEvents: !this.state.calendarVisible ? 'none' : 'auto'
      }}
      />

      <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', marginRight: '10px', height: '32px'}}/>

      <NXIcon icon={print} className='NXIcon fill' />
      </div>
        </StyledCalendar>
    );
  }
}
