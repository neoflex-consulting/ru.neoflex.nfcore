import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import './../styles/ChangeLogView.css'
import moment, {Moment} from "moment";
import {defaultDateFormat } from "../utils/consts";

export interface ILogEntry {
    logDateTime: Moment,
    author: string,
    change: string
}

interface Props {
    logEntries: ILogEntry[]
}

interface State {
}

function splitEntriesByDays(logEntries: ILogEntry[]): {date: Moment, entries: ILogEntry[]}[] {
    let entriesByDates:any[] = [];
    let date = moment('1900-01-01');
    let entries:ILogEntry[] = [];
    logEntries.forEach(l=>{
        if (date.format(defaultDateFormat) !== l.logDateTime.format(defaultDateFormat)) {
            date = l.logDateTime;
            entries = [l];
            entriesByDates.push({
                date: date,
                entries: entries
            })
        } else {
            entries.push(l)
        }
    });
    return entriesByDates;
}

class ChangeLogView extends React.Component<Props & WithTranslation, State> {
    render() {
        return (
            <div className={"change-log"}>
                <div className={"change-log-header"}>
                    <span>{this.props.t('change log')}</span>
                </div>
                {splitEntriesByDays(this.props.logEntries).map(de => {
                    return <div className={"log-day"}><span>{`${de.date.format('DD.MM.YYYY')}`}</span>{de.entries.map(e=>{
                        return <div className={"log-day-entry"}>
                            <div>
                                <span>{e.logDateTime.format('HH:mm')}</span>
                                <span>{e.author}</span>
                            </div>
                            <span>{e.change}</span>
                        </div>
                    })}</div>
                })}
            </div>
        )
    }
}

export default withTranslation()(ChangeLogView)
