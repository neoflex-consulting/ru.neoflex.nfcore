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
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class Server extends SessionFactory implements Closeable {
    public static final String ORIENTDB_STUDIO_JAR = "orientdb-studio-3.0.26.jar";
    OServer server;
    private OServerConfiguration configuration;

    public Server(String home, String dbName, List<EPackage> packages) throws Exception {
        super(dbName, packages);
        System.setProperty("ORIENTDB_HOME", home);
        //installStudioJar(home);
        String dbPath = new File(home, "databases").getAbsolutePath();
        this.server = OServerMain.create(false);
        this.configuration = createDefaultServerConfiguration(dbPath);
    }

    public Server open() throws InvocationTargetException, NoSuchMethodException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException {
        server.startup(configuration);
        server.activate();
        registerWwwAsStudio();
        if (!server.existsDatabase(dbName)) {
            server.createDatabase(dbName, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
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
        final OServerNetworkListener httpListener = server.getListenerByProtocol(ONetworkProtocolHttpAbstract.class);
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

    public void installStudioJar(String home) throws IOException {
        File pluginDir = new File(home, "plugins");
        pluginDir.mkdirs();
        File studioJar = new File(pluginDir, ORIENTDB_STUDIO_JAR);
        if (!studioJar.exists()) {
            InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("plugins/" + ORIENTDB_STUDIO_JAR);
            if (is != null) {
                Files.copy(is, studioJar.toPath());
                is.close();
            }
        }
    }

    @Override
    public void close() {
        server.shutdown();
    }

    @Override
    public ODatabaseDocument createDatabaseDocument() {
        return server.openDatabase(dbName);
    }

    public OServerConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(OServerConfiguration configuration) {
        this.configuration = configuration;
    }

    public void exportDatabase(File file) throws IOException {
        try (OutputStream os = new FileOutputStream(file)) {
            exportDatabase(os);
        }
    }

    public void exportDatabase(OutputStream os) throws IOException {
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(os)) {
            try (ODatabaseDocumentInternal db = server.openDatabase(dbName)) {
                ODatabaseExport export = new ODatabaseExport(db, gzipOutputStream, (String iText)->{System.out.println(iText);});
                try {
                    export.exportDatabase();
                }
                finally {
                    export.close();
                }
            }
        }
    }

    public void importDatabase(File file) throws IOException {
        try (InputStream is = new FileInputStream(file)) {
            importDatabase(is);
        }
    }

    public void importDatabase(InputStream is) throws IOException {
        try(GZIPInputStream gzipInputStream = new GZIPInputStream(is)) {
            try (ODatabaseDocumentInternal db = server.openDatabase(dbName)) {
                ODatabaseImport import_ = new ODatabaseImport(db, gzipInputStream, (String iText)->{System.out.println(iText);});
                try {
                    import_.importDatabase();
                }
                finally {
                    import_.close();
                }
            }
        }
    }

    public static void main(String[] args) {
        String home = System.getProperty("orientdb.home", new File(System.getProperty("user.home"), ".orientdb/home").getAbsolutePath());
        String dbName = System.getProperty("orientdb.dbname", "models");
        try {
            try (Server orientdb = new Server(home, dbName, new ArrayList<>()).open()) {
                orientdb.server.waitForShutdown();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
