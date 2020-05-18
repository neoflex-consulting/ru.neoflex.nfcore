import * as React from "react";
import Ecore from "ecore"

export const MainContext: React.Context<IMainContext> = React.createContext<IMainContext>({});

export interface ISubmitHandler {
    name: string,
    handler: Function
}

export interface IServerQueryParam {
    index: number,
    datasetColumn?: string,
    operation?: string,
    value?: string,
    enable?: boolean,
    type?: string
    highlightType?: string,
    backgroundColor?: string,
    color?: string
}

export interface IServerNamedParam {
    parameterName: string,
    parameterValue: string,
    parameterDataType?: string,
    parameterDateFormat?: string
}

export interface IMainContext {
    updateContext?: (context: any, cb?: () => void) => void;
    applicationReferenceTree?: Ecore.EObject
    viewReferenceTree?: Ecore.EObject
    viewObject?: Ecore.EObject
    changeURL?: (appModuleName?: string, useParentReferenceTree?: boolean, treeValue?: undefined, params?: Object[] | undefined) => void;
    runQuery?: (resource: Ecore.Resource, filterParams: IServerQueryParam[], aggregationParams: IServerQueryParam[], sortsParams: IServerQueryParam[], groupByParams: IServerQueryParam[], calculatedExpression: IServerQueryParam[], queryParams: IServerNamedParam[], ) => Promise<string>;
    datasetComponents?: any;
    notification?: (title: string, description: string, notificationType: "success" | "error" | "info" | "warning" | "open") => void;
    userProfile?: Ecore.EObject;
    changeUserProfile?: (viewObjectId: string, userProfileParams: any) => void;
    docxHandlers?: any[];
    excelHandlers?: any[];
    submitHandlers?: ISubmitHandler[];
    contextItemValues?: Map<String, any>;
}
