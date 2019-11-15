function copyIntoClipboard(text: string){
    let copied: boolean = false
    const modifyCopy = (e: any) => {
        e.clipboardData.setData('text/plain', String(text));
        copied = true;
        e.preventDefault();
        if(copied){
            document.removeEventListener('copy', modifyCopy);
        }
    };
    document.addEventListener('copy', modifyCopy);
    document.execCommand('copy')
}

export {copyIntoClipboard}
