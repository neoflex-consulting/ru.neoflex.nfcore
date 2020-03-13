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
            offset += Math.ceil(height/20)
        }
        if (excelData.excelComponentType === excelElementExportType.grid && excelData.gridData !== undefined) {
            //Добавление таблицы
            worksheet.addTable({
                name: 'MyTable',
                ref: 'A' + offset, //Позиция
                headerRow: true,
                style: {
                    theme: 'TableStyleDark3',
                    showRowStripes: true,
                },
                columns: excelData.gridData.columns,
                rows: excelData.gridData.rows,
            });
            offset += 1 + excelData.gridData.rows.length
        }
    }
    workbook.xlsx.writeBuffer().then((buf) => {
            saveAs(new Blob([buf]), 'example.xlsx')
        }
    );


    /*const doc: Document = new Document();
    let paragraphs: (Paragraph|Table)[] = [];
    for (let i = 0; i < context.docxHandlers.length; i++) {
        let docxData: docxExportObject = await context.docxHandlers[i]();
        if (docxData.excelComponentType === docxElementExportType.diagram && docxData.diagramData !== undefined) {
            //Добавление диаграммы в png
            const image = Media.addImage(doc, docxData.diagramData, 1400, 400);
            paragraphs.push(new Paragraph(image))
        }
        if (docxData.excelComponentType === docxElementExportType.grid && docxData.gridData !== undefined) {
            //Добавление таблицы
            let tableRows: TableRow[] = [];
            for (const row of docxData.gridData) {
                let tableRow: TableCell[] = [];
                for (const cell of row) {
                    tableRow.push(new TableCell({children: [new Paragraph(cell)]}));
                }
                tableRows.push(new TableRow({
                    children: tableRow
                }))
            }
            const table: Table = new Table({
                rows: tableRows
            });
            paragraphs.push(table)
        }
        if (docxData.excelComponentType === docxElementExportType.text && docxData.textData !== undefined) {
            //Добавление текста
            paragraphs.push(new Paragraph({
                children: [
                    new TextRun(docxData.textData)
                ]
            }))
        }
        //Разделитель
        paragraphs.push(new Paragraph({
            children: [
                new TextRun("")
            ]
        }))
    }
    doc.addSection({
        properties: {},
        children: paragraphs
    });
    Packer.toBlob(doc).then(blob => {
        console.log(blob);
        saveAs(blob, "example.docx");
        console.log("Document created successfully");
    });*/
}

export {handleExportExcel};