import React from 'react';
import * as dateFns from "date-fns";
import Ecore from "ecore";
import {API} from "../../modules/api";
import {ru} from "date-fns/locale";
import {Button, notification, Tag} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {colorList, statues} from '../../utils/consts'

interface State {
    currentMonth: Date;
    selectedDate: Date;
    Reports: Ecore.EObject[];
    calendarLanguage: string;
}

interface Props {
}

class Calendar extends React.Component<Props & WithTranslation, State> {

    state = {
        currentMonth: new Date(),
        selectedDate: new Date(),
        Reports: [],
        calendarLanguage: "",
    };

    getAllReports() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Report");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((resources) => {
                        this.setState({Reports: resources})
                    })
            }
        })
    };

    renderHeader() {
        const dateFormat = "LLLL yyyy";
        return (
            <div className="header row flex-middle">
                <div className="col col-start">
                    <div className="icon" onClick={this.prevMonth}>
                        chevron_left
                    </div>
                </div>
                <div className="col col-center">
        <span className="gradient">
            {dateFns.format(this.state.currentMonth, dateFormat, {locale: ru})}
        </span>
                </div>
                <div className="col col-end" onClick={this.nextMonth}>
                    <div className="icon">chevron_right</div>
                </div>
            </div>
        );
    }

    renderDays() {
        const dateFormat = "EEEE";
        const days = [];
        let startDate = dateFns.startOfWeek(this.state.currentMonth, {locale: ru});
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i}
                     className="col col-center gradient"
                >
                    <b>{dateFns.format(dateFns.addDays(startDate, i), dateFormat, {locale: ru})}</b>
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    }

    renderCells() {
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
                let temp = this.getReports(day);
                formattedDate = dateFns.format(day, dateFormat);
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
                        <span className="bg">{formattedDate}</span>
                        <div>
                            {temp.length !== 0
                                ?
                                temp.map( (t: any) =>
                                        <Button
                                            key={`${t.eContents()[0].get('name')}`}
                                            onClick={this.onReportClick} size="small"
                                                style={{display: 'block', backgroundColor: this.selectStatusColor(t.eContents()[0].get('status'))}}
                                                title={`${t.eContents()[0].get('name')}\n${dateFns.format(dateFns.parseISO(t.eContents()[0].get('date')), "PPpp ",{locale: ru})}\n
[за ${dateFns.format(dateFns.lastDayOfMonth(dateFns.addMonths(this.state.currentMonth, -1)), "P", {locale: ru})}]`}
                                        >
                                            {t.eContents()[0].get('name')}
                                        </Button>
                                ) : ""}
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

    private getReports(day: any) {
        let temp: any = [];
        this.state.Reports.filter((r: any) =>
            dateFns.isSameYear(day, dateFns.parseISO(r.eContents()[0].get('date')))
            && dateFns.isSameMonth(day, dateFns.parseISO(r.eContents()[0].get('date')))
            && dateFns.isSameDay(day, dateFns.parseISO(r.eContents()[0].get('date')))
        ).map((r) => temp.push(r));
        return temp;
    }

    selectStatusColor = (status: string): any => {
        let colorButton: any;
        colorList
            .filter( (c:{ [key:string]: any }) => c[`${status}`] && c[`${status}`].status === status)
            .map( (c:{ [key:string]: any }) => colorButton = c[`${status}`].color);
        return colorButton;
    };

    onReportClick = () => {};

    onDateClick = (day: any) => {
        this.setState({
            selectedDate: day
        });
    };

    nextMonth = () => {
        this.setState({
            currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
        });
    };
    prevMonth = () => {
        this.setState({
            currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
        });
    };


    componentDidMount(): void {
        this.getAllReports();
    }

    render() {
        return (
            <div className="calendar">
                {this.renderHeader()}
                {this.renderDays()}
                {this.renderCells()}
            </div>
        );
    }
}

const CalendarTrans = withTranslation()(Calendar);
export default CalendarTrans;
