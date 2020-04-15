import React from 'react';
import * as dateFns from "date-fns";
import Ecore, {EObject} from "ecore";
import {API} from "../../modules/api";
import {ru, enUS} from "date-fns/locale";
import {zhCN} from "date-fns/esm/locale";
import {withTranslation} from "react-i18next";
import {MainContext} from "../../MainContext";
import {Button, Drawer} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faLifeRing, faUser} from "@fortawesome/free-regular-svg-icons";
import {faAlignJustify, faPlus, faPrint} from "@fortawesome/free-solid-svg-icons";
import StatusLegend from "./StatusLegend";

interface State {
    currentMonth: Date;
    selectedDate: Date;
    notificationStatus: Object[];
    notificationInstancesDTO: Object[];
    globalSettings?: EObject;
    calendarLanguage: string;
    legendMenuVisible: boolean;
}

interface Props {
}

class Calendar extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            currentMonth: new Date(),
            selectedDate: new Date(),
            notificationStatus: [],
            notificationInstancesDTO: [],
            calendarLanguage: "",
            legendMenuVisible: false
        };
    }

    getAllNotificationInstances() {
        const monthStart = dateFns.startOfMonth(this.state.currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const dateFrom = monthStart.toString()
        const dateTo = monthEnd.toString()
        const ref: string = this.props.viewObject._id;
        const methodName: string = 'getNotificationInstances';
        let resourceSet = Ecore.ResourceSet.create();
        return API.instance().call(ref, methodName, [dateFrom, dateTo]).then((result: any) => {
            let notificationInstancesDTO = JSON.parse(result).resources;
            this.setState({notificationInstancesDTO});
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

    updateAllStatuses = (notificationStatus: any[]) => {
        this.setState({notificationStatus})
    };

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

    handleLegendMenu = () => {
        this.state.legendMenuVisible ? this.setState({ legendMenuVisible: false})
            : this.setState({ legendMenuVisible: true});
    };

    renderLegend() {
        const {i18n, t} = this.props;
        const dateFormat = "LLLL yyyy";
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

    renderHeader() {
        const {i18n} = this.props;
        const dateFormat = "LLLL yyyy";
        return (
            <div className="header row flex-middle">

                <Button style={{marginLeft: '10px'}}>
                    Сегодня
                </Button>
                <Button style={{marginLeft: '10px'}}>
                    2020
                </Button>
                <Button style={{marginLeft: '10px'}}>
                    Апрель
                </Button>


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

                <Button type="primary" style={{width: '20px', height: '30px', marginTop: '2px'}}>
                    <FontAwesomeIcon icon={faPlus} size="1x" style={{marginLeft: '-6px'}}/>
                </Button>

                <div style={{borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '6px', height: '34px'}}/>

                <Button style={{width: '20px', color: '#6e6e6e'}} type="link" onClick={this.handleLegendMenu}>
                    <FontAwesomeIcon icon={faLifeRing} size="lg" style={{marginLeft: '-9px'}}/>
                </Button>

                <div style={{borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '6px', marginRight: '10px', height: '34px'}}/>

                <Button style={{marginRight: '10px', width: '20px'}} type="link" ghost>
                    <FontAwesomeIcon color={'#6e6e6e'} icon={faCalendarAlt} size="lg" style={{marginLeft: '-6px'}}/>
                </Button>
                <Button style={{width: '20px'}} type="link" ghost>
                    <FontAwesomeIcon color={'#6e6e6e'} icon={faAlignJustify} size="lg" style={{marginLeft: '-6px'}}/>
                </Button>

                <div style={{borderLeft: '1px solid rgb(217, 217, 217)', marginLeft: '10px', marginRight: '10px', height: '34px'}}/>

                <Button style={{marginRight: '10px', width: '20px'}} type="link" ghost>
                    <FontAwesomeIcon color={'#6e6e6e'} icon={faPrint} size="lg" style={{marginLeft: '-6px'}}/>
                </Button>


            </div>
        );
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
                                        style={{width: "150px", display: "flex", color: "black", backgroundColor: r.contents[0]['statusColor'] ? r.contents[0]['statusColor'] : "white"}}
                                        title={`${r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}\n${dateFns.format(dateFns.parseISO(r.contents[0]['calendarDate']), "PPpp ",{locale: ru})}\n
[за ${dateFns.format(dateFns.lastDayOfMonth(dateFns.addMonths(this.state.currentMonth, -1)), "P", {locale: ru})}]`}
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
        this.getAllNotificationInstances();
    }

    render() {
        return (
            <MainContext.Consumer>
                { context => (
                    <div className="calendar">
                        {this.renderLegend()}
                        {this.renderHeader()}
                        {this.renderDays()}
                        {this.renderCells(context)}
                    </div>
                )}
            </MainContext.Consumer>
        );
    }
}

export default withTranslation()(Calendar)
