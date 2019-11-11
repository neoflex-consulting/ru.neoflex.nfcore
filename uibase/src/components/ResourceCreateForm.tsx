import React from 'react'
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from 'ecore';
import { Modal, Select, Button, Input } from 'antd';
import { Link } from 'react-router-dom';

//import {API} from './../modules/api'

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
        const { translate } = this.props
        
        return (
            <Modal
                key="create_resource"
                width={'400px'}
                title={translate('createresource')}
                visible={this.props.createResModalVisible}
                footer={this.state.selectedEClass && this.state.name ? 
                    <Button type="primary">
                        <Link to={{ pathname: `/settings/data/editor/null/null`, state: { selectedEClass: this.state.selectedEClass, name: this.state.name } }}>
                            <span id="edit">{translate('ok')}</span>
                        </Link>
                    </Button>
                    : 
                    null}
                onCancel={()=>this.props.setModalVisible(false)}
            >
                <Select
                    showSearch
                    style={{ width: '100%', marginBottom: '10px' }}
                    placeholder={translate('selecteclass')}
                    onChange={this.handleSelectClass}
                >
                    {this.props.classes.map((eclass: Ecore.EObject) =>
                        !eclass.get('abstract') ?
                            <Select.Option key={eclass.get('name')} value={eclass.get('name')}>
                                {`${eclass.eContainer.get('name')}.${eclass.get('name')}`}
                            </Select.Option>
                            :
                            null
                    )}
                </Select>
                <Input 
                    placeholder={translate('name')}
                    value={this.state.name} 
                    onChange={this.onChangeName}
                />
            </Modal>
        )
    }
}

export default withTranslation()(ResourceCreateForm);