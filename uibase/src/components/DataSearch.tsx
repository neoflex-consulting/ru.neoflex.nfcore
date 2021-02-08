import * as React from "react";
import Ecore from "ecore";
import {API} from "../modules/api";
import {Form, Layout, Tabs} from "antd";
import AceEditor from "react-ace";
import 'brace/theme/tomorrow';
import ponyCat from '../icons/ponyCat.png';
import {withTranslation, WithTranslation} from "react-i18next";

import ResourceCreateFrom from './ResourceCreateForm'
import {NeoButton, NeoHint, NeoInput, NeoOption, NeoSelect} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {FormInstance} from "antd/lib/form";

interface Props {
    onSearch: (resources: Ecore.Resource[]) => void;
    specialEClass?: Ecore.EClass | undefined;
}

interface State {
    tags: Ecore.EObject[];
    classes: Ecore.EObject[];
    createResModalVisible: boolean;
    selectTags: number;
    selectCount: number;
    selectDropdownVisible: boolean;
}

class DataSearch extends React.Component<Props & WithTranslation, State> {
    formRef = React.createRef<FormInstance>();

    state = {
        tags: [],
        classes: [],
        createResModalVisible: false,
        selectTags: 6,
        selectCount: 0,
        selectDropdownVisible: false
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };

    refresh = () => {
        this.formRef.current?.validateFields().then((values: any) => {
            let selectedClassObject: Ecore.EClass | undefined;
            if (this.props.specialEClass === undefined) {
                selectedClassObject = this.state.classes.find((c: Ecore.EClass) => c.eContainer.get('name') + "." + c.get('name') === values.selectEClass);
             } else {
                 selectedClassObject = this.props.specialEClass
             }
             if (values.key === 'json_search') {
                 API.instance().find(JSON.parse(values.json_field)).then(results => {
                     this.props.onSearch(results.resources)
                 })
             } else if (selectedClassObject) {
                 (API.instance().findByKindAndRegexp(selectedClassObject as Ecore.EClass, values.name, 1, values.tags ? values.tags.join(",") : undefined)
                     .then((resources) => {
                        this.props.onSearch(resources)
                    }))
             } else {
                (API.instance().findByTagsAndRegex( values.tags ? values.tags.join(",") : undefined, values.name,1)
                    .then((resources) => {
                         this.props.onSearch(resources)
                    }))
            }

        }).catch( () => {
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
        if (a.eContainer.get('name').toLowerCase() + a._id.toLowerCase() < b.eContainer.get('name').toLowerCase() + b._id.toLowerCase()) return -1;
        if (a.eContainer.get('name').toLowerCase() + a._id.toLowerCase() > b.eContainer.get('name').toLowerCase() + b._id.toLowerCase()) return 0;
        else return 0;
    };

    setModalVisible = (state:boolean) => {
        this.setState({ createResModalVisible: state })
    }

    componentDidMount(): void {
        this.getEClasses();
        this.getAllTags();
    }

    // checkEClass = () => {
    //     const checkRecursive = (cls:Ecore.EClass ) => {
    //         let retVal = false;
    //         if (cls.get('name') === 'Tagged') {
    //             return true;
    //         } else {
    //             cls.get('eSuperTypes').each((cl:any)=>{
    //                 retVal = checkRecursive(cl)
    //             })
    //         }
    //         return retVal
    //     };
    //     const className = form.getFieldValue('selectEClass');
    //     if (className === "" || !className) {
    //         return false
    //     }
    //     const selectedClassObject = this.state.classes.find((c: Ecore.EClass) => c.eContainer.get('name') + "." + c.get('name') === className);
    //     return !(selectedClassObject && checkRecursive(selectedClassObject as Ecore.EClass));
    // };


    render() {
        const { TabPane } = Tabs;
        const { t } = this.props;
        return (
            <React.Fragment>
                {this.state.createResModalVisible && <ResourceCreateFrom
                    classes={ this.state.classes }
                    refresh={ this.refresh }
                    createResModalVisible={ this.state.createResModalVisible }
                    form = { "form" }
                    translate={ t }
                    setModalVisible={this.setModalVisible}
                />}
                <Form
                    ref={this.formRef}
                    name={"dataSearch"}
                    initialValues={{ key: 'data_search' }}
                    onFinish={this.handleSubmit}
                    onFinishFailed={this.handleSubmit}
                >
                    <NeoButton
                        title={t("createitem")}
                        suffixIcon={<NeoIcon icon={"plus"}/>}
                        type="primary"
                        style={{ display: 'block', backgroundColor:'#424D78', margin: '0px 0px 10px auto', position:'absolute', right:'56px', zIndex:1}}
                        size="large"
                        onClick={ () => this.setModalVisible(true) }
                    />
                    <Form.Item
                        name={"key"}
                    >
                        <Tabs
                            // onChange={(key: string) => {
                            //     this.formRef.current!.setFieldsValue({ key: { value: key } })
                            // }}
                        >
                            <Tabs.TabPane
                                key='data_search'
                                className={'datasearch_region'}
                                tab={this.props.t('data search')}
                            >
                                <Form.Item
                                    label={<div style={{lineHeight:'1', marginBottom:'4px'}}>EClass</div>}
                                    name={"selectEClass"}
                                    initialValue={this.props.specialEClass === undefined
                                        ? undefined :
                                        this.props.specialEClass.eContainer.get('name') + "." + this.props.specialEClass.get('name')}
                                >
                                    <NeoSelect
                                        className={'EClass_select'}
                                        width={'670px'}
                                        allowClear={true}
                                        showSearch={true}
                                        disabled={!!this.props.specialEClass}
                                        placeholder={t('eClass')}>
                                        {
                                            this.state.classes
                                                .filter((eclass: Ecore.EObject) => /*!eclass.get('abstract')
                                                    && */eclass.get('eAllStructuralFeatures')
                                                        .find((feature: Ecore.EStructuralFeature) =>
                                                            feature.get('eType').get('name') === 'QName'))
                                                .map((eclass: Ecore.EObject) =>
                                                    <NeoOption key={eclass.get('name')}
                                                                   value={`${eclass.eContainer.get('name')}.${eclass.get('name')}`}>
                                                        {`${eclass.eContainer.get('name')}.${eclass.get('name')}`}
                                                    </NeoOption>)
                                        }
                                    </NeoSelect>
                                </Form.Item>




                                <Form.Item
                                    style={{display:'inline-block'}}
                                    label={<div style={{lineHeight:'1', marginBottom:'4px'}}>{t('name')}</div>}
                                    name={"name"}
                                >
                                    <NeoInput width={'670px'} />
                                </Form.Item>

                                <Form.Item

                                    label={t('tags')}
                                    name={"tags"}
                                >
                                    <NeoSelect
                                        className={'tags-select'}
                                        allowClear={true}
                                        mode={"tags"}
                                        // disabled={this.checkEClass()}
                                        width={'670px'}
                                        onChange={(event:any) => {
                                            this.setState({selectCount: event.toString().split(',').length})
                                        }}
                                        placeholder={t('choose from the list')}
                                        maxTagTextLength={7}
                                        maxTagCount={this.state.selectTags}
                                        maxTagPlaceholder={`Еще ${this.state.selectCount-this.state.selectTags}`}
                                        onDropdownVisibleChange={()=>this.setState({selectDropdownVisible: !this.state.selectDropdownVisible})}
                                    >
                                        {
                                            this.state.tags.map((tag: Ecore.EObject) =>
                                                    <NeoOption key={tag.get('name')}
                                                               value={tag.get('name')}>
                                                        {this.state.selectDropdownVisible ?
                                                            tag.get('name')
                                                            :
                                                            <NeoHint title={tag.get('name')}>
                                                            {tag.get('name')}
                                                            </NeoHint>
                                                        }
                                                    </NeoOption>
                                                )
                                        }
                                     </NeoSelect>
                                </Form.Item>

                                <Form.Item style={{marginBottom:'20px'}}>
                                    <NeoButton
                                        onClick={this.handleSubmit}
                                       type={'primary'}
                                    >
                                        {t('searchsimple')}
                                    </NeoButton>
                                </Form.Item>

                            </Tabs.TabPane>

                            <Tabs.TabPane
                                className={'datasearch_region'}
                                tab={this.props.t('json search')}
                                key='json_search'
                            >
                                <Form.Item
                                    name={"json_field"}
                                    initialValue={
                                        JSON.stringify({
                                            contents: { eClass: !!this.props.specialEClass ? this.props.specialEClass.eURI() : "ru.neoflex.nfcore.base.auth#//User" }
                                            }, null, 4)
                                    }
                                >
                                    <div>
                                        <AceEditor
                                            ref={"aceEditor"}
                                            mode={"json"}
                                            width={"100%"}
                                            // onChange={(json_field: string) => {
                                            //     setFieldsValue({ json_field: { value: json_field } });
                                            // }}
                                            editorProps={{ $blockScrolling: true }}
                                            // value={getFieldValue('json_field')}
                                            showPrintMargin={false}
                                            theme={"tomorrow"}
                                            debounceChangePeriod={100}
                                            height={"104px"}
                                        />
                                    </div>
                                </Form.Item>

                                <Form.Item style={{marginBottom:'20px'}}>
                                    <NeoButton
                                        title={t("searchsimple")}
                                    >
                                        {t('searchsimple')}
                                    </NeoButton>
                                </Form.Item>

                            </Tabs.TabPane>

                        </Tabs>
                    </Form.Item>
                </Form>

            </React.Fragment>
        )
    }
}

export default withTranslation()(DataSearch);

