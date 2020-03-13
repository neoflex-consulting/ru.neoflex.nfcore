import {saveAs} from "file-saver";
import * as ExcelJS from "exceljs";

export enum excelElementExportType {
    diagram,
    grid
}

export interface excelExportObject {
    excelComponentType: excelElementExportType;
    diagramData?: Buffer,
    gridData?: {
        tableName:string,
        columns:any[],
        rows:string[][]
    }
}

async function handleExportExcel(context: any) {
    //Смещение отностиельно 0 ячейки
    let offset = 1;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet();

    for (let i = 0; i < context.excelHandlers.length; i++) {
        const excelData: excelExportObject = await context.excelHandlers[i]();
        if (excelData.excelComponentType === excelElementExportType.diagram && excelData.diagramData !== undefined) {
            //Добавление диаграммы в png
            const width = 1400;
            const height = 400;
            const image = workbook.addImage({
                buffer: excelData.diagramData,
                extension: 'png',
            });
            worksheet.addImage(image, {
                tl: { col: 0, row: offset },
                ext: { width: width, height: height }
            });
            //20px ширина стандартной ячейки excel
            offset += Math.ceil(height/20);
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
    workbook.xlsx.writeBuffer().then((buf) => {
            saveAs(new Blob([buf]), 'example.xlsx')
        }
    );
}

export {handleExportExcel};