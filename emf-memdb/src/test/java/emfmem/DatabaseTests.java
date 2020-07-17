package emfmem;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.emfmemdb.MemDBServer;
import ru.neoflex.meta.test.Group;
import ru.neoflex.meta.test.TestFactory;
import ru.neoflex.meta.test.User;

import java.io.IOException;

public class DatabaseTests extends TestBase {
    @Before
    public void startUp() throws Exception {
        MemDBServer = getDatabase();
    }

    @After
    public void shutDown() throws IOException {
        MemDBServer.close();
    }

    @Test
    public void createEMFObject() throws Exception {
        Group group = TestFactory.eINSTANCE.createGroup();
        String[] ids = MemDBServer.inTransaction(false, (MemDBServer.TxFunction<String[]>) tx -> {
            group.setName("masters");
            ResourceSet resourceSet = tx.createResourceSet();
            Resource groupResource = resourceSet.createResource(MemDBServer.createURI(""));
            groupResource.getContents().add(group);
            groupResource.save(null);
            String groupId = MemDBServer.getId(groupResource.getURI());
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(MemDBServer.createURI(""));
            userResource.getContents().add(user);
            userResource.save(null);
            String userId = MemDBServer.getId(userResource.getURI());
            Assert.assertNotNull(userId);
            return new String[] {userId, groupId};
        });
        MemDBServer.inTransaction(false, (MemDBServer.TxFunction<Void>) tx -> {
            ResourceSet resourceSet = tx.createResourceSet();
            Resource userResource = resourceSet.createResource(MemDBServer.createURI(ids[0]));
            userResource.load(null);
            User user = (User) userResource.getContents().get(0);
            user.setName("Simanihin");
            userResource.save(null);
            return null;
        });
        MemDBServer.inTransaction(true, (MemDBServer.TxFunction<Void>) tx -> {
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            ResourceSet resourceSet = tx.createResourceSet();
            Resource userResource = resourceSet.createResource(MemDBServer.createURI(""));
            userResource.getContents().add(user);
            userResource.save(null);
            return null;
        });
//        memBDServer.inTransaction(true, (MemBDServer.TxFunction<Void>) tx -> {
//            return null;
//        });
//        memBDServer.inTransaction(true, (MemBDServer.TxFunction<Void>) tx -> {
//            return null;
//        });
    }
}
