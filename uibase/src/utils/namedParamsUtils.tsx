import {IServerNamedParam} from "../MainContext";
import {EList, EObject} from "ecore";
import {getUrlParam, getUrlParamDataType} from "./urlUtils";

function replaceNamedParam(valueString:string, namedParams:IServerNamedParam[]) {
    const params = namedParams.sort((a, b) => {
        if (a.parameterName > b.parameterName) {
            return -1
        } else if (a.parameterName === b.parameterName){
            return 0
        }
        return 1
    });
    let replacedCommand = valueString;
    params.forEach(param => {
        if (replacedCommand?.includes(param.parameterName)) {
            const value = typeof param.parameterValue === "object" ? JSON.stringify(param.parameterValue ? param.parameterValue : "") : param.parameterValue
            replacedCommand = replacedCommand?.replace(new RegExp(":"+param.parameterName, 'g'), (param.parameterValue===null)?"":value);
        }
    });
    return replacedCommand
}

function getNamedParams(valueItems: EList, contextItemValues: Map<String,IServerNamedParam>, params: IServerNamedParam[] = []) {
    let namedParams: IServerNamedParam[] = [];
    if (valueItems) {
        valueItems.each((item: EObject) => {
            if (contextItemValues.get(item.get('name')+item._id)) {
                const param = contextItemValues.get(item.get('name')+item._id)
                namedParams.push({
                    ...param!,
                    parameterValue: param?.parameterValue !== undefined && param?.parameterValue !== null && param?.parameterValue !== "" ? param.parameterValue : getUrlParam(params, item.get('name'))!,
                })
            } else {
                namedParams.push({
                    parameterName: item.get('name'),
                    //Проверка параметров в url'ах
                    parameterValue: item.get('value') !== undefined && item.get('value') !== null && item.get('value') !== "" ? item.get('value') : getUrlParam(params, item.get('name')),
                    parameterDataType: getUrlParamDataType(params, item.get('name')) || "String"
                })
            }
        });
    }
    return namedParams
}

function getNamedParamByName(parameterName: string, contextItemValues: Map<String,IServerNamedParam>, params: IServerNamedParam[] = []) : IServerNamedParam {
    let parameter : IServerNamedParam|undefined = undefined;
    contextItemValues.forEach(param => {
       if (param.parameterName === parameterName)
           parameter = param
    });
    return parameter !== undefined && parameter !== null ? parameter : {
        parameterName: parameterName,
        parameterValue: getUrlParam(params, parameterName)!
    }
}

export {replaceNamedParam, getNamedParams, getNamedParamByName}
