import React from "react";
import './../../styles/MandatoryReporting.css';
import {Button, notification, Tag} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {API} from "../../modules/api";
import Ecore from "ecore";

interface Props {
}

interface State {
    ReportStatus: Ecore.EObject[];
}

class StatusLegend extends React.Component<Props & WithTranslation, State> {

    state = {
        ReportStatus: []
    };

    getAllStatuses() {
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//ReportStatus");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((statuses) => {
                        this.setState({ReportStatus: statuses})
                    })
            }
        })
    };

    EditReportStatuses(): void {
    }

    componentDidMount(): void {
        this.getAllStatuses();
    }

    render() {
        const stat: { push(div: any): void } = [];
        this.state.ReportStatus.map(
            (status: any) =>
            stat.push(
                <div>
                    <Tag style={{
                        display: "table-caption",
                        width: "300px",
                        textAlign: "left",
                        backgroundColor: `${status.eContents()[0].get('color')}`,
                    }}
                    >
                        {status.eContents()[0].get('name')}
                    </Tag>
                </div>
            )
        );
        return (
            <div>
                <Button
                    onClick = { () => {
                        let btnCloseAll = (<Button type="link" size="small" onClick={() => notification.destroy()}>
                            Close All
                        </Button>);
                        let btnEdit = (<Button type="link" size="small" onClick={() => this.EditReportStatuses}>
                            Edit
                        </Button>);
                        notification.open({
                            message: "Легенда",
                            description: stat,
                            duration: 0,
                            key: "single",
                            btn: [btnEdit, btnCloseAll],
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
