package ru.neoflex.meta.emforientdb;

import com.orientechnologies.common.util.OCallable;
import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.db.tool.ODatabaseExport;
import com.orientechnologies.orient.core.db.tool.ODatabaseImport;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.config.*;
import com.orientechnologies.orient.server.network.OServerNetworkListener;
import com.orientechnologies.orient.server.network.protocol.http.ONetworkProtocolHttpAbstract;
import com.orientechnologies.orient.server.network.protocol.http.command.get.OServerCommandGetStaticContent;
import org.eclipse.emf.ecore.EPackage;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class Server extends SessionFactory implements Closeable {
    private String home;
    private OServer oServer;
    private OServerConfiguration configuration;

    public Server(String home, String dbName, List<EPackage> packages) throws Exception {
        super(dbName, packages);
        this.home = home;
        System.setProperty("ORIENTDB_HOME", home);
        String dbPath = new File(home, "databases").getAbsolutePath();
        this.oServer = OServerMain.create(false);
        this.configuration = createDefaultServerConfiguration(dbPath);
    }

    public Server open() throws InvocationTargetException, NoSuchMethodException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException {
        getOServer().startup(configuration);
        getOServer().activate();
        registerWwwAsStudio();
        if (!getOServer().existsDatabase(getDbName())) {
            getOServer().createDatabase(getDbName(), ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        }
        createSchema();
        return this;
    }

    public void registerWwwAsStudio() {
        OCallable oCallable = new OCallable<Object, String>() {
            @Override
            public Object call(final String iArgument) {
                String fileName = "www/" + iArgument;
                ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
                final URL url = classLoader.getResource(fileName);

                if (url != null) {
                    final OServerCommandGetStaticContent.OStaticContent content = new OServerCommandGetStaticContent.OStaticContent();
                    content.is = new BufferedInputStream(classLoader.getResourceAsStream(fileName));
                    content.contentSize = -1;
                    content.type = OServerCommandGetStaticContent.getContentType(url.getFile());
                    return content;
                }
                return null;
            }
        };
        final OServerNetworkListener httpListener = getOServer().getListenerByProtocol(ONetworkProtocolHttpAbstract.class);
        if (httpListener != null) {
            final OServerCommandGetStaticContent command = (OServerCommandGetStaticContent) httpListener
                    .getCommand(OServerCommandGetStaticContent.class);
            command.registerVirtualFolder("studio", oCallable);
        }
    }

    public OServerConfiguration createDefaultServerConfiguration(String dbPath) {
        OServerConfiguration configuration = new OServerConfiguration();
        configuration.network = new OServerNetworkConfiguration();
        configuration.network.protocols = new ArrayList<OServerNetworkProtocolConfiguration>() {{
            add(new OServerNetworkProtocolConfiguration("binary",
                    "com.orientechnologies.orient.server.network.protocol.binary.ONetworkProtocolBinary"));
            add(new OServerNetworkProtocolConfiguration("http",
                    "com.orientechnologies.orient.server.network.protocol.http.ONetworkProtocolHttpDb"));
        }};
        configuration.network.listeners = new ArrayList<OServerNetworkListenerConfiguration>() {{
            add(new OServerNetworkListenerConfiguration() {{
                protocol = "binary";
                ipAddress = "0.0.0.0";
                portRange = "2424-2430";
            }});
            add(new OServerNetworkListenerConfiguration() {{
                protocol = "http";
                ipAddress = "0.0.0.0";
                portRange = "2480-2490";
                commands = new OServerCommandConfiguration[] {new OServerCommandConfiguration() {{
                    implementation = "com.orientechnologies.orient.server.network.protocol.http.command.get.OServerCommandGetStaticContent";
                    pattern = "GET|www GET|studio/ GET| GET|*.htm GET|*.html GET|*.xml GET|*.jpeg GET|*.jpg GET|*.png GET|*.gif GET|*.js GET|*.css GET|*.swf GET|*.ico GET|*.txt GET|*.otf GET|*.pjs GET|*.svg";
                    parameters = new OServerEntryConfiguration[] {
                            new OServerEntryConfiguration("http.cache:*.htm *.html", "Cache-Control: no-cache, no-store, max-age=0, must-revalidate\r\nPragma: no-cache"),
                            new OServerEntryConfiguration("http.cache:default", "Cache-Control: max-age=120"),
                    };
                }}};
                parameters = new OServerParameterConfiguration[] {
                        new OServerParameterConfiguration("network.http.charset","UTF-8"),
                        new OServerParameterConfiguration("network.http.jsonResponseError","true")
                };
            }});
        }};
        configuration.users = new OServerUserConfiguration[] {
                new OServerUserConfiguration("root", "ne0f1ex", "*"),
                new OServerUserConfiguration("admin", "admin", "*"),
        };
        configuration.properties = new OServerEntryConfiguration[] {
//                new OServerEntryConfiguration("orientdb.www.path", "www"),
//                new OServerEntryConfiguration("orientdb.config.file", "C:/work/dev/orientechnologies/orientdb/releases/1.0rc1-SNAPSHOT/config/orientdb-server-config.xml"),
                new OServerEntryConfiguration("server.cache.staticResources", "false"),
                new OServerEntryConfiguration("log.console.level", "info"),
                new OServerEntryConfiguration("log.console.level", "info"),
                new OServerEntryConfiguration("log.file.level", "fine"),
                new OServerEntryConfiguration("server.database.path", dbPath),
                new OServerEntryConfiguration("plugin.dynamic", "true"),
        };
        return configuration;
    }

    @Override
    public void close() {
        getOServer().shutdown();
    }

    @Override
    public ODatabaseDocument createDatabaseDocument() {
        return getOServer().openDatabase(getDbName());
    }

    public OServerConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(OServerConfiguration configuration) {
        this.configuration = configuration;
    }

    public File exportDatabase(File file) throws IOException {
        file.getParentFile().mkdirs();
        try (OutputStream os = new FileOutputStream(file)) {
            exportDatabase(os);
        }
        return file;
    }

    public File backupDatabase() throws IOException {
        File backup = new File(home, "backups/" + getDbName() + "_" + new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".zip");
        return backupDatabase(backup);
    }

    public File backupDatabase(File file) throws IOException {
        file.getParentFile().mkdirs();
        try (OutputStream os = new FileOutputStream(file)) {
            backupDatabase(os, new HashMap<>());
        }
        return file;
    }

    public void backupDatabase(OutputStream os, Map<String, Object> options) throws IOException {
        try (ODatabaseDocumentInternal db = getOServer().openDatabase(getDbName())) {
            db.backup(os, options, null, System.out::print, 9, 4096);
        }
    }

    public void restoreDatabase(File file) throws IOException {
        try (InputStream is = new FileInputStream(file)) {
            restoreDatabase(is, new HashMap<>());
        }
    }

    public void restoreDatabase(InputStream is, Map<String, Object> options) throws IOException {
        try (ODatabaseDocumentInternal db = getOServer().openDatabase(getDbName())) {
            db.restore(is, options, null, System.out::print);
        }
    }

    public void exportDatabase(OutputStream os) throws IOException {
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(os)) {
            try (ODatabaseDocumentInternal db = getOServer().openDatabase(getDbName())) {
                ODatabaseExport export = new ODatabaseExport(db, gzipOutputStream, System.out::print);
                try {
                    export.run();
                }
                finally {
                    export.close();
                }
            }
        }
    }

    public void importDatabase(File file, String options) throws IOException {
        try (InputStream is = new FileInputStream(file)) {
            importDatabase(is, options);
        }
    }

    public void importDatabase(InputStream is, String options) throws IOException {
        try(GZIPInputStream gzipInputStream = new GZIPInputStream(is)) {
            try (ODatabaseDocumentInternal db = getOServer().openDatabase(getDbName())) {
                ODatabaseImport import_ = new ODatabaseImport(db, gzipInputStream, System.out::print);
                try {
                    import_.setOptions(options);
                    import_.run();
                }
                finally {
                    import_.close();
                }
            }
        }
    }

    public void vacuum() throws IOException {
        File export = exportDatabase();
        importDatabase(export, "-preserveClusterIDs=true");
    }

    public File exportDatabase() throws IOException {
        File export = new File(home, "exports/" + getDbName() + "_" + new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".json.gz");
        return exportDatabase(export);
    }

    public static void main(String[] args) {
        String home = System.getProperty("orientdb.home", new File(System.getProperty("user.home"), ".orientdb/home").getAbsolutePath());
        String dbName = System.getProperty("orientdb.dbname", "models");
        try {
            try (Server orientdb = new Server(home, dbName, new ArrayList<>()).open()) {
                orientdb.getOServer().waitForShutdown();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getHome() {
        return home;
    }

    public OServer getOServer() {
        return oServer;
    }
}
