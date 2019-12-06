package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.test.Group;
import ru.neoflex.meta.test.TestFactory;
import ru.neoflex.meta.test.User;

import java.io.IOException;

public class DatabaseTests extends TestBase {
    @Before
    public void startUp() throws Exception {
        database = refreshRatabase();
    }

    @After
    public void tearDown() {
        database.close();
    }

    @Test
    public void emptyTest() {

    }

    public void createEMFObject() throws IOException {
        String userId;
        String groupId;
        Group group = TestFactory.eINSTANCE.createGroup();
        try (Transaction tx = database.createTransaction("users")) {
            group.setName("masters");
            ResourceSet resourceSet = database.createResourceSet(tx);
            Resource groupResource = resourceSet.createResource(database.createURI(null));
            groupResource.getContents().add(group);
            groupResource.save(null);
            groupId = database.getResourceId(groupResource);
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(database.createURI(null));
            userResource.getContents().add(user);
            userResource.save(null);
            tx.commit("User Orlov and group masters created", "orlov", "");
            userId = database.getResourceId(userResource);
            //Assert.assertNotNull(userId);
        }
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
