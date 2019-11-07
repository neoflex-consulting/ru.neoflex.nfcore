import * as React from "react";
import { Icon, Dropdown, Menu } from 'antd'
import { API } from "../modules/api";
import logo from '../logo.png';
import pony from '../pony.png';
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

    surprise = () => {
        this.state.count === undefined ?
            this.setState({ count: 1 }) :
            this.state.count < 10 ? this.setState({ count: this.state.count + 1 }) :
                this.state.count === 10 ? this.setState({ images: pony, count: 0 }) :
                    this.setState({ count: 0 })
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
                        resources.map((r) => {
                            prepared.push(r.eContents()[0].get('name'))
                            this.importLangIcon(r.eContents()[0].get('name'))
                        });
                        this.setState({languages: prepared.sort()})
                    })
            }
        })
    }

    importLangIcon(lang:string){
        const langIcons: { [key: string]: any } = this.state.langIcons
        import (`flag-icon-css/flags/1x1/${lang}.svg`).then((importedModule)=> { 
            langIcons[lang] = importedModule 
            this.setState({ langIcons })
        });
    }

    componentDidMount(): void {
        if (!this.state.languages.length) this.getLanguages()
        this.authenticate().catch(() => {
            this.setState({ waitMinute: false })
        })


    }

    render() {
        const langIcons: { [key: string]: any } = this.state.langIcons
        const { t, i18n } = this.props as Props & WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng);
        };

        const langMenu = () => <Menu>
            {_map(this.state.languages, (lang:any, index:number)=>
                <Menu.Item onClick={()=>setLang(index)} key={index} style={{ width: '60px' }}>
                    <img style={{ borderRadius: '25px' }} alt='li' src={langIcons[lang] && langIcons[lang].default} />
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
                        <img className="lang-icon" alt='li' src={langIcons[storeLangValue] || langIcons['us']} />
                    </Dropdown>
                </div>
            )
        }
    }

    
}

export default withTranslation()(Login)
