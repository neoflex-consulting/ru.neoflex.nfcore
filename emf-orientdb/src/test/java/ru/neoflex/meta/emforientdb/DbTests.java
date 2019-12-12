package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.*;
import ru.neoflex.meta.test.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

public class DbTests extends TestBase {

    @BeforeClass
    public static void startUp() throws Exception {
        server = refreshDatabase();
    }

    @AfterClass
    public static void tearDown() {
        server.close();
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
            user_pk.getColumns().add(user_id);
            user.setPKey(user_pk);
            FKey user_group_fk = TestFactory.eINSTANCE.createFKey();
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
                Assert.assertTrue(e.getMessage().startsWith("OElement"));
            }
        });
//        sleepForever();
    }

    @Test
    public void databaseTest() throws Exception {
        try (Database db = new Database("remote:localhost", DBNAME, "admin", "admin", new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}})) {
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
            db.inTransaction(session -> {
                roleResource.delete(null);
            });
        }
    }
}
