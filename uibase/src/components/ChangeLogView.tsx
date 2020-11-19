import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import './../styles/ChangeLogView.css'
import moment, {Moment} from "moment";
import {defaultDateFormat } from "../utils/consts";
import {NeoColor, NeoParagraph} from "neo-design/lib";

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
                    <NeoParagraph type={"h3_medium"} style={{color:NeoColor.violete_5}}>{this.props.t('change log')}</NeoParagraph>
                </div>
                {splitEntriesByDays(this.props.logEntries).map(de => {
                    return <div className={"log-day"}>
                        <NeoParagraph type={"capture_regular"} style={{color:NeoColor.violete_5}}>{`${de.date.format('DD.MM.YYYY')}`}</NeoParagraph>
                        {de.entries.map(e=>{
                        return <div className={"log-day-entry"}>
                            <div>
                                <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_5}}>{e.logDateTime.format('HH:mm')}</NeoParagraph>
                                <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_5}}>{e.author}</NeoParagraph>
                            </div>
                            <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_9}}>{e.change}</NeoParagraph>
                        </div>
                    })}</div>
                })}
            </div>
        )
    }
}

export default withTranslation()(ChangeLogView)
