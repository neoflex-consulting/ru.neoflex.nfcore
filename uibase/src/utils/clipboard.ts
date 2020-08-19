async function copyToClipboard(stringToCopy: string) {
    await navigator.clipboard.writeText(stringToCopy);
    console.log('Content copied to clipboard');
}

async function getClipboardContents() {
    let json = "";
    if (navigator.clipboard) {
        json = await navigator.clipboard.readText();
        console.log('Pasted content: ', json);
    } else {
        navigator.permissions.query({
            name: "clipboard"
        }).then((permissionStatus:any) => {
            console.log(permissionStatus.state);
            permissionStatus.onchange = () => {
                console.log(permissionStatus.state);
            };
        });
    }
    return json
}

export {copyToClipboard, getClipboardContents}
