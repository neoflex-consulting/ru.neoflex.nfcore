import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {API} from "../modules/api";
import '../styles/App.css'

class FetchSpinner extends React.Component<any | WithTranslation, any> {
    state = {inProgress: false}

    processHandler = (processes: any[]) => {
        this.setState({inProgress: processes.length > 0})
        console.log('FetchSpinner: inProgress=' + (processes.length > 0))
    }

    componentDidMount() {
        API.instance().subscribeProcesses(this.processHandler)
    }

    componentWillUnmount() {
        API.instance().unsubscribeProcesses(this.processHandler)
    }

    render() {
        return this.state.inProgress && <div className="small_loader">
            <div className="small_inner one"/>
            <div className="small_inner two"/>
            <div className="small_inner three"/>
        </div>;
    }
}

export default withTranslation()(FetchSpinner)
