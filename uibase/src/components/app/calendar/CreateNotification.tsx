import React from "react";
import '../../../styles/Calendar.css';
import {Button, Checkbox, Col, Input, InputNumber, Row, Select, Switch, Tabs} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";
import {EObject} from "ecore";

const { TabPane } = Tabs;

interface Props {
    onCreateNotificationStatus?: (notificationStatus: any[]) => void;
    periodicity: EObject[];
}

interface State {
    listOfNumbers: any[];
    newNotification: Object;
    periodicity: EObject[];
}

class CreateNotification extends React.Component<Props & WithTranslation & any, State> {

    state = {
        listOfNumbers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
        newNotification: {
            'fullName': undefined,
            'shortName': undefined,
            'weekendReporting': false,
            'periodicity': 'Month',
            'dateOn': 1,
            'deadlineDay': 1,
            'deadlineTime': 9,
            'calculationInterval': undefined,
            'systemSetting': true
        },
        periodicity: this.props.periodicity
    };

    componentDidMount(): void {
    }

    handleChange(e: any): void {
        const target = JSON.parse(e);
        let newNotification: any = {
            'fullName': target['row'] === 'fullName' ? target['value'] : this.state.newNotification['fullName'],
            'shortName': target['row'] === 'shortName' ? target['value'] : this.state.newNotification['shortName'],
            'weekendReporting': target['row'] === 'weekendReporting' ? target['value'] : this.state.newNotification['weekendReporting'],
            'periodicity': target['row'] === 'periodicity' ? target['value'] : this.state.newNotification['periodicity'],
            'dateOn': target['row'] === 'dateOn' ? target['value'] : this.state.newNotification['dateOn'],
            'deadlineDay': target['row'] === 'deadlineDay' ? target['value'] : this.state.newNotification['deadlineDay'],
            'deadlineTime': target['row'] === 'deadlineTime' ? target['value'] : this.state.newNotification['deadlineTime'],
            'calculationInterval': target['row'] === 'calculationInterval' ? target['value'] : this.state.newNotification['calculationInterval'],
            'systemSetting': target['row'] === 'systemSetting' ? target['value'] : this.state.newNotification['systemSetting'],
            };
        this.setState({newNotification})
    }

    clear(): void {
        const newNotification: any = {
            'fullName': undefined,
            'shortName': undefined,
            'weekendReporting': false,
            'periodicity': 'Month',
            'dateOn': 1,
            'deadlineDay': 1,
            'deadlineTime': 9,
            'calculationInterval': undefined,
            'systemSetting': true
        };
        this.setState({newNotification})
    }

    apply(newNotification: any): void {
        this.props.onCreateNotificationStatus(newNotification)
    }

    render() {
        const {t} = this.props;
        const {newNotification} = this.state
        return (
            <div>
                <Row>
                    <Col span={10} style={{marginRight: '10px',textAlign: 'right'}}>
                        <span>{t('fullName')}</span>
                    </Col>
                    <Col span={12}>
                        <Input
                            value={newNotification['fullName']}
                            size="small"
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
                        size="small"
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
                            size="small"
                            disabled={false}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'weekendReporting', value: e})
                                this.handleChange(event)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Tabs
                        defaultActiveKey={'systemSetting'}
                        onChange={(e: any) => {
                            const event = JSON.stringify({row: 'systemSetting', value: e === 'systemSetting'});
                            this.handleChange(event)
                        }}
                    >
                        <TabPane tab={t('systemSetting')} key="systemSetting">

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('periodicity')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        value={t(newNotification['periodicity'])}
                                        size="small"
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
                                    <span>{t('dateOn')}</span>
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        min={1}
                                        max={31}
                                        value={newNotification['dateOn']}
                                        size="small"
                                        style={{ width: '200px'}}
                                        onChange={(e: any) => {
                                            const event = JSON.stringify({row: 'dateOn', value: e === "" ? undefined : e})
                                            this.handleChange(event)
                                        }}
                                    >
                                    </InputNumber>
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('deadlineDay')}</span>
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        size="small"
                                        min={1}
                                        max={220}
                                        value={newNotification['deadlineDay']}
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
                                        value={newNotification['deadlineTime']}
                                        formatter={value => `${value}:00`}
                                        size="small"
                                        style={{ width: '200px'}}
                                        onChange={(e: any) => {
                                            const event = JSON.stringify({row: 'deadlineTime', value: e === "" ? undefined : e})
                                            this.handleChange(event)
                                        }}
                                    >
                                    </InputNumber>
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px', marginBottom: '8px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('calculationInterval')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        value={t(newNotification['calculationInterval'])}
                                        size="small"
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {
                                            const event = e ? e : JSON.stringify({row: 'calculationInterval', value: undefined})
                                            this.handleChange(event)
                                        }}
                                    >
                                        <Select.Option
                                            key={JSON.stringify({row: 'calculationInterval', value: undefined})}
                                            value={JSON.stringify({row: 'calculationInterval', value: undefined})}
                                        >
                                            -
                                        </Select.Option>
                                        {
                                            this.state.periodicity!.map((p: any) =>
                                                <Select.Option
                                                    key={JSON.stringify({row: 'calculationInterval', value: p})}
                                                    value={JSON.stringify({row: 'calculationInterval', value: p})}
                                                >
                                                    {t(p)}
                                                </Select.Option>
                                            )
                                        }
                                    </Select>
                                </Col>
                            </Row>


                        </TabPane>

                        <TabPane tab={t('manualSetting')} key="manualSetting">

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('dateOn')}</span>
                                </Col>
                                <Col span={12}>
                                    {
                                        this.state.listOfNumbers.map((d: any) =>
                                            <Col span={3} style={{display: 'grid'}}>
                                                <span>{d}</span>
                                                <Checkbox/>
                                            </Col>
                                        )
                                    }

                                </Col>
                            </Row>

                        </TabPane>
                    </Tabs>
                </Row>


                <Row style={{marginTop: '15px'}}>
                    <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                    </Col>
                    <Col span={13}>
                        <Button
                            size="small"
                            title={t('create')}
                            style={{ width: '100px', right: '6px', }}
                            type="primary"
                            onClick={()=> this.apply(this.state.newNotification)}
                        >
                            {t('create')}
                        </Button>

                        <Button
                            size="small"
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
