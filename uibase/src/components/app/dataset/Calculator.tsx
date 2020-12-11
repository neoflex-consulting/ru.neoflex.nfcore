import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {Form, List} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {DrawerParameterComponent, DrawerState} from './DrawerParameterComponent';
import {MouseEvent} from "react";
import {API} from "../../../modules/api";
import Ecore, {EObject} from "ecore";
import TextArea from "antd/lib/input/TextArea";
import * as crypto from "crypto"
import {appTypes} from "../../../utils/consts";
import {NeoButton, NeoCol, NeoColor, NeoInput, NeoRow, NeoSelect, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

const inputOperationKey: string = "_inputOperationKey";
const selectTypeKey: string = "_selectTypeKey";
const selectMaskKey: string = "_selectMaskKey";
const inputFieldKey: string = "_inputFieldKey";
const inputSelectKey: string = "_inputSelectKey";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    componentType?: paramType;
    onChangeColumnDefs?: (columnDefs: any, rowData: any, datasetComponentName: string) => void;
    defaultColumnDefs?: Array<any>;
    formatMasks?: {key:string,value:string}[]
    handleDrawerVisability?: any;
    currentDatasetComponent?: Ecore.Resource;
}

interface CalculatorEventHandlerProps {
    onButtonClick: React.MouseEventHandler<HTMLElement>;
    onClearClick: React.MouseEventHandler<HTMLElement>;
    t: any;
}

interface FunctionsEventHandlerProps {
    onButtonClick: React.MouseEventHandler<HTMLElement>;
    functions?: EObject[];
    t: any;
}

function CreateCalculator({onButtonClick, onClearClick, t}:CalculatorEventHandlerProps) {
    return <NeoCol style={{flexDirection:'column'}}>
                <NeoRow>
                    <NeoButton type={'link'} className={'calc-button'} id={'1'} onClick={onButtonClick}>1</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'2'} onClick={onButtonClick}>2</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'3'} onClick={onButtonClick}>3</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'4'} onClick={onButtonClick}>4</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'5'} onClick={onButtonClick}>5</NeoButton>
                </NeoRow>
                <NeoRow>
                    <NeoButton type={'link'} className={'calc-button'} id={'6'} onClick={onButtonClick}>6</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'7'} onClick={onButtonClick}>7</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'8'} onClick={onButtonClick}>8</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'9'} onClick={onButtonClick}>9</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'0'} onClick={onButtonClick}>0</NeoButton>
                </NeoRow>
                <NeoRow>
                    <NeoButton type={'link'} className={'calc-button'} id={'('} onClick={onButtonClick}>(</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={')'} onClick={onButtonClick}>)</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'\''} onClick={onButtonClick}>`</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'.'} onClick={onButtonClick}>.</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={','} onClick={onButtonClick}>,</NeoButton>
                </NeoRow>
                <NeoRow>
                    <NeoButton type={'link'} className={'calc-button'} id={'-'} onClick={onButtonClick}>-</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'+'} onClick={onButtonClick}>+</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'*'} onClick={onButtonClick}>*</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'/'} onClick={onButtonClick}>/</NeoButton>
                    <NeoButton type={'link'} className={'calc-button'} id={'||'} onClick={onButtonClick}>||</NeoButton>
                    {/*<NeoButton type={'link'} className={'calc-button'} onClick={onClearClick}>c</NeoButton>*/}
                </NeoRow>
                <NeoRow>
                    <NeoButton type={'link'} style={{width: '175px', height: '24px', marginTop: '5px', border: '1px solid #D9D9D9', color: 'black'}} onClick={onButtonClick} id={' '}>{t("space")}</NeoButton>
                </NeoRow>
            </NeoCol>
}

function CreateFunctions({onButtonClick, functions,t}:FunctionsEventHandlerProps) {
    return (<NeoCol key={"CreateFunctionsCol"} style={{flexDirection:'column'}}>
        {functions ? functions.map(func => {
            return <NeoRow key={func.get("literal") + "row"}>
                <NeoButton
                    type={'link'}
                    key={func.get("literal")}
                    style={{textAlign: "left", color: 'black'}}
                    id={t(func.get("literal"))}
                    onClick={onButtonClick}>
                    {t(func.get("literal")).split("(")[0]}
                </NeoButton>
            </NeoRow>
        }) : null}
    </NeoCol>)
}

interface ColumnButtonsProps {
    columnDefs: any[],
    onClick: React.MouseEventHandler<HTMLElement>
}

export function encode(index: number) : string {
    if (index <= 23) {
        return String.fromCharCode(65 + index)
    } else {
        return String.fromCharCode(64 + index/26) + String.fromCharCode(65 + index%26)
    }
}

export function hash(s: string) : string {
    const hash = crypto.createHash('md5');
    hash.update(s);
    return hash.digest("hex")
}

function CreateColumnButtons({columnDefs, onClick}: ColumnButtonsProps) {
    return <List style={{padding:'8px 12px 17px'}}>
                {columnDefs?.map((element, index) =>{
                    return <NeoButton
                        type={'link'}
                        style={{color: 'black', wordWrap:"break-word", whiteSpace: "normal", textAlign:"left", display: "block" }}
                        key={"Button"+element.get("field")}
                        onClick={onClick}
                        id={encode(index)}
                            >
                             {encode(index) + " - " + element.get("headerName")}
                           </NeoButton>
                })}
            </List>
}

class Calculator extends DrawerParameterComponent<Props, DrawerState> {
    caretLastPosition: number;
    expressionRef = React.createRef<any>();
    previousText: string;
    
    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            //array index
            currentIndex: undefined,
            calculatorFunction: [],
        };
        this.caretLastPosition = 0;
        this.previousText = "";
        this.expressionRef = React.createRef<TextArea>()
    }

    componentDidMount(): void {
        /*if (this.state.calculatorFunction!.length === 0) {this.getAllEnumValues("dataset","CalculatorFunction", "calculatorFunction")}*/
        this.getALLFunctions(this.props.currentDatasetComponent?.eResource());
        if (this.props.parametersArray && this.props.parametersArray.length !== 0) {
            this.setState({parametersArray: this.props.parametersArray,currentIndex:0})
        } else {
            this.setState({parametersArray:[{index:1}],currentIndex:0})
        }
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot?: any): void {
        if (JSON.stringify(prevState.currentIndex) !== JSON.stringify(this.state.currentIndex)
            || JSON.stringify(prevState.parametersArray) !== JSON.stringify(this.state.parametersArray)) {
            this.setFieldsValue({
                [inputOperationKey]: this.state.parametersArray![this.state.currentIndex!].operation!,
                [inputFieldKey]: this.state.parametersArray![this.state.currentIndex!].datasetColumn!,
                [selectTypeKey]: this.state.parametersArray![this.state.currentIndex!].type!,
                [selectMaskKey]: this.state.parametersArray![this.state.currentIndex!].mask!
            });
        }
        if (JSON.stringify(prevProps.parametersArray) !== JSON.stringify(this.props.parametersArray)) {
            this.setState({parametersArray: this.props.parametersArray,currentIndex:0})
        }
    }

    getAllEnumValues(ePackageName:string, enumName:string, paramName:string) {
        API.instance().findEnum(    ePackageName, enumName)
            .then((result: EObject[]) => {
                const paramValue = result.map( (o: any) => {return o});
                this.setState<never>({
                    [paramName]: paramValue
                })
            })
    };

    getALLFunctions(resource_?: Ecore.Resource){
        const resource = resource_;
        if (resource) {
            const ref: string = `${resource.get('uri')}?rev=${resource.rev}`;
            const methodName: string = 'getAllFunctions';
            API.instance().call(ref, methodName, []).then((json: string) => {
                let  result: string = JSON.stringify(json);
                API.instance().findEnum(    "dataset", "CalculatorFunction")
                    .then((json: EObject[]) => {
                        const paramValue = json.filter((element : any, index) => {return result.includes(element._id.substr(21, element._id.size)) || index > 35}).map((o: any) => {
                            return o});
                        this.setState({
                            calculatorFunction: paramValue
                        })
                    })
            })
        }
    }

    handleCalculate = (e: any) => {
        let newString = "";
        let cursorStartPosition = this.expressionRef.current.resizableTextArea.textArea.selectionStart!;
        const cursorEndPosition = this.expressionRef.current.resizableTextArea.textArea.selectionEnd!;
        const oldString = (this.getFieldValue(inputOperationKey))?this.getFieldValue(inputOperationKey):"";
        if (cursorStartPosition !== cursorEndPosition) {
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.id + oldString.substring(cursorEndPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.id).length;
            this.setFieldsValue({
                [inputOperationKey]: newString
            })
        } else {
            if (cursorStartPosition === 0) {
                cursorStartPosition = this.caretLastPosition
            } else {
                this.caretLastPosition = cursorStartPosition!
            }
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.id + oldString.substring(cursorStartPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.id).length;
            this.setFieldsValue({
                [inputOperationKey]: newString
            })
        }
        this.previousText = newString
    };

    handleClear = (e: MouseEvent<HTMLElement>) => {
        this.setFieldsValue({
            [inputOperationKey]:""
        })
    };

    createNewRow = () => {
        if (this.getFieldValue(inputFieldKey)
            && this.getFieldValue(inputFieldKey) !== "") {
            let parametersArray: any = this.state.parametersArray;
            parametersArray.push(
                {index: parametersArray.length + 1,
                    datasetColumn: undefined,
                    operation: undefined,
                    enable: true,
                    type: this.getFieldValue(selectTypeKey),
                    mask: this.getFieldValue(selectMaskKey)});
            let currentIndex = parametersArray.length - 1;
            this.setState({parametersArray, currentIndex});
        } else {
            this.props.context.notification('Calculator','Empty field name', 'error')
        }
    };

    deleteRow = () => {
        // Удаляем смещаем на 1 вниз
        if (this.state.parametersArray?.length !== 1) {
            let parametersArray = this.state.parametersArray?.filter((element => {
                return element.index - 1 !== this.state.currentIndex
            })).map((element, index) => {
                return {...element,
                        index: index + 1}
            });
            let currentIndex = parametersArray!.length - 1;
            this.setState({parametersArray, currentIndex});
            this.props.onChangeParameters!(parametersArray!, this.props.componentType)
        //Последний обнуляем
        } else {
            let parametersArray = this.state.parametersArray?.map((element) => {
                   return {index: 1,
                       datasetColumn: undefined,
                       operation: undefined,
                       enable: true,
                       type: undefined}
                }
            );
            this.setState({parametersArray});
            this.props.onChangeParameters!(parametersArray!, this.props.componentType)
        }
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (err) {
                this.props.context.notification('Calculator','Please, correct the mistakes', 'error')
            } else {
                let parametersArray: any = this.state.parametersArray!.map((element)=>{
                    if (element.index-1 === this.state.currentIndex) {
                        return {
                            index: element.index,
                            datasetColumn: this.getFieldValue(inputFieldKey),
                            operation: this.getFieldValue(inputOperationKey),
                            enable: true,
                            type: this.getFieldValue(selectTypeKey),
                            mask: this.getFieldValue(selectMaskKey)
                        }
                    } else {
                        return element
                    }
                });
                this.setState({parametersArray});
                this.props.onChangeParameters!(parametersArray!, this.props.componentType)
                this.props.handleDrawerVisability(this.props.componentType, !this.props.isVisible )
            }
        });
    };

    reset = () => {
        this.props.onChangeParameters!(undefined, this.props.componentType);
        this.setState({parametersArray:[{index:1}],currentIndex:0});
        this.setFieldsValue({
            [inputOperationKey]: this.state.parametersArray![this.state.currentIndex!].operation!,
            [inputFieldKey]: this.state.parametersArray![this.state.currentIndex!].datasetColumn!,
            [inputSelectKey]: null
        });
    };

    render() {
    return (
        <div id={"selectsInCalculator"}>
            <Form style={{ marginTop: '24px' }}>
                <Form.Item style={{marginTop: '-28px', marginBottom:'15px', lineHeight:'19px'}}>
                        <NeoTypography type={'h4_medium'} style={{color:'#333333'}}>
                            {this.t('calculatableExpressions')}
                        </NeoTypography>
                </Form.Item>
                <Form.Item style={{marginBottom:'15px'}}>
                    <NeoCol span={10} style={{justifyContent:'flex-start'}}>
                        {
                            this.getFieldDecorator(inputSelectKey,{
                                initialValue: this.getFieldValue(inputFieldKey)
                            })(
                                <NeoSelect
                                    width={'310px'}
                                    getPopupContainer={() => document.getElementById ('calculatableexpressionsButton') as HTMLElement}
                                    placeholder={this.t("Select calculated column")}
                                    onChange={(e: any) => {
                                        this.setState({currentIndex:e});
                                    }}>
                                    {this.state.parametersArray?.filter((e)=>e.datasetColumn)
                                        .map((element)=> {
                                        return <option
                                            key={(element.datasetColumn)? element.datasetColumn : ""}
                                            value={(element.index)? element.index - 1 : 0}
                                        >
                                            {element.datasetColumn}
                                        </option>
                                    })}

                                </NeoSelect>
                            )
                        }
                    </NeoCol>
                    <NeoCol span={2}>
                        <NeoButton
                            type={'link'}
                            title={this.props.t("add calculable column")}
                            id={'createNewRowButton'}
                            onClick={this.createNewRow}
                        >
                            <NeoIcon icon={"plus"} color={NeoColor.violete_6} style={{margin:'auto 5px auto auto'}}/>
                        </NeoButton>
                    </NeoCol>
                    <NeoCol span={12} style={{justifyContent:'flex-end'}}>
                        {
                            this.getFieldDecorator(inputFieldKey,{
                                rules: [{
                                    required:true,
                                    message: ' '
                                }]
                            })(
                                <NeoInput
                                    width={'310px'}
                                    placeholder={this.t("Enter new column name")}
                                    onPressEnter={(e: { preventDefault: () => any; })=>{
                                        e.preventDefault();
                                        this.handleSubmit(e)
                                    }}
                                />
                            )
                        }
                    </NeoCol>
                </Form.Item>
                <Form.Item style={{marginBottom:'32px'}}>
                <NeoCol span={12} style={{justifyContent:'flex-start'}}>
                    {
                        this.getFieldDecorator(selectTypeKey,{
                            rules: [{
                            }]
                        })(
                            <NeoSelect placeholder={this.t('datatype')} key={selectTypeKey} allowClear={true} width={'310px'}
                                       getPopupContainer={() => document.getElementById ('selectsInCalculator') as HTMLElement}>
                                {Object.keys(appTypes).map(type => <option key={type} value={type}>
                                    {this.t(type)}
                                </option>)}
                            </NeoSelect>
                        )
                    }
                </NeoCol>
                <NeoCol span={12} style={{justifyContent:'flex-end'}}>
                    {
                        this.getFieldDecorator(selectMaskKey,{
                            rules: [{
                            }]
                        })(
                            <NeoSelect placeholder={this.t('format')} key={selectMaskKey} allowClear={true} width={'310px'}
                                       getPopupContainer={() => document.getElementById ('selectsInCalculator') as HTMLElement}>
                                {(this.props.formatMasks) ? this.props.formatMasks.map((mask:{key:string,value:string}) => <option
                                    key={mask.key}
                                    value={mask.value}>
                                    {this.t(mask.key)}
                                </option>) : undefined}
                            </NeoSelect>
                        )
                    }
                </NeoCol>
                </Form.Item>
                <Form.Item style={{marginBottom:'0px'}}>
                    <div style={{ display: "flex", fontSize: '14px', fontWeight: 500, lineHeight:'16px', color: '#333333', marginBottom:'8px'}}>{this.t('computational expression')}</div>
                    <div style={{ display: "flex", fontSize: '14px', fontWeight: 300, lineHeight:'16px', color: '#8с8с8с', marginBottom:'16px'}}>{this.t('create a calculation using column aliases')}</div>
                </Form.Item>
                    <Form.Item>
                    <NeoRow style={{marginBottom: '12px'}}>
                        <NeoCol span={24}>
                            {
                                this.getFieldDecorator(inputOperationKey,{
                                    /*value: this.currentOperation,*/
                                    initialValue: "",
                                    rules: [{
                                        required:true,
                                        message: ' '
                                    }]
                                })(
                                    <TextArea
                                       ref={this.expressionRef}
                                       placeholder={this.t("Expression")}
                                       style={{height:"112px"}}
                                    />
                                  )
                            }
                        </NeoCol>
                    </NeoRow>
                    <NeoRow>
                        <NeoCol span={8} style={{justifyContent: 'flex-start'}}>
                            <div className={'calc-block'}>
                                <NeoTypography type={'capture_medium'} style={{marginLeft:'10px', marginTop:'12px'}}>
                                    {this.t("columns")}
                                </NeoTypography>
                                <div style={{ height: '219px', overflowY:"auto"}}>
                                    <CreateColumnButtons
                                        onClick={this.handleCalculate}
                                        columnDefs={this.props.defaultColumnDefs.filter((def:any) => !def.get('hide'))}/>
                                </div>
                            </div>
                        </NeoCol>
                        <NeoCol span={8}>
                            <div className={'calc-block'}>
                                <NeoTypography type={'capture_medium'} style={{marginLeft:'10px', marginTop:'12px'}}>
                                    {this.t("keypad")}
                                </NeoTypography>
                                <CreateCalculator
                                    onButtonClick={this.handleCalculate}
                                    onClearClick={this.handleClear}
                                    t={this.t}/>
                            </div>
                        </NeoCol>
                        <NeoCol span={8} style={{justifyContent: 'flex-end'}}>
                            <div className={'calc-block'}>
                                <NeoTypography type={'capture_medium'} style={{marginLeft:'10px', marginTop:'12px', marginBottom:'10px'}}>
                                    {this.t("functions/operators")}
                                </NeoTypography>
                                <div style={{ height: '219px', overflowY:"auto" }}>
                                        <CreateFunctions
                                        onButtonClick={this.handleCalculate}
                                        functions={this.state.calculatorFunction}
                                        t={this.t}
                                    />
                                </div>
                            </div>
                        </NeoCol>
                    </NeoRow>
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
                                title={this.t("run query")}
                                style={{width: '127px'}}
                                id={'runQueryButton'}
                                onClick={this.handleSubmit}
                            >
                            {this.props.t('apply')}
                        </NeoButton>
                        <NeoButton
                            type={'secondary'}
                            title={this.t("reset")}
                            style={{width: '117px', marginLeft: '16px'}}
                            id={'resetButton'}
                            onClick={this.reset}
                        >
                            {this.props.t('clear')}
                        </NeoButton>
                    </div>
                <p>
                    {this.props.t("examples")}:<br/>
                    1. (B+C)*100 <br/>
                    2. {this.props.t("lower")}(B)||', '||{this.props.t("upper")}(C)<br/>
                    3. {this.props.t("case")} {this.props.t("when")} A = 10 {this.props.t("then")} B + C {this.props.t("else")} B {this.props.t("end")}
                </p>
            </Form>
        </div>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Calculator))
