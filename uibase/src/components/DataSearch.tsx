import * as React from "react";
import Ecore from "ecore";
import { API } from "../modules/api";
import { Icon, Select, Tabs, Button, Form, Input, Row, Col } from "antd";
import { FormComponentProps } from 'antd/lib/form/Form';
import Checkbox from "antd/lib/checkbox";
import AceEditor from "react-ace";
import 'brace/theme/tomorrow';
import ponyCat from '../icons/ponyCat.png';
import { withTranslation, WithTranslation } from "react-i18next";

import ResourceCreateFrom from './ResourceCreateForm'

const FormItem = Form.Item;

interface Props {
    onSearch: (resources: Ecore.Resource[]) => void;
    specialEClass?: Ecore.EClass | undefined;
}

interface State {
    tags: Ecore.EObject[];
    classes: Ecore.EObject[];
    indicatorError: boolean;
    createResModalVisible: boolean;
}

class DataSearch extends React.Component<Props & FormComponentProps & WithTranslation, State> {

    state = {
        tags: [],
        classes: [],
        indicatorError: false,
        createResModalVisible: false
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.setState({ indicatorError: false });
                let selectedClassObject: Ecore.EClass | undefined;
                if (this.props.specialEClass === undefined) {
                    selectedClassObject = this.state.classes.find((c: Ecore.EClass) => c.eContainer.get('name') + "." + c.get('name') === values.selectEClass);
                } else {
                    selectedClassObject = this.props.specialEClass
                }
                values.key === 'json_search'
                    ?
                    API.instance().find(JSON.parse(values.json_field)).then(results => {
                        this.props.onSearch(results.resources)
                    })
                    :
                    values.regular_expression
                        ?
                        (selectedClassObject && API.instance().findByKindAndRegexp(selectedClassObject as Ecore.EClass, values.name, 1, values.tags ? values.tags.join(",") : undefined)
                            .then((resources) => {
                                this.props.onSearch(resources)
                            }))
                        :
                        (selectedClassObject && API.instance().findByKindAndName(selectedClassObject as Ecore.EClass, values.name, 1, values.tags ? values.tags.join(",") : undefined)
                            .then((resources) => {
                                this.props.onSearch(resources)
                            }))
            } else this.setState({ indicatorError: true })
        });
    };

    getEClasses(): void {
        API.instance().fetchAllClasses(false).then(classes => {
            const filtered = (classes.filter((c: Ecore.EObject) => !c.get('interface')))
                .sort((a: any, b: any) => this.sortEClasses(a, b));
            this.setState({ classes: filtered })
        })
    }

    getAllTags() : void {
        API.instance().findClass("tag","Tag").then((eClass) => {
            API.instance().findByKind(eClass, {contents: {eClass: eClass.eURI()}}).then((result: Ecore.Resource[]) => {
                this.setState({tags: result.map(eObj=>{
                        return eObj.eContents()[0]
                    })});
            });
        })
    }

    sortEClasses = (a: any, b: any): number => {
        if (a.eContainer.get('name') + a._id < b.eContainer.get('name') + b._id) return -1;
        if (a.eContainer.get('name') + a._id > b.eContainer.get('name') + b._id) return 0;
        else return 0;
    };

    setModalVisible = (state:boolean) => {
        this.setState({ createResModalVisible: state })
    }

    componentDidMount(): void {
        this.getEClasses();
        this.getAllTags();
    }

    render() {
        const { getFieldDecorator, getFieldValue, setFields } = this.props.form;
        const { TabPane } = Tabs;
        const { t } = this.props;

        return (
            <React.Fragment>
                {this.state.createResModalVisible && <ResourceCreateFrom 
                    classes={ this.state.classes }
                    refresh={ this.refresh }
                    createResModalVisible={ this.state.createResModalVisible }
                    form = { this.props.form }
                    translate={ t }
                    setModalVisible={this.setModalVisible}
                />}
                <Row>
                    <Col span={23}>
                        <Form onSubmit={this.handleSubmit}>
                            {getFieldDecorator('key', { initialValue: 'data_search' })(
                                <Tabs onChange={(key: string) => {
                                    setFields({ key: { value: key } });
                                }}>
                                    <TabPane tab={this.props.t('data search')} key='data_search'>
                                        <FormItem>
                                            {getFieldDecorator('selectEClass', {
                                                initialValue: this.props.specialEClass === undefined
                                                    ? undefined :
                                                    this.props.specialEClass.eContainer.get('name') + "." + this.props.specialEClass.get('name'),
                                                rules: [{
                                                    required: getFieldValue('key') === 'data_search',
                                                    message: 'Please select eClass',
                                                }],
                                            })(
                                                <Select
                                                    notFoundContent={t('notfound')}
                                                    allowClear={true}
                                                    showSearch={true}
                                                    disabled={!!this.props.specialEClass}
                                                    style={{ width: '270px' }}
                                                    autoFocus
                                                    placeholder="EClass">
                                                    {
                                                        this.state.classes
                                                            .filter((eclass: Ecore.EObject) => /*!eclass.get('abstract')
                                                                && */eclass.get('eAllStructuralFeatures')
                                                                    .find((feature: Ecore.EStructuralFeature) =>
                                                                        feature.get('eType').get('name') === 'QName'))
                                                            .map((eclass: Ecore.EObject) =>
                                                                <Select.Option key={eclass.get('name')}
                                                                               value={`${eclass.eContainer.get('name')}.${eclass.get('name')}`}>
                                                                    {`${eclass.eContainer.get('name')}.${eclass.get('name')}`}
                                                                </Select.Option>)
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                        <FormItem style={{ display: 'inline-block' }}>
                                            {getFieldDecorator('name', {
                                                rules: [{
                                                    required: getFieldValue('regular_expression') && getFieldValue('key') === 'data_search',
                                                    message: 'Please enter name'
                                                }]
                                            })(
                                                <Input placeholder={t("name")} style={{ width: '270px' }} type="text" />
                                            )}
                                        </FormItem>
                                        <FormItem style={{ display: 'inline-block' }}>
                                            {getFieldDecorator('tags', {
                                                rules: []
                                            })(
                                                <Select
                                                    allowClear={true}
                                                    mode={"tags"}
                                                    style={{ width: '270px' }}
                                                    defaultValue={""}
                                                    placeholder={this.props.t("tags")}>
                                                    {
                                                        this.state.tags.map((tag: Ecore.EObject) =>
                                                                <Select.Option key={tag.get('name')}
                                                                               value={tag.get('name')}>
                                                                    {tag.get('name')}
                                                                </Select.Option>)
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                        <FormItem style={{ display: 'inline-block' }}>
                                            {getFieldDecorator('regular_expression', {
                                                valuePropName: 'checked'
                                            })(
                                                <Checkbox style={{ marginLeft: '10px' }}>{t("regularexpression")}</Checkbox>
                                            )}
                                        </FormItem>
                                        {this.state.indicatorError ?
                                            <img alt={t('notfound')} src={ponyCat} className="error" />
                                            :
                                            undefined
                                        }
                                    </TabPane>
                                    <TabPane tab={this.props.t('json search')} key='json_search'>
                                        <FormItem>
                                            {getFieldDecorator('json_field', {
                                                initialValue: JSON.stringify({
                                                    contents: { eClass: !!this.props.specialEClass ? this.props.specialEClass.eURI() : "ru.neoflex.nfcore.base.auth#//User" }
                                                }, null, 4),
                                                rules: [{
                                                    required: getFieldValue('key') === 'json_search',
                                                    message: 'Please enter json'
                                                }]
                                            })(
                                                <div>
                                                    <AceEditor
                                                        ref={"aceEditor"}
                                                        mode={"json"}
                                                        width={"100%"}
                                                        onChange={(json_field: string) => {
                                                            setFields({ json_field: { value: json_field } });
                                                        }}
                                                        editorProps={{ $blockScrolling: true }}
                                                        value={getFieldValue('json_field')}
                                                        showPrintMargin={false}
                                                        theme={"tomorrow"}
                                                        debounceChangePeriod={100}
                                                        height={"104px"}
                                                    />
                                                </div>
                                            )}
                                        </FormItem>
                                    </TabPane>
                                </Tabs>
                            )}
                            <FormItem>
                                <Button title={t("searchsimple")} type="primary" htmlType="submit" style={{ width: '100px', fontSize: '17px' }}>
                                    <Icon type="search" />
                                </Button>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col span={1}>
                        <Button
                            title={t("createitem")}
                            icon="plus" 
                            type="primary" 
                            style={{ display: 'block', margin: '0px 0px 10px auto' }} 
                            shape="circle" 
                            size="large"
                            onClick={()=>this.setModalVisible(true)} 
                        />
                    </Col>
                </Row>
               
            </React.Fragment>
        );
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(DataSearch))

