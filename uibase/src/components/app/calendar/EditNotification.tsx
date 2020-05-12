import React from "react";
import '../../../styles/Calendar.css';
import {Button, Col, Input, InputNumber, Row, Select, Switch, Tabs} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {EObject} from "ecore";

const { TabPane } = Tabs;

interface Props {
    onEditNotification?: (notificationStatus: any[]) => void;
    periodicity: EObject[];
    spinnerVisible: boolean;
    editableNotification: Object;
    myNotificationVisible: boolean;
}

interface State {
    editableNotification: Object;
    periodicity: EObject[];
    spinnerVisible: boolean;
    myNotificationVisible: boolean;
}

class EditNotification extends React.Component<Props & WithTranslation & any, State> {

    state = {
        editableNotification: this.props.editableNotification,
        periodicity: this.props.periodicity,
        spinnerVisible: this.props.spinnerVisible,
        myNotificationVisible: this.props.myNotificationVisible
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.state.spinnerVisible !== this.props.spinnerVisible && this.state.spinnerVisible) {
            this.setState({spinnerVisible: false})
        }
        if (this.props.editableNotification.fullName !== prevProps.editableNotification.fullName) {
            this.setState({
                editableNotification: this.props.editableNotification,
                myNotificationVisible: this.props.myNotificationVisible
            })
        }
    }

    handleChange(e: any): void {
        const target = JSON.parse(e);
        let editableNotification: any = {
            'id': this.state.editableNotification['id'],
            'fullName': target['row'] === 'fullName' ? target['value'] : this.state.editableNotification['fullName'],
            'shortName': target['row'] === 'shortName' ? target['value'] : this.state.editableNotification['shortName'],
            'weekendReporting': target['row'] === 'weekendReporting' ? target['value'] : this.state.editableNotification['weekendReporting'],
            'periodicity': target['row'] === 'periodicity' ? target['value'] : this.state.editableNotification['periodicity'],
            'deadlineDay': target['row'] === 'deadlineDay' ? target['value'] : this.state.editableNotification['deadlineDay'],
            'deadlineTime': target['row'] === 'deadlineTime' ? target['value'] : this.state.editableNotification['deadlineTime'],
            };
        this.setState({editableNotification})
    }

    clear(): void {
        const editableNotification: any = {
            'id': this.state.editableNotification['id'],
            'fullName': undefined,
            'shortName': (this.state.myNotificationVisible ? undefined : this.state.editableNotification['shortName']),
            'weekendReporting': (this.state.myNotificationVisible ? false : this.state.editableNotification['weekendReporting']),
            'periodicity': (this.state.myNotificationVisible ? 'Month' : this.state.editableNotification['periodicity']),
            'deadlineDay': 1,
            'deadlineTime': (this.state.myNotificationVisible ? 9 : this.state.editableNotification['deadlineTime'])
        };
        this.setState({editableNotification})
    }

    save(editableNotification: any): void {
        this.setState({spinnerVisible: true});
        this.props.onEditNotification(editableNotification)
    }

    render() {
        const {t} = this.props;
        const {editableNotification} = this.state;
        return (
            <div>
                <Row>
                    <Col span={10} style={{marginRight: '10px',textAlign: 'right'}}>
                        <span>{t('fullName')}</span>
                    </Col>
                    <Col span={12}>
                        <Input
                            value={editableNotification['fullName']}
                            disabled={false}
                            style={{ width: '200px'}}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'fullName', value: e.target.value === "" ? undefined : e.target.value});
                                this.handleChange(event)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                    <span>{t('shortName')}</span>
                </Col>
                <Col span={12}>
                    <Input
                        value={editableNotification['shortName']}
                        disabled={!this.state.myNotificationVisible}
                        style={{ width: '200px'}}
                        allowClear={true}
                        onChange={(e: any) => {
                            const event = JSON.stringify({row: 'shortName', value: e.target.value === "" ? undefined : e.target.value});
                            this.handleChange(event)
                        }}
                    />
                </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                        <span>{t('weekendReporting')}</span>
                    </Col>
                    <Col span={12}>
                        <Switch
                            checked={editableNotification['weekendReporting']}
                            disabled={!this.state.myNotificationVisible}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'weekendReporting', value: e})
                                this.handleChange(event)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>

                    <Row style={{marginTop: '10px'}}>
                        <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                            <span>{t('periodicity')}</span>
                        </Col>
                        <Col span={12}>
                            <Select
                                disabled={!this.state.myNotificationVisible}
                                value={t(editableNotification['periodicity'])}
                                style={{ width: '200px'}}
                                allowClear={true}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({row: 'periodicity', value: undefined});
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.state.periodicity!.map((p: any) =>
                                    <Select.Option
                                        key={JSON.stringify({row: 'periodicity', value: p})}
                                        value={JSON.stringify({row: 'periodicity', value: p})}
                                    >
                                        {t(p)}
                                    </Select.Option>
                                    )
                                }
                            </Select>
                        </Col>
                    </Row>

                    <Row style={{marginTop: '10px'}}>
                        <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                            <span>{t('deadlineDay')}</span>
                        </Col>
                        <Col span={12}>
                            <InputNumber
                                min={1}
                                max={220}
                                value={editableNotification['deadlineDay']}
                                disabled={false}
                                style={{ width: '200px'}}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({row: 'deadlineDay', value: e === "" ? undefined : e})
                                    this.handleChange(event)
                                }}
                            />
                        </Col>
                    </Row>

                    <Row style={{marginTop: '10px'}}>
                        <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                            <span>{t('deadlineTime')}</span>
                        </Col>
                        <Col span={12}>
                            <InputNumber
                                min={0}
                                max={23}
                                value={editableNotification['deadlineTime']}
                                formatter={value => `${value}:00`}
                                parser={value => value !== undefined ? value.replace(':00', '') : 1}
                                style={{ width: '200px'}}
                                disabled={!this.state.myNotificationVisible}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({row: 'deadlineTime', value: e === "" ? undefined : e});
                                    this.handleChange(event)
                                }}
                            >
                            </InputNumber>
                        </Col>
                    </Row>
                </Row>


                <Row style={{marginTop: '15px'}}>
                    <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                    </Col>
                    <Col span={13}>

                        {
                            this.state.spinnerVisible &&
                            <div className="small_loader">
                                <div className="small_inner one"/>
                                <div className="small_inner two"/>
                                <div className="small_inner three"/>
                            </div>
                        }

                        <Button
                            title={t('save')}
                            style={{ width: '100px', right: '6px', }}
                            type="primary"
                            onClick={()=> this.save(this.state.editableNotification)}
                        >
                            {t('save')}
                        </Button>

                        <Button
                            title={t('clear')}
                            style={{ marginLeft: '10px', width: '100px', right: '6px', }}
                            onClick={()=> this.clear()}
                        >
                            {t('clear')}
                        </Button>
                    </Col>

                </Row>


            </div>
        )
    }
}

export default withTranslation()(EditNotification)
