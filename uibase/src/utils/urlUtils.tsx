import {IServerNamedParam} from "../MainContext";

export function getUrlParam(urlParams:IServerNamedParam[], parameterName:string) {
    let param;
    if (urlParams !== undefined && urlParams.length !== 0) {
        param = urlParams.find((f: any) => f.parameterName === parameterName)
    }
    return param && param.parameterValue
}

export function getUrlParamDataType(urlParams:IServerNamedParam[], parameterName:string) {
    let param;
    if (urlParams !== undefined && urlParams.length !== 0) {
        param = urlParams.find((f: any) => f.parameterName === parameterName)
    }
    return param && param.parameterDataType
}