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

                <Col span={12} style={{backgroundColor: "red"}}>
                    Первая колонка
                </Col>
                <Col span={12} style={{backgroundColor: "blue"}}>
                    Вторая колонка
                </Col>




                <Col span={12} style={{backgroundColor: "red"}}>
                    Первая колонка
                </Col>
                <Col span={11} style={{backgroundColor: "blue"}}>
                    Вторая колонка
                </Col>

            </div>
        )
    }
}

export default withTranslation()(DatasetDiagram)
