package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.tx.OTransaction;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.test.Group;
import ru.neoflex.meta.test.TestFactory;
import ru.neoflex.meta.test.User;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class ServerTests extends TestBase {
    @Before
    public void startUp() throws Exception {
        server = refreshRatabase();
    }

    @After
    public void tearDown() {
        server.close();
    }

    @Test
    public void emptyTest() {
        ODatabaseDocument db = server.createDatabaseDocument();
        OClass ecore_EObject = db.createClassIfNotExist("ecore_EObject");
        ecore_EObject.setAbstract(true);
        OClass etl_project = db.createClassIfNotExist("etl_Project");
        etl_project.addSuperClass(ecore_EObject);
        etl_project.createProperty("name", OType.STRING);
        etl_project.createIndex("etl_Project_name", OClass.INDEX_TYPE.UNIQUE, "name");
        OClass etl_task = db.createClassIfNotExist("etl_Task");
        etl_task.addSuperClass(ecore_EObject);
        etl_task.createProperty("name", OType.STRING);
        etl_task.createProperty("project", OType.LINK, etl_project);
        etl_task.createIndex("etl_Task_project_name", OClass.INDEX_TYPE.UNIQUE, "project", "name");
        db.begin(OTransaction.TXTYPE.OPTIMISTIC);
        OElement oProject = db.newInstance("etl_Project");
        oProject.setProperty("name", "My Project #1");
        oProject.save();
        OElement oTask1 = db.newInstance("etl_Task");
        oTask1.setProperty("name", "Task #1");
        oTask1.setProperty("project", oProject);
        oTask1.save();
        OElement oTask2 = db.newInstance("etl_Task");
        oTask2.setProperty("name", "Task #2");
        oTask2.setProperty("project", oProject);
        oTask2.save();
        db.commit();
        OResultSet rs = db.query("select * from etl_Task");
        List<OElement> elements = rs.elementStream().collect(Collectors.toList());
        Assert.assertEquals(2, elements.size());
        rs.close();
        db.close();
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
        }
    }

    @Test
    public void createEMFObject() throws Exception {
        String userRef = server.inTransaction(false, session -> {
            String userId;
            String groupId;
            Group group = TestFactory.eINSTANCE.createGroup();
            group.setName("masters");
            ResourceSet resourceSet = session.createResourceSet();
            Resource groupResource = resourceSet.createResource(server.createURI(""));
            groupResource.getContents().add(group);
            groupResource.save(null);
            groupId = server.getId(groupResource.getURI());
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(server.createURI(""));
            userResource.getContents().add(user);
            userResource.save(null);
            userId = server.getId(userResource.getURI());
            Assert.assertNotNull(userId);
            Assert.assertNotNull(groupId);
            return userId;
        });
        server.inTransaction(false, session -> {
            List<Resource> users = session.query("select * from test_User where name=?", "Orlov");
            User user = (User) users.get(0).getContents().get(0);
            Assert.assertEquals("Orlov", user.getName());
            return null;
        });
//        try {
//            Thread.sleep(Long.MAX_VALUE);
//        } catch (InterruptedException e) {
//        }
//        try (Transaction tx = database.createTransaction("users")){
//            ResourceSet resourceSet = database.createResourceSet(tx);
//            Resource userResource = resourceSet.createResource(database.createURI(userId));
//            userResource.load(null);
//            User user = (User) userResource.getContents().get(0);
//            user.setName("Simanihin");
//            userResource.save(null);
//            tx.commit("User Orlov was renamed to Simanihin", "orlov", "");
//        }
//        try (Transaction tx = database.createTransaction("users")) {
//            User user = TestFactory.eINSTANCE.createUser();
//            user.setName("Orlov");
//            user.setGroup(group);
//            Resource userResource = database.createResource(tx, null);
//            userResource.getContents().add(user);
//            userResource.save(null);
//            tx.commit("User Orlov created", "orlov", "");
//        }
//        try (Transaction tx = database.createTransaction("users")) {
//            User user = TestFactory.eINSTANCE.createUser();
//            user.setName("Orlov");
//            user.setGroup(group);
//            Resource userResource = database.createResource(tx, null);
//            userResource.getContents().add(user);
//            try {
//                userResource.save(null);
//                tx.commit("User Orlov created", "orlov", "");
//                //Assert.assertTrue(false);
//            }
//            catch (IllegalArgumentException e) {
//                //Assert.assertTrue(e.getMessage().startsWith("Duplicate"));
//            }
//        }
//        try (Transaction tx = database.createTransaction("users")){
//            ResourceSet resourceSet = database.createResourceSet(tx);
//            Resource groupResource = resourceSet.createResource(database.createURI(groupId));
//            groupResource.load(null);
//            try {
//                groupResource.delete(null);
//                //Assert.assertTrue(false);
//            }
//            catch (IOException e) {
//                //Assert.assertTrue(e.getMessage().startsWith("Object "));
//            }
//        }
//        try (Transaction tx = database.createTransaction("users")){
//            List<Resource> dependent = database.getDependentResources(groupId, tx);
////            Assert.assertEquals(2, dependent.size());
////            Assert.assertEquals(3, tx.all().size());
////            Assert.assertEquals(1, database.findByEClass(group.eClass(), null, tx).getResources().size());
////            Assert.assertEquals(1, database.findByEClass(group.eClass(), "masters", tx).getResources().size());
////            Assert.assertEquals(0, database.findByEClass(group.eClass(), "UNKNOWN", tx).getResources().size());
//            Resource userResource = database.loadResource(userId, tx);
//            userResource.delete(null);
//            tx.commit("User Simanihin was deleted");
//        }
//        try (Transaction tx = database.createTransaction("users")){
//            List<Resource> dependent = database.getDependentResources(groupId, tx);
////            Assert.assertEquals(1, dependent.size());
//        }
    }
}
