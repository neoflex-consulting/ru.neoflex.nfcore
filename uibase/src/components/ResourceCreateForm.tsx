import React from 'react'
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from 'ecore';
import { Modal, Select, Button, Input } from 'antd';
import { Link } from 'react-router-dom';

interface Props {
    classes: Ecore.EClass[]
    createResModalVisible: boolean;
    refresh: ()=>void;
    form: any;
    translate: Function;
    setModalVisible: Function;
}

interface State {
    selectedEClass: undefined | string;
    name: string
}

class ResourceCreateForm extends React.Component<Props & WithTranslation, State>{

    state = {
        selectedEClass: undefined,
        name: ''
    }

    handleSelectClass = (value: string) => {
        this.setState({ selectedEClass: value })
    }

    onChangeName = (e: any) => {
        this.setState({ name: e.target.value })
    }

    render() {
        const {t} = this.props;
        return (
            <Modal
                key="create_resource"
                width={'400px'}
                title={t('createitem')}
                visible={this.props.createResModalVisible}
                footer={this.state.selectedEClass && this.state.name ? 
                    <Button type="primary">
                        <Link to={{ pathname: `/developer/data/editor/new/resource`, state: { selectedEClass: this.state.selectedEClass, name: this.state.name } }}>
                            <span id="edit">{t('ok')}</span>
                        </Link>
                    </Button>
                    : 
                    null}
                onCancel={()=>this.props.setModalVisible(false)}
            >
                <Select
                    showSearch
                    style={{ width: '100%', marginBottom: '10px' }}
                    placeholder={t('eClass')}
                    onChange={this.handleSelectClass}
                >
                    {this.props.classes
                        .filter((eclass: Ecore.EObject) => !eclass.get('abstract')
                            && eclass.get('eAllStructuralFeatures')
                                .find((feature: Ecore.EStructuralFeature) =>
                                    feature.get('eType').get('name') === 'QName'))
                        .map((eclass: Ecore.EObject) =>
                            <Select.Option key={eclass.get('name')}
                                           value={`${eclass.eContainer.get('name')}.${eclass.get('name')}`}>
                                {`${eclass.eContainer.get('name')}.${eclass.get('name')}`}
                            </Select.Option>)
                    }
                </Select>
                <Input 
                    placeholder={t('itemname')}
                    value={this.state.name} 
                    onChange={this.onChangeName}
                />
            </Modal>
        )
    }
}

export default withTranslation()(ResourceCreateForm);
