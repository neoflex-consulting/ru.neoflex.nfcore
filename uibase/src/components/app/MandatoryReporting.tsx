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

class MandatoryReporting extends React.Component<Props & WithTranslation, State> {

    render() {
        return (
            <Form style={{backgroundColor: "#fff"}}>
                <div className="headerCalendar">
                    <div id="logo" className="gradient">
                        Обязательная отчетность
                    </div>
                </div>
                <StatusLegendTrans/>
                <CalendarTrans />
            </Form>
        );
    }
}

const MandatoryReportingTrans = withTranslation()(MandatoryReporting);
export default MandatoryReportingTrans;
