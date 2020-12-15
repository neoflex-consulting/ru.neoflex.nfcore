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
        columns:any[],
        data:{value:string, mask:string, highlight:{color:string, background:string}}[][]
    },
    textData?: string,
    gridHeader?: {
        headerName: string,
        columnSpan: number
        rowSpan: number
    }[][]
}

function addTableData(excelData: excelExportObject, worksheet: ExcelJS.Worksheet, offset: number) {
    if (excelData.gridData) {
        for (const [rowIndex, row]of excelData.gridData.data.entries()) {
            for (const [columnIndex, cell] of row.entries()) {
                //Data
                worksheet.getCell(`${encode(columnIndex)}:${offset + rowIndex}`).value = cell.value;
                //Formatting
                worksheet.getCell(`${encode(columnIndex)}:${offset + rowIndex}`).numFmt = cell.mask;
                //Highlight color
                worksheet.getCell(`${encode(columnIndex)}:${offset + rowIndex}`).fill = {
                    type: 'pattern',
                    pattern:"solid",
                    fgColor:{argb: cell.highlight.background && cell.highlight.background.replace('#','')}
                };
                //font color
                worksheet.getCell(`${encode(columnIndex)}:${offset + rowIndex}`).font = {
                    color: {argb: cell.highlight.color && cell.highlight.color.replace('#','')}
                };
                //Borders
                worksheet.getCell(`${encode(columnIndex)}:${offset + rowIndex}`).border = {
                    top: {style:'thin'},
                    left: {style:'thin'},
                    bottom: {style:'thin'},
                    right: {style:'thin'}
                };
            }
        }
    }
}

async function handleExportExcel(handlers: any[], withTable: boolean, isDownloadFromDiagramPanel: any) {
    //Смещение отностиельно 0 ячейки
    let offset = 1;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet();

    for (let i = 0; i < handlers.length; i++) {

        const excelData: excelExportObject = handlers[i]();
        if (!excelData.hidden) {
            if (excelData.excelComponentType === excelElementExportType.diagram
                && excelData.diagramData !== undefined
                && withTable
                && isDownloadFromDiagramPanel
            ) {
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
            for (const [columnIndex,header] of excelData.gridData.columns.entries()) {
                worksheet.getCell(`${encode(columnIndex)}:${offset}`).value = header.name;
                worksheet.getCell(`${encode(columnIndex)}:${offset}`).fill = {
                    type: 'pattern',
                    pattern:"solid",
                    fgColor:{argb:'9bbb59'}
                }
            }
            addTableData(excelData, worksheet, offset + 1);
            worksheet.autoFilter = `A${offset}:${encode(excelData.gridData.columns.length-1)}${offset}`;
            offset += excelData.gridData.data.length;
        }
        if (excelData.excelComponentType === excelElementExportType.text && excelData.textData !== undefined) {
            //Добавление текста
            let cell = worksheet.getCell('A' + offset);
            // Modify/Add individual cell
            cell.value = excelData.textData;
        }
        if (excelData.excelComponentType === excelElementExportType.complexGrid
            && excelData.gridHeader !== undefined
            && excelData.gridData !== undefined
        ) {
            //Header
            for (const headerRow of excelData.gridHeader) {
                let columnSpan = 0;
                for (const headerCell of headerRow) {
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
                        fgColor:{argb:'9bbb59'}
                    };
                    cell.font = {
                        color: { argb: '000000' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' }
                }
                offset += 1;
            }
            addTableData(excelData, worksheet, offset);
            offset += 1 + excelData.gridData.data.length;
        }
        offset += 1;
        worksheet.columns && worksheet.columns.forEach(c=>{
            c.width = 20
        })
    }
    }
    return workbook.xlsx.writeBuffer()
}

export {handleExportExcel};