import * as React from "react";
import {Button} from "antd";
import {faUser} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface State {
}

export class StartPage extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {}
    }

    selectApplication(applicationName: string): void  {
        this.props.context.changeURL!(applicationName)
    }

    render() {
        return (
            <div style={{backgroundColor: 'rgb(250, 250, 250)', height: '100%', textAlign: 'center'}}>
                <div>
                    {
                        this.props.applications.map(
                        (app: any, index: any) =>
                            <Button
                                style={{
                                    color: 'rgb(18, 18, 18)',
                                    width: '220px',
                                    marginLeft: index !== 0 ? '30px' : '0px',
                                    height: '290px',
                                    background: 'rgb(255, 255, 255)',
                                    border: '1px solid rgb(213, 213, 213)',
                                    fontWeight: 600,
                                    fontSize: 'large',
                                    whiteSpace: 'pre-line'
                                }}
                                onClick={ ()=> this.selectApplication(app)}
                            >
                                <FontAwesomeIcon icon={faUser} size={"2x"}
                                                 style={{
                                                     color: 'silver',
                                                     marginBottom: '100px',
                                                     marginTop: '-50px'
                                                 }}
                                />

                                <div style={{marginTop: '-60px'}}>
                                    {app}
                                </div>
                                <div style={{marginTop: '25px', fontSize: "smaller", fontWeight: 400}}>
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
