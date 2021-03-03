import update from 'immutability-helper';

/**
 * Creates updaters for all levels of an object, including for objects in arrays.
 */
function nestUpdaters(json: any, parentObject: any = null, property ?: String): { [key: string]: any } {

    const createUpdater = (data: Object, init_idx?: Number) => {
        return (newValues: Object, indexForParentUpdater?: any, updaterProperty?: any, options?: any) => {
            const currentObject: { [key: string]: any } = data;
            const idx: any = init_idx;
            const prop: any = property;
            let parent = parentObject;
            let updatedData;
            if (updaterProperty) {
                if (indexForParentUpdater !== undefined) {
                    updatedData = update(currentObject as any, { [updaterProperty]: { [indexForParentUpdater]: { $merge: newValues } } })
                } else {
                    if (options && options.operation === "push") {
                        //cause a property may not exist
                        if (!currentObject[updaterProperty]) currentObject[updaterProperty] = [];
                        updatedData = update(currentObject as any, { [updaterProperty]: { $push: [newValues] } })
                    } else if (options && options.index && options.operation === "splice") {
                        updatedData = update(currentObject as any, { [updaterProperty]: { $splice: [[options.index, 1]] } })
                    } else if (options && options.operation === "set") {
                        updatedData = update(currentObject as any, { [updaterProperty]: { $set: newValues } })
                    } else if (options && options.operation === "unset") {
                        updatedData = update(currentObject as any, { $unset: [updaterProperty] })
                    } else if (options && options.operation === "move") {
                        let oldIndexValue
                        if (currentObject.children !== undefined) {
                            oldIndexValue = currentObject.children[options.oldIndex]
                        }
                        else {
                            oldIndexValue = currentObject[updaterProperty][options.oldIndex]
                        }
                        let temp = update(currentObject as any, { [updaterProperty]: { $splice: [[options.oldIndex, 1]] } });
                        updatedData = update(temp as any, { [updaterProperty]: { $splice: [[options.newIndex, 0, oldIndexValue]] } })
                    } else if (options && options.operation === "getAllParentChildren") {
                        return currentObject.children ? currentObject.children : undefined
                    } else if (options && options.operation === "deleteNode") {
                        if (Array.isArray(currentObject[updaterProperty])) {
                            updatedData = update(currentObject as any, { [updaterProperty]: { $splice: [[options.index, 1]] } })
                        } else { //DatasetComponent (component -> component)
                            updatedData = update(currentObject as any, { [updaterProperty]: { $set: null } })
                        }
                    } else {
                        //if nothing from listed above, then merge updating the object by a property name
                        updatedData = update(currentObject as any, { [updaterProperty]: { $merge: newValues } })
                    }
                }
            } else {
                updatedData = update(currentObject, { $merge: newValues })
            }
            let result = updatedData
            if (parent && parent.updater) {
                result = parent.updater(updatedData, idx, prop)
            }
            return result
        }
    }

    const walkThroughArray = (array: Array<any>) => {
        array.forEach((obj, index) => {
            //we have to check the type, cause it can be an array of strings, for e.g.
            if (typeof obj === "object") {
                walkThroughObject(obj)
                obj.updater = createUpdater(obj, index)
            }
        })
    };

    const walkThroughObject = (obj: any) => {
        obj.updater = createUpdater(obj);
        Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                nestUpdaters(value, obj, key)
            } else {
                if (value instanceof Object && typeof value === "object") nestUpdaters(value, obj, key)
            }
        })
    };

    if (Array.isArray(json)) {
        walkThroughArray(json)
    } else {
        walkThroughObject(json)
    }

    return json
}

/**
 * Looking for a target id and returns an object.
 */
function findObjectById(data: any, id: String): any {
    const walkThroughArray = (array: Array<any>): any => {
        for (var el of array) {
            if (el !== undefined && el._id === id) {
                return el
            } else {
                const result = findObjectById(el, id);
                if (result) return result
            }
        }
    };

    const walkThroughObject = (obj: any): any => {
        let result;

        for (let prop in obj) {
            if (result) {
                break
            }
            if (Array.isArray(obj[prop])) {
                result = findObjectById(obj[prop], id)
            } else {
                if (obj[prop] instanceof Object && typeof obj[prop] === "object") {
                    result = findObjectById(obj[prop], id)
                }
            }
        }
        if (result) return result
    };

    if (data._id === id) return data;

    if (Array.isArray(data)) {
        return walkThroughArray(data)
    } else {
        return walkThroughObject(data)
    }
}

function traverseEObject(obj: any, func: (obj: any, key: string, level: number)=>void, level = 1) {
    for (let k in obj) {
        if (obj.hasOwnProperty(k) && obj[k] && typeof obj[k] === 'object') {
            level = k === "children" ? level + 1 : level
            traverseEObject(obj[k], func, level)
        } else {
            // Do something with obj
            func(obj, k, level);
        }
    }
}

function findObjectByIdCallback(data: any, id: String, callback: any): any {
    const walkThroughArray = (array: Array<any>): any => {
        for (var el of array) {
            if (el._id && el._id === id) {
                return callback(el, data)
            } else {
                findObjectByIdCallback(el, id, callback);
            }
        }
    };

    const walkThroughObject = (obj: any): any => {
        let result;
        for (let prop in obj) {
            if (result) {
                break
            }
            if (Array.isArray(obj[prop])) {
                result = findObjectByIdCallback(obj[prop], id, callback)
            } else {
                if (obj[prop] instanceof Object && typeof obj[prop] === "object") {
                    result = findObjectByIdCallback(obj[prop], id, callback)
                }
            }
        }
        if (result) callback(result, data)
    };

    if (data._id === id) return callback(data, data);

    if (Array.isArray(data)) {
        return walkThroughArray(data)
    } else {
        return walkThroughObject(data)
    }
}

const boolSelectionOption: { [key: string]: any } = { "false": false, "undefined": false, "null": false, "true": true }
const getPrimitiveType = (value: string): any => boolSelectionOption[value]
const convertPrimitiveToString = (value: string): any => String(boolSelectionOption[value])

export { nestUpdaters, findObjectByIdCallback, findObjectById, boolSelectionOption, getPrimitiveType, convertPrimitiveToString, traverseEObject };
