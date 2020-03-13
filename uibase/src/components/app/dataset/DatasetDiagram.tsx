import * as React from "react";
import {withTranslation} from 'react-i18next';
import {Axis, ResponsiveBar} from "@nivo/bar";
import {ResponsiveLine} from "@nivo/line";
import {ResponsivePie} from "@nivo/pie";
import {AxisProps} from "@nivo/axes"
import {diagramAnchorMap} from "../../../utils/consts";
import {Button, Dropdown, Menu} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {API} from "../../../modules/api";
import Ecore from "ecore";
import { Resizable } from "re-resizable";
import domtoimage from 'dom-to-image';
import { handleExportDocx, docxExportObject, docxElementExportType } from "../../../utils/docxExportUtils";
import { handleExportExcel, excelExportObject, excelElementExportType } from "../../../utils/excelExportUtils";
import {saveAs} from "file-saver";

interface Props {
}

interface State {
}

function getUniqueFromData(data: any[], indexed: string) {
    const keys = [];
    for (let i of data) {
        keys.push(i[indexed])
    }
    return Array.from(new Set(keys))
}

const diagramAnchorMap_: any = diagramAnchorMap;

const resizeStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "solid 1px #ddd",
    background: "#ffffff"
};

class DatasetDiagram extends React.Component<any, any> {

    private node: (Resizable|null);

    constructor(props: any) {
        super(props);

        this.state = {
            columnDefs: [],
            rowData: [],
            //Enums
            AxisXPositionType: [],
            AxisYPositionType: [],
            LegendAnchorPositionType: [],

            indexBy: (this.props.viewObject.get('indexBy') !== undefined ) ? this.props.viewObject.get('indexBy').values.name : "",
            keyColumn: (this.props.viewObject.get('keyColumn') !== undefined ) ? this.props.viewObject.get('keyColumn').values.name : "",
            valueColumn: (this.props.viewObject.get('valueColumn') !== undefined ) ? this.props.viewObject.get('valueColumn').values.name : "",
            legendAnchorPosition: diagramAnchorMap_[this.props.viewObject.get('legendAnchorPosition')] || diagramAnchorMap_["TopLeft"],
            axisXPosition: this.props.viewObject.get('axisXPosition') || "Top",
            axisXLegend: this.props.viewObject.get('axisXLegend') || "",
            axisYPosition: this.props.viewObject.get('axisYPosition') || "Left",
            axisYLegend: this.props.viewObject.get('axisYLegend') || "",
            //Пока цвет задаётся через цветовые схемы
            colorSchema: this.props.viewObject.get('colorSchema') || "",
            diagramType: this.props.viewObject.get('diagramType') || "Line"
        };
    }

    //2.Добавление в action handler
    onActionMenu(e : any) {
        if (e.key.split('.').includes('axisXPosition')) {
            this.setSelectedKey(e.key.split('.')[0], e.key.split('.')[1])
        }
        if (e.key.split('.').includes('axisYPosition')) {
            this.setSelectedKey(e.key.split('.')[0], e.key.split('.')[1])
        }
        if (e.key.split('.').includes('legendAnchorPosition')) {
            this.setSelectedKey(e.key.split('.')[0], e.key.split('.')[1])
        }
        if (e.key === 'exportToDocx') {
            handleExportDocx(this.props.context)
        }
        if (e.key === 'exportToExcel') {
            handleExportExcel(this.props.context)
        }
        if (e.key === 'getImage') {
            this.getImage()
        }
    }

    //3.Добавление в getSelectedKeys
    private getSelectedKeys() {
        let selectedKeys: string[] = [];
        selectedKeys.push(`axisXPosition.${this.state.axisXPosition}`);
        selectedKeys.push(`axisYPosition.${this.state.axisYPosition}`);
        selectedKeys.push(`legendAnchorPosition.${this.state.legendAnchorPosition}`);
        return selectedKeys;
    }

    //4. Добавление считывания enum
    componentDidMount(): void {
        if (this.props.context.docxHandlers !== undefined) {
            this.props.context.docxHandlers.push(this.getDocxData.bind(this))
        }
        if (this.props.context.excelHandlers !== undefined) {
            this.props.context.excelHandlers.push(this.getExcelData.bind(this))
        }
        if (this.state.AxisXPositionType.length === 0) {
            this.getAllEnumValues("AxisXPositionType")
        }
        if (this.state.AxisYPositionType.length === 0) {
            this.getAllEnumValues("AxisYPositionType")
        }
        if (this.state.LegendAnchorPositionType.length === 0) {
            this.getAllEnumValues("LegendAnchorPositionType", function(str : string) {
                return diagramAnchorMap[str];
            })
        }
    }

    componentWillUnmount(): void {
        if (this.props.context.docxHandlers !== undefined && this.props.context.docxHandlers.length > 0) {
            this.props.context.docxHandlers.pop()
        }
        if (this.props.context.excelHandlers !== undefined && this.props.context.excelHandlers.length > 0) {
            this.props.context.excelHandlers.pop()
        }
    }

    private setSelectedKey(parameterKey?: string, parameterValue?: string) {
        if (this.state.AxisXPositionType.length !== 0) {
            if (parameterKey && parameterValue) {
                let selectedKey: any = {};
                selectedKey[parameterKey] = parameterValue;
                this.setState(selectedKey);
                this.props.viewObject.set(parameterKey, parameterValue);
            }
        }
    }

    private getDocxData(): docxExportObject {
        return {
            docxComponentType : docxElementExportType.diagram,
            diagramData: {
                //@ts-ignore
                blob: domtoimage.toBlob(this.node?.resizable),
                width: (this.node) ? this.node.size.width : 800,
                height: (this.node) ? this.node.size.height : 600
            }
        };
    }

    private getExcelData() : excelExportObject {
        return  {
            excelComponentType : excelElementExportType.diagram,
            diagramData: {
                //@ts-ignore
                blob: domtoimage.toBlob(this.node?.resizable),
                width: (this.node) ? this.node.size.width : 800,
                height: (this.node) ? this.node.size.height : 600
            }
        };
    }

    private getImage() {
        // @ts-ignore
        domtoimage.toBlob(this.node?.resizable).then((blob) => {
            saveAs(blob, 'image.png')
        });
    }
    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        //Вычитать и отобразить данные
        const userComponentName = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === this.props.viewObject.get('datasetView')._id);
        const componentName = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
            this.props.viewObject.get('datasetView').get('datasetComponent').get('name')
            : JSON.parse(userComponentName[0].get('value'))['name'];
        if (this.props.context.datasetComponents
            && this.props.context.datasetComponents[componentName] !== undefined) {
            if (JSON.stringify(prevState.columnDefs) !== JSON.stringify(this.props.context.datasetComponents[componentName]['columnDefs'])) {
                const columnDefs = this.props.context.datasetComponents[componentName]['columnDefs'];
                this.setState({columnDefs})
            }
            if (JSON.stringify(prevState.rowData) !== JSON.stringify(this.props.context.datasetComponents[componentName]['rowData'])) {
                const rowData = this.props.context.datasetComponents[componentName]['rowData'];
                this.setState({rowData})
            }
        }
        if ((this.props.viewObject.get('diagramType') === null && this.state.diagramType !== "Line")
            ||
            (this.props.viewObject.get('diagramType') !== null && this.state.diagramType !== this.props.viewObject.get('diagramType'))) {

            this.setState({diagramType: this.props.viewObject.get('diagramType') || "Line",
                indexBy: this.props.viewObject.get('indexBy') || "",
                keyColumn: this.props.viewObject.get('keyColumn') || "",
                valueColumn: this.props.viewObject.get('valueColumn') || "",
                legendAnchorPosition: diagramAnchorMap_[this.props.viewObject.get('legendAnchorPosition')] || diagramAnchorMap_["TopLeft"],
                axisXPosition: this.props.viewObject.get('axisXPosition') || "Top",
                axisXLegend: this.props.viewObject.get('axisXLegend') || "",
                axisYPosition: this.props.viewObject.get('axisYPosition') || "Left",
                axisYLegend: this.props.viewObject.get('axisYLegend') || "",
                //Пока цвет задаётся через цветовые схемы
                colorSchema: this.props.viewObject.get('colorSchema') || ""
            })
        }
    }

    getAllEnumValues(enumName: string, mapFunction: any = undefined) {
        let enumValues : Array<string> = [];
        API.instance().findEnum('application', enumName)
            .then((result: Ecore.EObject[]) => {
                enumValues = result.map( (t: any) => {
                    return t.get('name')
                });
                //Переводим из модели в нужные типы
                if (mapFunction !== undefined) {
                    enumValues = enumValues.map(mapFunction);
                }
                let attrName: any = {};
                attrName[enumName] = enumValues;
                this.setState(attrName)
            });
    };

    private drawBar() {
        function prepareData(indexedBy: string, keyColumn: string, dataColumn: string, rowData: any) {
            const distIndexes = getUniqueFromData(rowData, indexedBy);
            let dataForChart = [];

            if (distIndexes.length !== 0) {
                for (let i = 0; i < distIndexes.length; i++) {
                    let dataObject = {};
                    //Подписи под столбцом
                    Object.defineProperty(dataObject, indexedBy, {value : distIndexes[i]});
                    for (let j = 0; j < rowData.length; j++) {
                        if (rowData[j][indexedBy] === distIndexes[i]) {
                            //Данные
                            Object.defineProperty(dataObject, rowData[j][keyColumn], {value : rowData[j][dataColumn]})
                        }
                    }
                    dataForChart.push(dataObject)
                }
            }
            return dataForChart
        }
        const distKeys = getUniqueFromData(this.state.rowData, this.state.keyColumn);
        const axisX : Axis  = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.axisXLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        const axisY : Axis = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.axisYLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        return <div>
            <Resizable ref={(n) => { this.node = n}}
                       style={resizeStyle}
                       defaultSize={{
                           width: 700,
                           height: 400
                       }}>
            <ResponsiveBar
                data={prepareData(this.state.indexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
                keys={distKeys}
                indexBy={this.state.indexBy}
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                colors={{ scheme: this.state.colorSchema }}
                defs={[]}
                fill={[]}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                axisTop={(this.state.axisXPosition === "Top") ? axisX : null}
                axisRight={(this.state.axisYPosition === "Right") ? axisY : null}
                axisBottom={(this.state.axisXPosition === "Bottom") ? axisX : null}
                axisLeft={(this.state.axisYPosition === "Left") ? axisY : null}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: this.state.legendAnchorPosition,
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
            />
            </Resizable>
        </div>
    }

    private drawLine() {
        function prepareData(indexedBy: string, xColumn: string, yColumn: string, rowData: any) : any[] {
            const distIndexes = getUniqueFromData(rowData, indexedBy);
            let dataForChart = [];
            if (distIndexes.length !== 0) {
                for (let i = 0; i < distIndexes.length; i++) {
                    let lineDataObject = []; //Координаты отдельной линии
                    //id - одна линия
                    for (let j = 0; j < rowData.length; j++) {
                        //Разбиваем датасет на линии
                        if (rowData[j][indexedBy] === distIndexes[i]) {
                            //Данные
                            lineDataObject.push({
                                "x": rowData[j][xColumn],
                                "y": rowData[j][yColumn]
                            })
                        }
                    }
                    dataForChart.push({
                        "id":distIndexes[i],
                        "data":lineDataObject
                    })
                }
            }
            return dataForChart
        }
        const axisX : AxisProps  = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.axisXLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        const axisY : AxisProps = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.axisYLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        let selectedKeys = this.getSelectedKeys();
        const menu = (
            //1.Добавление в меню
            <Menu
                onClick={(e) => this.onActionMenu(e)}
                selectedKeys={selectedKeys}
                style={{width: '180px'}}
            >
                <Menu.SubMenu title={'axisXPosition'}>
                    {this.state.AxisXPositionType.map((p: string) =>
                        <Menu.Item key={`axisXPosition.${p}`} style={{width: '65px'}}>
                            {p}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.SubMenu title={'axisYPosition'}>
                    {this.state.AxisYPositionType.map((p: string) =>
                        <Menu.Item key={`axisYPosition.${p}`} style={{width: '65px'}}>
                            {p}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.SubMenu title={'legendAnchorPosition'}>
                    {this.state.LegendAnchorPositionType.map((p: string) =>
                        <Menu.Item key={`legendAnchorPosition.${p}`} style={{width: '120px'}}>
                            {p}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item key='exportToDocx'>
                    exportToDocx
                </Menu.Item>
                <Menu.Item key='exportToExcel'>
                    exportToExcel
                </Menu.Item>
                <Menu.Item key='getImage'>
                    getImage
                </Menu.Item>
            </Menu>
        );

        //let responsiveLine =

        return <div>
            <Dropdown overlay={menu} placement='bottomLeft'>
                <Button style={{color: 'rgb(151, 151, 151)'}}>
                    <FontAwesomeIcon icon={faChevronDown} size='xs'
                                     style={{marginLeft: '5px'}}/>
                </Button>
            </Dropdown>
            {/*Ссылка для выгрузки диаграммы в png*/}
            <Resizable ref={(n) => { this.node = n}}
            style={resizeStyle}
            defaultSize={{
                width: 700,
                height: 400
            }}>
                <ResponsiveLine
                    data={prepareData(this.state.indexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                    axisTop={(this.state.axisXPosition === "Top") ? axisX : null}
                    axisRight={(this.state.axisYPosition === "Right") ? axisY : null}
                    axisBottom={(this.state.axisXPosition === "Bottom") ? axisX : null}
                    axisLeft={(this.state.axisYPosition === "Left") ? axisY : null}
                    colors={{ scheme: this.state.colorSchema }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabel="y"
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                        {
                            anchor: this.state.legendAnchorPosition,
                            direction: 'column',
                            justify: false,
                            translateX: 100,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                />
        </Resizable>
        </div>
    }

    private drawPie() {
        function prepareData(IndexedBy: string, keyColumn: string, valueColumn: string, data: any) : any[] {
            let dataForChart = [];
            if (data.length !== 0) {
                for (let i = 0; i < data.length; i++) {
                    //TODO нужно суммирование по id - data[i][headerColumn]
                    let dataObject = {};
                    //id
                    Object.defineProperty(dataObject, "id", {value : data[i][IndexedBy]});
                    //label
                    Object.defineProperty(dataObject, "label", {value : data[i][keyColumn]});
                    //value
                    Object.defineProperty(dataObject, "value", {value : data[i][valueColumn]});
                    dataForChart.push(dataObject)
                }
            }
            return dataForChart
        }
        return <div>
            <Resizable ref={(n) => { this.node = n}}
                       style={resizeStyle}
                       defaultSize={{
                           width: 700,
                           height: 400
                       }}>
            <ResponsivePie
                data={prepareData(this.state.indexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: this.state.colorSchema }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                radialLabelsSkipAngle={10}
                radialLabelsTextXOffset={6}
                radialLabelsTextColor="#333333"
                radialLabelsLinkOffset={0}
                radialLabelsLinkDiagonalLength={16}
                radialLabelsLinkHorizontalLength={24}
                radialLabelsLinkStrokeWidth={1}
                radialLabelsLinkColor={{ from: 'color' }}
                slicesLabelsSkipAngle={10}
                slicesLabelsTextColor="#333333"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                defs={[]}
                fill={[]}
                legends={[
                    {
                        anchor: this.state.legendAnchorPosition,
                        direction: 'row',
                        translateY: 56,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        symbolSize: 18,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000'
                                }
                            }
                        ]
                    }
                ]}
            />
            </Resizable>
        </div>
    }

    render() {
        switch (this.state.diagramType) {
                case "Line":
                    return this.drawLine();
                case "Bar":
                    return this.drawBar();
                case "Pie":
                    return this.drawPie();
                default:
                    return <div>default</div>
            }
    }
}

export default withTranslation()(DatasetDiagram)
