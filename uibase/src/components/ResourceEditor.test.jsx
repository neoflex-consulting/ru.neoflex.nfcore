import {ResourceEditor} from './ResourceEditor';
import cloneDeep from 'lodash/cloneDeep'

const resourceEditor = new ResourceEditor();

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
    let expextedFoundObject
    let result

    it("should return a found object from shallow", () => {
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

    it("should return a found object from 'authenticators' array", () => {
        expextedFoundObject = { 
            "eClass": "ru.neoflex.nfcore.base.auth#//PasswordAuthenticator", 
            "_id": "//@authenticators.0", 
            "password": "admin"
        }
        result = resourceEditor.findObjectById(testJSONData, '//@authenticators.0');
        expect(result).toEqual(expextedFoundObject);
    });

    it("should return a found object from deep 'tests' array", () => {
        expextedFoundObject = {
            "testAudit": { "eClass": "ru.neoflex.nfcore.base.testAudit#//testAudit", "_id": "//@testAudit", "created": "2019-08-19T08:55:43.121+0000" },
            "eClass": "ru.neoflex.nfcore.base.test#//Test",
            "_id": "//@test.0",
        }
        result = resourceEditor.findObjectById(testJSONData, '//@test.0');
        expect(result).toEqual(expextedFoundObject);
    });

});

{
    const copyOfJSONData = cloneDeep(testJSONData)
    const nestedJSON = resourceEditor.nestUpdaters(copyOfJSONData)

    describe("function nestUpdaters", () => {
        it("should return an object with updaters, particular checking for existing of some updaters", () => {
            expect(nestedJSON).toHaveProperty('updater')
            expect(nestedJSON.audit).toHaveProperty('updater')
            expect(nestedJSON.authenticators[1]).toHaveProperty('updater')
            expect(nestedJSON.authenticators[1].tests[0]).toHaveProperty('updater')
        })
    })

    describe("testing of calling updaters in JSON object", () => {
        it("should return an updated object with correct data", () => {
            let updatedJSON = nestedJSON.updater({ name: 'admin2', newFeature: 'value' })
            expect(updatedJSON).toHaveProperty('name')
            expect(updatedJSON.name).toEqual('admin2')
            expect(updatedJSON).toHaveProperty('newFeature')
            expect(updatedJSON.newFeature).toEqual('value')

            updatedJSON = nestedJSON.audit.updater({ 'created': null })
            expect(updatedJSON.audit).toHaveProperty('created')
            expect(updatedJSON.audit.created).toEqual(null)

            updatedJSON = nestedJSON.authenticators[0].updater({ 'password': 'newpass' })
            expect(updatedJSON.authenticators[0]).toHaveProperty('password')
            expect(updatedJSON.authenticators[0].password).toEqual('newpass')
        })
    })

    describe("testing of calling parent updaters and parameters", () => {
        
    })
}