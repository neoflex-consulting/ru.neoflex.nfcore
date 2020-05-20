import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {Col, Row, Select} from "antd";
import {EObject} from "ecore";
import {API} from "../../../modules/api";

class MetadataBrowser extends React.Component<any & WithTranslation, any> {
    state = {
        entityTypes: []
    }

    componentDidMount() {
        API.instance().fetchAllClasses(false)
            .then(classes => classes
                    .filter(eClass => eClass.eURI() === "ru.neoflex.nfcore.masterdata#//EntityType")
                    .forEach(eClass => {
                            API.instance().findByClass(eClass, {}).then(resources => {
                                const entityTypes = resources.map(r=>r.eContents()[0])
                                this.setState({entityTypes})
                            })
                        }
                    ))
    }

    render() {
        const {t} = this.props;
        const {entityTypes} = this.state
        return (
            <Row style={{marginTop: 15}}>
                <Col span={1}/>
                <Col span={22}>
                    <Select
                        notFoundContent={t('notfound')}
                        allowClear={true}
                        showSearch={true}
                        style={{width: '270px'}}
                        autoFocus
                        placeholder="EntityType">
                        {entityTypes.map((eObject: EObject, index) =>
                            <Select.Option key={eObject.get('name')}
                                           value={index}>
                                {eObject.get('name')}
                            </Select.Option>)}
                    </Select>
                </Col>
                <Col span={1}/>
            </Row>
        );
    }
}

export default withTranslation()(MetadataBrowser)

