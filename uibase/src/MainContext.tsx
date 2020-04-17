import * as React from "react";
import Ecore from "ecore"

export const MainContext: React.Context<IMainContext> = React.createContext<IMainContext>({});

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
    parameterName: String,
    parameterValue: String
}

export interface IMainContext {
    updateContext?: (context: any, cb?: () => void) => void;
    applicationReferenceTree?: Ecore.EObject
    viewReferenceTree?: Ecore.EObject
    viewObject?: Ecore.EObject
    changeURL?: (appModuleName?: string, treeValue?: undefined, params?: Object[] | undefined) => void;
    runQuery?: (resource: Ecore.Resource, filterParams: IServerQueryParam[], aggregationParams: IServerQueryParam[], sortsParams: IServerQueryParam[], groupByParams: IServerQueryParam[], calculatedExpression: IServerQueryParam[], queryParams: IServerNamedParam[], ) => Promise<string>;
    datasetComponents?: any;
    notification?: (title: string, description: string, notificationType: "success" | "error" | "info" | "warning" | "open") => void;
    userProfile?: Ecore.EObject;
    changeUserProfile?: (viewObjectId: string, userProfileParams: any) => void;
}
