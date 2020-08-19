async function checkPermissions() {
    let isReadAllowed, isWriteAllowed = false;
    //https://github.com/microsoft/TypeScript/issues/33923
    // @ts-ignore
    await navigator.permissions.query({name: 'clipboard-read'}).then((permissionStatus:any) => {
        console.log(permissionStatus.state);
        if (permissionStatus.state !== "denied")
            isReadAllowed = true
    });
    // @ts-ignore
    await navigator.permissions.query({name: 'clipboard-write'}).then((permissionStatus:any) => {
        console.log(permissionStatus.state);
        if (permissionStatus.state !== "denied")
            isWriteAllowed = true
    });
    return isReadAllowed && isWriteAllowed;
}

async function copyToClipboard(stringToCopy: string) {
    checkPermissions().then(async isAllowed=>{
        if (isAllowed) {
            await navigator.clipboard.writeText(stringToCopy);
            console.log('Content copied to clipboard');
        } else {
            document.addEventListener('copy', function(event){
                event.clipboardData!.setData('text/plain', stringToCopy);
                event.preventDefault(); // default behaviour is to copy any selected text
                document.removeEventListener('copy',()=>{});
            });
            document.execCommand('copy');
        }
    })
}

async function getClipboardContents() {
    let json = "";
    await checkPermissions().then(async isAllowed=>{
        if (isAllowed) {
            json = await navigator.clipboard.readText();
            console.log('Pasted content: ', json);
        } else {
            document.addEventListener('copy', function(event){
                json = event.clipboardData!.getData('text/plain');
                event.preventDefault(); // default behaviour is to copy any selected text
                document.removeEventListener('copy',()=>{});
            });
            document.execCommand('copy');
        }
    });
    return json
}

export {copyToClipboard, getClipboardContents}
