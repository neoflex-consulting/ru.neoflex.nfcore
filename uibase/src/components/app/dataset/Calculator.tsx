import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {Button, Row, Col, Form, Select, Input, List} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {MouseEvent} from "react";
import {API} from "../../../modules/api";
import {EObject} from "ecore";
import TextArea from "antd/lib/input/TextArea";
import * as crypto from "crypto"
import {appTypes} from "../../../utils/consts";

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
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
    expression: string;
    currentIndex: number;
    calculatorFunction: EObject[];
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
    return <Col>
                <Row>
                    <Button style={{width: '40px'}} value={"1"} onClick={onButtonClick}>1</Button>
                    <Button style={{width: '40px'}} value={"2"} onClick={onButtonClick}>2</Button>
                    <Button style={{width: '40px'}} value={"3"} onClick={onButtonClick}>3</Button>
                    <Button style={{width: '40px'}} value={"+"} onClick={onButtonClick}>+</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} value={"4"} onClick={onButtonClick}>4</Button>
                    <Button style={{width: '40px'}} value={"5"} onClick={onButtonClick}>5</Button>
                    <Button style={{width: '40px'}} value={"6"} onClick={onButtonClick}>6</Button>
                    <Button style={{width: '40px'}} value={"-"} onClick={onButtonClick}>-</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} value={"7"} onClick={onButtonClick}>7</Button>
                    <Button style={{width: '40px'}} value={"8"} onClick={onButtonClick}>8</Button>
                    <Button style={{width: '40px'}} value={"9"} onClick={onButtonClick}>9</Button>
                    <Button style={{width: '40px'}} value={"/"} onClick={onButtonClick}>/</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} onClick={onClearClick}>c</Button>
                    <Button style={{width: '40px'}} value={"0"} onClick={onButtonClick}>0</Button>
                    <Button style={{width: '40px'}} value={"."} onClick={onButtonClick}>.</Button>
                    <Button style={{width: '40px'}} value={"*"} onClick={onButtonClick}>*</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} value={"("} onClick={onButtonClick}>(</Button>
                    <Button style={{width: '80px'}} value={" "} onClick={onButtonClick}>{t("space")}</Button>
                    <Button style={{width: '40px'}} value={")"} onClick={onButtonClick}>)</Button>
                </Row>
            </Col>
}

function CreateFunctions({onButtonClick, functions,t}:FunctionsEventHandlerProps) {
    return (<Col key={"CreateFunctionsCol"}>
        {functions ? functions.map(func => {
            return <Row key={func.get("literal") + "row"}>
                <Button key={func.get("literal")} style={{textAlign: "left"}} value={t(func.get("literal"))} onClick={onButtonClick}>{t(func.get("literal")).split("(")[0]}</Button>
            </Row>
        }) : null}
    </Col>)
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
    return <List>
                {columnDefs?.map((element, index) =>{
                    return <Button style={{marginRight: '2px', marginTop: '2px', wordWrap:"break-word", whiteSpace: "normal", textAlign:"left" }}
                                   key={"Button"+element.get("field")}
                                   onClick={onClick}
                                   value={encode(index)}
                            >
                             {encode(index) + " - " + element.get("headerName")}
                           </Button>
                })}
            </List>
}

class Calculator extends DrawerParameterComponent<Props, State> {
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
        if (this.state.calculatorFunction!.length === 0) {this.getAllEnumValues("dataset","CalculatorFunction", "calculatorFunction")}
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
        API.instance().findEnum(ePackageName, enumName)
            .then((result: EObject[]) => {
                const paramValue = result.map( (o: any) => {return o});
                this.setState<never>({
                    [paramName]: paramValue
                })
            })
    };

    handleCalculate = (e: any) => {
        let newString = "";
        let cursorStartPosition = this.expressionRef.current.resizableTextArea.textArea.selectionStart!;
        const cursorEndPosition = this.expressionRef.current.resizableTextArea.textArea.selectionEnd!;
        const oldString = (this.getFieldValue(inputOperationKey))?this.getFieldValue(inputOperationKey):"";
        if (cursorStartPosition !== cursorEndPosition) {
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.value + oldString.substring(cursorEndPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.value).length;
            this.setFieldsValue({
                [inputOperationKey]: newString
            })
        } else {
            if (cursorStartPosition === 0) {
                cursorStartPosition = this.caretLastPosition
            } else {
                this.caretLastPosition = cursorStartPosition!
            }
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.value + oldString.substring(cursorStartPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.value).length;
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
            }
        });
    };

    reset = () => {
        this.props.onChangeParameters!(undefined, this.props.componentType);
        this.setState({parametersArray:[{index:1}],currentIndex:0});
        this.setFieldsValue({
            [inputOperationKey]: this.state.parametersArray![this.state.currentIndex!].operation!,
            [inputFieldKey]: this.state.parametersArray![this.state.currentIndex!].datasetColumn!
        });
    };

    render() {
    return (
        <div>
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>{this.t('calculatableExpressions')}</div>
                    </Col>
                    <Col span={12}>
                        {
                            this.getFieldDecorator(inputSelectKey,{
                                initialValue: this.getFieldValue(inputFieldKey)
                            })(
                                <Select getPopupContainer={() => document.getElementById ('calculatableexpressionsButton') as HTMLElement}
                                    placeholder={this.t("Select calculated column")}
                                        onChange={(e: any) => {
                                            this.setState({currentIndex:e});
                                        }}>
                                    {this.state.parametersArray?.map((element)=> {
                                        return <Select.Option
                                            key={(element.datasetColumn)? element.datasetColumn : ""}
                                            value={(element.index)? element.index - 1 : 0}
                                        >
                                            {element.datasetColumn}
                                        </Select.Option>
                                    })}

                                </Select>
                            )
                        }
                    </Col>
                </Form.Item>
                <Form.Item>
                    <Col span={8}>
                        {
                            this.getFieldDecorator(inputFieldKey,{
                                rules: [{
                                    required:true,
                                    message: ' '
                                }]
                            })(
                                <Input placeholder={this.t("Enter new column name")}/>
                            )
                        }
                    </Col>
                    <Col span={8}>
                        <Button
                            title="add row"
                            style={{width: '40px', marginLeft: '10px', marginRight: '10px'}}
                            key={'createNewRowButton'}
                            value={'createNewRowButton'}
                            onClick={this.createNewRow}
                        >
                            <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="run query"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'runQueryButton'}
                            value={'runQueryButton'}
                            htmlType="submit"
                        >
                            <FontAwesomeIcon icon={faPlay} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="delete"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'deleteButton'}
                            value={'deleteButton'}
                            onClick={this.deleteRow}
                        >
                            <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="reset"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'resetButton'}
                            value={'resetButton'}
                            onClick={this.reset}
                        >
                            <FontAwesomeIcon icon={faRedo} size='xs' color="#7b7979"/>
                        </Button>
                    </Col>
                    <Col span={8}/>
                </Form.Item>
                <Row>
                <Form.Item>
                <Col span={8}>
                    {
                        this.getFieldDecorator(selectTypeKey,{
                            rules: [{
                            }]
                        })(
                            <Select placeholder={this.t('datatype')} key={selectTypeKey} allowClear={true}>
                                {Object.keys(appTypes).map(type => <Select.Option key={type} value={type}>
                                    {this.t(type)}
                                </Select.Option>)}
                            </Select>
                        )
                    }
                </Col>
                </Form.Item>
                <Form.Item>
                <Col span={8}>
                    {
                        this.getFieldDecorator(selectMaskKey,{
                            rules: [{
                            }]
                        })(
                            <Select placeholder={this.t('format')} key={selectMaskKey} allowClear={true}>
                                {this.props.formatMasks.map((mask:{key:string,value:string}) => <Select.Option
                                    key={mask.key}
                                    value={mask.value}>
                                    {this.t(mask.key)}
                                </Select.Option>)}
                            </Select>
                        )
                    }
                </Col>
                </Form.Item>
                </Row>
                <Form.Item>
                    <Row>
                        <Col span={24}>
                            {
                                this.getFieldDecorator(inputOperationKey,{
                                    /*value: this.currentOperation,*/
                                    initialValue: "",
                                    rules: [{
                                        required:true,
                                        message: ' '
                                    }]
                                })(
                                    <TextArea ref={this.expressionRef}
                                           placeholder={this.t("Expression")}
                                           style={{height:"150px"}}
                                    />
                                  )
                            }

                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>
                            <div style={{textAlign:"center"}}>
                                {this.t("columns")}
                            </div>
                            <div style={{ height: '500px', overflowY:"scroll"}}>
                                <CreateColumnButtons
                                    onClick={this.handleCalculate}
                                    columnDefs={this.props.defaultColumnDefs.filter((def:any) => !def.get('hide'))}/>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div style={{textAlign:"center"}}>
                                {this.t("keypad")}
                            </div>
                            <CreateCalculator
                                onButtonClick={this.handleCalculate}
                                onClearClick={this.handleClear}
                                t={this.t}/>
                        </Col>
                        <Col span={8}>
                            <div style={{textAlign:"center"}}>
                                {this.t("functions/operators")}
                            </div>
                            <div style={{ height: '500px', overflowY:"scroll" }}>
                                <CreateFunctions
                                    onButtonClick={this.handleCalculate}
                                    functions={this.state.calculatorFunction}
                                    t={this.t}
                                />
                            </div>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </div>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Calculator))
