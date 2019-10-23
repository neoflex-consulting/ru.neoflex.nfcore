import React from "react";
import CalendarTrans from "./Calendar";
import './../../styles/MandatoryReporting.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import StatusLegendTrans from "./StatusLegend";

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
                <StatusLegendTrans />
                <CalendarTrans />
            </Form>
        );
    }
}

const MandatoryReportingTrans = withTranslation()(MandatoryReporting);
export default MandatoryReportingTrans;
