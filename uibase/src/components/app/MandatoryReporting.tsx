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

class MandatoryReporting extends React.Component<WithTranslation, any> {

    render() {
        const {t} = this.props;
        return (
            <Form>
                <div className="headerCalendar col-text">
                    <div id="logo">
                        {t('mandatoryreporting')}
                    </div>
                </div>
                <StatusLegend />
                <Calendar {...this.props} reporting={1}/>
            </Form>
        );
    }
}

export default withTranslation()(MandatoryReporting)
