import * as React from "react";
import {withTranslation} from 'react-i18next';
import {Axis, ResponsiveBar} from "@nivo/bar";
import {ResponsiveLine} from "@nivo/line";
import {ResponsivePie} from "@nivo/pie";
import {AxisProps} from "@nivo/axes"
import {Resizable } from "re-resizable";
import domtoimage from 'dom-to-image';
import {docxExportObject, docxElementExportType} from "../../../utils/docxExportUtils";
import {excelExportObject, excelElementExportType} from "../../../utils/excelExportUtils";
import * as _ from 'lodash';
import {diagramAnchorMap} from "../../../utils/consts";

const diagramAnchorMap_: any = diagramAnchorMap;

interface Props {
    rowData: any[],
    diagramParams: {
        keyColumn: string,
        valueColumn: string,
        diagramLegend: string,
        legendAnchorPosition: string,
        axisXPosition: string,
        axisXLegend: string,
        axisYPosition: string,
        axisYLegend: string,
        diagramType: string,
        colorSchema: string,
        isSingle: boolean,
        indexBy?: string,
    }
}

interface State {
    rowData: any[],
    diagramParams: {
        keyColumn: string,
        valueColumn: string,
        diagramLegend: string,
        legendAnchorPosition: any, //TODO типизовать к nivo типам
        axisXPosition: string,
        axisXLegend: string,
        axisYPosition: string,
        axisYLegend: string,
        diagramType: string,
        indexBy: string,
        colorSchema: any, //TODO типизовать к nivo типам
        isSingle: boolean,
    }
}

function getUniqueFromData(data: any[], indexed: string) {
    const keys = [];
    for (let i of data) {
        keys.push(i[indexed])
    }
    return Array.from(new Set(keys))
}

const resizeStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "solid 1px #ddd",
    background: "#ffffff"
};

class DatasetDiagram extends React.Component<Props & any, State> {

    private node: (Resizable|null);

    constructor(props: any) {
        super(props);

        this.state = {
            rowData: this.props.rowData,
            diagramParams: this.props.diagramParams,
        };
    }

    componentDidMount(): void {
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
        this.props.context.addExcelHandler(this.getExcelData.bind(this));
    }

    componentWillUnmount(): void {
        this.props.context.removeDocxHandler();
        this.props.context.removeExcelHandler();
    }

    private getDocxData(): docxExportObject {
        const width = (this.node) ? this.node.size.width : 700;
        const height = (this.node) ? this.node.size.height : 400;
        if (this.node && this.node?.resizable !== null) {
            return {
                hidden: this.props.hidden,
                docxComponentType : docxElementExportType.diagram,
                diagramData: {
                    blob: domtoimage.toBlob(this.node?.resizable,{
                        width: width,
                        height: height
                    }),
                    width: width,
                    height: height
                }
            };
        }
        return {hidden: this.props.hidden, docxComponentType: docxElementExportType.diagram}
    }

    private getExcelData(): excelExportObject {
        const width = (this.node) ? this.node.size.width : 700;
        const height = (this.node) ? this.node.size.height : 400;
        if (this.node && this.node?.resizable !== null) {
            return {
                hidden: this.props.hidden,
                excelComponentType: excelElementExportType.diagram,
                diagramData: {
                    blob: domtoimage.toBlob(this.node?.resizable, {
                        width: width,
                        height: height
                    }),
                    width: width,
                    height: height
                }
            };
        }
        return {hidden: this.props.hidden, excelComponentType: excelElementExportType.diagram}
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (!_.isEqual(this.props.rowData, prevProps.rowData)) {
            this.setState({rowData:this.props.rowData});
        }
        if (!_.isEqual(this.props.diagramParams, prevProps.diagramParams)) {
            this.setState({diagramParams:this.props.diagramParams});
        }
    }

    private drawBar() {
        function prepareData(indexedBy: string, keyColumn: string, valueColumn: string, rowData: any) {
            let dataForChart: any[] = [];
            const groups = _.groupBy(rowData, indexedBy);
            for (const group of Object.keys(groups)) {
                let xyData = groups[group].map(r => {
                    return {[keyColumn]: r[keyColumn], [valueColumn]: Number(r[valueColumn])}
                });
                dataForChart.push(xyData.reduce((acc, curr)=> {
                    acc[curr[keyColumn]] = curr[valueColumn];
                    return acc
                }, {[indexedBy]: group}));
            }
            return dataForChart
        }
        const distKeys = getUniqueFromData(this.state.rowData, this.state.diagramParams.keyColumn);
        const axisX : Axis  = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.diagramParams.axisXLegend,
            legendPosition: 'middle',
            legendOffset: 30,
        };
        const axisY : Axis = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.diagramParams.axisYLegend,
            legendPosition: 'middle',
            legendOffset: -45,
        };
        return <div>

            <Resizable ref={(n) => { this.node = n}}
                       style={resizeStyle}
                       defaultSize={{
                           width: "100%",
                           height: 600
                       }}>
                <ResponsiveBar
                    data={prepareData((this.state.diagramParams.isSingle)
                        ? this.state.diagramParams.keyColumn
                        : this.state.diagramParams.indexBy
                        , this.state.diagramParams.keyColumn
                        , this.state.diagramParams.valueColumn
                        , this.state.rowData)}
                    keys={distKeys}
                    indexBy={(this.state.diagramParams.isSingle) ? this.state.diagramParams.keyColumn : this.state.diagramParams.indexBy}
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    colors={{ scheme: this.state.diagramParams.colorSchema }}
                    defs={[]}
                    fill={[]}
                    borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                    axisTop={(this.state.diagramParams.axisXPosition === "Top") ? axisX : null}
                    axisRight={(this.state.diagramParams.axisYPosition === "Right") ? axisY : null}
                    axisBottom={(this.state.diagramParams.axisXPosition === "Bottom") ? axisX : null}
                    axisLeft={(this.state.diagramParams.axisYPosition === "Left") ? axisY : null}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                    legends={[
                        {
                            dataFrom: "keys",
                            anchor: diagramAnchorMap_[this.state.diagramParams.legendAnchorPosition],
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
        function prepareData(indexedBy: string, keyColumn: string, valueColumn: string, rowData: any, isSingle: boolean) : any[] {
            let dataForChart: any[] = [];
            const groups = (isSingle)? _.groupBy(rowData): _.groupBy(rowData, indexedBy);
            for (const group of Object.keys(groups)) {
                let xyData = groups[group].map(r => {
                    return {[keyColumn]: r[keyColumn], [valueColumn]: r[valueColumn], [indexedBy]:r[indexedBy]}
                });
                dataForChart.push({
                    "id": (isSingle)? indexedBy: group,
                    "data": xyData.map(r => {
                        return {"x": r[keyColumn], "y": r[valueColumn]}
                    })
                });
            }
            return dataForChart
        }
        const axisX : AxisProps  = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.diagramParams.axisXLegend,
            legendPosition: 'middle',
            legendOffset: 30,
        };
        const axisY : AxisProps = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.diagramParams.axisYLegend,
            legendPosition: 'middle',
            legendOffset: -45,
        };
        return <div>
            {/*Ссылка для выгрузки диаграммы в png*/}
            <Resizable ref={(n) => { this.node = n}}
                       style={resizeStyle}
                       defaultSize={{
                           width: "100%",
                           height: 600
                       }}>
                <ResponsiveLine
                    data={prepareData((this.state.diagramParams.isSingle)
                        ? this.state.diagramParams.diagramLegend
                        : this.state.diagramParams.indexBy
                        , this.state.diagramParams.keyColumn
                        , this.state.diagramParams.valueColumn
                        , this.state.rowData
                        , this.state.diagramParams.isSingle)}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                    axisTop={(this.state.diagramParams.axisXPosition === "Top") ? axisX : null}
                    axisRight={(this.state.diagramParams.axisYPosition === "Right") ? axisY : null}
                    axisBottom={(this.state.diagramParams.axisXPosition === "Bottom") ? axisX : null}
                    axisLeft={(this.state.diagramParams.axisYPosition === "Left") ? axisY : null}
                    colors={{ scheme: this.state.diagramParams.colorSchema }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabel="y"
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                        {
                            anchor: diagramAnchorMap_[this.state.diagramParams.legendAnchorPosition],
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
        function prepareData(keyColumn: string, valueColumn: string, rowData: any[]) : any[] {
            let dataForChart: any[] = [];
            const groups = _.groupBy(rowData);
            for (const group of Object.keys(groups)) {
                let xyData = groups[group].map(r => {
                    return {[keyColumn]: r[keyColumn], [valueColumn]: r[valueColumn]}
                });
                dataForChart = xyData.map((val) => {
                    return {"id": val[keyColumn], "value": Number(val[valueColumn]), "label": val[keyColumn]}
                });
            }
            return dataForChart
        }
        return <div>
            <Resizable ref={(n) => { this.node = n}}
                       style={resizeStyle}
                       defaultSize={{
                           width: "100%",
                           height: 600
                       }}>
                <ResponsivePie
                    data={prepareData(this.state.diagramParams.keyColumn, this.state.diagramParams.valueColumn, this.state.rowData)}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ scheme: this.state.diagramParams.colorSchema }}
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
                            anchor: diagramAnchorMap_[this.state.diagramParams.legendAnchorPosition],
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
        switch (this.state.diagramParams.diagramType) {
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
