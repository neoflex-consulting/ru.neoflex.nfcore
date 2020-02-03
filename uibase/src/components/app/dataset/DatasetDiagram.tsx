import * as React from "react";
import {withTranslation, WithTranslation} from 'react-i18next';
import {Col} from 'antd';

interface Props {
}

interface State {
}

class DatasetDiagram extends React.Component<Props & WithTranslation, State> {

    state = {
    };

    componentDidMount(): void {
    }

    render() {
        return (
            <div>
                This is Diagram
            </div>
        )
    }
}

export default withTranslation()(DatasetDiagram)
