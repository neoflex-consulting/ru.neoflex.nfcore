import * as React from "react";
import {Col, Dropdown, Menu, Row} from 'antd'
import { API } from "../modules/api";
import logo from '../icons/logo.png';
import { WithTranslation, withTranslation } from "react-i18next";
import _map from "lodash/map"
import pony from '../icons/pony.png';
import authorizationIcon from '../icons/authorization.jpg';
import {NeoButton} from "neo-design/lib";

export interface Props {
    onLoginSucceed: (principal: any) => void;
}

interface State {
    principal: any | undefined;
    userName: string | undefined;
    password: string | undefined;
    waitMinute: boolean;
    count: number;
    images: any;
    languages: Array<string>;
}

export class Login extends React.Component<any, State> {
    state = {
        principal: undefined,
        userName: undefined,
        password: undefined,
        waitMinute: true,
        count: 0,
        images: logo,
        languages: [],
    };

    authenticate = () => {
        return API.instance().authenticate(this.state.userName, this.state.password)
            .then((principal) => {
                this.props.onLoginSucceed(principal)
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

        const langMenu = () => <Menu style={{ marginTop: '24px', color: 'black' }}>
            {_map(languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={lang} style={{ width: '60px', backgroundColor: '#fdfdfd' }}>
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
                <div>
                    <Col span={11} style={{zIndex: 10}}>
                        <div style={{background: "#20326F", height: "188px"}}>
                            <div className={"comfort"}><span className={"comfortWord"}>Удобная</span> система</div>
                            <div className={"secondLine"}>Налогового мониторинга</div>
                        </div>
                        <img src={authorizationIcon} style={{width: "100%", position: "absolute", height: "565px"}}/>

                        <Row style={{background: "#20326F", height: "2px"}}>

                        </Row>

                    </Col>
                    <Col span={13} style={{background: "#F2F2F2", height: "750px", zIndex: 100}}>
                        <Row>
                            <div className={"nameOfApp"}>Neoflex Reporting</div>
                        </Row>

                        <Row>
                            <div className={"authorizing"}>Авторизация</div>
                        </Row>
                        <Row className={"Login"} style={{textAlign: "center" , marginRight: "330px"}}>
                                Логин
                        </Row>
                        <div className={"inputLogin"}>
                            <input
                                autoFocus
                                className="input-login"
                                key="user"
                                /*placeholder={t('username')}*/
                                onChange={e => {
                                    this.setState({ userName: e.target.value })
                                }}
                                onKeyUp={this.authenticateIfEnterPress}
                            />
                            </div>
                        <Row className={"Password"} style={{textAlign: "center" , marginRight: "323px"}}>
                                Пароль
                        </Row>
                        <div className={"inputPassword"}>
                            <input
                                className="input-login"
                                key="pass"
                                type="password"
                                /*placeholder={t('password')}*/
                                onChange={e => {
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
                        {/*<Row className={"login-button"}>
                            <NeoButton key="conbutton" className={"loginButton"}
                                    onClick={this.authenticate}>
                                {t('login')}
                            </NeoButton>
                        </Row>*/}




                    {/*<div className="login-box">
                        <div className="app-logo" style={{ width: '100%', textAlign: 'center' }}>
                            <img alt={t('notfound')} src={pony} style={{ height: '45px', width: '55px', marginRight: '10px', marginBottom: '10px' }}/>
                            <span style={{ fontVariantCaps: 'normal' }}>{t('appname')}</span>
                        </div>
                        <div className="login-form">
                            <input
                                autoFocus
                                className="input-login"
                                key="user"
                                placeholder={t('username')}
                                onChange={e => {
                                    this.setState({ userName: e.target.value })
                                }}
                                onKeyUp={this.authenticateIfEnterPress}
                            />
                            <input
                                className="input-login"
                                key="pass"
                                type="password"
                                placeholder={t('password')}
                                onChange={e => {
                                    this.setState({ password: e.target.value })
                                }}
                                onKeyUp={this.authenticateIfEnterPress}
                            />
                            <button key="conbutton" className="login-button"
                                onClick={this.authenticate}>
                                {t('login')}
                            </button>
                        </div>
                        {this.state.languages.length !== 0 &&
                        <Dropdown overlay={langMenu} placement="bottomCenter">
                            <div className="lang-label-login" style={{ fontVariantCaps: 'petite-caps', color: 'black' }}>
                                {languages.includes(storeLangValue.toUpperCase()) ? storeLangValue.toUpperCase() : 'US'}
                            </div>
                        </Dropdown>
                        }
                    </div>*/}

                    </Col>
                </div>
            )
        }
    }

    
}

export default withTranslation()(Login)
