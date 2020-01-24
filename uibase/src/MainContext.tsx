import * as React from "react";
import Ecore from "ecore"

export const MainContext: React.Context<IMainContext> = React.createContext<IMainContext>({});

export interface IMainContext {
    updateContext?: (context: any, cb?: () => void) => void;
    applicationReferenceTree?: Ecore.EObject
    viewReferenceTree?: Ecore.EObject
    viewObject?: Ecore.EObject
    changeURL?: (appModuleName?: string, treeValue?: undefined, params?: Object[] | undefined) => void;
    runQuery?: (resource: Ecore.Resource) => Promise<string>;
}
