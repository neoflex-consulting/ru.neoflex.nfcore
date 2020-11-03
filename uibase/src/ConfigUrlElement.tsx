import {IServerNamedParam} from "./MainContext";

interface ConfigUrlElement {
    appModule: string | undefined
    tree: string[]
    params: IServerNamedParam[] | undefined
    useParentReferenceTree: boolean
}

export default ConfigUrlElement

