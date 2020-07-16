package emfmem;

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
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

public class PerfTests extends TestBase {
    int nGroups = 50;
    int nUsers = 100;
    int nThreads = 100;
    int nUpdates = 3000;
    List<String> groupIds = new ArrayList<>();
    List<String> userIds = new ArrayList<>();

    @Before
    public void startUp() throws Exception {
        MemDBServer = refreshDatabase();
    }

    @After
    public void shutDown() throws IOException {
        MemDBServer.close();
    }

    @Test
    public void fullTest() throws Exception {
        long start = System.currentTimeMillis();
        for (int i = 0; i < nGroups; ++i) {
            int index = i;
            MemDBServer.inTransaction(false, tx -> {
                Group group = TestFactory.eINSTANCE.createGroup();
                String name = "group_" + index;
                group.setName(name);
                ResourceSet resourceSet = tx.createResourceSet();
                Resource groupResource = resourceSet.createResource(MemDBServer.createURI(""));
                groupResource.getContents().add(group);
                groupResource.save(null);
                String groupId = MemDBServer.getId(groupResource.getURI());
                groupIds.add(groupId);
                return null;
            });
        }
        long created1 = System.currentTimeMillis();
        for (int i = 0; i < nUsers; ++i) {
            int index = i;
            MemDBServer.inTransaction(false, tx -> {
                Random rand = new Random();
                String groupId = groupIds.get(rand.nextInt(groupIds.size()));
                ResourceSet resourceSet = tx.createResourceSet();
                Resource groupResource = resourceSet.createResource(MemDBServer.createURI(groupId));
                groupResource.load(null);
                Group group = (Group) groupResource.getContents().get(0);
                User user = TestFactory.eINSTANCE.createUser();
                String name = "User_" + index;
                user.setName(name);
                user.setGroup(group);
                Resource userResource = resourceSet.createResource(MemDBServer.createURI(""));
                userResource.getContents().add(user);
                userResource.save(null);
                String userId = MemDBServer.getId(userResource.getURI());
                userIds.add(userId);
                return null;
            });
        }
        long created2 = System.currentTimeMillis();
        List<Thread> threads = new ArrayList<>();
        AtomicInteger eCount = new AtomicInteger(0);
        for (int i = 0; i < nThreads; ++i) {
            final int index = i;
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    Random rand = new Random();
                    for (int j = 0; j < nUpdates; ++j) {
                        String name = "User_" + index + "_" + j;
                        String groupId = groupIds.get(rand.nextInt(groupIds.size()));
                        String userId = userIds.get(rand.nextInt(userIds.size()));
                        try {
                            MemDBServer.inTransaction(false, tx -> {
                                ResourceSet resourceSet = tx.createResourceSet();
                                Resource groupResource = resourceSet.createResource(MemDBServer.createURI(groupId));
                                groupResource.load(null);
                                Group group = (Group) groupResource.getContents().get(0);
                                Resource userResource = resourceSet.createResource(MemDBServer.createURI(userId));
                                userResource.load(null);
                                User user = (User) userResource.getContents().get(0);
                                user.setName(name);
                                user.setGroup(group);
                                userResource.save(null);
                                return null;
                            });
                        } catch (Throwable e) {
                            System.out.println(e.getMessage());
                            eCount.incrementAndGet();
                        }
                    }
                }
            });
            thread.start();
            threads.add(thread);
        }
        for (Thread thread: threads) {
            thread.join();
        }
        long finish = System.currentTimeMillis();
        System.out.println("Created " + nGroups + " groups in " + (created1 - start)/1000 + " sec");
        System.out.println("Created " + nUsers + " users  in " + (created2 - created1)/1000 + " sec");
        System.out.println("Updated " + (nUpdates*nThreads) + " users in " + nThreads + " threads in " + (finish - created2)/1000 + " sec");
        System.out.println("Errors found: " + eCount.get());
        Assert.assertEquals(0, eCount.get());
    }
}
