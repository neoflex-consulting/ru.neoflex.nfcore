package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.config.*;
import org.eclipse.emf.ecore.EPackage;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

public class Server extends SessionFactory implements Closeable {
    public static final String ORIENTDB_STUDIO_JAR = "orientdb-studio-3.0.26.jar";
    OServer server;
    OServerConfiguration configuration;

    public Server(String home, String dbName, List<EPackage> packages) throws Exception {
        super(dbName, packages);
        System.setProperty("ORIENTDB_HOME", home);
        installStudioJar(home);
        String dbPath = new File(home, "databases").getAbsolutePath();
        this.server = OServerMain.create();
        this.configuration = new OServerConfiguration();
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
        server.startup(configuration);
        server.activate();
        if (!server.existsDatabase(dbName)) {
            server.createDatabase(dbName, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        }
        createSchema();
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
}
