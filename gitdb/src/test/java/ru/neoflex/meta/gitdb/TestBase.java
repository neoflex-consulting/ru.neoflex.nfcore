package ru.neoflex.meta.gitdb;

import org.eclipse.emf.ecore.EPackage;
import org.eclipse.jgit.api.errors.GitAPIException;
import ru.neoflex.meta.test.TestPackage;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class TestBase {
    public static final String GITDB = "gitdbtest";
    EMFJSONDB database;

    public static boolean deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        return directoryToBeDeleted.delete();
    }

    public static EMFJSONDB getDatabase() throws IOException, GitAPIException {
        return new EMFJSONDB(GITDB, new ArrayList<EPackage>(){{add(TestPackage.eINSTANCE);}});
    }

    public static EMFJSONDB refreshRatabase() throws IOException, GitAPIException {
        deleteDirectory(new File(GITDB));
        return getDatabase();
    }
}
