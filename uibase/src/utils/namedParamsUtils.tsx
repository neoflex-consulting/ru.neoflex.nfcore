import {IServerNamedParam} from "../MainContext";
import {EObject} from "ecore";
import {getUrlParam} from "./urlUtils";

function replaceNamedParam(valueString:string, namedParams:IServerNamedParam[]) {
    const params = namedParams.sort((a, b) => {
        if (a.parameterName > b.parameterName) {
            return 1
        } else if (a.parameterName === b.parameterName){
            return 0
        }
        return -1
    });
    let replacedCommand = valueString;
    params.forEach(param => {
        if (replacedCommand?.includes(param.parameterName)) {
            replacedCommand = replacedCommand?.replace(new RegExp(":"+param.parameterName, 'g'), (param.parameterValue===null)?"":param.parameterValue);
        }
    });
    return replacedCommand
}

function getNamedParams(valueItems: any, contextItemValues: any, params: any[] = []) {
    let namedParams: IServerNamedParam[] = [];
    if (valueItems) {
        valueItems.each((item: EObject) => {
            if (contextItemValues.get(item.get('name')+item._id)) {
                namedParams.push(contextItemValues.get(item.get('name')+item._id))
            } else {
                namedParams.push({
                    parameterName: item.get('name'),
                    parameterValue: item.get('value')
                })
            }
        });
    }
    //Проверка параметров в url'ах
    namedParams = namedParams.map(param => {
        return {
            ...param,
            parameterValue: param.parameterValue ? param.parameterValue : getUrlParam(params, param.parameterName)
        }
    });
    return namedParams
}


export {replaceNamedParam, getNamedParams}
