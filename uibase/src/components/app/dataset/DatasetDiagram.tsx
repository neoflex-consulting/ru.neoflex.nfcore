import * as React from "react";
import {withTranslation} from 'react-i18next';
import {Axis, ResponsiveBar} from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { AxisProps } from "@nivo/axes"

interface Props {
}

interface State {
}

function getUniqueFromData(data: any[], indexed: string) {
    const keys = []
    for (let i of data) {
        keys.push(i[indexed])
    }
    return Array.from(new Set(keys))
}

const anchorMap: any = {
    "TopLeft":"top-Left",
    "Top": "top",
    "TopRight": "top-right",
    "Left": "left",
    "Center": "center",
    "BottomLeft": "bottom-left",
    "Bottom": "bottom",
    "BottomRight": "bottom-right"
}
class DatasetDiagram extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            themes: [],
            currentTheme: this.props.viewObject.get('theme') || 'balham',
            rowPerPages: [],
            paginationPageSize: this.props.viewObject.get('rowPerPage') || 'all',
            operations: [],
            selectedServerFilters: [],
            showUniqRow: this.props.viewObject.get('showUniqRow') || false,
            highlight: this.props.viewObject.get('highlight') || [],
            columnDefs: [],
            rowData: [],
            saveMenuVisible: false,
            IndexBy: this.props.viewObject.get('IndexBy') || "",
            keyColumn: this.props.viewObject.get('keyColumn') || "",
            valueColumn: this.props.viewObject.get('valueColumn') || "",
            legendAnchorPosition: anchorMap[this.props.viewObject.get('legendAnchorPosition')] || anchorMap["TopLeft"],
            AxisXPosition: this.props.viewObject.get('axisXPosition') || "Top",
            AxisXLegend: this.props.viewObject.get('axisXLegend') || "",
            AxisYPosition: this.props.viewObject.get('axisYPosition') || "Left",
            AxisYLegend: this.props.viewObject.get('axisYLegend') || "",
            //Пока цвет задаётся через цветовые схемы
            colorSchema: this.props.viewObject.get('colorSchema') || "",
            diagramType: this.props.viewObject.get('diagramType') || "Line"
        };
    }

    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        //Вычитать и отобразить данные
        const userComponentName = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === this.props.viewObject.get('datasetView')._id);
        const componentName = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
            this.props.viewObject.get('datasetView').get('datasetComponent').get('name')
            : JSON.parse(userComponentName[0].get('value'))['name']
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
                IndexBy: this.props.viewObject.get('IndexBy') || "",
                keyColumn: this.props.viewObject.get('keyColumn') || "",
                valueColumn: this.props.viewObject.get('valueColumn') || "",
                legendAnchorPosition: anchorMap[this.props.viewObject.get('legendAnchorPosition')] || anchorMap["TopLeft"],
                AxisXPosition: this.props.viewObject.get('AxisXPosition') || "Top",
                AxisXLegend: this.props.viewObject.get('AxisXLegend') || "",
                AxisYPosition: this.props.viewObject.get('AxisYPosition') || "Left",
                AxisYLegend: this.props.viewObject.get('AxisYLegend') || "",
                //Пока цвет задаётся через цветовые схемы
                colorSchema: this.props.viewObject.get('colorSchema') || ""
            })
        }
    }


    private drawBar() {
        function prepareData(indexedBy: string, keyColumn: string, dataColumn: string, rowData: any) {
            const distIndexes = getUniqueFromData(rowData, indexedBy)
            let dataForChart = [];

            if (distIndexes.length !== 0) {
                for (let i = 0; i < distIndexes.length; i++) {
                    let dataObject = {};
                    //Подписи под столбцом
                    Object.defineProperty(dataObject, indexedBy, {value : distIndexes[i]})
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
        const distKeys = getUniqueFromData(this.state.rowData, this.state.keyColumn)
        const axisX : Axis  = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.AxisXLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        const axisY : Axis = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.AxisYLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        return <div style={{height:"300px"}}>
            <ResponsiveBar
                data={prepareData(this.state.IndexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
                keys={distKeys}
                indexBy={this.state.IndexBy}
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                colors={{ scheme: this.state.colorSchema }}
                defs={[]}
                fill={[]}
                borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                axisTop={(this.state.AxisXPosition === "Top") ? axisX : null}
                axisRight={(this.state.AxisYPosition === "Right") ? axisY : null}
                axisBottom={(this.state.AxisXPosition === "Bottom") ? axisX : null}
                axisLeft={(this.state.AxisYPosition === "Left") ? axisY : null}
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
        </div>
    }

    private drawLine() {
        function prepareData(indexedBy: string, xColumn: string, yColumn: string, rowData: any) : any[] {
            const distIndexes = getUniqueFromData(rowData, indexedBy)
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
            legend: this.state.AxisXLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        const axisY : AxisProps = {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: this.state.AxisYLegend,
            legendPosition: 'middle',
            legendOffset: 0
        };
        return <div style={{height:"300px"}}>
            <ResponsiveLine
                data={prepareData(this.state.IndexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                axisTop={(this.state.AxisXPosition === "Top") ? axisX : null}
                axisRight={(this.state.AxisYPosition === "Right") ? axisY : null}
                axisBottom={(this.state.AxisXPosition === "Bottom") ? axisX : null}
                axisLeft={(this.state.AxisYPosition === "Left") ? axisY : null}
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
                    Object.defineProperty(dataObject, "id", {value : data[i][IndexedBy]})
                    //label
                    Object.defineProperty(dataObject, "label", {value : data[i][keyColumn]})
                    //value
                    Object.defineProperty(dataObject, "value", {value : data[i][valueColumn]})
                    dataForChart.push(dataObject)
                }
            }
            return dataForChart
        }
        return <div style={{height:"300px"}}>
            <ResponsivePie
                data={prepareData(this.state.IndexBy, this.state.keyColumn, this.state.valueColumn, this.state.rowData)}
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
        </div>
    }

    render() {
        switch (this.state.diagramType) {
                case "Line":
                    return this.drawLine()
                case "Bar":
                    return this.drawBar()
                case "Pie":
                    return this.drawPie()
                default:
                    return <div>default</div>
            }
    }
}

export default withTranslation()(DatasetDiagram)
