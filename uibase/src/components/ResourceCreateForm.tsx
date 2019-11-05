import React from 'react'
import {withTranslation, WithTranslation} from "react-i18next";
import Ecore from 'ecore';
import { Modal, Select, Button, Input } from 'antd';

import {API} from './../modules/api'

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

    handleCreateResource = () => {
        const targetEClass: {[key:string]: any}|undefined = this.props.classes.find((eclass: Ecore.EClass) => eclass.get('name') === this.state.selectedEClass)
        const resourceSet = Ecore.ResourceSet.create()
        const newResourceJSON: { [key: string]: any } = {}

        newResourceJSON.eClass = targetEClass && targetEClass!.eURI()
        newResourceJSON._id = '/'
        newResourceJSON.name = this.state.name

        const resource = resourceSet.create({ uri: ' ' }).parse(newResourceJSON as Ecore.EObject)
        
        resource.set('uri', null)

        API.instance().saveResource(resource).then(() => {
            this.props.form.setFields({
                selectEClass:{
                    value: `${targetEClass!.eContainer.get('name')}.${targetEClass!.get('name')}`
                },
                name:{
                    value: this.state.name
                }
            })
            this.props.refresh()
            this.props.setModalVisible(false)
        })
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
                footer={this.state.selectedEClass && this.state.name ? <Button type="primary" onClick={this.handleCreateResource}>OK</Button> : null}
                onCancel={()=>this.props.setModalVisible(false)}
            >
                <Input 
                    placeholder={translate('name')}
                    value={this.state.name} 
                    onChange={this.onChangeName}
                    style={{ marginBottom: '10px' }}
                />
                <Select
                    showSearch
                    style={{ width: '100%' }}
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
            </Modal>
        )
    }
}

export default withTranslation()(ResourceCreateForm);