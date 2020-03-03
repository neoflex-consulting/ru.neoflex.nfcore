import * as React from "react";
import {Button} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import './../styles/StartPage.css';
import _find from "lodash/find"
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
            icons: {}
        }
    }

    selectApplication(applicationName: string): void  {
        this.props.context.changeURL!(applicationName)
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.applications.length === 0 && this.props.applications.length !== 0) {this.importIcons()}
    }

    importIcons(): void {
        const icons: { [key: string]: any } = {};
        const appLength = this.props.applications.length;
        let counter = 0;
        this.props.applications.map( (app:any) => {
            const prefix = app.eContents()[0].get('iconPrefix') === null ? 'far' : app.eContents()[0].get('iconPrefix')
            const name = app.eContents()[0].get('iconName') === null ? 'faUser' : 'fa' + app.eContents()[0].get('iconName').charAt(0).toUpperCase() + app.eContents()[0].get('iconName').slice(1)

            if (prefix === 'far') {
                import (`@fortawesome/free-regular-svg-icons/${name}`).then( (importedIcon) => {
                    icons[name] = importedIcon[name]
                    counter += 1
                    if (appLength === counter) {this.setState({ icons })}
                })
            }
            else if (prefix === 'fas') {
                import (`@fortawesome/free-solid-svg-icons/${name}`).then( (importedIcon) => {
                    icons[name] = importedIcon[name]
                    counter += 1
                    if (appLength === counter) {this.setState({ icons })}
                })
            }
            else if (prefix === 'fab') {
                import (`@fortawesome/free-brands-svg-icons/${name}`).then( (importedIcon) => {
                    icons[name] = importedIcon[name]
                    counter += 1
                    if (appLength === counter) {this.setState({ icons })}
                })
            }
        })
    }

    render() {
        return (
            <div className="page">
                <div>
                    {
                        this.state.icons.faUser !== undefined && this.props.applications.map(
                        (app: any) =>
                            <Button
                                className="button"
                                onClick={ ()=> this.selectApplication(app.eContents()[0].get('name'))}
                            >
                                <FontAwesomeIcon icon={
                                    _find(this.state.icons, (iconRes:any)=> {
                                        return (
                                            iconRes.prefix === (app.eContents()[0].get('iconPrefix') === null ? 'far' : app.eContents()[0].get('iconPrefix'))
                                            &&
                                            iconRes.iconName === (app.eContents()[0].get('iconName') === null ? 'user' : app.eContents()[0].get('iconName')))
                                         })
                                } size={"2x"} className="icon"/>

                                <FontAwesomeIcon icon={faUser} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faCogs} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faWrench} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faLaravel} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faShieldAlt} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faSpa} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faFile} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faCoins} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faCubes} size={"2x"} className="icon"/>
                                <FontAwesomeIcon icon={faEye} size={"2x"} className="icon"/>


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
