import React from 'react';
import Ecore from 'ecore';
import { withTranslation, WithTranslation } from "react-i18next";

import { API } from './../modules/api'
import {NeoButton, NeoModal, NeoOption, NeoSelect} from "neo-design/lib";

interface Props {
    translate: Function;
    setSelectEClassVisible: Function;
    modalSelectEClassVisible: boolean;
    onOk: (EClassObject: Ecore.EClass|undefined)=>void;
}

interface State {
    classes: Array<any>;
    selectedEClassObject: undefined | Ecore.EClass;
}

class EClassSelection extends React.Component<Props & WithTranslation, State>{

    state = {
        classes: [],
        selectedEClassObject: undefined,
        modalVisible: false
    }

    sortEClasses = (a: any, b: any): number => {
        if (a.eContainer.get('name') + a._id < b.eContainer.get('name') + b._id) return -1;
        if (a.eContainer.get('name') + a._id > b.eContainer.get('name') + b._id) return 0;
        else return 0;
    }

    getEClasses(): void {
        API.instance().fetchAllClasses(false).then(classes => {
            const filtered = (classes.filter((c: Ecore.EObject) => !c.get('interface')))
                .sort((a: any, b: any) => this.sortEClasses(a, b));
            this.setState({ classes: filtered })
        })
    }

    handleSelectEClass = (EClassName:any) => {
        const EClassObject: Ecore.EClass|undefined = this.state.classes.find((eClass: Ecore.EClass)=>eClass.get('name') === EClassName)
        this.setState({ selectedEClassObject: EClassObject })
    }

    handleOk = () => {
        this.props.onOk && this.props.onOk(this.state.selectedEClassObject)
        this.props.setSelectEClassVisible(false)
    }

    componentDidMount() {
        this.getEClasses()
    }

    render() {
        const { translate } = this.props
        return (
            this.props.modalSelectEClassVisible && <NeoModal
                type={'edit'}
                title={translate('createresource')}
                visible={this.props.modalSelectEClassVisible}
                footer={this.state.selectedEClassObject ? <NeoButton type="primary" onClick={this.handleOk}>OK</NeoButton> : null}
                onCancel={() => this.props.setSelectEClassVisible(false)}
            >
                <NeoSelect
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={translate('selecteclass')}
                    onChange={this.handleSelectEClass}
                >
                    {this.state.classes.map((eclass: Ecore.EObject, index: number) =>
                        !eclass.get('abstract') ?
                            <NeoOption key={`ec_${eclass.eContainer.get('name')}.${eclass.get('name')}`} value={eclass.get('name')}>
                                {`${eclass.eContainer.get('name')}.${eclass.get('name')}`}
                            </NeoOption>
                            :
                            null
                    )}
                </NeoSelect>
            </NeoModal>
        )
    }

}

export default withTranslation()(EClassSelection);