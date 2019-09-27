import {ResourceEditor} from './ResourceEditor';

const testJSONData = { 
    "eClass": "ru.neoflex.nfcore.base.auth#//User", 
    "_id": "/", 
    "name": "admin1", 
    "description": "Admin user with Super User role", 
    "roles": [{ "$ref": "07c865e012e2939a37e5100e72004833#/", "eClass": "ru.neoflex.nfcore.base.auth#//Role" }], 
    "audit": { "eClass": "ru.neoflex.nfcore.base.auth#//Audit", "_id": "//@audit", "created": "2019-08-19T08:55:43.121+0000" }, 
    "email": "admin@neoflex.ru", 
    "authenticators": [
        { "eClass": "ru.neoflex.nfcore.base.auth#//PasswordAuthenticator", "_id": "//@authenticators.0", "password": "admin" },
        { 
            "eClass": "ru.neoflex.nfcore.base.auth#//PasswordAuthenticator", 
            "_id": "//@authenticators.0", "password": "admin",
            "tests": [{
                "testAudit": { "eClass": "ru.neoflex.nfcore.base.testAudit#//testAudit", "_id": "//@testAudit", "created": "2019-08-19T08:55:43.121+0000" },
                "eClass": "ru.neoflex.nfcore.base.test#//Test",
                "_id": "//@test.0",
            }] 
        }
    ] 
}

describe("function findObjectById", () => {
    const resourceEditor = new ResourceEditor();
    let expextedFoundObject
    let result

    it("should return found object from shallow", () => {
        expextedFoundObject = Object.assign({}, testJSONData)
        result = resourceEditor.findObjectById(testJSONData, '/');
        expect(result).toEqual(expextedFoundObject);
    });

    it("should not return any object", () => {
        expextedFoundObject = undefined
        result = resourceEditor.findObjectById(testJSONData, '/qwerty');
        expect(result).toEqual(expextedFoundObject);

        result = resourceEditor.findObjectById({}, '/qwerty');
        expect(result).toEqual(expextedFoundObject);

        result = resourceEditor.findObjectById(testJSONData, '');
        expect(result).toEqual(expextedFoundObject);
    });

    it("should return found object from 'authenticators' array", () => {
        expextedFoundObject = { 
            "eClass": "ru.neoflex.nfcore.base.auth#//PasswordAuthenticator", 
            "_id": "//@authenticators.0", 
            "password": "admin"
        }
        result = resourceEditor.findObjectById(testJSONData, '//@authenticators.0');
        expect(result).toEqual(expextedFoundObject);
    });

    it("should return found object from deep 'tests' array", () => {
        expextedFoundObject = {
            "testAudit": { "eClass": "ru.neoflex.nfcore.base.testAudit#//testAudit", "_id": "//@testAudit", "created": "2019-08-19T08:55:43.121+0000" },
            "eClass": "ru.neoflex.nfcore.base.test#//Test",
            "_id": "//@test.0",
        }
        result = resourceEditor.findObjectById(testJSONData, '//@test.0');
        expect(result).toEqual(expextedFoundObject);
    });

});
