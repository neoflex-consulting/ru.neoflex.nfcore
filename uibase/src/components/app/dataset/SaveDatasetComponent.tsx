import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {Button, Modal} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave} from "@fortawesome/free-regular-svg-icons";

interface Props {
}

interface State {

}

class SaveDatasetComponent extends React.Component<any, any> {

    state = {

    };

    saveResource(): void {

    }

    render() {
        const { t } = this.props;

        return (
            <div>dddd




                <Button title={t('save')} style={{ width: '45px', color: 'rgb(151, 151, 151)'}} onClick={() => this.saveResource()}>
                    <FontAwesomeIcon icon={faSave} size='1x'/>
                </Button>
            </div>

        )
    }
}

export default withTranslation()(SaveDatasetComponent)
