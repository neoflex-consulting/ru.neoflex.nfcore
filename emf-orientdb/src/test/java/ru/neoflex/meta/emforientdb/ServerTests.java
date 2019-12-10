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

import java.util.List;
import java.util.stream.Collectors;

public class ServerTests extends TestBase {
    @Before
    public void startUp() throws Exception {
        server = refreshDatabase();
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
    }

    @Test
    public void createEMFObject() throws Exception {
        String userRef = server.inTransaction(session -> {
            String userId;
            String groupId;
            Group group = TestFactory.eINSTANCE.createGroup();
            group.setQName("masters");
            ResourceSet resourceSet = session.createResourceSet();
            Resource groupResource = resourceSet.createResource(server.createURI());
            groupResource.getContents().add(group);
            groupResource.save(null);
            groupId = server.getId(groupResource.getURI());
            User user = TestFactory.eINSTANCE.createUser();
            user.setQName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(server.createURI());
            userResource.getContents().add(user);
            userResource.save(null);
            userId = server.getId(userResource.getURI());
            Assert.assertNotNull(userId);
            Assert.assertNotNull(groupId);
            return userId;
        });
        server.withSession(session -> {
            List<Resource> users = session.query("select * from test_User where qName=?", "Orlov");
            User user = (User) users.get(0).getContents().get(0);
            Assert.assertEquals("Orlov", user.getQName());
            return null;
        });
//        sleepForever();
    }
}
