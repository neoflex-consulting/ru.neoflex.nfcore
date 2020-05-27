import React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import update from 'immutability-helper';
import {EObject} from "ecore";
import {createDefaultValue, getAllAttributes, getCaption} from './utils'
import {DatePicker, Select, Input, InputNumber, Typography, Col, Divider, Row, Button, Collapse} from "antd";
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowUp, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import MasterdataLookup from "./MasterdataLookup";
import * as _ from "lodash";
import {NXInput, NXDatePicker, NXTypography} from '../../../nx-design';

interface Props {
    entityType: EObject,
    data: any,
    updateData: (data: Object) => void
}

class MasterdataForm extends React.Component<Props & WithTranslation, any> {

    renderJSONEditor(attributeType: EObject, data: any, updateData: (data: any) => void) {
        return <Typography.Paragraph
            ellipsis={{rows: 3, expandable: true}}
            editable={{onChange: value => updateData(JSON.parse(value))}}>
            {JSON.stringify(data)}
        </Typography.Paragraph>
    }

    renderArrayTypeEditor(caption: string, elementType: EObject, data: any, updateData: (data: any) => void) {
        const {t} = this.props
        const addButton =
            <Button title={t('add')} size={'small'}
                    style={{color: 'rgb(151, 151, 151)'}}
                    onClick={(event) => {
                        updateData([...data, createDefaultValue(elementType)])
                        event.stopPropagation()
                    }}>
                <FontAwesomeIcon icon={faPlus} size='sm' color="#7b7979"/>
            </Button>
        data = data || []
        return (
            <React.Fragment>
                <Collapse defaultActiveKey={[]} >
                    <Collapse.Panel header={caption} key="1" extra={addButton}>
                        {data.map((e: any, i: number) => <Row key={i}>
                            <Col span={3}>
                                <Button title={t('delete')} size={'small'}
                                        style={{color: 'rgb(151, 151, 151)', marginTop: '5px'}}
                                        onClick={() => {
                                            updateData([...data.slice(0, i), ...data.slice(i + 1)])
                                        }}>
                                    <FontAwesomeIcon icon={faMinus} size='sm' color="#7b7979"/>
                                </Button>
                                <Button title={t('up')} size={'small'}
                                        style={{color: 'rgb(151, 151, 151)', marginTop: '5px'}}
                                        disabled={i<=0}
                                        onClick={() => {
                                            updateData([...data.slice(0, i - 1), data[i], data[i - 1], ...data.slice(i + 1)])
                                        }}>
                                    <FontAwesomeIcon icon={faArrowUp} size='sm' color="#7b7979"/>
                                </Button>
                                <Button title={t('down')} size={'small'}
                                        disabled={i>=data.length-1}
                                        style={{color: 'rgb(151, 151, 151)', marginTop: '5px'}}
                                        onClick={() => {
                                            updateData([...data.slice(0, i), data[i+1], data[i], ...data.slice(i + 2)])
                                        }}>
                                    <FontAwesomeIcon icon={faArrowDown} size='sm' color="#7b7979"/>
                                </Button>
                            </Col>
                            <Col span={21}>
                                {this.renderValueEditor("#"+(i + 1), elementType, data[i], dataNew => {
                                    updateData([...data.slice(0, i), update(data[i], {$merge: dataNew}), ...data.slice(i + 1)])
                                })}
                            </Col>
                        </Row>)}
                    </Collapse.Panel>
                </Collapse>
            </React.Fragment>
        )
    }

    renderMapTypeEditor(caption: string, valueType: EObject, data: any, updateData: (data: any) => void) {
        const {t} = this.props
        data = data || {}
        const addButton =
            <Button title={t('add')} size={'small'}
                    disabled={data.hasOwnProperty("")}
                    style={{color: 'rgb(151, 151, 151)'}}
                    onClick={(event) => {
                        updateData({...data, "": createDefaultValue(valueType)})
                        event.stopPropagation()
                    }}>
                <FontAwesomeIcon icon={faPlus} size='sm' color="#7b7979"/>
            </Button>
        return (
            <React.Fragment>
                <Collapse defaultActiveKey={[]} >
                    <Collapse.Panel header={caption} key="1" extra={addButton}>
                        {Object.keys(data).sort().map((key: string, i: number) => <Row key={key}>
                            <Col span={8}>
                                <Button title={t('delete')} size={'small'}
                                        style={{color: 'rgb(151, 151, 151)', marginTop: '5px'}}
                                        onClick={() => {
                                            updateData(_.omit(data, key))
                                        }}>
                                    <FontAwesomeIcon icon={faMinus} size='sm' color="#7b7979"/>
                                </Button>
                                <NXTypography.Text editable={{
                                    onChange: (newKey :any) => updateData({..._.omit(data, key), [newKey]: data[key]})
                                }} >
                                    {key}
                                </NXTypography.Text>
                            </Col>
                            <Col span={16}>
                                {this.renderValueEditor(key, valueType, data[key], dataNew => {
                                    updateData({..._.omit(data, key), [key]: dataNew})
                                })}
                            </Col>
                        </Row>)}
                    </Collapse.Panel>
                </Collapse>
            </React.Fragment>
        )
    }

    renderPlainTypeEditor(attributeType: EObject, data: any, updateData: (data: any) => void) {
        const typeName = attributeType.get('name') as string
        if (['INTEGER', 'LONG', 'FLOAT', 'DOUBLE', 'DECIMAL'].includes(typeName)) {
            return <InputNumber value={data} style={{width: '15em'}} onChange={value => updateData(value)}/>
        }
        if (typeName === 'BOOLEAN') {
            return <Select value={_.isBoolean(data)?data.toString():undefined} allowClear={true}
                           style={{width: '6em'}}
                           onChange={(value: any) => updateData(value?value === "true":undefined)}>
                <Select.Option key={"true"}>True</Select.Option>
                <Select.Option key={"false"}>False</Select.Option>
            </Select>
        }
        if (typeName === 'STRING') {
            return <NXInput.Input value={data} onChange={(value :any) => updateData(value.target.value)}/>
        }
        if (typeName === 'TEXT') {
            return <NXInput.TextArea rows={3} value={data} onChange={(value :any) => updateData(value.target.value)}/>
        }
        if (typeName === 'DATE') {
            return <NXDatePicker value={!data ? null : moment(data, 'YYYY-MM-DD HH:mm:ss')}
                               onChange={(value:any) => updateData(value?.format('YYYY-MM-DD HH:mm:ss'))} showTime={false}/>
        }
        if (typeName === 'DATETIME') {
            return <NXDatePicker value={!data ? null : moment(data, 'YYYY-MM-DD HH:mm:ss')}
                               onChange={(value:any) => updateData(value?.format('YYYY-MM-DD HH:mm:ss'))} showTime={true}/>
        }
        return this.renderJSONEditor(attributeType, data, updateData)
    }

    renderValueEditor(caption: string, attributeType: EObject, data: any, updateData: (data: any) => void) {
        if (attributeType.eClass.get('name') === 'PlainType') {
            return this.renderPlainTypeEditor(attributeType, data, updateData)
        }
        if (attributeType.eClass.get('name') === 'EnumType') {
            const length = Math.max(...attributeType.get('values').map((value: EObject) =>
                value.get('name').length)) + 3
            return <Select value={data} allowClear={true}
                           style={{width: `${length}em`}}
                           onChange={(value: any) => updateData(value)}>
                {attributeType.get('values').map((value: EObject) =>
                    <Select.Option key={value.get('name')}>{value.get('name')}</Select.Option>
                )}
            </Select>
        }
        if (attributeType.eClass.get('name') === 'ArrayType') {
            return this.renderArrayTypeEditor(caption, attributeType.get('elementType'), data, updateData)
        }
        if (attributeType.eClass.get('name') === 'MapType') {
            return this.renderMapTypeEditor(caption, attributeType.get('valueType'), data, updateData)
        }
        if (attributeType.eClass.get('name') === 'DocumentType') {
            return <MasterdataForm {...this.props} entityType={attributeType} data={data} updateData={updateData}/>
        }
        if (attributeType.eClass.get('name') === 'EntityType') {
            return <MasterdataLookup {...this.props} entityType={attributeType} rid={data} onSelect={updateData}/>
        }
        return this.renderJSONEditor(attributeType, data, updateData)
    }

    render() {
        const {entityType, data, updateData} = this.props
        return (
            <React.Fragment>
                {entityType.eClass.get('name') === 'EntityType' &&
                <Divider orientation="left">{entityType.get('caption') || entityType.get('name')}</Divider>}
                {data['@rid'] && <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                    <Col span={4}><NXTypography.Text strong>{'@rid'}</NXTypography.Text></Col>
                    <Col span={20}>{data['@rid']}</Col>
                </Row>}
                {getAllAttributes(entityType).map(attr =>
                    <Row style={{marginTop: '5px'}} gutter={{xs: 8, sm: 16, md: 24, lg: 32}} key={attr.get('name')}>
                        <Col span={4}>
                            {!['ArrayType', 'MapType'].includes(attr.get('attributeType').eClass.get('name')) &&
                            <NXTypography.Text strong>{getCaption(attr)}</NXTypography.Text>}
                        </Col>
                        <Col
                            span={20}>{this.renderValueEditor(getCaption(attr), attr.get('attributeType'), data[attr.get('name') as string], (data: any) => {
                            updateData({[attr.get('name')]: data})
                        })}</Col>
                    </Row>
                )}
            </React.Fragment>
        )
    }
}

export default withTranslation()(MasterdataForm)
