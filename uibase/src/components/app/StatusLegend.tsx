import React from "react";
import './../../styles/MandatoryReporting.css';
import {Button, Form, notification, Tag} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {colorList, statues} from "../../utils/consts";

interface Props {
}

interface State {
}

class StatusLegend extends React.Component<Props & WithTranslation, State> {

    selectStatusColor = (status: string): any => {
        let colorButton: any;
        colorList
            .filter( (c:{ [key:string]: any }) => c[`${status}`] && c[`${status}`].status === status)
            .map( (c:{ [key:string]: any }) => colorButton = c[`${status}`].color);
        return colorButton;
    };

    render() {
        const stat: { push(div: any): void } = [];
        statues.filter( status =>
            stat.push(
                <div>
                    <Tag style={{
                        display: "table-caption",
                        width: "300px",
                        textAlign: "left",
                        backgroundColor: `${this.selectStatusColor(status)}`,
                    }}
                    >
                        {status}
                    </Tag>
                </div>
            )
        );
        return (
            <div>
                <Button
                    onClick = { () => {
                        let btn = (<Button type="link" size="small" onClick={() => notification.destroy()}>
                            Close All
                        </Button>);
                        notification.open({
                            message: "Легенда",
                            description: stat,
                            duration: 0,
                            key: "single",
                            btn,
                            style: {
                                width: 400,
                                marginLeft: -10,
                                marginTop: 16,
                                wordWrap: "break-word"
                            },
                        })}}
                    style={{width: "300px"}}
                >
                    Легенда
                </Button>
            </div>
        )
    }
}

const StatusLegendTrans = withTranslation()(StatusLegend);
export default StatusLegendTrans;
