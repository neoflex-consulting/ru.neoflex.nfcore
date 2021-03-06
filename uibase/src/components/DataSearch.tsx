import * as React from "react";
import Ecore from "ecore";
import {API, QueryResult} from "../modules/api";
import {Form, Tabs} from "antd";
import AceEditor from "react-ace";
import 'brace/theme/tomorrow';
import {withTranslation, WithTranslation} from "react-i18next";

import ResourceCreateFrom from './ResourceCreateForm'
import {NeoButton, NeoHint, NeoInput, NeoOption, NeoSelect, NeoTabs} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {FormInstance} from "antd/lib/form";

interface Props {
    onJSONSearch: (results: QueryResult) => void;
    onSearch: (resources: Ecore.Resource[]) => void;
    onReset: () => void;
    specialEClass?: Ecore.EClass | undefined;
    refresh: boolean;
}

interface State {
    refresh: boolean,
    tags: Ecore.EObject[];
    classes: Ecore.EObject[];
    indicatorError: boolean;
    createResModalVisible: boolean;
    selectTags: number;
    selectCount: number;
    selectDropdownVisible: boolean;
    isJSONResult: boolean;
}

class DataSearch extends React.Component<Props & WithTranslation, State> {
    formRef = React.createRef<FormInstance>();

    state = {
        refresh: this.props.refresh,
        tags: [],
        classes: [],
        indicatorError: false,
        createResModalVisible: false,
        selectTags: 6,
        selectCount: 0,
        selectDropdownVisible: false,
        isJSONResult: false
    };

    handleSubmit = (e: any) => {
        this.refresh();
    };

    handleSubmitFailed = () => {
        this.setState({ indicatorError: true })
    };

    refresh = () => {
        this.setState({ indicatorError: false });
        const values = this.formRef.current!.getFieldsValue();
        let selectedClassObject: Ecore.EClass | undefined;
        if (this.props.specialEClass === undefined) {
            selectedClassObject = this.state.classes.find((c: Ecore.EClass) => c.eContainer.get('name') + "." + c.get('name') === values.selectEClass);
         } else {
             selectedClassObject = this.props.specialEClass
         }
         if (this.state.isJSONResult) {
             API.instance().find(JSON.parse(values.json_field.value)).then(results=>{
                 this.props.onJSONSearch(results)
             })
         } else if (values.key.value === "json_search") {
             API.instance().find(JSON.parse(values.json_field.value)).then(results => {
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

    componentDidUpdate() {
        if (this.props.refresh !== this.state.refresh){
            this.refresh()
            this.setState({refresh: this.props.refresh})
        }
    }

    checkEClass = () => {
        const checkRecursive = (cls:Ecore.EClass ) => {
            let retVal = false;
            if (cls.get('name') === 'Tagged') {
                return true;
            } else {
                cls.get('eSuperTypes').each((cl:any)=>{
                    retVal = checkRecursive(cl)
                })
            }
            return retVal
        };
        const className = this.formRef.current !== null ? this.formRef.current!.getFieldValue('selectEClass') : "";
        if (className === "" || !className) {
            return false
        }
        const selectedClassObject = this.state.classes.find((c: Ecore.EClass) => c.eContainer.get('name') + "." + c.get('name') === className);
        return !(selectedClassObject && checkRecursive(selectedClassObject as Ecore.EClass));
    };

    onSearchClick = () => {
        this.setState({isJSONResult: false}, ()=>this.handleSubmit)
    };

    onJSONSearchClick = () => {
        this.setState({isJSONResult: true}, ()=>this.handleSubmit)
    };

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                {this.state.createResModalVisible && <ResourceCreateFrom
                    classes={ this.state.classes }
                    refresh={ this.refresh}
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
                    onFinishFailed={this.handleSubmitFailed}
                    style={{width:'100%', padding:'10px 36px'}}
                    className={'datasearch'}
                >
                    <Form.Item
                        name={"key"}
                    >
                        <NeoTabs
                            onChange={(key: string) => {
                                this.formRef.current!.setFieldsValue({ key: { value: key } })
                                this.setState({isJSONResult: false}, ()=> this.props.onReset())
                            }}
                        >
                            <NeoTabs.TabPane
                                key='data_search'
                                className={'datasearch_region'}
                                tab={this.props.t('data search')}
                            >
                                <Form.Item
                                    style={{display:'block'}}
                                    label={<div style={{lineHeight:'1', marginBottom:'4px'}}>EClass</div>}
                                    name={"selectEClass"}
                                    initialValue={this.props.specialEClass === undefined
                                        ? undefined :
                                        this.props.specialEClass.eContainer.get('name') + "." + this.props.specialEClass.get('name')}
                                >
                                    <NeoSelect
                                        className={'EClass_select'}
                                        width={'100%'}
                                        style={{maxWidth: '670px'}}
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
                                    style={{display:'block'}}
                                    label={<div style={{lineHeight:'1', marginBottom:'4px'}}>{t('name')}</div>}
                                    name={"name"}
                                >
                                    <NeoInput width={'100%'} style={{maxWidth: '670px'}} />
                                </Form.Item>

                                <Form.Item
                                    style={{display:'block'}}
                                    label={<div style={{lineHeight:'1', marginBottom:'4px'}}>{t('tags')}</div>}
                                    name={"tags"}
                                >
                                    <NeoSelect
                                        className={'tags-select'}
                                        allowClear={true}
                                        mode={"tags"}
                                        disabled={this.checkEClass()}
                                        width={'100%'}
                                        style={{maxWidth: '670px'}}
                                        onChange={(event:any) => {
                                            this.setState({selectCount: event.toString().split(',').length})
                                        }}
                                        placeholder={t('choose from the list')}
                                        maxTagTextLength={7}
                                        maxTagCount={'responsive'}
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
                                {this.formRef.current ?
                                    <Form.Item style={{margin:'20px auto 16px'}} shouldUpdate={true}>
                                        {() => (
                                        <NeoButton
                                            type={((this.formRef.current!.getFieldValue('tags') === undefined ||
                                                this.formRef.current!.getFieldValue('tags').length === 0) &&
                                                this.formRef.current!.getFieldValue('selectEClass') === undefined &&
                                                (this.formRef.current!.getFieldValue('name') === undefined ||
                                                    this.formRef.current!.getFieldValue('name') === ""))
                                                ? 'disabled': 'primary'}
                                            onClick={this.handleSubmit}
                                        >
                                            {t('searchsimple')}
                                        </NeoButton>
                                        )}
                                    </Form.Item>

                                    :
                                    null
                                }


                            </NeoTabs.TabPane>

                            <Tabs.TabPane
                                className={'datasearch_region'}
                                tab={this.props.t('json search')}
                                key='json_search'
                            >
                                <Form.Item
                                    name={"json_field"}
                                    initialValue={this.formRef.current !== null && this.formRef.current!.getFieldValue("json_field") === undefined ? this.formRef.current!.setFieldsValue({ json_field: { value: JSON.stringify({
                                                contents: { eClass: !!this.props.specialEClass ? this.props.specialEClass.eURI() : "ru.neoflex.nfcore.base.auth#//User" }
                                            }, null, 4) } }) : undefined}
                                >
                                    <div>
                                        <AceEditor
                                            ref={"aceEditor"}
                                            mode={"json"}
                                            width={"100%"}
                                            onChange={(json_field: string) => {
                                                this.formRef.current!.setFieldsValue({ json_field: { value: json_field } });
                                            }}
                                            editorProps={{ $blockScrolling: true }}
                                            defaultValue={JSON.stringify({
                                                contents: { eClass: !!this.props.specialEClass ? this.props.specialEClass.eURI() : "ru.neoflex.nfcore.base.auth#//User" }
                                            }, null, 4)}
                                            showPrintMargin={false}
                                            theme={"tomorrow"}
                                            debounceChangePeriod={100}
                                            height={"104px"}
                                        />
                                    </div>
                                </Form.Item>


                                <Form.Item style={{marginBottom:'20px'}}>
                                    <NeoButton
                                        title={t("table view")}
                                        onClick={this.onSearchClick}
                                    >
                                        {t('table view')}
                                    </NeoButton>

                                    <NeoButton
                                        style={{marginLeft:"16px"}}
                                        type={"secondary"}
                                        title={t("json view")}
                                        onClick={this.onJSONSearchClick}
                                    >
                                        {t('json view')}
                                    </NeoButton>
                                </Form.Item>

                            </Tabs.TabPane>
                            <NeoButton
                                title={t("createitem")}
                                type="square"
                                size="medium"
                                style={{ position:'absolute', right:'0', top: '0', zIndex:1}}
                                onClick={ () => this.setModalVisible(true) }
                            >
                                <NeoIcon color={'white'} size={'m'} icon={"plus"} /></NeoButton>
                        </NeoTabs>
                    </Form.Item>
                </Form>

            </React.Fragment>
        )
    }
}

export default withTranslation()(DataSearch);

