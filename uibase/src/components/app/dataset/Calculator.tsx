import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {EObject} from 'ecore';
import {Button, Row, Col, Form, Select, Switch, Input, List} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {DrawerParameterComponent} from './DrawerParameterComponent';
import {ChangeEvent, EventHandler} from "react";
import {MouseEvent} from "react";

const inputOperationKey: string = "_inputOperationKey";
const inputFieldKey: string = "_inputFieldKey";
const inputSelectKey: string = "_inputSelectKey";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newServerParam: any[], paramName: paramType) => void;
    isVisible?: boolean;
    allCalculatorOperations?: Array<EObject>;
    componentType?: paramType;
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
    expression: string;
    currentIndex: number;
}

interface CalculatorEventHandlerProps {
    onItemsClick: React.MouseEventHandler<HTMLElement>;
    onClearClick: React.MouseEventHandler<HTMLElement>;
}

function CreateCalculator({onItemsClick, onClearClick}:CalculatorEventHandlerProps) {
    return <Col>
                <Row>
                    <Button onClick={onItemsClick}>1</Button>
                    <Button onClick={onItemsClick}>2</Button>
                    <Button onClick={onItemsClick}>3</Button>
                    <Button onClick={onItemsClick}>+</Button>
                </Row>
                <Row>
                    <Button onClick={onItemsClick}>4</Button>
                    <Button onClick={onItemsClick}>5</Button>
                    <Button onClick={onItemsClick}>6</Button>
                    <Button onClick={onItemsClick}>-</Button>
                </Row>
                <Row>
                    <Button onClick={onItemsClick}>7</Button>
                    <Button onClick={onItemsClick}>8</Button>
                    <Button onClick={onItemsClick}>9</Button>
                    <Button onClick={onItemsClick}>/</Button>
                </Row>
                <Row>
                    <Button onClick={onClearClick}>c</Button>
                    <Button onClick={onItemsClick}>0</Button>
                    <Button onClick={onItemsClick}>.</Button>
                    <Button onClick={onItemsClick}>*</Button>
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
                    return <Row>
                        <Button key={element.get("field")} onClick={onClick}>{element.get("field")}</Button>
                    </Row>
                })}
            </List>
}

class Calculator extends DrawerParameterComponent<Props, State> {
    currentField: string;
    
    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            expression: "",
            currentIndex: 0
        };
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot?: any): void {
        if (JSON.stringify(prevState.currentIndex) !== JSON.stringify(this.state.currentIndex)) {
            this.setFieldsValue({
                [inputOperationKey]: this.state.parametersArray![this.state.currentIndex!].operation!,
                [inputFieldKey]: this.state.parametersArray![this.state.currentIndex!].datasetColumn!
            });
        }
    }

    handleCalculate = (e: MouseEvent<HTMLElement>) => {
        this.setFieldsValue({
            [inputOperationKey]: this.getFieldValue(inputOperationKey) + e.currentTarget.textContent
        })
    };

    handleClear = (e: MouseEvent<HTMLElement>) => {
        this.setFieldsValue({
            [inputOperationKey]:""
        })
    };

    handleTextInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.value) {
            this.setState({expression: e.currentTarget.value})
        }
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
            this.props.context.notification('Achtung!','Empty field name', 'error')
        }
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        /*this.refresh();*/
        this.props.form.validateFields((err: any, values: any) => {
            if (err) {
                this.props.context.notification('Achtung!','Please, correct the mistakes', 'error')
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
            }
        });
    };

    render() {
    return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={8}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Вычисляемые столбцы</div>
                        {
                            this.getFieldDecorator(inputFieldKey,{
                                rules: [{
                                    required:true,
                                    message: ' '
                                }]
                            })(
                                <Input/>
                            )
                        }
                    </Col>
                    <Col span={16} style={{textAlign: "right"}}>
                        {
                            this.getFieldDecorator(inputSelectKey,{
                                initialValue: this.getFieldValue(inputFieldKey)
                            })(
                                <Select
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
                        <Button
                            title="add row"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'createNewRowButton'}
                            value={'createNewRowButton'}
                            onClick={this.createNewRow}
                        >
                            <FontAwesomeIcon icon={faPlus} size='xs' color="#7b7979"/>
                        </Button>
                        <Button
                            title="run query"
                            style={{width: '40px'}}
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
                            /*TODO*/
                            /*onClick={this.reset}*/
                        >
                            <FontAwesomeIcon icon={faTrash} size='xs' color="#7b7979"/>
                        </Button>
                    </Col>
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
                                    <Input onChange={this.handleTextInput}/>
                                  )
                            }
                            <CreateColumnButtons onClick={this.handleCalculate} columnDefs={this.props.columnDefs}/>
                        </Col>
                        <Col span={12}>
                            <CreateCalculator onItemsClick={this.handleCalculate} onClearClick={this.handleClear}/>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        )
    }
}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(Calculator))
