package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EPackage;
import ru.neoflex.meta.test.TestPackage;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    public static Server getDatabase(List<EPackage> ePackageList) throws Exception {
        if (ePackageList == null) {
            ePackageList = new ArrayList<EPackage>(){{
                add(TestPackage.eINSTANCE);
            }};
        }
        return new Server(getHomeFile().getAbsolutePath(), DBNAME, ePackageList).open();
    }

    public static File getHomeFile() throws IOException {
        return new File(System.getProperty("user.home"), ".orientdb");
    }

    public static Server refreshDatabase(List<EPackage> ePackageList) throws Exception {
        deleteDirectory(new File(getHomeFile(), "databases/" + DBNAME));
        return getDatabase(ePackageList);
    }

    public static void sleepForever() {
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
        }
    }
}
