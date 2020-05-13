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

const inputOperationKey: string = "_inputOperationKey";
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
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
    expression: string;
    currentIndex: number;
}

interface CalculatorEventHandlerProps {
    onButtonClick: React.MouseEventHandler<HTMLElement>;
    onClearClick: React.MouseEventHandler<HTMLElement>;
}

function CreateCalculator({onButtonClick, onClearClick}:CalculatorEventHandlerProps) {
    return <Col>
                <Row>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>1</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>2</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>3</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>+</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>4</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>5</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>6</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>-</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>7</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>8</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>9</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>/</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} onClick={onClearClick}>c</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>0</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>.</Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>*</Button>
                </Row>
                <Row>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>(</Button>
                    <Button style={{width: '80px'}} onClick={onButtonClick}> </Button>
                    <Button style={{width: '40px'}} onClick={onButtonClick}>)</Button>
                </Row>
            </Col>
}

interface ColumnButtonsProps {
    columnDefs: any[],
    onClick: React.MouseEventHandler<HTMLElement>
}

function CreateColumnButtons({columnDefs, onClick}: ColumnButtonsProps) {
    return <List>
                {columnDefs?.map((element, index) =>{
                    return <Button style={{marginRight: '2px', marginTop: '2px'}}
                                   key={"Button"+element.get("field")}
                                   onClick={onClick}>
                             {element.get("headerName")}
                           </Button>
                })}
            </List>
}

class Calculator extends DrawerParameterComponent<Props, State> {
    caretLastPosition: number;
    expressionRef = React.createRef<Input>();
    previousText: string;
    
    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            //array index
            currentIndex: undefined
        };
        this.caretLastPosition = 0;
        this.previousText = "";
        this.expressionRef = React.createRef<Input>()
    }

    componentDidMount(): void {
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
                [inputFieldKey]: this.state.parametersArray![this.state.currentIndex!].datasetColumn!
            });
        }
        if (JSON.stringify(prevProps.parametersArray) !== JSON.stringify(this.props.parametersArray)) {
            this.setState({parametersArray: this.props.parametersArray,currentIndex:0})
        }
    }

    handleCalculate = (e: MouseEvent<HTMLElement>) => {
        let newString = "";
        let cursorStartPosition = this.expressionRef.current!.input.selectionStart!;
        const cursorEndPosition = this.expressionRef.current!.input.selectionEnd!;
        const oldString = (this.getFieldValue(inputOperationKey))?this.getFieldValue(inputOperationKey):"";
        if (cursorStartPosition !== cursorEndPosition) {
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.textContent + oldString.substring(cursorEndPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.textContent).length;
            this.setFieldsValue({
                [inputOperationKey]: newString
            })
        } else {
            if (cursorStartPosition === 0) {
                cursorStartPosition = this.caretLastPosition
            } else {
                this.caretLastPosition = cursorStartPosition!
            }
            newString = oldString.substring(0,cursorStartPosition) + e.currentTarget.textContent + oldString.substring(cursorStartPosition);
            this.caretLastPosition = (oldString.substring(0,cursorStartPosition) + e.currentTarget.textContent).length;
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
                    type: undefined});
            let currentIndex = parametersArray.length - 1;
            this.setState({parametersArray, currentIndex});
        } else {
            this.props.context.notification('Calculator','Empty field name', 'error')
        }
    };

    deleteRow = () => {
        //Удаляем смещаем на 1 вниз
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
                            type: undefined
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
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Вычисляемые столбцы</div>
                    </Col>
                    <Col span={12}>
                        {
                            this.getFieldDecorator(inputSelectKey,{
                                initialValue: this.getFieldValue(inputFieldKey)
                            })(
                                <Select placeholder={this.t("Select calculated column")}
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
                <Form.Item>
                    <Row>
                        <Col span={12}>
                            {
                                this.getFieldDecorator(inputOperationKey,{
                                    /*value: this.currentOperation,*/
                                    initialValue: "",
                                    rules: [{
                                        required:true,
                                        message: ' '
                                    }]
                                })(
                                    <Input ref={this.expressionRef}
                                           placeholder={this.t("Expression")}/>
                                  )
                            }
                            <CreateColumnButtons
                                onClick={this.handleCalculate}
                                columnDefs={this.props.defaultColumnDefs}/>
                        </Col>
                        <Col span={12}>
                            <CreateCalculator
                                onButtonClick={this.handleCalculate}
                                onClearClick={this.handleClear}/>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Calculator))
