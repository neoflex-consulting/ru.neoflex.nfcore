import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {Form, Typography} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoRow, NeoSwitch} from "neo-design/lib";

const { Paragraph } = Typography;

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Map<String,any>[];
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    componentType?: paramType;
    handleDrawerVisability?:any;
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
}

const SortableList = SortableContainer(({items}:any) => {
    return (
        <ul className="SortableList">
            {items.map((value:any) => (
                <SortableItem key={`item-${value.index}`} index={value.index-1} value={value} />
            ))}
        </ul>
    );
});

const SortableItem = SortableElement(({value}:any) => <div className="SortableItem">
    <NeoRow style={{height:'100%'}}>
        <NeoCol span={2}>
            <Form.Item style={{ margin: 'auto' }}>
                <NeoSwitch
                    defaultChecked={value.enable !== undefined ? value.enable : true}
                    onChange={(e: any) => {
                        const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                        value.handleChange(event, true)
                    }}/>
            </Form.Item>
        </NeoCol>
        <NeoCol span={22}>
            <Form.Item style={{ margin: 'auto auto auto 25px'}}>
                <Paragraph
                    key={`Paragraph ${value}`}
                    editable={false}
                    style={{marginBottom:'unset'}}>
                    {
                        value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn)
                            ? value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn).get('headerName')
                            : value.datasetColumn
                    }
                </Paragraph>
            </Form.Item>
        </NeoCol>
    </NeoRow>
</div>);

class HiddenColumn extends DrawerParameterComponent<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
        };
        this.handleChange = this.handleChange.bind(this);
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    }

    render() {
        const {t} = this.props
        return (
            <Form style={{ marginTop: '15px' }} onSubmit={this.handleOnSubmit}>
                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={18} style={{justifyContent: "flex-start"}}>
                        <div style={{display: "inherit", fontSize: '16px', fontWeight: 500, color: '#878787'}}>Выберите колонки, которые вы хотите скрыть</div>
                    </NeoCol>
                    <NeoCol span={6} style={{justifyContent: "flex-end"}}>
                        <NeoButton type={'link'}
                                   title={t("reset")}
                                   id={'resetButton'}
                                   onClick={this.reset}>
                            <span style={{color: '#B38136', fontSize: '14px', fontWeight:'normal', textDecorationLine:'underline'}}>Сбросить</span>
                        </NeoButton>
                    </NeoCol>
                </Form.Item>
                <Form.Item style={{ marginBottom: '0' }}>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map((serverSort: any) => (
                                {
                                    ...serverSort,
                                    idDatasetColumn : `${JSON.stringify({index: serverSort.index, columnName: 'datasetColumn', value: serverSort.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverSort.index, columnName: 'operation', value: serverSort.operation})}`,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    handleChange: this.handleChange,
                                    parametersArray: this.state.parametersArray
                                }))}
                                      distance={3}
                                      onSortEnd={this.onSortEnd}
                                      helperClass="SortableHelper"/>
                    }
                </Form.Item>
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '80px',
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '16px 40px',
                    background: '#F2F2F2',
                    textAlign: 'left',
                }}>
                    <NeoButton
                        id={'runQueryButton'}
                        title={t('apply')}
                        style={{width: '144px'}}
                        onClick={this.handleOnSubmit}>
                        {t('apply')}
                    </NeoButton>
                </div>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(HiddenColumn))
