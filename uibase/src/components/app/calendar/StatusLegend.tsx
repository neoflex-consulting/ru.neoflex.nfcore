import React from "react";
import '../../../styles/Calendar.css';
import {NeoRow, NeoCol, NeoButton, NeoInput} from "neo-design/lib";
import {withTranslation, WithTranslation} from "react-i18next";

interface Props {
    notificationStatus: Object[];
    onChangeNotificationStatus?: (notificationStatus: any[]) => void;
}

interface State {
    notificationStatus: Object[];
}

class StatusLegend extends React.Component<Props & WithTranslation & any, State> {

    state = {
        notificationStatus: this.props.notificationStatus,
    };

    componentDidMount(): void {
    }

    handleChange(e: any): void {
        const target = JSON.parse(e);
        this.state.notificationStatus!
            .filter( (f: any) => f['name'] === target['name'])
            .map ( (f: any) => f['enable'] = target['enable'])
    }

    apply(notificationStatus: Object[]): void {
        let objectId = this.props.viewObject._id;
        let params: any = {
            'notificationStatus' : notificationStatus
        };
        this.props.context.changeUserProfile(objectId, params);
        this.props.onChangeNotificationStatus(notificationStatus);
        this.props.handleLegendMenu();
    }

    render() {
        const {t} = this.props;
        return (
            <div>
                {
                    this.state.notificationStatus!
                        .map((c: any, index:number) =>
                            <NeoRow style={{marginBottom: '15px'}} key={`statusLegendRow-${index}`}>
                                <NeoCol span={2}>
                                    <NeoInput
                                        type={'checkbox'}
                                        defaultChecked={c['enable']}
                                        onChange={(e: any) => {
                                            console.log('onchange')
                                            const event = JSON.stringify({enable: e.target.checked, name: c['name'], color: c['color']});
                                            this.handleChange(event)
                                        }}
                                    >
                                    </NeoInput>
                                </NeoCol>
                                <NeoCol span={4}>

                                    <div style={{height: '29px', width: '52px', backgroundColor: c['color'], borderRadius: '5px'}}/>
                                </NeoCol>
                                <NeoCol span={17} style={{justifyContent: 'start'}}>
                                    <span
                                        key={JSON.stringify({name: c['name'], color: c['color']})}
                                    >
                                        {c['name']}
                                    </span>
                                </NeoCol>
                            </NeoRow>
                        )
                }
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
                    <NeoButton onClick={()=> this.apply(this.state.notificationStatus)} style={{marginRight:'16px'}}>
                        {t('apply')}
                    </NeoButton>
                </div>
            </div>
        )
    }
}

export default withTranslation()(StatusLegend)
