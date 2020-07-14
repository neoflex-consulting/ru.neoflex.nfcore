package emfmem;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import ru.neoflex.meta.emfmemdb.MemBDServer;
import ru.neoflex.meta.test.Group;
import ru.neoflex.meta.test.TestFactory;
import ru.neoflex.meta.test.User;

import java.io.IOException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DatabaseTests extends TestBase {
    @Before
    public void startUp() throws Exception {
        memBDServer = getDatabase();
    }

    @After
    public void shutDown() throws IOException {
        memBDServer.close();
    }

    @Test
    public void createEMFObject() throws Exception {
        Group group = TestFactory.eINSTANCE.createGroup();
        String[] ids = memBDServer.inTransaction(false, (MemBDServer.TxFunction<String[]>) tx -> {
            group.setName("masters");
            ResourceSet resourceSet = tx.createResourceSet();
            Resource groupResource = resourceSet.createResource(memBDServer.createResourceURI(Stream.empty()));
            groupResource.getContents().add(group);
            groupResource.save(null);
            String groupId = MemBDServer.getIds(groupResource.getURI()).collect(Collectors.joining(","));
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            Resource userResource = resourceSet.createResource(memBDServer.createResourceURI(Stream.empty()));
            userResource.getContents().add(user);
            userResource.save(null);
            String userId = MemBDServer.getIds(userResource.getURI()).collect(Collectors.joining(","));;
            Assert.assertNotNull(userId);
            return new String[] {userId, groupId};
        });
        memBDServer.inTransaction(false, (MemBDServer.TxFunction<Void>) tx -> {
            ResourceSet resourceSet = tx.createResourceSet();
            Resource userResource = resourceSet.createResource(memBDServer.createResourceURI(Stream.of(tx.get(ids[0]))));
            userResource.load(null);
            User user = (User) userResource.getContents().get(0);
            user.setName("Simanihin");
            userResource.save(null);
            return null;
        });
        memBDServer.inTransaction(true, (MemBDServer.TxFunction<Void>) tx -> {
            User user = TestFactory.eINSTANCE.createUser();
            user.setName("Orlov");
            user.setGroup(group);
            ResourceSet resourceSet = tx.createResourceSet();
            Resource userResource = resourceSet.createResource(memBDServer.createResourceURI(Stream.empty()));
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
