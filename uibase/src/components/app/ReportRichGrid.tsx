import * as React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import ReactDataSheet from 'react-datasheet';
import "react-datasheet/lib/react-datasheet.css";

interface Props {
}

interface State {
    grid: GridElement[][];
}

export interface GridElement extends ReactDataSheet.Cell<GridElement, number> {
    value: number | null;
}

class MyReactDataSheet extends ReactDataSheet<GridElement, number> { }

class ReportRichGrid extends React.Component<Props & WithTranslation & GridElement, State> {

    constructor(props: any) {
        super(props)
        this.state = {
            grid: [
                [{ value: 1 }, { value: -3 }, { value: -3 }, { value: -3 }, { value: -3 }, { value: -3 } ],
                [{ value: -2 }, { value: 4 }, { value: -3 }, { value: -3 }, { value: -3 }, { value: -3 } ]
            ]
        }
    }

    componentDidMount(): void {
    }

    render() {
        return (
            <div>
                <MyReactDataSheet
                    data={this.state.grid}
                    valueRenderer={(cell) => cell.value}
                /*onCellsChanged={changes => {
                    const grid = this.state.grid.map(row => [...row])
                    changes.forEach(({ cell, row, col, value }) => {
                        grid[row][col] = { ...grid[row][col], value }
                    })
                    this.setState({ grid })
                }}*/
                />
            </div>
        )
    }
}

const ReportRichGridTrans = withTranslation()(ReportRichGrid);
export default ReportRichGridTrans;
