package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.emfjson.jackson.utils.ValueWriter;
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
import java.util.List;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

public class EMFJSONDBTests {
    public static final String GITDB = "gitdbtest";
    EMFJSONDB database;
    ObjectMapper mapper = new ObjectMapper();

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
        try (Transaction tx = database.createTransaction("users")) {
            Group group = TestFactory.eINSTANCE.createGroup();
            group.setName("masters");
            ResourceSet resourceSet = database.getResourceSet(tx);
            Resource groupResource = resourceSet.createResource(URI.createURI("http://").appendSegment(""));
            groupResource.getContents().add(group);
            groupResource.save(null);
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(URI.createURI("http://").appendSegment(""));
            userResource.getContents().add(user);
            userResource.save(null);
            tx.commit("User Orlov and group masters created", "orlov");
            String userId = userResource.getURI().segment(0);
            Assert.assertNotNull(userId);
        }
    }
}
