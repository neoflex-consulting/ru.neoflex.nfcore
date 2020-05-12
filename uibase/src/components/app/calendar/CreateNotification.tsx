import React from "react";
import '../../../styles/Calendar.css';
import {Button, Checkbox, Col, Input, InputNumber, Row, Select, Switch, Tabs} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {EObject} from "ecore";

const { TabPane } = Tabs;

interface Props {
    onCreateNotification?: (notificationStatus: any[]) => void;
    periodicity: EObject[];
    spinnerVisible: boolean;
}

interface State {
    newNotification: Object;
    periodicity: EObject[];
    spinnerVisible: boolean;
}

class CreateNotification extends React.Component<Props & WithTranslation & any, State> {

    state = {
        newNotification: {
            'fullName': undefined,
            'shortName': undefined,
            'weekendReporting': false,
            'periodicity': 'Month',
            'deadlineDay': 1,
            'deadlineTime': 9
        },
        periodicity: this.props.periodicity,
        spinnerVisible: this.props.spinnerVisible
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.state.spinnerVisible !== this.props.spinnerVisible && this.state.spinnerVisible) {
            this.setState({spinnerVisible: false})
        }
    }

    handleChange(e: any): void {
        const target = JSON.parse(e);
        let newNotification: any = {
            'fullName': target['row'] === 'fullName' ? target['value'] : this.state.newNotification['fullName'],
            'shortName': target['row'] === 'shortName' ? target['value'] : this.state.newNotification['shortName'],
            'weekendReporting': target['row'] === 'weekendReporting' ? target['value'] : this.state.newNotification['weekendReporting'],
            'periodicity': target['row'] === 'periodicity' ? target['value'] : this.state.newNotification['periodicity'],
            'deadlineDay': target['row'] === 'deadlineDay' ? target['value'] : this.state.newNotification['deadlineDay'],
            'deadlineTime': target['row'] === 'deadlineTime' ? target['value'] : this.state.newNotification['deadlineTime'],
            };
        this.setState({newNotification})
    }

    clear(): void {
        const newNotification: any = {
            'fullName': undefined,
            'shortName': undefined,
            'weekendReporting': false,
            'periodicity': 'Month',
            'deadlineDay': 1,
            'deadlineTime': 9
        };
        this.setState({newNotification})
    }

    apply(newNotification: any): void {
        this.setState({spinnerVisible: true});
        this.props.onCreateNotification(newNotification)
    }

    render() {
        const {t} = this.props;
        const {newNotification} = this.state;
        return (
            <div>
                <Row>
                    <Col span={10} style={{marginRight: '10px',textAlign: 'right'}}>
                        <span>{t('fullName')}</span>
                    </Col>
                    <Col span={12}>
                        <Input
                            value={newNotification['fullName']}
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
                        value={newNotification['shortName']}
                        disabled={false}
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
                            checked={newNotification['weekendReporting']}
                            disabled={false}
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
                                value={t(newNotification['periodicity'])}
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
                                value={newNotification['deadlineDay']}
                                disabled={false}
                                style={{ width: '200px'}}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({row: 'deadlineDay', value: e === "" ? undefined : e});
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
                                value={newNotification['deadlineTime']}
                                formatter={value => `${value}:00`}
                                parser={value => value !== undefined ? value.replace(':00', '') : 1}
                                style={{ width: '200px'}}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({row: 'deadlineTime', value: e === "" ? undefined : e > 23 ? e/100 : e});
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
                            title={t('create')}
                            style={{ width: '100px', right: '6px', }}
                            type="primary"
                            onClick={()=> this.apply(this.state.newNotification)}
                        >
                            {t('create')}
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

export default withTranslation()(CreateNotification)
