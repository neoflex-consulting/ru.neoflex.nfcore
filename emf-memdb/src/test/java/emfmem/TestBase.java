package emfmem;

import org.eclipse.emf.ecore.EPackage;
import ru.neoflex.meta.emfmemdb.MemDBServer;
import ru.neoflex.meta.test.TestPackage;

import java.io.File;
import java.util.ArrayList;

public class TestBase {
    public static final String MEMDB = "test-emf-mem";
    MemDBServer MemDBServer;

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }

    public static MemDBServer getDatabase() throws Exception {
        return new MemDBServer(getDatabaseFile().getAbsolutePath(), MEMDB, new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}});
    }

    public static File getDatabaseFile() {
        return new File(System.getProperty("user.home") + "/.memdb", MEMDB);
    }

    public static MemDBServer refreshDatabase() throws Exception {
        deleteDirectory(getDatabaseFile());
        return getDatabase();
    }
}
