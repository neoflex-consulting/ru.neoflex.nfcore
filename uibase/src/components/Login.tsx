import * as React from "react";
import { Icon, Dropdown, Menu } from 'antd'
import { API } from "../modules/api";
import logo from '../logo.png';
import { WithTranslation, withTranslation } from "react-i18next";
import _map from "lodash/map"
import Ecore from "ecore";


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
    langIcons: { [key: string]: any };
}

export class Login extends React.Component<Props & WithTranslation, State> {
    state = {
        principal: undefined,
        userName: undefined,
        password: undefined,
        waitMinute: true,
        count: 0,
        images: logo,
        languages: [],
        langIcons: {}
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
        const prepared: Array<string> = [];
        API.instance().fetchAllClasses(false).then(classes => {
            const temp = classes.find((c: Ecore.EObject) => c._id === "//Lang");
            if (temp !== undefined) {
                API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                    .then((resources) => {
                        resources.forEach((r) => {
                            prepared.push(r.eContents()[0].get('name'))
                        });
                        this.setState({languages: prepared.sort()})
                    })
            }
        })
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
            i18n.changeLanguage(lng);
        };
        const storeLangValue = String(localStorage.getItem('i18nextLng'))

        const langMenu = () => <Menu>
            {_map(languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(lang)} key={index} style={{ width: '60px' }}>
                    <span style={{ fontVariantCaps: 'petite-caps' }}>{lang}</span>
                </Menu.Item>
            )}
        </Menu>

        if (this.state.waitMinute) {
            return (
                <div className="loader">
                    <div className="inner one"></div>
                    <div className="inner two"></div>
                    <div className="inner three"></div>
                </div>
            )
        }
        else {
            return (
                <div>
                    <div className="login-box">
                        <div className="app-logo" style={{ width: '100%', paddingRight: '20px', textAlign: 'center' }}>
                            <Icon type='appstore' style={{ color: '#1890ff', marginRight: '2px', marginLeft: '10px' }} />
                            <span style={{ fontVariantCaps: 'petite-caps' }}>{t('appname')}</span>
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
                    </div>
                    {this.state.languages.length !== 0 && <Dropdown className="language-menu" overlay={langMenu} placement="bottomCenter">
                        <div className="lang-label-login" style={{ fontVariantCaps: 'petite-caps' }}>
                            {languages[storeLangValue] ? languages[storeLangValue] : 'EN'}
                        </div>
                    </Dropdown>}
                </div>
            )
        }
    }

    
}

export default withTranslation()(Login)
