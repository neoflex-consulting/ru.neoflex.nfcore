import React,{Component} from "react";
import NXButton from "../Button/NXButton";
import {NXOption, NXSelect} from "../Input/Input";


class NXCalendarBar extends Component {
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

  render() {
    const {i18n, t} = this.props;
    const dateFormat = "LLLL yyyy";
    const dateFormat_ = "LLLL";
    return (
      <div id="selectInFullScreen" className="header row flex-middle">
        {
          this.state.calendarVisible &&
          <div
            style={{display: "contents"}}
          >
            <div
              className="date">

              <NXButton
                className='buttonToday'
                onClick={(e) => {this.handleChange(e, 'today')}}
              >
                {t('today')}
              </NXButton>

              <NXSelect className='selectYear'
                      getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                      value={this.state.currentMonth.getFullYear()}
                      style={{width: '75px', marginLeft: '10px', fontWeight: "normal", position: "relative"}}
                      onChange={(e) => {this.handleChange(e, 'year')}}>
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
                className='selectMonth'
                getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                value={dateFns.format(this.state.currentMonth, dateFormat_, {locale: this.getLocale(i18n)})}
                style={{width: '100px', marginLeft: '10px', fontWeight: "normal"}}
                onChange={(e) => {this.handleChange(e, 'month')}}
              >
                {
                  this.state.months.map((m) =>
                    <NXOption
                      className='selectMonth2'
                      key={m}
                      value={m}
                    >
                      {
                        dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).charAt(0).toUpperCase() +
                        dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).slice(1)
                      }
                    </NXOption>
                  )
                }
              </NXSelect>
            </div>

            <div className="col col-start">
              <div className="icon" onClick={this.prevMonth}>
                chevron_left
              </div>
            </div>
            <div className="col-col-center">
                    <span className="col-text" style={{fontSize: "120%"}}>
                        {dateFns.format(this.state.currentMonth, dateFormat, {locale: this.getLocale(i18n)})}
                    </span>
            </div>
            <div className="col col-end" >
              <div className="icon" onClick={this.nextMonth}>
                chevron_right
              </div>
            </div>

            <Button className="buttonLegend" style={{width: '26px', height: '26px', color: '#6e6e6e'}} type="link"
                    onClick={this.handleLegendMenu}>
              <img  alt="Not found" src={legend}  style={{marginLeft: '-9px', marginTop: '4px'}}/>
            </Button>
          </div>
        }

        {
          !this.state.calendarVisible &&
          <div
            style={{display: "contents", marginTop: '2px'}}
          >
            <div style={{flexGrow: 1, marginLeft: '21px', marginTop: this.state.fullScreenOn ? '8px' : '0px'}}>
              <Input
                style={{
                  width: '186px',
                  borderRadius: '4px',
                  fill: '#ffffff',
                  strokeWidth: 1,
                  height: '32px'
                }}
                placeholder="Поиск"
                suffix={
                  <img
                    alt="Not found"
                    src={searchIcon}
                    onClick={this.searchValue}
                  />
                }
                onChange={(e) => {
                  this.changeSearchValue(e.target.value)
                }}
              />
            </div>


            <NXSelect
              getPopupContainer={() => document.getElementById('selectInFullScreen') as HTMLElement}
              value={this.state.selectedValueInGrid}
              style={{width: '180px', marginRight: '-2px', fontWeight: "normal", marginTop: this.state.fullScreenOn ?'8px' : '1px'}}
              onChange={(e) => {
                this.handleChange(e, 'select')
              }}
            >
              <NXOption
                key={this.props.viewObject.get('defaultStatus').get('name')}
                value={this.props.viewObject.get('defaultStatus').get('name')}
              >
                {this.props.viewObject.get('defaultStatus').get('name')}
              </NXOption>

              <NXOption
                key={'Системные заметки'}
                value={'Системные заметки'}
              >
                Системные заметки
              </NXOption>
            </NXSelect>


          </div>
        }

        <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', marginRight: '6px', height: '34px'}}/>


        <Button
          className="buttonPlus"
          type="primary"
          style={{
            width: '20px',
            height: '30px',
            marginTop: this.state.fullScreenOn ? '11px' : '2px',
            backgroundColor: '#293468'
          }}
          onClick={this.handleCreateMenu}>
          <FontAwesomeIcon icon={faPlus} size="1x" style={{marginLeft: '-6px'}}/>
        </Button>




        <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '6px', marginRight: '10px', height: '34px'}}/>

        <Button
          disabled={this.state.calendarVisible}
          className="calendarAlt"
          style={{
            marginRight: '10px',
            width: '32px',
            height: '32px',
            backgroundColor: '#ffffff'
          }}
          onClick={this.handleCalendarVisible}
        >
          <FontAwesomeIcon color={'#6e6e6e'} icon={faCalendarAlt} size="lg"
                           style={{
                             marginLeft: '-8px',
                             color: this.state.calendarVisible ? '#293468' : '#a0a0a0'
                           }}/>
        </Button>
        <Button
          disabled={!this.state.calendarVisible}
          className="alignJustify"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#ffffff'
          }}
          onClick={this.handleCalendarVisible}
        >
          <FontAwesomeIcon icon={faAlignJustify} size="lg"
                           style={{
                             marginLeft: '-8px',
                             color: this.state.calendarVisible ? '#a0a0a0' : '#293468'
                           }}/>
        </Button>

        <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', height: '34px'}}/>

        <Button
          className="buttonPrint"
          type="link"
          ghost
          style={{
            marginRight: '10px',
            width: '32px',
            height: '32px'
          }}
        >
          <img
            alt="Not found"
            src={printIcon}
            style={{
              marginLeft: '-6px',
              color: '#515151'
            }}
          />
        </Button>


        <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '0px', height: '34px'}}/>


        <Button
          className="buttonFullScreen"
          type="link"
          ghost
          style={{
            marginRight: '10px',
            width: '32px',
            height: '32px'
          }}
          onClick={this.onFullScreen}
        >
          {this.state.fullScreenOn  ?
            <FontAwesomeIcon icon={faCompressArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>
            :
            <FontAwesomeIcon icon={faExpandArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>}
        </Button>
      </div>
    );
  }
}

export default NXCalendarBar;
