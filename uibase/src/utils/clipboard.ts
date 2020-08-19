async function copyToClipboard(stringToCopy: string) {
    await navigator.clipboard.writeText(stringToCopy);
    console.log('Content copied to clipboard');
}

async function getClipboardContents() {
    let json = "";
    json = await navigator.clipboard.readText();
    console.log('Pasted content: ', json);
    return json
}

export {copyToClipboard, getClipboardContents}
