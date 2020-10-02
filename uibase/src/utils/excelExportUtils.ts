import * as ExcelJS from "exceljs";

function encode(index: number) : string {
    if (index <= 23) {
        return String.fromCharCode(65 + index)
    } else {
        return String.fromCharCode(64 + index/26) + String.fromCharCode(65 + index%26)
    }
}

export enum excelElementExportType {
    diagram,
    grid,
    text,
    complexGrid
}

export interface excelExportObject {
    hidden: boolean;
    excelComponentType: excelElementExportType;
    diagramData?: {
        blob: Promise<Blob>,
        width: number,
        height: number
    },
    gridData?: {
        tableName:string,
        columns:any[],
        rows:string[][]
    },
    textData?: string,
    gridHeader?: {
        headerName: string,
        columnSpan: number
        rowSpan: number
    }[][]
}

async function handleExportExcel(handlers: any[], withTable: any, isDownloadFromDiagramPanel: any) {
    //Смещение отностиельно 0 ячейки
    let offset = 1;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet();

    for (let i = 0; i < handlers.length; i++) {

        const excelData: excelExportObject = handlers[i]();
        if (!excelData.hidden) {
            if (!(isDownloadFromDiagramPanel && !withTable && excelData.excelComponentType === 1)){
                if (excelData.excelComponentType === excelElementExportType.diagram && excelData.diagramData !== undefined) {
                    //Добавление диаграммы в png
                    //cast to ArrayBuffer
                    const arrayBuffer = await new Response(await excelData.diagramData.blob).arrayBuffer();
                    const image = workbook.addImage({
                        buffer: arrayBuffer,
                        extension: 'png',
                    });
                    worksheet.addImage(image, {
                        tl: {col: 0, row: offset},
                        ext: {width: excelData.diagramData.width, height: excelData.diagramData.height}
                    });
                    //20px ширина стандартной ячейки excel
                    offset += Math.ceil(excelData.diagramData.height / 20);
                }
            if (excelData.excelComponentType === excelElementExportType.grid && excelData.gridData !== undefined) {
                //Добавление таблицы
                worksheet.addTable({
                    name: excelData.gridData.tableName,
                    ref: 'A' + offset, //Позиция
                    headerRow: true,
                    style: {
                        theme: 'TableStyleDark3',
                        showRowStripes: true,
                    },
                    columns: excelData.gridData.columns,
                    rows: excelData.gridData.rows,
                });
                offset += 1 + excelData.gridData.rows.length;
            }
            if (excelData.excelComponentType === excelElementExportType.text && excelData.textData !== undefined) {
                //Добавление текста
                let cell = worksheet.getCell('A' + offset);
                // Modify/Add individual cell
                cell.value = excelData.textData;
                offset += 1;
            }
            if (excelData.excelComponentType === excelElementExportType.complexGrid
                && excelData.gridHeader !== undefined
                && excelData.gridData !== undefined
            ) {
                //Header
                for (const headerRow of excelData.gridHeader) {
                    let columnSpan = 0;
                    for (const [index, headerCell] of headerRow.entries()) {
                        if (headerCell.columnSpan > 1) {
                            worksheet.mergeCells(encode(columnSpan) + offset +
                                                    ':' +
                                                    encode(columnSpan+headerCell.columnSpan-1) + offset)
                        }
                        if (headerCell.rowSpan > 1) {
                            worksheet.mergeCells(encode(columnSpan) + offset +
                                                    ':' +
                                                    encode(columnSpan) + (offset + headerCell.rowSpan - 1))
                        }
                        columnSpan += headerCell.columnSpan;
                        let cell = worksheet.getCell(encode(columnSpan-1) + offset);
                        if (!cell.value) {
                            cell.value = headerCell.headerName;
                        } else {
                            while (cell.value) {
                                columnSpan+=1;
                                cell = worksheet.getCell(encode(columnSpan-1) + offset);
                            }
                            cell.value = headerCell.headerName;
                        }
                        cell.fill = {
                            type: 'pattern',
                            pattern:"solid",
                            fgColor:{argb:'000000'}
                        };
                        cell.font = {
                            color: { argb: 'FFFFFF' }
                        };
                        cell.alignment = { vertical: 'middle', horizontal: 'center' }
                    }
                    offset += 1;
                }
                //Data
                //https://github.com/exceljs/exceljs/issues/970 - auto-filter bug
                worksheet.addTable({
                    name: excelData.gridData.tableName,
                    ref: 'A' + offset, //Позиция
                    headerRow: false,
                    style: {
                        theme: 'TableStyleDark3',
                        showRowStripes: true,
                    },
                    columns: excelData.gridData.columns,
                    rows: excelData.gridData.rows,
                });
                offset += 1 + excelData.gridData.rows.length;
            }
            offset += 1;
        }
        worksheet.columns.forEach(c=>{
            c.width = 20
        })
    }
    }
    return workbook.xlsx.writeBuffer()
}

export {handleExportExcel};