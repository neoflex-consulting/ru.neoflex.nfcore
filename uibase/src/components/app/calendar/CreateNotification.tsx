import React from "react";
import '../../../styles/Calendar.css';
import {Button, Checkbox, Col, Input, Row, Select, Switch, Tabs} from "antd";
import {withTranslation, WithTranslation} from "react-i18next";

const { TabPane } = Tabs;

interface Props {
    onCreateNotificationStatus?: (notificationStatus: any[]) => void;
}

interface State {
    listOfNumbers: any[]
}

class CreateNotification extends React.Component<Props & WithTranslation & any, State> {

    state = {
        listOfNumbers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
    };

    componentDidMount(): void {
    }

    handleChange(e: any): void {
        const target = JSON.parse(e);
        // this.state.notificationStatus!.map( (f: any) => {
        //     if (f['name'] === target['name']) {
        //         f['enable'] = target['enable']
        //     }
        // });
    }

    apply(): void {
        let objectId = this.props.viewObject._id;
        // let params: any = {
        //     'notificationStatus' : this.state.notificationStatus
        // };
        // this.props.context.changeUserProfile(objectId, params).then (()=> {
        //     this.props.onChangeNotificationStatus(this.state.notificationStatus)
        // })
    }

    render() {
        const {t} = this.props;
        return (
            <div>
                <Row>
                    <Col span={10} style={{marginRight: '10px',textAlign: 'right'}}>
                        <span>{t('fullName')}</span>
                    </Col>
                    <Col span={12}>
                        <Input
                            size="small"
                            placeholder={t('fullName')}
                            disabled={false}
                            style={{ width: '200px'}}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'fullName', value: e.target.value === "" ? undefined : e.target.value})
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
                            size="small"
                            placeholder={t('shortName')}
                            disabled={false}
                            style={{ width: '200px'}}
                            allowClear={true}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'shortName', value: e.target.value === "" ? undefined : e.target.value})
                                this.handleChange(event)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                        <span>{t('weekendreporting')}</span>
                    </Col>
                    <Col span={12}>
                        <Switch
                            size="small"
                            disabled={false}
                            onChange={(e: any) => {
                                // const event = JSON.stringify({row: 'shortName', value: e.target.value === "" ? undefined : e.target.value})
                                // this.handleChange(event)
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Tabs defaultActiveKey={'throughnotificationattributes'}>

                        <TabPane tab={t('throughnotificationattributes')} key="throughnotificationattributes">

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('periodicity')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        size="small"
                                        placeholder={t('periodicity')}
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {}}
                                    >
                                    </Select>
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('dateon')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        size="small"
                                        placeholder={t('dateon')}
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {}}
                                    >
                                    </Select>
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('deadlineday')}</span>
                                </Col>
                                <Col span={12}>
                                    <Input
                                        size="small"
                                        placeholder={t('deadlineday')}
                                        disabled={false}
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {
                                            const event = JSON.stringify({row: 'shortName', value: e.target.value === "" ? undefined : e.target.value})
                                            this.handleChange(event)
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('deadlinetime')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        size="small"
                                        placeholder={t('deadlinetime')}
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {}}
                                    >
                                    </Select>
                                </Col>
                            </Row>

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('calculationinterval')}</span>
                                </Col>
                                <Col span={12}>
                                    <Select
                                        size="small"
                                        placeholder={t('calculationinterval')}
                                        style={{ width: '200px'}}
                                        allowClear={true}
                                        onChange={(e: any) => {}}
                                    >
                                    </Select>
                                </Col>
                            </Row>


                        </TabPane>

                        <TabPane tab={t('manualsetting')} key="manualsetting">

                            <Row style={{marginTop: '10px'}}>
                                <Col span={10} style={{marginRight: '10px', textAlign: 'right'}}>
                                    <span>{t('dateon')}</span>
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
                            onClick={()=> this.apply()}
                        >
                            {t('create')}
                        </Button>

                        <Button
                            size="small"
                            title={t('clear')}
                            style={{ marginLeft: '10px', width: '100px', right: '6px', }}
                            onClick={()=> this.apply()}
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
