import {Document, Media, Packer, Paragraph, Table, TableCell, TableRow, TextRun} from "docx";


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
    gridData?: string[][],
    textData?: string
}
async function handleExportDocx(this: any, handlers: any[], withTable: any, isDownloadFromDiagramPanel: any) {
    const doc: Document = new Document();
    let paragraphs: (Paragraph|Table)[] = [];

    for (let i = 0; i < handlers.length; i++) {


        const docxData: docxExportObject = handlers[i]();

        if (!docxData.hidden) {
            if((!(isDownloadFromDiagramPanel && !withTable && docxData.docxComponentType === 1)) ||
                (isDownloadFromDiagramPanel === false && withTable === false && docxData.docxComponentType === 0)) {

                if (docxData.docxComponentType === docxElementExportType.diagram && docxData.diagramData !== undefined) {
                    //Добавление диаграммы в png
                    //cast to ArrayBuffer
                    const arrayBuffer = await new Response(await docxData.diagramData.blob).arrayBuffer();
                    const image = Media.addImage(doc, arrayBuffer, docxData.diagramData.width, docxData.diagramData.height);
                    paragraphs.push(new Paragraph(image))
                }
                if (docxData.docxComponentType === docxElementExportType.grid && docxData.gridData !== undefined) {
                    //Добавление таблицы
                    let tableRows: TableRow[] = [];
                    for (const row of docxData.gridData) {
                        let tableRow: TableCell[] = [];
                        for (const cell of row) {
                            tableRow.push(new TableCell({children: [new Paragraph((cell === null) ? "" : cell)]}));
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
        }
        doc.addSection({
            properties: {},
            children: paragraphs
        });
        return Packer.toBlob(doc)

}

export {handleExportDocx};
