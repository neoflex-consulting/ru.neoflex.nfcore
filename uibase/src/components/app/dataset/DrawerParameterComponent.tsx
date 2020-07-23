import * as React from 'react';
import {WithTranslation} from 'react-i18next';
import {Button, Row, Col, Form} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {faPlay, faPlus, faRedo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {paramType} from "./DatasetView"
import {IServerQueryParam} from "../../../MainContext";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import '../../../styles/Draggable.css';
import arrayMove from "array-move";
import {EObject} from "ecore";

interface Props {
    parametersArray?: Array<IServerQueryParam>;
    columnDefs?:  Array<any>;
    onChangeParameters?: (newServerParam: any[], paramName: paramType) => void;
    saveChanges?: (newParam: any, paramName: string) => void;
    isVisible?: boolean;
    componentType?: paramType;
}

interface State {
    parametersArray: IServerQueryParam[] | undefined;
    backgroundColorVisible?: boolean;
    textColorVisible?: boolean;
    colorIndex?: any;
    color?: any;
    currentIndex?: number;
    solidPicker?: boolean;
    calculatorFunction?: EObject[];
}

export class DrawerParameterComponent<T extends Props, V extends State> extends React.Component<Props & FormComponentProps & WithTranslation & any, State> {
    t: any;
    getFieldDecorator: any;
    setFieldsValue: any;
    getFieldValue: any;
    paramNotification: string;

    constructor(props: any) {
        super(props);
        this.state = {
            parametersArray: this.props.parametersArray,
            currentIndex: 0
        };
        this.handleChange = this.handleChange.bind(this);
        this.t = this.props.t;
        this.getFieldDecorator = this.props.form?.getFieldDecorator;
        this.setFieldsValue = this.props.form?.setFieldsValue;
        this.getFieldValue = this.props.form?.getFieldValue;
        switch (this.props.componentType) {
            case paramType.sort:
                this.paramNotification = "Sort notification";
                break;
            case paramType.highlights:
                this.paramNotification = "Highlight notification";
                break;
            case paramType.aggregate:
                this.paramNotification = "Aggregate notification";
                break;
            case paramType.filter:
                this.paramNotification = "Filter notification";
                break;
            case paramType.group:
                this.paramNotification = "Group by notification";
                break;
            case paramType.groupByColumn:
                this.paramNotification = "Group by column notification";
                break;
            default:
                this.paramNotification = "Param notification"
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (JSON.stringify(prevProps.isVisible) !== JSON.stringify(this.props.isVisible) && !this.props.isVisible
            && JSON.stringify(this.props.parametersArray) !== JSON.stringify(this.state.parametersArray)) {
            this.props.form.validateFields((err: any, values: any) => {
                if (err) {
                    this.props.context.notification(this.paramNotification,'Please, correct the mistakes', 'error')
                }
            });
        }
        if (JSON.stringify(prevProps.parametersArray) !== JSON.stringify(this.props.parametersArray)) {
            this.setState({parametersArray: this.props.parametersArray})
        }
        if (JSON.stringify(prevState.parametersArray) !== JSON.stringify(this.state.parametersArray)
            && this.props.isVisible
            && this.state.parametersArray?.length !== 0) {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    this.props.saveChanges!(this.state.parametersArray!, this.props.componentType);
                }
            });
        }

        if (this.state.parametersArray?.length === 0) {
            this.createNewRow()
        }
    }

        handleChange(e: any) {
        const target = JSON.parse(e);
        let parametersArray = this.state.parametersArray!.map( (f: any) => {
            if (f.index.toString() === target['index'].toString()) {
                const targetColumn = this.props.columnDefs!.find( (c: any) =>
                    c.get('field') === (f.datasetColumn || target['value'])
                );
                return {index: f.index,
                    datasetColumn: target['columnName'] === 'datasetColumn' ? target['value'] : f.datasetColumn,
                    operation: target['columnName'] === 'operation' ? target['value'] : f.operation,
                    value: target['columnName'] === 'value' ? target['value'] : f.value,
                    enable: target['columnName'] === 'enable' ? target['value'] : f.enable,
                    type: f.type || (targetColumn ? targetColumn.get('type') : undefined)}
            } else {
                return f
            }
        });
        this.setState({parametersArray})
    };

    translate = (field: string) => {
        let sortMap : {fieldName:string, fieldHeader:string}[] = this.props.columnDefs.map((colDef:any) => {
            return {
                fieldName : colDef.get("field"),
                fieldHeader : colDef.get("headerName")
            }
        }).sort((a: { fieldHeader: string; }, b: { fieldHeader: string; }) => {
            if (a.fieldHeader > b.fieldHeader) {
                return 1
            } else if (a.fieldHeader === b.fieldHeader){
                return 0
            }
            return -1
        });

        sortMap.some(colDef => {
            if (field.includes(colDef.fieldName)) {
                field = field.replace(colDef.fieldName, colDef.fieldHeader);
                return true
            }
            return false
        });
        return field
    };

    deleteRow = (e: any) => {
        this.props.form.resetFields();
        let newServerParam: IServerQueryParam[] = [];
        this.state.parametersArray?.forEach((element:IServerQueryParam, index:number) => {
            if (element.index !== e.index) {
                newServerParam.push({
                    index: newServerParam.length + 1,
                    datasetColumn: element.datasetColumn,
                    operation: element.operation,
                    value: element.value,
                    enable: (element.enable !== null ? element.enable : false),
                    type: element.type,
                    highlightType: element.highlightType,
                    backgroundColor: element.backgroundColor,
                    color: element.color
                })}
        });
        this.props.onChangeParameters!(newServerParam, this.props.componentType);
    };

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.refresh();
    };


    createNewRow = () => {
        let parametersArray: any = this.state.parametersArray;
        parametersArray.push(
            {index: parametersArray.length + 1,
                datasetColumn: undefined,
                operation: undefined,
                value: undefined,
                enable: true,   
                type: undefined,
                highlightType: undefined,
                backgroundColor: undefined,
                color: undefined});
        this.setState({parametersArray})
    };


    reset = () => {
        this.props.onChangeParameters!(undefined, this.props.componentType);
        this.setState({parametersArray:[]});
    };

    isValid(parameterArray : any) : boolean | undefined{
        let answer = 0;
        for (let i = 0; i < parameterArray.length; i++) {
            if (this.getColumnType(this.props.columnDefs, parameterArray[i].datasetColumn) === undefined){
                answer++
            }
            else if (this.getColumnType(this.props.columnDefs, parameterArray[i].datasetColumn) === "Integer"
                || this.getColumnType(this.props.columnDefs, parameterArray[i].datasetColumn) === "Decimal"){
                if ((parameterArray[i].operation === "Count" || parameterArray[i].operation === "CountDistinct"
                    || parameterArray[i].operation === "Maximum" || parameterArray[i].operation === "Minimum"
                    || parameterArray[i].operation === "Sum" || parameterArray[i].operation === "Average")) {
                    answer++
                }
            } else if (this.getColumnType(this.props.columnDefs, parameterArray[i].datasetColumn) === "String") {
                if (parameterArray[i].operation === "Count" || parameterArray[i].operation === "CountDistinct") {
                    answer++
                }
            } else if (this.getColumnType(this.props.columnDefs, parameterArray[i].datasetColumn) === "Date") {
                if (parameterArray[i].operation === "Count" || parameterArray[i].operation === "CountDistinct"
                    || parameterArray[i].operation === "Maximum" || parameterArray[i].operation === "Minimum") {
                    answer++
                }
            }
        }
        return answer === parameterArray.length;
    };

    getColumnType(columnDef: any[], columnName: string) : string | undefined{
        if (columnDef.length !== 0)
        {
            for (let i = 0; i < columnDef.length; i++) {
                if (columnDef[i].get("field") === columnName) {
                    return columnDef[i].get("type")
                }
            }
            return undefined
        }
    }

    refresh = () => {
        if (this.props.componentType === paramType.aggregate){
            if (!this.isValid(this.state.parametersArray!)){
                this.props.context.notification('Aggregate notification','Please, correct the mistakes', 'error')
            }
            else{
                        this.props.onChangeParameters!(this.state.parametersArray!, this.props.componentType)
            }
        }
        else{
                this.props.onChangeParameters!(this.state.parametersArray!, this.props.componentType)
            }

        /*this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onChangeParameters!(this.state.parametersArray!, this.props.componentType)
            }
            else {
                this.props.context.notification('Sort notification','Please, correct the mistakes', 'error')
            }*/
    };

    SortableItem = SortableElement(({value}: any) => {
        return <li className="SortableItem">
            <Row gutter={[8, 0]}>
                <Col span={24}>
                    {value.index}
                </Col>
            </Row>
        </li>
    });

    onSortEnd = ({oldIndex, newIndex}:any) => {
        let newState: IServerQueryParam[] = arrayMove(this.state.parametersArray!, oldIndex, newIndex);
        newState.forEach( (serverParam, index) => serverParam.index = index+1 );
        this.setState({parametersArray: newState});
    };

    SortableList = SortableContainer(({items}:any) => {
        return (
            <ul className="SortableList">
                {items.map((value:any) => (
                    <this.SortableItem key={`item-${value.index}`} index={value.index-1} value={value} />
                ))}
            </ul>
        );
    });

    render() {
        return (
            <Form style={{ marginTop: '30px' }} onSubmit={this.handleSubmit}>
                <Form.Item style={{marginTop: '-38px', marginBottom: '40px'}}>
                    <Col span={12}>
                        <div style={{display: "inherit", fontSize: '17px', fontWeight: 500, marginLeft: '18px', color: '#878787'}}>Сортировка</div>
                    </Col>
                    <Col span={12} style={{textAlign: "right"}}>
                        <Button
                            title="reset"
                            style={{width: '40px', marginRight: '10px'}}
                            key={'resetButton'}
                            value={'resetButton'}
                            onClick={this.reset}
                        >
                            <FontAwesomeIcon icon={faRedo} size='xs' color="#7b7979"/>
                        </Button>
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
                    </Col>
                </Form.Item>
                <Form.Item>
                    {
                        <this.SortableList items={this.state.parametersArray!
                            .map((serverParam: any) => (
                                {
                                    ...serverParam,
                                    idDatasetColumn : `${JSON.stringify({index: serverParam.index, columnName: 'datasetColumn', value: serverParam.datasetColumn})}`,
                                    idOperation : `${JSON.stringify({index: serverParam.index, columnName: 'operation', value: serverParam.operation})}`,
                                }))} distance={3} onSortEnd={this.onSortEnd} helperClass="SortableHelper"/>
                    }
                </Form.Item>
            </Form>
        )
    }
}
