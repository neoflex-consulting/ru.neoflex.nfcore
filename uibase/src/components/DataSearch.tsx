import * as React from "react";
import Ecore from "ecore";
import {API} from "../modules/api";
import Button from "antd/es/button";
import Form from "antd/es/form";
import Input from "antd/es/input";
import FormItem from "antd/es/form/FormItem";
import {Icon, Select, Tabs} from "antd";
import {FormComponentProps} from 'antd/lib/form/Form';
import Checkbox from "antd/lib/checkbox";
import AceEditor from "react-ace";
import 'brace/theme/tomorrow';
import ponyCat from '../ponyCat.png';
import {withTranslation, WithTranslation} from "react-i18next";

interface Props {
    onSearch: (resources: Ecore.Resource[]) => void;
    specialEClass?: Ecore.EClass | undefined;
}

interface State {
    classes: Ecore.EObject[];
    indicatorError: boolean;
}

class DataSearch extends React.Component<Props & FormComponentProps & WithTranslation, State> {

    state = {
        classes: [],
        indicatorError: false
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    refresh = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.setState({indicatorError: false});
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
                        (selectedClassObject && API.instance().findByKindAndRegexp(selectedClassObject as Ecore.EClass, values.name)
                            .then((resources) => {
                                this.props.onSearch(resources)
                            }))
                        :
                        (selectedClassObject && API.instance().findByKindAndName(selectedClassObject as Ecore.EClass, values.name)
                            .then((resources) => {
                                this.props.onSearch(resources)
                            }))
            } else this.setState({indicatorError: true})
        });
    };

    getEClasses(): void {
            API.instance().fetchAllClasses(false).then(classes => {
            const filtered = (classes.filter((c: Ecore.EObject) => !c.get('interface')))
                .sort((a: any, b: any) => this.sortEClasses(a, b));
            this.setState({classes: filtered})
        })
    }

    sortEClasses = (a: any, b: any): number => {
        if (a.eContainer.get('name') + a._id < b.eContainer.get('name') + b._id) return -1;
        if (a.eContainer.get('name') + a._id > b.eContainer.get('name') + b._id) return 0;
        else return 0;
    };

    componentDidMount(): void {
        this.getEClasses()
    }

    render() {
        const {Option} = Select;
        const {getFieldDecorator, getFieldValue, setFields} = this.props.form;
        const {TabPane} = Tabs;
        const {t} = this.props;
        return (
            <Form onSubmit={this.handleSubmit}>
                {getFieldDecorator('key', {initialValue: 'data_search'})(
                    <Tabs onChange={(key: string) => {
                        setFields({key: {value: key}});
                    }}>
                        <TabPane tab='Data Search' key='data_search'>
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
                                        style={{width: '270px'}}
                                        autoFocus
                                        placeholder="EClass">
                                        {
                                            this.state.classes.map((c: Ecore.EObject, i: Number) =>
                                            <Option value={`${c.eContainer.get('name')}.${c.get('name')}`} key={`${i}${c.get('name')}`}>
                                                {`${c.eContainer.get('name')}.${c.get('name')}`}
                                            </Option>)
                                        }
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem style={{display: 'inline-block'}}>
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: getFieldValue('regular_expression') && getFieldValue('key') === 'data_search',
                                        message: 'Please enter name'
                                    }]
                                })(
                                    <Input placeholder={t("datasource.eClasses.Driver.eStructuralFeatures.name.caption",
                                        {ns: 'packages'})} style={{width: '270px'}} type="text"/>
                                )}
                            </FormItem>
                            <FormItem style={{display: 'inline-block'}}>
                                {getFieldDecorator('regular_expression', {
                                    valuePropName: 'checked'
                                })(
                                    <Checkbox style={{marginLeft: '10px'}}>{t("regularexpression")}</Checkbox>
                                )}
                            </FormItem>
                            {this.state.indicatorError ?
                                <img alt={t('notfound')} src={ponyCat} className="error" />
                                :
                                undefined
                            }
                        </TabPane>
                        <TabPane tab='Json Search' key='json_search'>
                            <FormItem>
                                {getFieldDecorator('json_field', {
                                    initialValue: JSON.stringify({
                                        contents: {eClass: !!this.props.specialEClass ? this.props.specialEClass.eURI() : "ru.neoflex.nfcore.base.auth#//User"}}, null, 4),
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
                                            setFields({json_field: {value: json_field}});
                                        }}
                                        editorProps={{$blockScrolling: true}}
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
                    <Button type="primary" htmlType="submit" style={{width: '100px', fontSize: '17px'}}>
                        <Icon type="search" />
                    </Button>
                </FormItem>
            </Form>
        );
    }
}

const WrappedDataSearch = Form.create<Props & FormComponentProps & WithTranslation>()(DataSearch);
const DataSearchTrans = withTranslation()(WrappedDataSearch);
export default DataSearchTrans;

