import Ecore, {EObject} from "ecore";
import _ from 'lodash';
import {Client} from '@stomp/stompjs';

const indexer = (() => {
    let i = 0
    return () => {
        i = i + 1
        return i
    }
})()

export class Error {
    error: string = "Unknown error";
    message?: string;
    path?: string;
    status?: number;
    timestamp?: string;
    trace?: string;
    cause?: any;

    static fromResponce(response: Response): Error {
        return new Error({error: response.statusText, status: response.status, path: response.url, cause: response})
    }

    constructor(init?: Partial<Error>) {
        Object.assign(this, init);
    }
}

export interface IErrorHandler {
    handleError(error: Error): void;
}

export interface QueryResult {
    executionStats: any;
    resources: Ecore.Resource[];
    bookmark: string;
    warning: string;
}

export class API implements IErrorHandler {
    private static _instance: API;
    public errorHandlers: Array<IErrorHandler>;
    private ePackagesPromise: Promise<Ecore.EPackage[]>;
    private resolvePackages: (value?: Ecore.EPackage[] | PromiseLike<Ecore.EPackage[]>) => void;
    private processes: any[];
    private processHandlers: ((processes: any[])=>void)[];
    private stompClient: Client;
    public onServerDown: () => void;

    private constructor() {
        this.errorHandlers = [this];
        this.ePackagesPromise = new Promise<Ecore.EPackage[]>((resolve, reject) => {
            this.resolvePackages = resolve
        });
        this.processes = [];
        this.processHandlers = [];
    }

    static instance(): API {
        if (!API._instance) {
            API._instance = new API();
        }
        return API._instance;
    }

    init = () => {
        this.fetchJson("/emf/packages").then(json => {
            let resourceSet = Ecore.ResourceSet.create();
            for (let i = 0; i < 2; ++i) {
                for (let aPackage of json as any[]) {
                    let uri = aPackage['nsURI'];
                    let resource = resourceSet.create({uri});
                    resource.load(aPackage);
                    resource.get('contents').each((ePackage: Ecore.EPackage) => {
                        Ecore.EPackage.Registry.register(ePackage);
                    })
                }
            }
            this.resolvePackages(Ecore.EPackage.Registry.ePackages());
        })
    };

    private reportError(error: Error): void {
        this.errorHandlers.forEach(h => h.handleError(error))
    }

    addErrorHandler(handler: IErrorHandler) {
        this.errorHandlers.push(handler)
    }

    removeErrorHandler(handler: IErrorHandler) {
        const index = this.errorHandlers.indexOf(handler, 0);
        if (index > -1) {
            this.errorHandlers.splice(index, 1);
        }
    }

    handleError(error: Error): void {
        console.log(error)
    }

    getOpts(opts?: RequestInit) {
        return _.merge({
            "credentials": "include",
            headers: {'X-Requested-With': 'XMLHttpRequest'}
        }, opts || {})
    }

    fetchJson(input: RequestInfo, init?: RequestInit): Promise<any> {
        return this.fetch(input, this.getOpts(init)).then(response => response.json());
    }

    fetchText(input: RequestInfo, init?: RequestInit): Promise<any> {
        return this.fetch(input, this.getOpts(init)).then(response => response.text());
    }

    newProcess(type: string, props: any) {
        const id = indexer()
        this.processes.push({id, type, props})
        this.fireProcesses()
        return id
    }

    removeProcess(id: number) {
        const index = this.processes.findIndex(item => item.id === id)
        if (index >= 0) {
            this.processes.splice(index, 1)
        }
        this.fireProcesses()
    }

    subscribeProcesses(handler: (processes: any[])=>void) {
        this.processHandlers.push(handler)
    }

    unsubscribeProcesses(handler: (processes: any[])=>void) {
        this.processHandlers = this.processHandlers.filter(value => value !== handler)
    }

    fireProcesses() {
        this.processHandlers.forEach(value => value(this.processes))
        // console.log("Process count: " + this.processes.length)
    }

    fetch(input: RequestInfo, init?: RequestInit): Promise<any> {
        console.log("FETCH: " + input + ' ' + (init?JSON.stringify(init):''));
        const pid = this.newProcess("FETCH", {input, init})
        return fetch(input, init).then(response => {
            if (!response.ok) {
                throw response;
            }
            this.removeProcess(pid)
            return response
        }).catch((error) => {
            this.removeProcess(pid)
            this.catchFetchError(error);
            return Promise.reject(error)
        });
    }

    fetchFirstAuthenticate(input: RequestInfo, init?: RequestInit): Promise<any> {
        return fetch(input, init).then(response => {
            if (!response.ok) {
                throw response;
            }
            return response
        }).catch((error) => {
            if (error.status !== 401) {
                this.catchFetchError(error)
            }
            return Promise.reject(error)
        });
    }

    private catchFetchError(error: any) {
        if (error instanceof Error) {
            this.reportError(error)
        } else if (error instanceof Response) {
            let response = error as Response;
            response.json().then(json => {
                this.reportError(new Error(Object.assign({}, json, {cause: response})));
            }).catch(error => {
                this.reportError(Error.fromResponce(response))
            })
        } else {
            this.reportError(new Error(Object.assign({}, error, {cause: error})));
        }
    }

    static collectExtReferences(object: any) {
        const ids = API.collectIds(object, new Set<string>());
        return API.collectReferences(object, new Set<string>(), ids, object._id);
    }
    static collectReferences(object: any, found: Set<string>, ids: Set<string>, rootId: string): Set<string> {
        if (!object || typeof object !== 'object') {
            return found;
        }
        let ref = object.$ref;
        if (ref) {
            let {id, fragment} = API.parseRef(ref);
            if (id) {
                if (!ids.has(id) && !ids.has(fragment)) {
                    object.$ref = id + '#' + fragment;
                    found.add(object.$ref);
                }
                else {
//                    object.$ref = rootId + "#" + (fragment === "/" ? id : fragment);
                    object.$ref = (fragment === "/" ? id : fragment);
                }
            }
        }
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                API.collectReferences(object[i], found, ids, rootId);
            }
        }
        return found;
    }

    static collectIds(object: any, found: Set<string>): Set<string> {
        if (!object || typeof object !== 'object') {
            return found;
        }
        let id = object._id;
        if (!!id && id !== "/") {
            found.add(id);
        }
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                API.collectIds(object[i], found);
            }
        }
        return found;
    }

    static parseRef(ref: string): any {
        if (!ref) return {}
        let id: string|undefined, query: string|undefined, resid: string|undefined, fragment: string|undefined;
        [resid, fragment] = ref.split('#', 2);
        if (!fragment) {
            if (resid.startsWith("/")) {
                fragment = resid
                resid = undefined
                }
            else {
                fragment = '/';
            }
        }
        if (resid) {
            [id, query] = resid.split('?', 2);
        }
        let rev = query && query.startsWith("rev=") ? query.substring(4) : undefined;
        return {id, rev, fragment, query, resid};
    }

    static fixReferences(object: any, rootId: string): void {
        if (!object || typeof object !== 'object' || !rootId) {
            return;
        }
        let ref = object.$ref;
        if (ref) {
            if (!ref.includes("#")) {
               object.$ref = rootId + '#' + ref;
            }
        }
        // let id = object._id;
        // if (id) {
        //     if (!id.includes("#")) {
        //         object._id = rootId + '#' + id;
        //     }
        // }
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                API.fixReferences(object[i], rootId);
            }
        }
    }

    static removeVerFromRefs(object: any): void {
        if (!object || typeof object !== 'object') {
            return;
        }
        let ref = object.$ref;
        if (ref) {
            const {id, fragment} = API.parseRef(ref)
            object.$ref = id + '#' + fragment;
        }
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                API.removeVerFromRefs(object[i]);
            }
        }
    }

    saveResource(resource: Ecore.Resource, level: number = 1): Promise<Ecore.Resource> {
        let url = "/emf/resource";
        let uri = resource.get('uri');
        if (uri) {
            let {id} = API.parseRef(uri);
            let rev = resource.rev;
            if (id && rev) {
                id = id + '?rev=' + rev;
            }
            if (id) {
                url = url + '?ref=' + encodeURIComponent(id);
            }
        }
        let obj = resource.to()
        API.fixReferences(obj, API.parseRef(resource.get('uri')).id)
        return this.fetchJson(url, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(json => {
            let {contents, uri} = json;
            let jsonObject = contents[0];
            let resourceSet = Ecore.ResourceSet.create();
            let loading: any = {}
            let promise = this.loadEObjectWithRefs(level, jsonObject, resourceSet, loading, uri);
            loading[API.parseRef(uri).id] = promise;
            return promise;
        })
    }

    indexObject(obj: any, index: Set<any>): Set<any> {
        if (!obj || typeof obj !== 'object' || index.has(obj)) {
            return index;
        }
        index.add(obj)
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                this.indexObject(obj[i], index)
            }
        }
        return index
    }

    loadResourceSet(resourceSet: Ecore.ResourceSet, jsonResources: any[]): Ecore.Resource[] {
        const prepared = jsonResources.map(jr=>{
            const {id, rev} = API.parseRef(jr.uri)
            return {id, rev, jObject: jr.contents[0]}
        })
        const db: any = {}
        prepared.forEach(p => {db[p.id] = p})
        function create(id: any) {
            const resource = resourceSet.create(id)
            if (resource.get('contents').size() === 0) {
                const {rev, jObject} = db[id]
                resource.rev = rev
                API.collectExtReferences(jObject).forEach(ref => create(API.parseRef(ref).id))
                resource.load(jObject)
            }
            return resource
        }
        return prepared.map(p => create(p.id))
    }

    fetchResourceSet(ref: string, resourceSet: Ecore.ResourceSet): Promise<Ecore.Resource> {
        if (!resourceSet) {
            resourceSet =  Ecore.ResourceSet.create();
        }
        return this.fetchJson(`/emf/resourceset?ref=${ref}`).then(json => {
            return this.loadResourceSet(resourceSet, json.resources)[0]
        })
    }

    fetchResource(ref: string, level: number, resourceSet: Ecore.ResourceSet, loading: any): Promise<Ecore.Resource> {
        const {id} = API.parseRef(ref);
        if (loading.hasOwnProperty(id)) {
            return loading[id];
        }

        let result = this.fetchResourceSet(id, resourceSet)
        loading[id] = result;
        return result;
    }

    loadEObjectWithRefs(level: number, jsonObject: any, resourceSet: Ecore.ResourceSet, loading: any, uri: string): Promise<Ecore.Resource> {
        let refEObjects: Promise<EObject>[] = []
        if (level > 0) {
            let refs = Array.from(API.collectExtReferences(jsonObject).values());
            refEObjects = refs.map(ref => {
                const alreadyLoaded: EObject = resourceSet.getEObject(ref)
                if (alreadyLoaded) {
                    return Promise.resolve(alreadyLoaded);
                }
                return this.fetchResource(ref, level - 1, resourceSet, loading).then(resource=>{
                    return Promise.resolve(resource.eContents()[0]);
                })
            })
        }
        return Promise.all(refEObjects).then(_ => {
            let {id, rev} = API.parseRef(uri);
            let resource = resourceSet.create({uri: id});
            resource.rev = rev;
            if (resource.eContents().length === 0) {
                resource.load(jsonObject);
            }
            return resource
        })
    }

    fetchEObject(ref: string, level: number = 1): Promise<Ecore.EObject> {
        let resourceSet = Ecore.ResourceSet.create();
        return this.fetchResource(ref, level, resourceSet, {}).then(_ => {
            let lastResource: Ecore.Resource = resourceSet.get('resources').last();
            return lastResource.get('contents').first();
        })
    }

    fetchPackages(): Promise<Ecore.EPackage[]> {
        return this.ePackagesPromise;
    }

    findEnum(ePackageName: string, eEnumName: string): Promise<Ecore.EClass[]> {
        return this.fetchPackages().then(packages => {
            let eClassifiers = packages
                .filter(p=>p.get('name') === ePackageName)
                .map(p=>p.get('eClassifiers').array())
                .flat() as Ecore.EObject[];
            return eClassifiers.filter(c=>c.get('name') === eEnumName)
                .map(p=>p.get('eLiterals').array())
                .flat() as Ecore.EObject[]
        })
    }

    findClass(ePackageName: string, eClassName: string): Promise<Ecore.EClass> {
        return this.fetchPackages().then(packages => {
            let eClassifiers = packages
                .filter(p=>p.get('name') === ePackageName)
                .map(p=>p.get('eClassifiers').array())
                .flat() as Ecore.EObject[];
            return eClassifiers.filter(c=>c.get('name') === eClassName)[0]
        })
    }

    find(selection: any, level: number = 1, tags?: string): Promise<QueryResult> {

        return this.fetchJson(`/emf/find${tags ? "?tags="+tags : ""}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selection)
        }).then(json => {
            let {executionStats, bookmark, warning, size} = json;
            let rs = Ecore.ResourceSet.create();
            const resources = this.loadResourceSet(rs, json.resources).slice(0, size)
            return {resources, executionStats, bookmark, warning}
        })
    }

    fetchAllClasses(includeBasicPackages: Boolean = true): Promise<Ecore.EClass[]> {
        const basicPackages: Array<String> = ["ecore", "resources"]
        return this.fetchPackages().then(packages => {
            return packages
                .filter(p=>includeBasicPackages || !basicPackages.includes(p.get('name')))
                .map(p=>p.eContents().filter(c => c.isTypeOf('EClass')))
                .flat() as Ecore.EClass[];
        })
    }

    findByKindAndName(eClass: Ecore.EClass, objectName?: string, level: number = 1, tags?: string) {
        if (objectName) {
            return this.findByKind(eClass, {contents: {name: objectName}}, level, tags)
        }
        return this.findByKind(eClass, {contents: {eClass: eClass.eURI()}}, level, tags)
    }

    findByKindAndRegexp(eClass: Ecore.EClass, objectName?: string, level: number = 1, tags?: string) {
        if (objectName) {
            return this.findByKind(eClass, {contents: {name: {"$regex": objectName}}}, level, tags)
        }
        return this.findByKind(eClass, {contents: {eClass: eClass.eURI()}}, level)
    }

    findByKind(eClass: Ecore.EClass, selector: any, level: number = 1, tags?: string): Promise<Ecore.Resource[]> {
        // const eAllSubTypes: Ecore.EClass[] = (eClass.get('eAllSubTypes') as Ecore.EClass[]);
        const promises: Promise<Ecore.Resource[]>[] = [eClass/*, ...eAllSubTypes*/]
            // .filter(c => !c.get('abstract'))
            .map(c => this.findByClass(c, selector, level, tags));
        return Promise.all(promises).then((resources: Ecore.Resource[][]) => {
            return resources.flat();
        })
    }

    findByClass(eClass: Ecore.EClass, selector: any, level: number = 1, tags?: string): Promise<Ecore.Resource[]> {
        return this.findByClassURI(eClass.eURI(), selector, level, tags);
    }

    findByTagsAndRegex(tags: string, objectName?: string, level: number = 1): Promise<Ecore.Resource[]> {
        let selection: any = {contents: {eClass: undefined}};
        if (objectName) {
            selection = {contents: {name: {"$regex": objectName}}}
        }
        return this.find(selection, level, tags).then(r=>r.resources);
    }

    findByTagsAndName(tags: string, objectName?: string, level: number = 1): Promise<Ecore.Resource[]> {
        let selection: any = {contents: {eClass: undefined}};
        if (objectName) {
            selection = {contents: {name: objectName}}
        }
        return this.find(selection, level, tags).then(r=>r.resources);
    }

    findByClassURI(classURI: string, selector: any, level: number = 1, tags?: string): Promise<Ecore.Resource[]> {
        let selection: any = {contents: {eClass: classURI}};
        selection = _.merge(selector, selection);
        return this.find(selection, level, tags).then(r=>r.resources);
    }

    deleteResource(ref: string): Promise<any> {
        return this.fetchJson(`/emf/resource?ref=${ref}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    }

    call(ref: string, method: string, params: any[]): Promise<any> {
        return this.fetchJson(`/emf/call?ref=${encodeURIComponent(ref)}&method=${encodeURIComponent(method)}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
    }

    voidCall(ref: string, method: string, params: any[]): Promise<any> {
        return this.fetch(`/emf/call?ref=${encodeURIComponent(ref)}&method=${encodeURIComponent(method)}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
    }

    authenticate(login : any, password : any) {
        if (login === undefined) {
            return this.fetchFirstAuthenticate('/system/user', this.getOpts({}))
                .then(response => response.json())
        } else {
            return this.fetch('/system/user', this.getOpts({
                method: "GET",
                headers: {
                    'Authorization': "Basic " + btoa(unescape(encodeURIComponent(login + ":" + password)))
                }
            })).then(response => response.json())
        }
    }

    logout() {
        return this.fetch('/logout', this.getOpts({
            method: "POST"
        }))
    }

    deleteLock(name: string): Promise<any> {
        return this.fetchJson(`/emf/deleteLock?name=${name}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    }

    createLock(name: string, objectName: string): Promise<any> {
        return this.fetchJson(`/emf/currentLock?name=${name}&objectName=${objectName}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    }

    download(input: RequestInfo, init?: RequestInit, filename?: string) {
        let download = filename || "download"
        return this.fetch(input, init).then(response => {
            var disposition = response.headers.get('Content-Disposition');
            if (disposition) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    download = matches[1].replace(/['"]/g, '');
                }
            }
            return response.blob()
        }).then((blob: any) => {
            const a: HTMLAnchorElement = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute("style", "display: none");
            let objectURL = URL.createObjectURL(blob)
            a.href = objectURL;
            a.download = download;
            a.click();
            URL.revokeObjectURL(objectURL)
            document.body.removeChild(a)
        })
    }

    fetchLog(): Promise<any> {
        return this.fetchText("/actuator/logfile")
    }

    stompConnect = () => {
        this.stompClient = new Client();

        this.stompClient.configure({
            webSocketFactory: () => {
                // eslint-disable-next-line no-restricted-globals
                return new WebSocket('ws://' + window.location.host + '/socket-registry')
            },
            onConnect: () => {
                this.stompClient.subscribe('/topic/afterSave', message => {
                    console.log('ON CONNECT: ', JSON.parse(message.body));
                });
            },
            debug: (str) => {
                console.log('DEBUG:', new Date(), str);
            },
            onWebSocketError: (evt: Event) => {
                if (this.onServerDown) {
                    this.onServerDown();
                    this.stompClient.deactivate();
                }
            }
        });
        this.stompClient.activate();
    };
}
