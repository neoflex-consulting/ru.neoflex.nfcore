import React from "react";
import '../../../styles/Calendar.css';
import {withTranslation, WithTranslation} from "react-i18next";
import {EObject} from "ecore";
import {NeoButton, NeoCol, NeoInput, NeoInputNumber, NeoRow, NeoSelect} from "neo-design/lib";

interface Props {
    onCreateNotification?: (notificationStatus: any[]) => void;
    periodicity: EObject[];
}

interface State {
    newNotification: Object;
    periodicity: EObject[];
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
    };

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
        this.props.onCreateNotification(newNotification);
        this.props.handleCreateMenu()
    }

    render() {
        const {t} = this.props;
        const {newNotification} = this.state;
        return (
            <div id="selectButton">
                <NeoRow>
                    <NeoCol span={10} style={{alignItems:'initial'}}>
                        <span>{t('fullName')}</span>
                    </NeoCol>
                    <NeoCol span={12} style={{alignItems:'initial'}}>
                        <NeoInput
                            value={newNotification['fullName']}
                            width={'200px'}
                            onChange={(e: any) => {
                                const event = JSON.stringify({row: 'fullName', value: e.target.value === "" ? undefined : e.target.value});
                                this.handleChange(event)
                            }}
                        />
                    </NeoCol>
                </NeoRow>
                <NeoRow style={{marginTop: '10px'}}>
                <NeoCol span={10} style={{alignItems:'initial'}}>
                    <span>{t('shortName')}</span>
                </NeoCol>
                <NeoCol span={12} style={{alignItems:'initial'}}>
                    <NeoInput
                        value={newNotification['shortName']}
                        width={'200px'}
                        onChange={(e: any) => {
                            const event = JSON.stringify({row: 'shortName', value: e.target.value === "" ? undefined : e.target.value});
                            this.handleChange(event)
                        }}
                    />
                </NeoCol>
                </NeoRow>
                <NeoRow style={{marginTop: '10px'}}>
                    <NeoCol span={10} style={{alignItems:'initial'}}>
                        <span>{t('weekendReporting')}</span>
                    </NeoCol>
                    <NeoCol span={12} style={{alignItems:'initial'}}>
                        <NeoInput type={"checkbox"}
                                  defaultChecked={newNotification['weekendReporting']}
                                  onChange={(e: any) => {
                                      const event = JSON.stringify({row: 'weekendReporting', value: e.target.checked})
                                      this.handleChange(event)
                                  }}/>
                    </NeoCol>
                </NeoRow>
                <NeoRow style={{marginTop: '10px'}}>

                    <NeoRow>
                        <NeoCol span={10} style={{alignItems:'initial'}}>
                            <span>{t('periodicity')}</span>
                        </NeoCol>
                        <NeoCol span={12} style={{alignItems:'initial'}}>
                            <NeoSelect
                                getPopupContainer={() => document.getElementById ('selectButton') as HTMLElement}
                                value={t(newNotification['periodicity'])}
                                width={'200px'}
                                onChange={(e: any) => {
                                    const event = e ? e : JSON.stringify({row: 'periodicity', value: undefined});
                                    this.handleChange(event)
                                }}
                            >
                                {
                                    this.state.periodicity!.map((p: any) =>
                                    <option
                                        key={JSON.stringify({row: 'periodicity', value: p})}
                                        value={JSON.stringify({row: 'periodicity', value: p})}
                                    >
                                        {t(p)}
                                    </option>
                                    )
                                }
                            </NeoSelect>
                        </NeoCol>
                    </NeoRow>

                    <NeoRow style={{marginTop: '10px'}}>
                        <NeoCol span={10} style={{alignItems:'initial'}}>
                            <span>{t('deadlineDay')}</span>
                        </NeoCol>
                        <NeoCol span={12} style={{alignItems:'initial'}}>
                            <NeoInputNumber
                                width={'200px'}
                                min={1}
                                max={220}
                                defaultValue={newNotification['deadlineDay']}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({row: 'deadlineDay', value: e === "" ? undefined : e});
                                    this.handleChange(event)
                                }}/>
                        </NeoCol>
                    </NeoRow>

                    <NeoRow style={{marginTop: '10px'}}>
                        <NeoCol span={10} style={{alignItems:'initial'}}>
                            <span>{t('deadlineTime')}</span>
                        </NeoCol>
                        <NeoCol span={12} style={{alignItems:'initial'}}>
                            <NeoInputNumber
                                width={'200px'}
                                min={0}
                                max={23}
                                defaultValue={newNotification['deadlineTime']}
                                formatter={value => `${value}:00`}
                                parser={value => value !== undefined ? value.replace(':00', '') : 1}
                                onChange={(e: any) => {
                                    const event = JSON.stringify({
                                        row: 'deadlineTime',
                                        value: e === "" ? undefined : e > 23 ? e / 100 : e
                                    });
                                    this.handleChange(event)
                                }}
                            >
                            </NeoInputNumber>
                        </NeoCol>
                    </NeoRow>
                </NeoRow>
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '80px',
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '16px 40px',
                    background: '#F2F2F2',
                    textAlign: 'left',
                }}>
                    <NeoButton
                        title={t('create')}
                        style={{width: '100px', right: '6px',}}
                        onClick={() => this.apply(this.state.newNotification)}
                    >
                        {t('create')}
                    </NeoButton>

                    <NeoButton
                        type={'secondary'}
                        title={t('clear')}
                        style={{marginLeft: '10px', width: '100px', right: '6px',}}
                        onClick={() => this.clear()}
                    >
                        {t('clear')}
                    </NeoButton>
                </div>
            </div>
        )
    }
}

export default withTranslation()(CreateNotification)
