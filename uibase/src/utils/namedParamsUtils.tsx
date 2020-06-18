import {IServerNamedParam} from "../MainContext";
import {EObject} from "ecore";

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
};

function getNamedParams(valueItems: any, contextItemValues: any) {
    let namedParams: IServerNamedParam[] = [];
    if (valueItems) {
        valueItems.each((item: EObject) => {
            if (contextItemValues.get(item._id.split("_")[0])) {
                namedParams.push(contextItemValues.get(item._id.split("_")[0]))
            } else {
                namedParams.push({
                    parameterName: item.get('name'),
                    parameterValue: item.get('value')
                })
            }
        });
    }
    return namedParams
};

export {replaceNamedParam, getNamedParams}
