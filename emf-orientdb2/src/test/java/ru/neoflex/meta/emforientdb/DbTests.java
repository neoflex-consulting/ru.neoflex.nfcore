package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import ru.neoflex.meta.test.*;

import java.util.Collections;
import java.util.List;

public class DbTests extends TestBase {

    @BeforeClass
    public static void startUp() throws Exception {
        server = refreshDatabase(null);
    }

    @AfterClass
    public static void tearDown() {
        server.close();
    }

    @Test
    public void testMetaView() throws Exception {
        DBTable aObject = server.inTransaction(session -> {
            ResourceSet rs = session.createResourceSet();
            DBTable testTable = TestFactory.eINSTANCE.createDBTable();
            testTable.setQName("TEST_TABLE");
            Resource testRes = rs.createResource(server.createURI());
            testRes.getContents().add(testTable);
            testRes.save(null);
            MetaView metaView = TestFactory.eINSTANCE.createMetaView();
            metaView.setQName("My Meta View");
            metaView.setAPackage(TestPackage.eINSTANCE);
            metaView.setAClass(EcorePackage.eINSTANCE.getEAnnotation());
            metaView.setAObject(testTable);
            Resource metaRes = rs.createResource(server.createURI());
            metaRes.getContents().add(metaView);
            metaRes.save(null);
            return testTable;
        });
        MetaView metaView = server.inTransaction(session -> {
            Resource metaViewRes = session.query("select from test_MetaView where qName=?", "My Meta View").get(0);
            EcoreUtil.resolveAll(metaViewRes);
            return (MetaView) metaViewRes.getContents().get(0);
        });
        Assert.assertEquals(EcorePackage.eINSTANCE.getEAnnotation(), metaView.getAClass());
        Assert.assertEquals(TestPackage.eINSTANCE, metaView.getAPackage());
        Assert.assertEquals(aObject.getQName(), ((DBTable) metaView.getAObject()).getQName());
        server.inTransaction(session -> {
            metaView.setAClass(EcorePackage.eINSTANCE.getEOperation());
            ResourceSet rs = session.createResourceSet();
            Resource resource = rs.createResource(metaView.eResource().getURI());
            resource.getContents().add(metaView);
            resource.save(null);
        });
        Resource metaViewRes2 = server.inTransaction(session -> {
            return session.query("select from test_MetaView where qName=?", "My Meta View").get(0);
        });
        MetaView metaView2 = (MetaView) metaViewRes2.getContents().get(0);
        Assert.assertEquals(EcorePackage.eINSTANCE.getEOperation(), metaView2.getAClass());
//        sleepForever();
    }

    @Test
    public void dbTest() throws Exception {
        server.inTransaction(session -> {
            ResourceSet rs = session.createResourceSet();

            DBTable group = TestFactory.eINSTANCE.createDBTable();
            group.setQName("GROUP");
            Column group_id = TestFactory.eINSTANCE.createColumn();
            group_id.setName("ID");
            group_id.setDbType("INTEGER");
            group.getColumns().add(group_id);
            Column group_name = TestFactory.eINSTANCE.createColumn();
            group_name.setName("NAME");
            group_name.setDbType("STRING");
            group.getColumns().add(group_name);
            PKey group_pk = TestFactory.eINSTANCE.createPKey();
            group_pk.setName("group_pk");
            group_pk.getColumns().add(group_id);
            group.setPKey(group_pk);
            Resource group_res = rs.createResource(server.createURI());
            group_res.getContents().add(group);
            group_res.save(null);

            DBTable user = TestFactory.eINSTANCE.createDBTable();
            user.setQName("USER");
            Column user_id = TestFactory.eINSTANCE.createColumn();
            user_id.setName("ID");
            user_id.setDbType("INTEGER");
            user.getColumns().add(user_id);
            Column user_name = TestFactory.eINSTANCE.createColumn();
            user_name.setName("NAME");
            user_name.setDbType("STRING");
            user.getColumns().add(user_name);
            Column user_group_id = TestFactory.eINSTANCE.createColumn();
            user_group_id.setName("GROUP_ID");
            user_group_id.setDbType("INTEGER");
            user.getColumns().add(user_group_id);
            PKey user_pk = TestFactory.eINSTANCE.createPKey();
            user_pk.setName("user_pk");
            user_pk.getColumns().add(user_id);
            user.setPKey(user_pk);
            FKey user_group_fk = TestFactory.eINSTANCE.createFKey();
            user_group_fk.setName("user_group_fk");
            user_group_fk.getColumns().add(user_group_id);
            user_group_fk.setEntity(group);
            user.getFKeys().add(user_group_fk);
            Resource user_res = rs.createResource(server.createURI());
            user_res.getContents().add(user);
            user_res.save(null);

            DBView user_group = TestFactory.eINSTANCE.createDBView();
            user_group.setQName("USER_GROUP");
            user_group.getColumns().add(user_id);
            user_group.getColumns().add(user_name);
            user_group.getColumns().add(group_id);
            user_group.getColumns().add(group_name);
            Resource user_group_res = rs.createResource(server.createURI());
            user_group_res.getContents().add(user_group);
            user_group_res.save(null);
        });
        server.withSession(session -> {
            List<Resource> users = session.query("select from test_DBTable where qName=?", "USER");
            Assert.assertEquals(1, users.size());
            DBTable user = (DBTable) users.get(0).getContents().get(0);
            Assert.assertEquals("GROUP_ID", user.getFKeys().get(0).getColumns().get(0).getName());
            Assert.assertEquals("ID", user.getPKey().getColumns().get(0).getName());
        });
        server.withSession(session -> {
            List<Resource> views = session.query("select from test_DBView");
            DBView user_group = (DBView) views.get(0).getContents().get(0);
            Assert.assertEquals("ID", user_group.getColumns().get(0).getName());
            Assert.assertEquals("NAME", user_group.getColumns().get(1).getName());
            Assert.assertEquals(4, user_group.getColumns().size());
            Resource table_User = session.query("select from test_DBTable where qName=?", "USER").get(0);
            try {
                table_User.delete(null);
                Assert.fail("Can't delete referenced Resource");
            }
            catch (IllegalArgumentException e) {
                Assert.assertTrue(e.getMessage().startsWith("Can't delete"));
            }
        });
        DBView extView = server.inTransaction(session -> {
            List<Resource> users = session.query("select from test_DBTable where qName=?", "USER");
            DBTable user = (DBTable) users.get(0).getContents().get(0);
            Column group_id = user.getColumns().stream().filter(column -> column.getName().equals("GROUP_ID")).findFirst().get();
            List<Resource> views = session.query("select from test_DBView");
            DBView user_group = (DBView) views.get(0).getContents().get(0);
            user_group.getColumns().add(0, group_id);
            user_group.eResource().save(null);
            return user_group;
        });
        server.withSession(session -> {
            List<Resource> views = session.query("select from test_DBView");
            DBView user_group = (DBView) views.get(0).getContents().get(0);
            Assert.assertEquals("GROUP_ID", user_group.getColumns().get(0).getName());
            Assert.assertEquals("ID", user_group.getColumns().get(1).getName());
            Assert.assertEquals(5, user_group.getColumns().size());
        });
        server.inTransaction(session -> {
            List<Resource> users = session.query("select from test_DBTable where qName=?", "USER");
            Resource userRes = users.get(0);
            List<Resource> refs = session.getDependentResources(userRes);
            Assert.assertEquals(1, refs.size());
        });
//        sleepForever();
    }

    //@Test
    public void testImportExport() throws Exception {
        server.vacuum();
    }

    @Test
    public void databaseTest() throws Exception {
        try (Database db = new Database("remote:localhost", DBNAME, "root", "ne0f1ex", Collections.singletonList(TestPackage.eINSTANCE))) {
            Resource roleResource = db.inTransaction(session -> {
                ResourceSet rs = session.createResourceSet();
                DBTable role = TestFactory.eINSTANCE.createDBTable();
                role.setQName("ROLE");
                Column role_id = TestFactory.eINSTANCE.createColumn();
                role_id.setName("ID");
                role_id.setDbType("INTEGER");
                role.getColumns().add(role_id);
                PKey role_pk = TestFactory.eINSTANCE.createPKey();
                role_pk.getColumns().add(role_id);
                role.setPKey(role_pk);
                Resource resource = rs.createResource(db.createURI());
                resource.getContents().add(role);
                resource.save(null);
                return resource;
            });
            db.withSession(session -> {
                Assert.assertEquals(1, session.query("select from test_DBTable where qName=?", "ROLE").size());
            });
            db.inTransaction(session -> {
                roleResource.delete(null);
            });
            db.withSession(session -> {
                Assert.assertEquals(0, session.query("select from test_DBTable where qName=?", "ROLE").size());
            });
        }
    }
}
