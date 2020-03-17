import * as ExcelJS from "exceljs";
import {saveAs} from "file-saver";

export enum excelElementExportType {
    diagram,
    grid
}

export interface excelExportObject {
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
    }
}

async function handleExportExcel(handlers: any[]) {
    //Смещение отностиельно 0 ячейки
    let offset = 1;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet();

    for (let i = 0; i < handlers.length; i++) {
        const excelData: excelExportObject = handlers[i]();
        if (excelData.excelComponentType === excelElementExportType.diagram && excelData.diagramData !== undefined) {
            //Добавление диаграммы в png
            //cast to ArrayBuffer
            const arrayBuffer = await (await excelData.diagramData.blob).arrayBuffer();
            const image = workbook.addImage({
                buffer: arrayBuffer,
                extension: 'png',
            });
            worksheet.addImage(image, {
                tl: { col: 0, row: offset },
                ext: { width: excelData.diagramData.width, height: excelData.diagramData.height }
            });
            //20px ширина стандартной ячейки excel
            offset += Math.ceil(excelData.diagramData.height/20);
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
        offset += 1;
    }
    return workbook.xlsx.writeBuffer()
}

export {handleExportExcel};