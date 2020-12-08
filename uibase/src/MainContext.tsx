import * as React from "react";
import Ecore from "ecore"
import {actionType, dmlOperation, eventType} from "./utils/consts";
import ConfigUrlElement from "./ConfigUrlElement";

export const MainContext: React.Context<IMainContext> = React.createContext<IMainContext>({});

export interface IServerQueryParam {
    index: number,
    datasetColumn?: string,
    operation?: string,
    value?: string,
    enable?: boolean,
    type?: string,
    mask?: string,
    highlightType?: string,
    backgroundColor?: string,
    color?: string
}


export interface IServerNamedParam {
    parameterName: string,
    parameterValue: string|{[key:string]:string|number|null},
    parameterDataType?: string,
    isPrimaryKey?: boolean
}

export interface IEvent {
    type: eventType,
    itemId: string,
    value?: string|{[key:string]:string|number|null}|{[key:string]:string|number|null}[]
}

export interface IAction {
    actionType: actionType,
    callback: (value:string|{[key:string]:string|number|null}|{[key:string]:string|number|null}[]|undefined) => void
}

export interface IEventAction {
    itemId: string,
    actions: IAction[]
}

export interface IEventHandler {
    itemId: string,
    eventType: eventType,
    callback: (value:string|{[key:string]:string|number|null}|{[key:string]:string|number|null}[]|undefined) => void
}

export interface IMainContext {
    updateContext?: (context: any, cb?: () => void) => void;
    applicationReferenceTree?: Ecore.EObject
    viewReferenceTree?: Ecore.EObject
    viewObject?: Ecore.EObject
    changeURL?: (appModuleName?: string, useParentReferenceTree?: boolean, treeValue?: undefined, params?: IServerNamedParam[] | undefined) => void;
    getURL?: (appModuleName?: string, useParentReferenceTree?: boolean, treeValue?: undefined, params?: IServerNamedParam[] | undefined) => any;
    runQuery?: (
        resource: Ecore.Resource,
        queryParams: IServerNamedParam[],
        filterParams: IServerQueryParam[],
        aggregationParams: IServerQueryParam[],
        sortsParams: IServerQueryParam[],
        groupByParams: IServerQueryParam[],
        calculatedExpression: IServerQueryParam[],
        groupByColumns: IServerQueryParam[]
        ) => Promise<string>;
    executeDMLOperation?: (
        resource: Ecore.Resource,
        operation: dmlOperation,
        queryParams: IServerNamedParam[],
    ) => Promise<string>;
    runQueryDataset? : (resource: Ecore.Resource, queryParams: IServerNamedParam[]) => Promise<string>;
    datasetComponents?: any;
    notification?: (title: string, description: string, notificationType: "success" | "error" | "info" | "warning" | "open") => void;
    userProfilePromise?: Promise<Ecore.Resource>;
    changeUserProfile?: (viewObjectId: string, userProfileParams: any) => void;
    addDocxHandler?: (handler:any)=>void;
    addExcelHandler?: (handler:any)=>void;
    addEventAction?: (action:IEventAction)=>void;
    removeDocxHandler?: ()=>void;
    removeExcelHandler?: ()=>void;
    removeEventAction?: ()=>void;
    getDocxHandlers?: ()=>any[];
    getExcelHandlers?: ()=>any[];
    getEventActions?: ()=>IEventAction[];
    contextItemValues?: Map<String, string|{[key:string]:string|number|null}|{[key:string]:string|number|null}[]>;
    globalValues?: Map<String, IServerNamedParam>;
    addEventHandler?: (eventHandler: IEventHandler)=>void;
    removeEventHandler?: (name: string)=>void;
    notifyAllEventHandlers?: (event: IEvent)=>void;
    getFullPath?: ()=>ConfigUrlElement[];
    isDeveloper?: ()=>boolean;
}
