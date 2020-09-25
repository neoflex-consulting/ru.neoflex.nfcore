import * as React from "react";
import {Col, Dropdown, Menu, Row} from 'antd'
import { API } from "../modules/api";
import { WithTranslation, withTranslation } from "react-i18next";
import _map from "lodash/map"
import {NeoButton, NeoInput} from "neo-design/lib";

export interface Props {
    onLoginSucceed: (principal: any) => void;
}

interface State {
    principal: any | undefined;
    userName: string | undefined;
    password: string | undefined;
    waitMinute: boolean;
    count: number;
    languages: Array<string>;
}

export class Login extends React.Component<any, State> {
    state = {
        principal: undefined,
        userName: undefined,
        password: undefined,
        waitMinute: true,
        count: 0,
        languages: [],
    };

    authenticate = () => {
        return API.instance().authenticate(this.state.userName, this.state.password)
            .then((principal) => {
                this.props.onLoginSucceed(principal);
                // API.instance().stompConnect();
            })
    };

    authenticateIfEnterPress = (e: any) => {
        if (e.keyCode === 13) {
            this.authenticate()
        }
    };

    getLanguages() {
        this.setState({languages: ['US', 'RU', 'CN']})
    }

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages()
        this.authenticate().catch(() => {
            this.setState({ waitMinute: false })
        })
    }

    render() {
        const languages: { [key: string]: any } = this.state.languages
        const { t, i18n } = this.props as Props & WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng.toString().toLowerCase());
        };
        const storeLangValue = String(localStorage.getItem('i18nextLng'))

        const langMenu = () => <Menu style={{ marginTop: '5px', color: 'black' }}>
            {_map(languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={lang} style={{ width: '25px', backgroundColor: '#fdfdfd', marginRight: "20px" }}>
                    <span style={{ fontVariantCaps: 'petite-caps', color: 'black' }}>{lang}</span>
                </Menu.Item>
            )}
        </Menu>;

        if (this.state.waitMinute) {
            return (
                <div className="loader">
                    <div className="inner one"/>
                    <div className="inner two"/>
                    <div className="inner three"/>
                </div>
            )
        }
        else {
            return (
                <div className={"backGroundImage"}>
                    <Col className={"firstColumn"}>
                            <div className={"comfort"}><span className={"comfortWord"}>Удобная</span> система</div>
                            <div className={"secondLine"}>Налогового мониторинга</div>
                            <div className={"yellowLineColumn1"}/>
                    </Col>


                    <Col className={"secondColumn"}>
                        {this.state.languages.length !== 0 &&
                        <Dropdown overlay={langMenu} placement="bottomCenter">
                            <div className="lang-login">
                                {languages.includes(storeLangValue.toUpperCase()) ? storeLangValue.toUpperCase() : 'US'}
                            </div>
                        </Dropdown>
                        }
                        <Row>
                            <div className={"nameOfApp"}>Neoflex Reporting</div>
                        </Row>

                        <Row>
                            <div className={"authorizing"}>Авторизация</div>
                        </Row>
                        <Row className={"Login"}>
                                Логин
                        </Row>
                        <div className={"inputLogin"}>
                            <NeoInput
                                autofocus
                                className="input-login"
                                key="user"
                                onChange={(e: any) => {
                                    this.setState({ userName: e.target.value })
                                }}
                                onKeyUp={this.authenticateIfEnterPress}
                            />
                            </div>
                        <Row className={"Password"}>
                                Пароль
                        </Row>
                        <div className={"inputPassword"}>
                            <NeoInput
                                password
                                className="input-login"
                                key="pass"
                                onChange={(e: any) => {
                                    this.setState({ password: e.target.value })
                                }}
                                onKeyUp={this.authenticateIfEnterPress}
                            />
                        </div>
                        <Row className={"button"} style={{textAlign: "center"}}>
                        <NeoButton key="conbutton" className={"loginButton"}
                                   onClick={this.authenticate}>
                            {t('login')}
                        </NeoButton>
                        </Row>
                        <div className={"yellowLineColumn2"}/>
                    </Col>
                </div>
            )
        }
    }

    
}

export default withTranslation()(Login)
