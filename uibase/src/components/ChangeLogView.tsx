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
    logEntries: ILogEntry[],
    className?: string,
    hidden?: boolean,
    disabled?: boolean,
    style?: {[key:string]: string|number}
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
            <div className={`change-log ${this.props.className}`} hidden={this.props.hidden} aria-disabled={this.props.disabled} style={this.props.style}>
                <div className={"change-log-header"}>
                    <NeoParagraph type={"h3_medium"} style={{color:NeoColor.violete_5}}>{this.props.t('change log')}</NeoParagraph>
                </div>
                <div className={"change-log-body"}>
                {splitEntriesByDays(this.props.logEntries).map((de, index) => {
                    return <div className={"log-day"} key={`day${index}`}>
                        <NeoParagraph type={"capture_regular"} style={{color:NeoColor.violete_5}}>{`${de.date.format('DD.MM.YYYY')}`}</NeoParagraph>
                        {de.entries.map((e, eIndex)=>{
                        return <div className={"log-day-entry"} key={`entry${eIndex}`}>
                            <div>
                                <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_5}}>{e.logDateTime.format('HH:mm')}</NeoParagraph>
                                <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_5}}>{e.author}</NeoParagraph>
                            </div>
                            <NeoParagraph type={"capture_regular"} style={{color:NeoColor.grey_9}}>{e.change}</NeoParagraph>
                        </div>
                    })}</div>
                })}
                </div>
            </div>
        )
    }
}

export default withTranslation()(ChangeLogView)
