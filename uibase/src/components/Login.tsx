import * as React from "react";
import {Button, Col, Layout, Row} from 'antd'
import {API} from "../modules/api";
import logo from '../logo.png';
import pony from '../pony.png';
import {WithTranslation, withTranslation} from "react-i18next";

const { Header, Content } = Layout;

export interface Props {
    onLoginSucceed: (principal: any)=>void;
}

interface State {
    principal: any|undefined;
    userName: string|undefined;
    password: string|undefined;
    waitMinute: boolean;
    count: number;
    images: any;
}

export class Login extends React.Component<Props & WithTranslation, State> {
    state = {principal: undefined,
        userName: undefined,
        password: undefined,
        waitMinute: true,
        count: 0,
        images: logo
    };


    componentDidMount(): void {
        this.authenticate().catch(()=>{
            this.setState({waitMinute: false})
        })
    }

    surprise = () => {
        this.state.count === undefined ?
            this.setState({count: 1}) :
            this.state.count < 10 ? this.setState({count: this.state.count + 1}) :
                this.state.count === 10 ? this.setState({images: pony, count: 0}) :
                    this.setState({count: 0})
    };

    render() {
        const {t, i18n} = this.props as Props & WithTranslation;
        const setLang = (lng: any) => {
            i18n.changeLanguage(lng);
        };
        if (this.state.waitMinute) {
            return (
                <div className="loader"/>
            )
        }
        else {
            return (
                <div>
                    <Layout>
                        <Header style={{height: '30vh', backgroundColor: '#ffffff'}}>
                            <Row type="flex" justify="space-between">
                                <Col span={1}>
                                    <img alt="Not found" src={this.state.images} className="logo" onClick={this.surprise}/>
                                </Col>
                                <Col>
                                    <Button onClick={() => {
                                        i18n.language === ('ru') ? setLang('en') : setLang('ru')}}>
                                        {i18n.language}
                                    </Button>
                                </Col>
                            </Row>
                        </Header>
                        <Content style={{height: '65vh', backgroundColor: '#ffffff'}}>
                            <div className='form-div'>
                                <input
                                    autoFocus
                                    className="input-border"
                                    key="user"
                                    placeholder={t('username')}
                                    onChange={e => {
                                        this.setState({userName: e.target.value})
                                    }}
                                    onKeyUp={this.authenticateIfEnterPress}
                                />
                                <input
                                    className="input-border"
                                    key="pass"
                                    type="password"
                                    placeholder={t('password')}
                                    onChange={e => {
                                        this.setState({password: e.target.value})
                                    }}
                                    onKeyUp={this.authenticateIfEnterPress}
                                />
                                <button key="conbutton" className="custom-button"
                                        onClick={this.authenticate}>
                                    {t('login')}
                                </button>
                            </div>
                        </Content>
                    </Layout>
                </div>
            )
        }
    }

    authenticate = () => {
        return API.instance().authenticate(this.state.userName, this.state.password)
            .then((principal)=>{
                this.props.onLoginSucceed(principal)
            })
    };

    authenticateIfEnterPress = (e:any) => {
        if (e.keyCode === 13) {
            this.authenticate()
        }
    };
}

export default withTranslation()(Login)
