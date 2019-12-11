package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EPackage;
import ru.neoflex.meta.test.TestPackage;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class TestBase {
    public static final String DBNAME = "test-emf-orientdb";
    public static Server server;

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }

    public static Server getDatabase() throws Exception {
        return new Server(getHomeFile().getAbsolutePath(), DBNAME, new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}});
    }

    public static File getHomeFile() throws IOException {
        return new File(System.getProperty("user.home"), ".orientdb/home");
    }

    public static Server refreshDatabase() throws Exception {
        deleteDirectory(new File(getHomeFile(), "databases"));
        return getDatabase();
    }

    public static void sleepForever() {
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
        }
    }
}
