import * as React from "react";
import '../../styles/Calendar.css';
import {Form} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";

class PageNotFound extends React.Component<WithTranslation, any> {

    render() {
        return (
            <Form>
                Page Not Found
            </Form>
        );
    }
}

export default withTranslation()(PageNotFound)
