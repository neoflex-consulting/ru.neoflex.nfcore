import React from 'react';
import * as dateFns from "date-fns";
import Ecore, {EObject} from "ecore";
import {API} from "../../../modules/api";
import {ru, enUS} from "date-fns/locale";
import {zhCN} from "date-fns/esm/locale";
import {withTranslation} from "react-i18next";
import {MainContext} from "../../../MainContext";
import {Button, Drawer, Icon, Input, Select, Switch} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faLifeRing} from "@fortawesome/free-regular-svg-icons";
import {faAlignJustify, faPlus, faPrint} from "@fortawesome/free-solid-svg-icons";
import StatusLegend from "./StatusLegend";
import CreateNotification from "./CreateNotification";
import {add, getMonth} from "date-fns";
import {AgGridColumn, AgGridReact} from "@ag-grid-community/react";
import {AllCommunityModules} from "@ag-grid-community/all-modules";
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';

import legend from '../../../legend.svg';
import searchIcon from '../../../searchIcon.svg';
import printIcon from '../../../printIcon.svg';
import trashcanIcon from '../../../trashcanIcon.svg';
import settingsIcon from '../../../settingsIcon.svg';
import EditNotification from "./EditNotification";

interface Props {
}

class Calendar extends React.Component<any, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
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
            periodicity: [],
            years: [],
            months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            calendarVisible: true,
            gridOptions: {
                defaultColDef: {
                    resizable: true,
                    filter: true,
                    sortable: true
                }
            },
            columnDefs: [],
            rowData: [],
            spinnerVisible: false,
            selectedValueInGrid: 'Системные заметки',
            frameworkComponents: {
                'actionMenu': this.actionMenu
            }
        };
        this.grid = React.createRef();
        this.handleEditMenu = this.handleEditMenu.bind(this)
    }

    actionMenu = () => (
        <div style={{marginLeft: '-32px'}}>
            <Button
                type="link"
                style={{width: '35px'}}
                onClick={this.handleEditMenu}
            >
                <img
                    alt="Not found"
                    src={settingsIcon}
                    style={{
                        color: '#515151'
                    }}
                />
            </Button>
            <Button
                type="link"
                style={{width: '35px',}}
            >
                <img
                    alt="Not found"
                    src={trashcanIcon}
                    style={{
                        color: '#515151'
                    }}
                />
            </Button>
        </div>
    );

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    };

    getAllNotificationInstances(currentMonth: Date) {
        const monthStart = dateFns.startOfMonth(currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const dateFrom = monthStart.toString();
        const dateTo = monthEnd.toString();
        const ref: string = this.props.viewObject._id;
        const methodName: string = 'getNotificationInstances';
        let resourceSet = Ecore.ResourceSet.create();
        return API.instance().call(ref, methodName, [dateFrom, dateTo]).then((result: any) => {
            let notificationInstancesDTO = JSON.parse(result).resources;
            this.setState({notificationInstancesDTO, spinnerVisible: false});
        })
    };

    getAllStatuses() {
        const userProfileValue = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === this.props.viewObject._id);
        if (userProfileValue.length !== 0) {
            let notificationStatus = JSON.parse(userProfileValue[0].get('value')).notificationStatus
            this.setState({notificationStatus})
        }
        else {
            API.instance().fetchAllClasses(false).then(classes => {
                const temp = classes.find((c: Ecore.EObject) => c._id === "//NotificationStatus");
                if (temp !== undefined) {
                    API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                        .then((result) => {
                            let notificationStatus = result.map ((r: any) => {
                                return {
                                    name: r.eContents()[0].get('name'),
                                    color: r.eContents()[0].get('color'),
                                    enable: true
                                }
                            });
                            this.setState({notificationStatus})
                        })
                }
            })
        }
    };

    getAllPeriodicity() {
        API.instance().findEnum('notification', 'Periodicity')
            .then((result: Ecore.EObject[]) => {
                let periodicity = result.map( (t: any) => {
                    return t.get('name')
                });
                this.setState({periodicity})
            })
    };

    createNotification = (newNotification: any) => {
        this.setState({spinnerVisible: true});
        const ref: string = this.props.viewObject._id;
        const methodName: string = 'createNotification';
        return API.instance().call(ref, methodName, [JSON.stringify(newNotification)]).then((result: any) => {
            this.getAllNotificationInstances(this.state.currentMonth);
        })
    };

    updateAllStatuses = (notificationStatus: any[]) => {
        this.setState({notificationStatus})
    };

    getYears() {
        const currentYear = new Date().getFullYear();
        let years = [];
        for (let i = -10; i <= 10; i++) {
            years.push(currentYear + i)
        }
        this.setState({years});
    };

    handleChange(e: any, type: string) {
        let newDate = null;
        if (type === 'year') {
            newDate = add(this.state.currentMonth, {years: e - this.state.currentMonth.getFullYear()});
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate)
        }
        else if (type == 'today') {
            newDate = new Date();
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate)
        }
        else if (type === 'month') {
            newDate = add(this.state.currentMonth, {months: e - this.state.currentMonth.getMonth() - 1});
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate)
        }
        else if (type === 'select') {
            this.setState({selectedValueInGrid: e});
            e === this.props.viewObject.get('defaultStatus').get('name') ?
                this.setGridData(true) : this.setGridData(false)

        }
    }

    getGlobalSettings() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//GlobalSettings");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((result) => {
                        this.setState({globalSettings: result[0].eContents()[0]})
                    })
            }
        })
    };

    private getLocale(i18n: any) {
        return i18n.language === "cn" ? zhCN
            :
            i18n.language === "ru" ? ru
                : enUS;
    }

    handleCreateMenu = () => {
        this.state.createMenuVisible ? this.setState({ createMenuVisible: false})
            : this.setState({ createMenuVisible: true});
    };

    handleEditMenu = () => {
        this.state.editMenuVisible ? this.setState({ editMenuVisible: false})
            : this.setState({ editMenuVisible: true});

    };

    handleLegendMenu = () => {
        this.state.legendMenuVisible ? this.setState({ legendMenuVisible: false})
            : this.setState({ legendMenuVisible: true});
    };

    renderCreateNotification() {
        const {i18n, t} = this.props;
        return (
            <Drawer
                placement='right'
                title={t('createNotification')}
                width={'450px'}
                visible={this.state.createMenuVisible}
                onClose={this.handleCreateMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    <CreateNotification
                        {...this.props}
                        onCreateNotificationStatus={this.createNotification}
                        periodicity={this.state.periodicity}
                        spinnerVisible={this.state.spinnerVisible}
                    />
                }
            </Drawer>
        );
    }

    renderEditNotification() {
        const {i18n, t} = this.props;
        return (
            <Drawer
                placement='right'
                title={t('editNotification')}
                width={'450px'}
                visible={this.state.editMenuVisible}
                onClose={this.handleEditMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    <EditNotification
                        {...this.props}
                        onCreateNotificationStatus={this.createNotification}
                        periodicity={this.state.periodicity}
                        spinnerVisible={this.state.spinnerVisible}
                    />
                }
            </Drawer>
        );
    }

    renderLegend() {
        const {i18n, t} = this.props;
        return (
            <Drawer
                placement='right'
                title={t('legend')}
                width={'450px'}
                visible={this.state.legendMenuVisible}
                onClose={this.handleLegendMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    <StatusLegend
                        {...this.props}
                        notificationStatus={this.state.notificationStatus}
                        onChangeNotificationStatus={this.updateAllStatuses}
                    />
                }
            </Drawer>
        );
    }

    handleCalendarVisible = () => {
        this.state.calendarVisible ? this.setState({ calendarVisible: false})
            : this.setState({ calendarVisible: true});
    };

    renderGrid() {
        const { t } = this.props;
        const {gridOptions} = this.state;
        return (
            <div
                style={{
                    marginTop: '30px',
                    width: '98%'
                }}
                className={'ag-theme-material'}
            >
                {this.state.columnDefs.length !== 0 && <AgGridReact
                    ref={this.grid}
                    rowData={this.state.rowData}
                    modules={AllCommunityModules}
                    onGridReady={this.onGridReady}
                    suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                    suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                    allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                    headerHeight={40} //высота header в px (25 по умолчанию)
                    suppressRowClickSelection //строки не выделяются при нажатии на них
                    pagination={true}
                    domLayout='autoHeight'
                    paginationPageSize={10}
                    frameworkComponents={this.state.frameworkComponents}
                    {...gridOptions}
                >
                    {this.state.columnDefs.map((col: any) =>
                        <AgGridColumn
                            key={col['field']}
                            field={col['field']}
                            headerName={col['field']}
                        />
                    )}
                    <AgGridColumn
                        key={'settings'}
                        cellRenderer='actionMenu'
                        width={85}
                        suppressMenu={true}
                    />
                </AgGridReact>
                }
            </div>
        )
    }

    renderHeader() {
        const {i18n, t} = this.props;
        const dateFormat = "LLLL yyyy";
        const dateFormat_ = "LLLL";
        return (
            <div className="header row flex-middle">


                {
                    this.state.calendarVisible &&
                    <div
                        style={{display: "contents"}}
                    >
                        <Button style={{marginLeft: '10px'}}
                                onClick={(e: any) => {this.handleChange(e, 'today')}}
                        >
                            {t('today')}
                        </Button>

                        <Select
                            value={this.state.currentMonth.getFullYear()}
                            style={{width: '75px', marginLeft: '10px', fontWeight: "normal"}}
                            onChange={(e: any) => {this.handleChange(e, 'year')}}
                        >
                            {
                                this.state.years!.map((y: any) =>
                                    <Select.Option
                                        key={y}
                                        value={y}
                                    >
                                        {y}
                                    </Select.Option>
                                )
                            }
                        </Select>

                        <Select
                            value={dateFns.format(this.state.currentMonth, dateFormat_, {locale: this.getLocale(i18n)})}
                            style={{width: '100px', marginLeft: '10px', fontWeight: "normal"}}
                            onChange={(e: any) => {this.handleChange(e, 'month')}}
                        >
                            {
                                this.state.months!.map((m: any) =>
                                    <Select.Option
                                        key={m}
                                        value={m}
                                    >
                                        {
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).charAt(0).toUpperCase() +
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).slice(1)
                                        }
                                    </Select.Option>
                                )
                            }
                        </Select>

                        <div className="col col-start">
                            <div className="icon" onClick={this.prevMonth}>
                                chevron_left
                            </div>
                        </div>
                        <div className="col col-center">
                    <span className="col-text" style={{fontSize: "120%"}}>
                        {dateFns.format(this.state.currentMonth, dateFormat, {locale: this.getLocale(i18n)})}
                    </span>
                        </div>
                        <div className="col col-end" onClick={this.nextMonth}>
                            <div className="icon">chevron_right</div>
                        </div>

                        <Button style={{width: '26px', height: '26px', color: '#6e6e6e'}} type="link"
                                onClick={this.handleLegendMenu}>
                            <img alt="Not found" src={legend} style={{marginLeft: '-9px', marginTop: '4px'}}/>
                        </Button>
                    </div>
                }

                {
                    !this.state.calendarVisible &&
                    <div
                        style={{display: "contents", marginTop: '2px'}}
                    >
                        <div style={{flexGrow: 1, marginLeft: '21px'}}>
                            <Input
                                style={{width: '186px', borderRadius: '4px', fill: '#ffffff', strokeWidth: 1, height: '32px'}}
                                placeholder="Поиск"
                                suffix={<img alt="Not found" src={searchIcon}/>}
                            />
                        </div>

                        <Select
                            value={this.state.selectedValueInGrid}
                            style={{width: '180px', marginRight: '-2px', fontWeight: "normal", marginTop: '1px'}}
                            onChange={(e: any) => {this.handleChange(e, 'select')}}
                        >
                            <Select.Option
                                key={this.props.viewObject.get('defaultStatus').get('name')}
                                value={this.props.viewObject.get('defaultStatus').get('name')}
                            >
                                {this.props.viewObject.get('defaultStatus').get('name')}
                            </Select.Option>

                            <Select.Option
                                key={'Системные заметки'}
                                value={'Системные заметки'}
                            >
                                Системные заметки
                            </Select.Option>
                        </Select>

                    </div>
                }

                <div style={{borderLeft: '1px solid #858585', marginLeft: '10px', marginRight: '6px', height: '34px'}}/>

                <Button
                    type="primary"
                    style={{
                        width: '20px',
                        height: '30px',
                        marginTop: '2px',
                        backgroundColor: '#293468'
                    }}
                    onClick={this.handleCreateMenu}>
                    <FontAwesomeIcon icon={faPlus} size="1x" style={{marginLeft: '-6px'}}/>
                </Button>

                <div style={{borderLeft: '1px solid #858585', marginLeft: '6px', marginRight: '10px', height: '34px'}}/>

                <Button
                    style={{
                        marginRight: '10px',
                        width: '32px',
                        height: '32px'
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
                    style={{
                        width: '32px',
                        height: '32px'
                    }}
                    onClick={this.handleCalendarVisible}
                >
                    <FontAwesomeIcon icon={faAlignJustify} size="lg"
                                     style={{
                                         marginLeft: '-8px',
                                         color: this.state.calendarVisible ? '#a0a0a0' : '#293468'
                                     }}/>
                </Button>

                <div style={{borderLeft: '1px solid #858585', marginLeft: '10px', height: '34px'}}/>

                <Button
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
            </div>
        )
    }

    renderDays() {
        const {i18n} = this.props;
        const dateFormat = "EEEE";
        const days = [];
        let startDate = dateFns.startOfWeek(this.state.currentMonth, {locale: ru});
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i}
                     className="col col-center col-text" style={{fontSize: "110%"}}
                >
                    {dateFns.format(dateFns.addDays(startDate, i), dateFormat, {locale: this.getLocale(i18n)})}
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    }

    openNotification(notification: any, context: any): void  {
        let params: Object[] = [{
            datasetColumn: 'reportDate',
            operation: 'EqualTo',
            value: notification.contents[0]['notificationDateOn'],
            enable: true,
            type: 'Date'
        }];
        if (notification.contents[0]['AppModuleName'] !== null) {
            context.changeURL(
                notification.contents[0]['AppModuleName'],
                undefined,
                params
            )
        }
    }

    renderCells(context: any) {
        const {t} = this.props;
        const { currentMonth, selectedDate } = this.state;
        const monthStart = dateFns.startOfMonth(currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const startDate = dateFns.startOfWeek(monthStart, {locale: ru});
        const endDate = dateFns.endOfWeek(monthEnd, {locale: ru});

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                let content = this.getContents(day);
                formattedDate = dateFns.format(day, dateFormat);
                let title = this.getTitle(day);
                const cloneDay = day;
                days.push(
                    <div
                        className={`col cell ${
                            !dateFns.isSameMonth(day, monthStart)
                                ? "disabled"
                                : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
                            }`}
                        key = {day.toString()}
                        onClick={() =>
                            this.onDateClick(cloneDay)
                        }
                    >
                        <span className="number">{formattedDate}</span>
                        <span className="title">{title}</span>
                        <span className="bg">{formattedDate}</span>
                        <div>
                            {content.length !== 0
                                ?
                                content.map( (r: any) =>
                                    <Button
                                        onClick={ () => this.openNotification(r, context)}
                                        key={`${r.contents[0]._id}`}
                                        size="small"
                                        style={{marginLeft: '5px', marginTop: '5px', marginBottom: '5px', width: "150px", display: "flex", color: "black", backgroundColor: r.contents[0]['statusColor'] ? r.contents[0]['statusColor'] : "white"}}
                                        title={`${r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}\n${dateFns.format(dateFns.parseISO(r.contents[0]['calendarDate']), "PPpp ",{locale: ru})}\n
[отчетная дата "на": ${dateFns.format(dateFns.parseISO(r.contents[0]['notificationDateOn']), "P ",{locale: ru})}]
[интервал: ${t(r.contents[0]['calculationInterval'])}]`}
                                    >
                                        {r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}
                                    </Button>
                                )
                                : ""}
                        </div>
                    </div>
                );
                day = dateFns.addDays(day, 1);
            }
            rows.push(
                <div className="row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return (
            <div>
                <div className="body">{rows}</div>
            </div>
        )
    }

    private getTitle(day: any) {
        let temp: any = [];
            this.props.viewObject.get('yearBook').get('days').array().filter((r: any) =>
                dateFns.isSameYear(day, dateFns.parseISO(r.get('date')))
                && dateFns.isSameMonth(day, dateFns.parseISO(r.get('date')))
                && dateFns.isSameDay(day, dateFns.parseISO(r.get('date')))
            ).map((r: any) => temp.push(r.get('title')));
            if (temp.length === 0) {
                temp.push(this.props.viewObject.get('defaultTitle'))
            }
        return temp;
    }

    private getContents(day: any) {
        let temp: any = [];
        let result: any = [];
        this.state.notificationInstancesDTO.filter((r: any) =>
            dateFns.isSameYear(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameMonth(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameDay(day, dateFns.parseISO(r.contents[0]['calendarDate']))
        ).map((r: any) => temp.push(r));
        if (temp.length !== 0 && this.state.notificationStatus) {
            let colors = this.state.notificationStatus
                .filter((s: any) => s['enable'] === true)
                .map((s: any) => {return s['color']});
            temp.forEach((r: any) => {
                if (colors.includes(r.contents[0]['statusColor'])) {
                    result.push(r)
                }
            })
        }
        return result;
    }
    
    onDateClick = (day: any) => {
        this.setState({
            selectedDate: day
        })
    };

    nextMonth = () => {
        this.setState({
            currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
        })
    };

    prevMonth = () => {
        this.setState({
            currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
        })
    };

    componentDidMount(): void {
        this.getGlobalSettings();
        this.getAllStatuses();
        this.getAllNotificationInstances(this.state.currentMonth);
        this.getAllPeriodicity();
        this.getYears();
        this.setGridData(false)
    }

    setGridData(myNotificationVisible: boolean): void {
        const {t} = this.props;
        let rowData: any = [];
        let columnDefs = [
            {field: 'Полное название формы'},
            {field: 'Краткое название формы'},
            {field: 'Отчетная дата "на"'},
            {field: 'Периодичность сдачи'},
            {field: 'Рабочий день сдачи'},
            {field: 'Время сдачи'},
            {field: 'Отчетность по выходным'},
            {field: 'Интервал расчета'}
        ];
        if (myNotificationVisible) {
            this.props.viewObject.get('notifications').array()
                .filter((n: EObject) => n.get('defaultStatus').get('name') === 'Личная заметка')
                .forEach((n: EObject) => {
                rowData.push(
                    {
                        ['Полное название формы']: n.get('name'),
                        ['Краткое название формы']: n.get('shortName'),
                        ['Отчетная дата "на"']: n.get('reportingDateOn').array().map((d: any) => d.get('name')),
                        ['Периодичность сдачи']: n.get('periodicity') === null ? t('Day') : t(n.get('periodicity')),
                        ['Рабочий день сдачи']: n.get('deadlineDay'),
                        ['Время сдачи']: n.get('deadlineTime'),
                        ['Отчетность по выходным']: n.get('weekendReporting') ? 'Да' : 'Нет',
                        ['Интервал расчета']: t(n.get('calculationInterval'))
                    }
                )
            });
        }
        else {
            this.props.viewObject.get('notifications').array()
                .filter((n: EObject) => n.get('defaultStatus').get('name') !== 'Личная заметка')
                .forEach((n: EObject) => {
                rowData.push(
                    {
                        ['Полное название формы']: n.get('name'),
                        ['Краткое название формы']: n.get('shortName'),
                        ['Отчетная дата "на"']: n.get('reportingDateOn').array().map((d: any) => d.get('name')),
                        ['Периодичность сдачи']: n.get('periodicity') === null ? t('Day') : t(n.get('periodicity')),
                        ['Рабочий день сдачи']: n.get('deadlineDay'),
                        ['Время сдачи']: n.get('deadlineTime'),
                        ['Отчетность по выходным']: n.get('weekendReporting') ? 'Да' : 'Нет',
                        ['Интервал расчета']: t(n.get('calculationInterval')),
                        ['Удалена']: n.get('archive') ? 'Да' : 'Нет'
                    }
                )
            });
        }
        this.setState({rowData, columnDefs});
    }

    render() {
        return (
            <MainContext.Consumer>
                { context => (
                    <div className="calendar">
                        {this.renderCreateNotification()}
                        {this.renderEditNotification()}
                        {this.renderLegend()}
                        {this.renderHeader()}
                        {this.state.calendarVisible && this.renderDays()}
                        {this.state.calendarVisible && this.renderCells(context)}
                        {!this.state.calendarVisible && this.renderGrid()}
                    </div>
                )}
            </MainContext.Consumer>
        );
    }
}

export default withTranslation()(Calendar)
