import * as React from "react";
import {Button} from "antd";
import {WithTranslation} from "react-i18next";

export interface Props {
}

interface State {
}

class Report extends React.Component<Props, State> {
    state = {
    };

    render() {
        const {t} = this.props as Props & WithTranslation;
        return (
            <div>
                <Button onClick={this.onPress}>{t('delete')}</Button>
                <Button onClick={this.onPress}>{t('application.caption', {ns: 'packages'})}</Button>
            </div>
        )
    }

    onPress = () => {
        console.info('Clicked');
    }
}

export default Report
