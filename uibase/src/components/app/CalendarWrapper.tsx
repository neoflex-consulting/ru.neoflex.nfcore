import React from "react";
import Calendar from "./Calendar";
import './../../styles/MandatoryReporting.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import StatusLegend from "./StatusLegend";

interface Props {
}

interface State {
}

class CalendarWrapper extends React.Component<any, any> {

    render() {
        const {t} = this.props;
        return (
            <Form>
                <Calendar {...this.props}/>
            </Form>
        );
    }
}

export default withTranslation()(CalendarWrapper)
