import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Col, Row, Select} from "antd";
import {EObject} from "ecore";
import {API} from "../../../modules/api";
import MasterdataEditor from "./MasterdataEditor";

class MetadataBrowser extends React.Component<any & WithTranslation, any> {
    state = {
        entityTypes: [],
        index: -1,
        caption: ''
    }

    componentDidMount() {
        API.instance().fetchAllClasses(false)
            .then(classes => classes
                    .filter(eClass => eClass.eURI() === "ru.neoflex.nfcore.masterdata#//EntityType")
                    .forEach(eClass => {
                            API.instance().findByClass(eClass, {}, 999).then(resources => {
                                const entityTypes = resources.map(r=>r.eContents()[0]).filter(eObject => !eObject.get('abstract'))
                                this.setState({entityTypes})
                            })
                        }
                    )
            )
    }

    render() {
        const {t} = this.props;
        const {entityTypes} = this.state
        return (
            <Row style={{marginTop: 15}}>
                <Col span={1}/>
                <Col span={22}>
                    <Select
                        onChange={value => {
                            this.setState({
                                index: value!==undefined?value:-1,
                                caption: value!==undefined?(this.state.entityTypes[value as number] as EObject).get('caption'):''
                            })
                        }}
                        notFoundContent={t('notfound')}
                        allowClear={true}
                        showSearch={true}
                        filterOption={(input, option) => {
                            return (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }}
                        style={{width: '270px'}}
                        autoFocus
                        placeholder="EntityType">
                        {entityTypes.map((eObject: EObject, index) =>
                            <Select.Option key={eObject.get('name')}
                                           value={index}>
                                {eObject.get('name')}
                            </Select.Option>)}
                    </Select><span style={{paddingLeft: '20px'}}>{this.state.caption}</span>
                    {this.state.index >= 0 &&
                    <div style={{marginTop: 15}}>
                        <MasterdataEditor {...this.props} entityType={this.state.entityTypes[this.state.index]}/>
                    </div>}
                </Col>
                <Col span={1}/>
            </Row>
        );
    }
}

export default withTranslation()(MetadataBrowser)

