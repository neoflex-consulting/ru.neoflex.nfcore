import * as React from "react";
import '../../styles/Calendar.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";

class PageNotFound extends React.Component<WithTranslation, any> {

    render() {
        return (
            <Form style={{backgroundColor: '#f3f4fb', textAlign: "center", fontSize: "larger", color: 'rgba(42, 53, 108, 0.75)'}}>
                Page Not Found
            </Form>
        );
    }
}

export default withTranslation()(PageNotFound)
