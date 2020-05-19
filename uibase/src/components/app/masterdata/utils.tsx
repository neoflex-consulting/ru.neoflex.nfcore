import {EObject} from "ecore";

export const getAllAttributes = (entityType: EObject): EObject[] => {
    return [
        ...(entityType.get('superTypes') as EObject[]).map(t => getAllAttributes(t)).flat(),
        ...entityType.get('attributes').array()
    ]
}

export const getAttrCaption = (attr: EObject): string => {
    return attr.get('caption') || attr.get('name')
}