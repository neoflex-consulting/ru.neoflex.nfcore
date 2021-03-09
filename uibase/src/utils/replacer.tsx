// import {hash} from "../components/app/dataset/Calculator";

import * as crypto from "crypto"

export function hash(s: string) : string {
    const hash = crypto.createHash('md5');
    hash.update(s);
    return hash.digest("hex")
}

export function encode(index: number) : string {
    if (index <= 23) {
        return String.fromCharCode(65 + index)
    } else {
        return String.fromCharCode(64 + index/26) + String.fromCharCode(65 + index%26)
    }
}

export function replaceAllCollisionless(str:string, arr:{name:string, replacement: string}[], flags = 'g') {
    let str1 = str;
    const arr1 = arr.map(a=>{
        return {
            ...a,
            hash: hash(a.name)
        }
    }).sort((a, b) => {
        if (a.name.length > b.name.length)
            return -1;
        if (a.name.length < b.name.length)
            return 1;
        if (a.name.length === b.name.length && a.name > b.name)
            return -1;
        if (a.name.length === b.name.length && a.name < b.name)
            return 1;
        return 0
    });
    arr1.forEach(a=>str1 = str1.includes(a.name) ? str1.replace(new RegExp(a.name, flags), a.hash): str1);
    arr1.forEach(a=>str1 = str1.includes(a.hash) ? str1.replace(new RegExp(a.hash, flags), a.replacement) : str1);
    return str1
}
