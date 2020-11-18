import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {NeoButton} from "neo-design/lib";
import DatasetGrid from "./app/dataset/DatasetGrid";
import './../styles/DeveloperMain.css'
import ChangeLogView, {ILogEntry} from "./ChangeLogView";
import moment from "moment";

interface Props {
}

interface State {
    logEntries: ILogEntry[]
}


class DeveloperMain extends React.Component<Props & WithTranslation, State> {
    constructor(props: Props & WithTranslation) {
        super(props);
        this.state = {
            logEntries: []
        }
    }


    getLogEntries = () => {
        this.setState({logEntries:[
                {logDateTime:moment('2020-04-01 10:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:40'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:50'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 12:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 14:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-03 23:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
            ]})
    };

    componentDidMount(): void {
        this.getLogEntries();
    }

    render() {
        return (
            <div className={"developer-main"}>
                <div className={"interactive-area"}>
                    <div className={"buttons-bar"}>
                        <NeoButton>{this.props.t('create application')}</NeoButton>
                        <NeoButton>{this.props.t('create application module')}</NeoButton>
                        <NeoButton>{this.props.t('universal editor')}</NeoButton>
                    </div>
                    <div className={"grid-area"}>
                        <DatasetGrid
                            paginationPageSize={40}
                            height={400}
                            rowData = {[]}
                            columnDefs = {[]}
                        />
                    </div>
                </div>
                <div className={"application-changes"}>
                    <ChangeLogView
                        logEntries={this.state.logEntries}
                    />
                </div>
            </div>
        )
    }
}

export default withTranslation()(DeveloperMain)
