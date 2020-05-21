import {EObject} from "ecore";

export const getAllAttributes = (entityType: EObject): EObject[] => {
    return [
        ...(entityType.get('superTypes') as EObject[] || []).map(t => getAllAttributes(t)).flat(),
        ...entityType.get('attributes').array()
    ]
}

export const getAttrCaption = (attr: EObject): string => {
    return attr.get('caption') || attr.get('name')
}

export const createDefaultValue = (classifierType: EObject): any => {
    if (classifierType.eClass.get('name') === 'DocumentType') {
        return {'@type': 'd', '@class': classifierType.get('name')}
    }
    if (classifierType.eClass.get('name') === 'ArrayType') {
        return []
    }
    return null
}