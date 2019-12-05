package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.ecore.EPackage;
import ru.neoflex.meta.test.TestPackage;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class TestBase {
    public static final String GITDB = "test-emf-orientdb";
    Database database;

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }

    public static Database getDatabase() throws IOException {
        return new Database(getDatabaseFile().getAbsolutePath(), new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}});
    }

    public static File getDatabaseFile() throws IOException {
        return new File(System.getProperty("user.home") + "/.orientdb", GITDB);
    }

    public static Database refreshRatabase() throws IOException {
        deleteDirectory(getDatabaseFile());
        return getDatabase();
    }
}
