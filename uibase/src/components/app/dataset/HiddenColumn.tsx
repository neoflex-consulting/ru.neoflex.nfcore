import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {Form, Typography} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import {DrawerParameterComponent, DrawerState, ParameterDrawerProps} from './DrawerParameterComponent';
import {NeoButton, NeoCol, NeoColor, NeoInput, NeoRow, NeoSwitch} from "neo-design/lib";
import NeoIcon from "neo-icon/lib/icon";
import arrayMove from "array-move";

const { Paragraph } = Typography;

interface Props extends ParameterDrawerProps {
    componentType?: paramType;
    handleDrawerVisability?:any;
    datasetComponentVersion?: string;
}




function trimHeader(header: string) {
    return header.length > 60 ? header.substring(0,60) + "..." : header
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

const SortableItem = SortableElement(({value}:any) =>
    <div className="SortableItem" style={{display: value.isHidden ? 'none' : undefined}}>
    <NeoRow style={{height:'100%'}}>
        <NeoIcon color={NeoColor.grey_5} icon={"dragAndDrop"} size={"m"}/>
        <Form.Item style={{margin: 'auto 0 auto 20px'}}>
            <NeoSwitch
                checked={value.enable}
                onChange={(e: any) => {
                    const event = JSON.stringify({index: value.index, columnName: 'enable', value: e});
                    value.handleChange(event, true)
                }}/>
        </Form.Item>
        <Form.Item style={{ margin: value.parametersArray.length === 1 ? 'auto auto auto 24px' : 'auto 0 auto 24px'}}>
            <Paragraph
                key={`Paragraph ${value}`}
                editable={false}
                style={{marginBottom:'unset'}}>
                {
                    trimHeader(value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn)
                        ? value.columnDefs.find((c:Map<String,any>) => c.get('field') === value.datasetColumn).get('headerName')
                        : value.datasetColumn)
                }
            </Paragraph>
        </Form.Item>
        <NeoButton title={value.t("move top")} type={"link"} style={{ margin: value.index === value.parametersArray.length ? 'auto 24px auto auto' : 'auto 0 auto auto'}} onClick={()=>value.onToTopClick(value.index)} hidden={value.index === 1}>
            <NeoIcon icon={"moveUp"} color={NeoColor.grey_7} size={"m"}/>
        </NeoButton>
        <NeoButton title={value.t("move bottom")} type={"link"} style={{ marginLeft: value.index === 1 && 'auto'}} onClick={()=>value.onToBottomClick(value.index)} hidden={value.index === value.parametersArray.length}>
            <NeoIcon icon={"moveDown"} color={NeoColor.grey_7} size={"m"}/>
        </NeoButton>
    </NeoRow>
</div>);

class HiddenColumn extends DrawerParameterComponent<Props, DrawerState> {
    filter:string = "";

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.getFieldDecorator = this.props.form.getFieldDecorator;
    }

    handleOnSubmit=(e:any)=>{
        this.handleSubmit(e);
        this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
    };

    onSortEnd = ({oldIndex, newIndex}:any) => {
        let newState: IServerQueryParam[] = arrayMove(this.state.parametersArray!, oldIndex, newIndex);
        newState.forEach( (serverParam, index) => serverParam.index = index+1 );
        this.setState({parametersArray: newState});
        this.props.onChangeParameters!(this.state.parametersArray, this.props.componentType);
    };

    reset = () => {
        this.props.onChangeParameters!(undefined, this.props.componentType);
        this.filter = "";
    };

    render() {
        const {t} = this.props;
        return (
                    <div>
            <Form style={{ marginTop: '15px' }}>

                <Form.Item style={{marginTop: '-28px', marginBottom: '5px'}}>
                    <NeoCol span={18} style={{justifyContent: "flex-start", marginBottom: '6px'}}>
                        <NeoInput className={"search-column"} placeholder={this.props.t("quick filter")} value={this.filter} type={"search"} onChange={(event: any)=>{
                            this.filter = event.currentTarget.value;
                            this.setState({parametersArray:this.state.parametersArray!
                                    .map(p=>{
                                        return {
                                            ...p,
                                            isHidden: !(event.currentTarget.value === ""  || this.translate(p.datasetColumn as string).includes(event.currentTarget.value))
                                        }
                                    })});
                        }}/>
                    </NeoCol>
                    <NeoCol span={6} style={{justifyContent: "flex-end"}}>
                        <NeoButton title={t("back to version") + " " + this.props.datasetComponentVersion}
                                   type={'link'}
                                   id={'resetButton'}
                                   onClick={this.reset}>
                            <span style={{color: '#B38136', fontSize: '14px', fontWeight:'normal', textDecorationLine:'underline'}}>{t('reset')}</span>
                        </NeoButton>
                    </NeoCol>
                </Form.Item>
                <Form.Item style={{ marginBottom: '0' }}>
                    {
                        <SortableList items={this.state.parametersArray!
                            .map(hiddenColumn => (
                                {
                                    ...hiddenColumn,
                                    t : t,
                                    idDatasetColumn : `${JSON.stringify({index: hiddenColumn.index, columnName: 'datasetColumn', value: hiddenColumn.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: hiddenColumn.index, columnName: 'operation', value: hiddenColumn.operation})}`,
                                    getFieldDecorator: this.getFieldDecorator,
                                    columnDefs: this.props.columnDefs,
                                    handleChange: this.handleChange,
                                    parametersArray: this.state.parametersArray,
                                    onToBottomClick: (index:number)=>{
                                        if (this.state.parametersArray) {
                                            const item = this.state.parametersArray.splice(index-1,1);
                                            this.setState({parametersArray: this.state.parametersArray.concat(item).map((p, i)=>{
                                                    return {
                                                        ...p,
                                                        index: i+1
                                                    }
                                                })}, ()=> this.props.onChangeParameters!(this.state.parametersArray, this.props.componentType)
                                            )
                                        }
                                    },
                                    onToTopClick: (index:number)=>{

                                        if (this.state.parametersArray) {
                                            const item = this.state.parametersArray.splice(index-1,1);
                                            this.setState({parametersArray: item.concat(this.state.parametersArray).map((p, i)=>{
                                                    return {
                                                        ...p,
                                                        index: i+1
                                                    }
                                                })}, ()=>this.props.onChangeParameters!(this.state.parametersArray, this.props.componentType))
                                        }
                                    }
                                }))}
                                      distance={3}
                                      onSortEnd={this.onSortEnd}
                                      helperClass="SortableHelper"/>
                    }

                </Form.Item>

            </Form>
                    </div>

        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(HiddenColumn))
