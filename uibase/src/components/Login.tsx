import * as React from "react";
import { Icon, Dropdown, Menu } from 'antd'
import { API } from "../modules/api";
import logo from '../logo.png';
import pony from '../pony.png';
import { WithTranslation, withTranslation } from "react-i18next";
import _map from "lodash/map"

import ru from 'flag-icon-css/flags/1x1/ru.svg';
import en from 'flag-icon-css/flags/1x1/us.svg';
import cn from 'flag-icon-css/flags/1x1/cn.svg';

const langIcon: {[key:string]: any} = {
    'en': en,
    'ru': ru,
    'cn': cn
}

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
}

export class Login extends React.Component<Props & WithTranslation, State> {
    state = {
        principal: undefined,
        userName: undefined,
        password: undefined,
        waitMinute: true,
        count: 0,
        images: logo
    };


    componentDidMount(): void {
        this.authenticate().catch(() => {
            this.setState({ waitMinute: false })
        })
    }

    surprise = () => {
        this.state.count === undefined ?
            this.setState({ count: 1 }) :
            this.state.count < 10 ? this.setState({ count: this.state.count + 1 }) :
                this.state.count === 10 ? this.setState({ images: pony, count: 0 }) :
                    this.setState({ count: 0 })
    };

    render() {
        const { t, i18n } = this.props as Props & WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng);
        };

        const langMenu = () => <Menu>
            {_map(langIcon, (iconRes:any, index:number)=>
                <Menu.Item onClick={()=>setLang(index)} key={index} style={{ width: '60px' }}>
                    <img style={{ borderRadius: '25px' }} alt='language' src={iconRes} />
                </Menu.Item>
            )}
        </Menu>

        const storeLangValue = String(localStorage.getItem('i18nextLng'))

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
                            <span style={{ fontVariantCaps: 'petite-caps' }}>Neoflex CORE</span>
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
                    <Dropdown className="language-menu" overlay={langMenu} placement="bottomCenter">
                        <img className="lang-icon" alt='language' src={langIcon[storeLangValue] || 'en'} />
                    </Dropdown>
                </div>
            )
        }
    }

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
}

export default withTranslation()(Login)
