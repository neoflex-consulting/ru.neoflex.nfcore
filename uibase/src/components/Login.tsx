import * as React from "react";
import {API} from "../modules/api";
import {WithTranslation, withTranslation} from "react-i18next";
import {NeoButton, NeoCol, NeoInput, NeoRow} from "neo-design/lib";
import FetchSpinner from "./FetchSpinner";

export interface Props {
    onLoginSucceed: (principal: any) => void;
}

interface State {
    principal: any | undefined;
    userName: string | undefined;
    password: string | undefined;
    count: number;
    languages: Array<string>;
    waitMinute: boolean;
}

export class Login extends React.Component<any, State> {
    state = {
        principal: undefined,
        userName: undefined,
        password: undefined,
        count: 0,
        languages: [],
        waitMinute: true
    };

    authenticate = () => {
        return API.instance().authenticate(this.state.userName, this.state.password)
            .then((principal) => {
                this.props.onLoginSucceed(principal);
                API.instance().stompConnect(principal.name);
            })
    };

    authenticateIfEnterPress = (e: any) => {
        if (e.keyCode === 13) {
            this.authenticate()
        }
    };

    getLanguages() {
        this.setState({languages: ['US', 'RU']})
    }

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages()
        this.authenticate().catch(() => {
            this.setState({ waitMinute: false })
        })
    }

    render() {
        const { t, i18n } = this.props as Props & WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng.toString().toLowerCase());
        };
        const storeLangValue = String(localStorage.getItem('i18nextLng'))

        return (
            this.state.waitMinute
                ?
                <FetchSpinner/>
                :
                <div className={"backGroundImage"}>
                    <NeoCol className={"firstColumn"}>
                        <div className={"comfort"}><span className={"comfortWord"}>{t('convenient')}</span>{t('system')}</div>
                        <div className={"secondLine"}>{t('taxMonitoring')}</div>
                        <div className={"yellowLineColumn1"}/>
                    </NeoCol>

                    <NeoCol className={"secondColumn"}>
                        {this.state.languages.length !== 0 &&
                        <div className="lang-login">
                            <NeoButton onClick={()=>setLang(storeLangValue==='ru' ? 'en' : 'ru')} type={"link"} className="lang-label">
                                {storeLangValue.toUpperCase()}
                            </NeoButton>
                        </div>
                        }
                        <NeoRow>
                            <div className={"nameOfApp"}>Neoflex Reporting</div>
                        </NeoRow>

                        <NeoRow>
                            <div className={"authorizing"}>{t('authorization')}</div>
                        </NeoRow>
                        <NeoRow className={"Login"}>
                            {t('login')}
                        </NeoRow>
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
                        <NeoRow className={"Password"}>
                            {t('password')}
                        </NeoRow>
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
                        <NeoRow className={"button"} style={{textAlign: "center"}}>
                            <NeoButton key="conbutton" className={"loginButton"}
                                       onClick={this.authenticate}>
                                {t('login')}
                            </NeoButton>
                        </NeoRow>
                        <div className={"yellowLineColumn2"}/>
                    </NeoCol>
                </div>
        )
    }
}

export default withTranslation()(Login)
