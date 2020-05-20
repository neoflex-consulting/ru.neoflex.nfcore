import React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
// import update from "immutability-helper";
import {EObject} from "ecore";
import {getAllAttributes, getAttrCaption} from './utils'
import {DatePicker, Select, Input, InputNumber, Typography, Col, Divider, Row} from "antd";
import moment from "moment";

interface Props {
    entityType: EObject,
    data: any,
    updateData: (data: Object)=>void
}

class MasterdataForm extends React.Component<Props & WithTranslation, any> {

    renderJSONEditor(attributeType: EObject, data: any, updateData: (data: any)=>void) {
        return <Typography.Paragraph
            ellipsis={{ rows: 3, expandable: true }}
            editable={{ onChange: value => updateData(JSON.parse(value)) }}>
            {JSON.stringify(data)}
        </Typography.Paragraph>
    }

    renderPlainTypeEditor(attributeType: EObject, data: any, updateData: (data: any)=>void) {
        const typeName = attributeType.get('name') as string
        if (typeName === 'INTEGER') {
            return <InputNumber value={data} onChange={value => updateData(value)}/>
        }
        if (typeName === 'STRING') {
            return <Input value={data} onChange={value => updateData(value.target.value)}/>
        }
        if (typeName === 'TEXT') {
            return <Input.TextArea rows={3} value={data} onChange={value => updateData(value.target.value)}/>
        }
        if (typeName === 'DATE') {
            return <DatePicker value={!data?null:moment(data, 'YYYY-MM-DD HH:mm:ss')} onChange={(value) => updateData(value?.format('YYYY-MM-DD HH:mm:ss'))} showTime={false}/>
        }
        if (typeName === 'DATETIME') {
            return <DatePicker value={!data?null:moment(data, 'YYYY-MM-DD HH:mm:ss')} onChange={(value) => updateData(value?.format('YYYY-MM-DD HH:mm:ss'))} showTime={true}/>
        }
        return this.renderJSONEditor(attributeType, data, updateData)
    }

    renderValueEditor(attributeType: EObject, data: any, updateData: (data: any)=>void) {
        if (attributeType.eClass.get('name') === 'PlainType') {
            return this.renderPlainTypeEditor(attributeType, data, updateData)
        }
        if (attributeType.eClass.get('name') === 'EnumType') {
            return <Select value={data} allowClear={true} onChange={(value: any) => updateData(value)}>
                {attributeType.get('values').map((value: EObject)=>
                    <Select.Option key={value.get('name')}>{value.get('name')}</Select.Option>
                )}
            </Select>
        }
        return this.renderJSONEditor(attributeType, data, updateData)
    }

    render() {
        const {entityType, data, updateData} = this.props
        return (
            <React.Fragment>
                <Divider orientation="left">{entityType.get('caption') || entityType.get('name')}</Divider>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col span={6}><Typography.Text strong={true}>{'@rid'}</Typography.Text></Col>
                    <Col span={18}>{data['@rid']}</Col>
                </Row>
                {getAllAttributes(entityType).map(attr=>
                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} key={attr.get('name')}>
                        <Col span={6}><Typography.Text strong={true}>{getAttrCaption(attr)}</Typography.Text></Col>
                        <Col span={18}>{this.renderValueEditor(attr.get('attributeType'), data[attr.get('name') as string], (data: any)=>{
                            updateData({[attr.get('name')]: data})
                        })}</Col>
                    </Row>
                )}
            </React.Fragment>
        )
    }
}

export default withTranslation()(MasterdataForm)
