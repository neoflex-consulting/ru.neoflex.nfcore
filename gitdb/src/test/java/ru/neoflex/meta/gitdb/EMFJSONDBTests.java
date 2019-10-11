package ru.neoflex.meta.gitdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.test.Group;
import ru.neoflex.meta.test.TestFactory;
import ru.neoflex.meta.test.TestPackage;
import ru.neoflex.meta.test.User;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class EMFJSONDBTests {
    public static final String GITDB = "gitdbtest";
    EMFJSONDB database;

    @Before
    public void startUp() throws IOException, GitAPIException {
        deleteDirectory(new File(GITDB));
        database = new EMFJSONDB(GITDB, new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}});
        database.createBranch("users", "master");
    }

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }

    @Test
    public void createEMFObject() throws IOException {
        String userId;
        String groupId;
        Group group = TestFactory.eINSTANCE.createGroup();
        try (Transaction tx = database.createTransaction("users")) {
            group.setName("masters");
            ResourceSet resourceSet = database.createResourceSet(tx);
            Resource groupResource = resourceSet.createResource(database.createURI(null, null));
            groupResource.getContents().add(group);
            groupResource.save(null);
            groupId = database.getId(groupResource.getURI());
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(database.createURI(null, null));
            userResource.getContents().add(user);
            userResource.save(null);
            tx.commit("User Orlov and group masters created", "orlov");
            userId = database.getId(userResource.getURI());
            Assert.assertNotNull(userId);
        }
        try (Transaction tx = database.createTransaction("users")){
            ResourceSet resourceSet = database.createResourceSet(tx);
            Resource userResource = resourceSet.createResource(database.createURI(userId, null));
            userResource.load(null);
            User user = (User) userResource.getContents().get(0);
            user.setName("Simanihin");
            userResource.save(null);
            tx.commit("User Orlov was renamed to Simanihin", "orlov");
        }
        try (Transaction tx = database.createTransaction("users")){
            ResourceSet resourceSet = database.createResourceSet(tx);
            Resource groupResource = resourceSet.createResource(database.createURI(groupId, null));
            groupResource.load(null);
            try {
                groupResource.delete(null);
                Assert.assertTrue(false);
            }
            catch (IOException e) {
                Assert.assertTrue(e.getMessage().startsWith("Object "));
            }
        }
        try (Transaction tx = database.createTransaction("users")){
            ResourceSet resourceSet = database.createResourceSet(tx);
            Resource userResource = resourceSet.createResource(database.createURI(userId, null));
            ResourceSet dependent = database.getDependentResources(groupId, tx);
            Assert.assertEquals(1, dependent.getResources().size());
            userResource.load(null);
            userResource.delete(null);
            tx.commit("User Simanihin was deleted", "orlov");
            dependent = database.getDependentResources(groupId, tx);
            Assert.assertEquals(0, dependent.getResources().size());
        }
    }
}
