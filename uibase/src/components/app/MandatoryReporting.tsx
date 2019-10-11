import React from "react";
import CalendarTrans from "./Calendar";
import './../../styles/MandatoryReporting.css';
import {Button, Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";

interface Props {
}

interface State {
}

class MandatoryReporting extends React.Component<Props & WithTranslation, State> {


    render() {
        return (
            <Form style={{backgroundColor: "#fff"}}>
                <div className="headerCalendar">
                    <div>
                        <div id="logo" className="gradient">
                            Обязательная отчетность
                        </div>
                    </div>
                </div>
                <div style={{height: "7vh", backgroundColor: "#fff"}}>
                    <Button style={{textAlign: "right"}}>
                        Редактировать отчеты
                    </Button>
                    </div>
                <div style={{height: "82vh"}}>
                    <CalendarTrans />
                </div>
            </Form>
        );
    }
}

const MandatoryReportingTrans = withTranslation()(MandatoryReporting);
export default MandatoryReportingTrans;
