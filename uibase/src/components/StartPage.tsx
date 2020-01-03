import * as React from "react";
import {Layout} from "antd";
import CheckableTag from "antd/lib/tag/CheckableTag";

interface State {
}

export class StartPage extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
        }
    }

    selectApplication(applicationName: string): void  {
        const path = btoa(
            encodeURIComponent(
                JSON.stringify(
                    [{
                        appModule: applicationName,
                        tree: [],
                        params: {}
                    }]
                )
            )
        );
        this.props.history.push(`/app/${path}`);
    }

    render() {
        const applications: { push(div: any): void } = [];
        if (this.props.applications) {
            this.props.applications.every(
                (app: any) =>
                    applications.push(
                        <div style={{
                            display: "table-caption",
                            width: "300px",
                            textAlign: "left",
                        }}>
                            <CheckableTag checked={true} onChange={ e => this.selectApplication(app.eContents()[0].get('name'))}
                            >
                                {app.eContents()[0].get('name')}
                            </CheckableTag>
                        </div>
                    )
            )
        }

        return (
            <Layout>
                {applications}
            </Layout>
        )
    }

}
