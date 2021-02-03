import Ecore from "ecore";

const searchSource = "ru.neoflex.nfcore";

type classAnnotationKey = "documentation";
type fieldAnnotationKey = "invisible"|"disabled"|"documentation"|"renderConditions"|"expandable"|"syntax"|"resourceEditorName"|"neoIconSelect";

function getAnnotationByKey(annotations: Ecore.EList, key: classAnnotationKey|fieldAnnotationKey) {
    let retVal = "";
    annotations.each( (a:Ecore.EObject) => {
        if (a.get('source') === searchSource) {
            a.get('details') && a.get('details').each((b:Ecore.EObject) => {
                if (b.get('key') === key) {
                    retVal = b.get('value')
                }
            })
        }
    });
    return retVal
}

export function getClassAnnotationByKey(annotations: Ecore.EList, key: classAnnotationKey) {
    return getAnnotationByKey(annotations, key)
}

export function getFieldAnnotationByKey(annotations: Ecore.EList, key: fieldAnnotationKey) {
    return getAnnotationByKey(annotations, key)
}

export function getClassAnnotationByClassAndKey(eClass: Ecore.EClass, key: classAnnotationKey, checkParents = false) {
    let retVal = "";
    if (checkParents) {
        eClass.get('eAllSuperTypes').forEach((st: Ecore.EObject) => {
            retVal = retVal !== "" ? retVal + "," + getClassAnnotationByKey(st.get('eAnnotations'), key) : getClassAnnotationByKey(st.get('eAnnotations'), key)
        })
    }
    return retVal !== "" ? retVal + "," + getClassAnnotationByKey(eClass.get('eAnnotations'), key) : getClassAnnotationByKey(eClass.get('eAnnotations'), key)
}

