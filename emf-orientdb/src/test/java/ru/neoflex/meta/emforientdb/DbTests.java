package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.test.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

public class DbTests extends TestBase {

    @Before
    public void startUp() throws Exception {
        server = refreshDatabase();
    }

    @After
    public void tearDown() {
        server.close();
    }

    @Test
    public void dbTest() throws Exception {
        server.inTransaction(session -> {
            DBTable group = TestFactory.eINSTANCE.createDBTable();
            group.setName("GROUP");
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
            DBTable user = TestFactory.eINSTANCE.createDBTable();
            user.setName("USER");
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
            user_group_fk.setTable(group);
            user.getFKeys().add(user_group_fk);
            DBView user_group = TestFactory.eINSTANCE.createDBView();
            user_group.setName("USER_GROUP");
            user_group.getColumns().add(user_id);
            user_group.getColumns().add(user_name);
            user_group.getColumns().add(group_id);
            user_group.getColumns().add(group_name);
            ResourceSet rs = session.createResourceSet();
            Resource group_res = rs.createResource(server.createURI());
            group_res.getContents().add(group);
            group_res.save(null);
            Resource user_res = rs.createResource(server.createURI());
            user_res.getContents().add(user);
            user_res.save(null);
            Resource user_group_res = rs.createResource(server.createURI());
            user_group_res.getContents().add(user_group);
            user_group_res.save(null);
            return null;
        });
        server.withSession(session -> {
            List<Resource> views = session.query("select from test_DBView");
            DBView user_group = (DBView) views.get(0).getContents().get(0);
            Assert.assertEquals("ID", user_group.getColumns().get(0).getName());
            Assert.assertEquals(4, user_group.getColumns().size());
            return null;
        });
        //sleepForever();
    }
}
