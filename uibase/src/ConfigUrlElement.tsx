import {EObject} from "ecore";

interface ConfigUrlElement {
    appModule: string | undefined
    tree: string[]
    params: Object[] | undefined
}

export default ConfigUrlElement

