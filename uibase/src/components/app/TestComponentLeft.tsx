import * as React from "react";
import CalendarTrans from "./Calendar";
import './../../styles/MandatoryReporting.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import StatusLegendTrans from "./StatusLegend";

interface Props {
}

interface State {
}

class TestComponentLeft extends React.Component<WithTranslation, any> {

    render() {
        return (
            <Form>
                TestComponentLeft
            </Form>
        );
    }
}

const TestComponentLeftTrans = withTranslation()(TestComponentLeft);
export default TestComponentLeftTrans;
