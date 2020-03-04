import * as React from "react";
import {Button} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './../styles/StartPage.css';
import {faEye, faFile, faUser} from "@fortawesome/free-regular-svg-icons";
import {faCogs, faCoins, faCubes, faShieldAlt, faSpa, faWrench} from "@fortawesome/free-solid-svg-icons";
import {faLaravel} from "@fortawesome/free-brands-svg-icons";

interface State {
    icons: {[key:string]: any}
}

export class StartPage extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            icons: {
                'faUser': faUser,
                'faCogs': faCogs,
                'faWrench': faWrench,
                'faLaravel': faLaravel,
                'faShieldAlt': faShieldAlt,
                'faSpa': faSpa,
                'faFile': faFile,
                'faCoins': faCoins,
                'faCubes': faCubes,
                'faEye': faEye
            }
        }
    }

    selectApplication(applicationName: string): void  {
        this.props.context.changeURL!(applicationName)
    }

    render() {
        return (
            <div className="page">
                <div>
                    {
                        this.props.applications.map(
                        (app: any) =>
                            <Button
                                type="primary"
                                style={{background: "rgb(255, 255, 255)", borderColor: "rgb(213, 213, 213)", color: "rgb(18, 18, 18)"}}
                                className="button"
                                onClick={ ()=> this.selectApplication(app.eContents()[0].get('name'))}
                            >
                                <FontAwesomeIcon icon={
                                    app.eContents()[0].get('iconName') === null ?
                                        this.state.icons.faUser : this.state.icons[app.eContents()[0].get('iconName')]
                                } size={"2x"} className="icon-start-page"/>
                                <div className="app-name">
                                    {app.eContents()[0].get('name')}
                                </div>
                                <div className="description">
                                   Описание приложения
                                </div>
                            </Button>
                        )
                    }
                </div>
            </div>
        )
    }

}
