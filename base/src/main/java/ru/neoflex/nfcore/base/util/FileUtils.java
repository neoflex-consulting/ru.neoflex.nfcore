package ru.neoflex.nfcore.base.util;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.concurrent.Callable;

public class FileUtils {

    public static File getWorkspaceRootDir() {
        return new File(System.getProperty("workspace.root", System.getProperty("user.dir") + "/workspace"));
    }

    public static URL getWorkspaceRootURL() throws MalformedURLException {
        return getWorkspaceRootDir().toURI().toURL();
    }

    public static ClassLoader getClassLoader(ClassLoader parent) throws MalformedURLException {
        return new URLClassLoader(new URL[] {getWorkspaceRootURL()}, parent);
    }


    static public<R> R withClassLoader(Callable<R> f) throws Exception {
        ClassLoader parent = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(getClassLoader(parent));
        try {
            return f.call();
        }
        finally {
            Thread.currentThread().setContextClassLoader(parent);
        }
    }
}
