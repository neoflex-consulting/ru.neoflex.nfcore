import React from 'react';
import * as dateFns from "date-fns";
import Ecore, {EObject} from "ecore";
import {API} from "../../modules/api";
import {ru, enUS} from "date-fns/locale";
import {zhCN} from "date-fns/esm/locale";
import {withTranslation} from "react-i18next";
import {MainContext} from "../../MainContext";
import {Button} from "antd";

interface State {
    currentMonth: Date;
    selectedDate: Date;
    notificationStatus: Ecore.EObject[];
    notificationInstancesDTO: Object[];
    globalSettings?: EObject;
    calendarLanguage: string;
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
            calendarLanguage: ""
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
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//NotificationStatus");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((notificationStatus) => {
                        this.setState({notificationStatus})
                    })
            }
        })
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

    renderHeader() {
        const {i18n} = this.props;
        const dateFormat = "LLLL yyyy";
        return (
            <div className="header row flex-middle">
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
                                        style={{width: "150px", display: "flex", color: "black"/*, backgroundColor: r.contents[0]['statusColor'] ? rr.contents[0] : "white"*/}}
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
        this.state.notificationInstancesDTO.filter((r: any) =>
            dateFns.isSameYear(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameMonth(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameDay(day, dateFns.parseISO(r.contents[0]['calendarDate']))
        ).map((r) => temp.push(r));
        return temp;
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
