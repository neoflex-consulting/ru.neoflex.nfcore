import Ecore from "ecore";

const searchSource = "ru.neoflex.nfcore";

type classAnnotationKey = "invisible"|"disabled"|"documentation";

export function getClassAnnotationByKey(annotations: Ecore.EList, key: classAnnotationKey) {
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

export function getClassAnnotationByClassAndKey(eClass: Ecore.EClass, key: classAnnotationKey, checkParents = false) {
    let retVal = "";
    if (checkParents) {
        eClass.get('eAllSuperTypes').forEach((st: Ecore.EObject) => {
            retVal = retVal !== "" ? retVal + "," + getClassAnnotationByKey(st.get('eAnnotations'), key) : getClassAnnotationByKey(st.get('eAnnotations'), key)
        })
    }
    return retVal !== "" ? retVal + "," + getClassAnnotationByKey(eClass.get('eAnnotations'), key) : getClassAnnotationByKey(eClass.get('eAnnotations'), key)
}