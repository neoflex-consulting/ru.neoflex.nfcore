import * as React from "react";
import Calendar from "./Calendar";
import './../../styles/MandatoryReporting.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import StatusLegend from "./StatusLegend";

interface Props {
}

interface State {
}

class TaxReporting extends React.Component<WithTranslation, any> {

    render() {
        const {t} = this.props;
        return (
            <Form>
                <div className="headerCalendar col-text">
                    <div id="logo">
                        {t('taxreporting')}
                    </div>
                </div>
                <StatusLegend />
                <Calendar reporting={2}/>
            </Form>
        );
    }
}

export default withTranslation()(TaxReporting)
