import {Document, Media, Packer, Paragraph, Table, TableCell, TableRow, TextRun, } from "docx";


export enum docxElementExportType {
    diagram,
    grid,
    text
}

export interface docxExportObject {
    hidden: boolean;
    docxComponentType: docxElementExportType;
    diagramData?: {
        blob: Promise<Blob>,
        width: number,
        height: number
    },
    gridData?: {value:string, highlight:{color:string, background:string}}[][],
    gridHeader?: {
        headerName: string,
        columnSpan: number
        rowSpan: number
    }[][],
    textData?: string
}
async function handleExportDocx(this: any, handlers: any[], withTable: boolean, isDownloadFromDiagramPanel: boolean) {
    const doc: Document = new Document();
    let paragraphs: (Paragraph|Table)[] = [];

    for (let i = 0; i < handlers.length; i++) {


        const docxData: docxExportObject = handlers[i]();

        if (!docxData.hidden) {
            if (docxData.docxComponentType === docxElementExportType.diagram
                && docxData.diagramData !== undefined
                && withTable
                && isDownloadFromDiagramPanel
            ) {
                    //Добавление диаграммы в png
                    //cast to ArrayBuffer
                    const arrayBuffer = await new Response(await docxData.diagramData.blob).arrayBuffer();
                    const image = Media.addImage(doc, arrayBuffer, docxData.diagramData.width, docxData.diagramData.height);
                    paragraphs.push(new Paragraph(image))
                }
                if (docxData.docxComponentType === docxElementExportType.grid && docxData.gridData !== undefined) {
                    //Добавление таблицы
                    let tableRows: TableRow[] = [];
                    //header
                    for (const row of docxData.gridHeader!) {
                        let tableRow: TableCell[] = [];
                        for (const cell of row) {
                            tableRow.push(new TableCell({
                                children: [new Paragraph((cell === null) ? "" : cell.headerName)],
                                columnSpan:cell.columnSpan,
                                rowSpan:cell.rowSpan,
                                shading: {
                                    fill: "9bbb59",
                                }
                            }));
                        }
                        tableRows.push(new TableRow({
                            children: tableRow
                        }))
                    }
                    //data
                    for (const row of docxData.gridData) {
                        let tableRow: TableCell[] = [];
                        for (const cell of row) {
                            tableRow.push(new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: (cell.value === null) ? "" : cell.value,
                                        color: cell.highlight.color && cell.highlight.color.replace('#',''),
                                    })]
                                })],
                                shading: {
                                    fill: cell.highlight.background && cell.highlight.background.replace('#',''),
                                },
                            }));
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
                if (docxData.docxComponentType === docxElementExportType.text && docxData.textData !== undefined) {
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
        }
        doc.addSection({
            properties: {},
            children: paragraphs
        });
        return Packer.toBlob(doc)

}

export {handleExportDocx};
