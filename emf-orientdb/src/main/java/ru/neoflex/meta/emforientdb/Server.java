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
import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.ecore.EPackage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class Server extends SessionFactory implements Closeable {
    private static final Logger logger = LoggerFactory.getLogger(Server.class);
    private final String home;
    private final OServer oServer;
    private OServerConfiguration configuration;
    private int numOfProtectedBackups = 0;

    public Server(String home, String dbName, List<EPackage> packages) throws Exception {
        super(dbName, packages);
        this.home = home;
        System.setProperty("ORIENTDB_HOME", home);
        System.setProperty("ridBag.embeddedToSbtreeBonsaiThreshold", String.valueOf(Integer.MAX_VALUE));
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
        OCallable<Object, String> oCallable = iArgument -> {
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
                commands = new OServerCommandConfiguration[]{new OServerCommandConfiguration() {{
                    implementation = "com.orientechnologies.orient.server.network.protocol.http.command.get.OServerCommandGetStaticContent";
                    pattern = "GET|www GET|studio/ GET| GET|*.htm GET|*.html GET|*.xml GET|*.jpeg GET|*.jpg GET|*.png GET|*.gif GET|*.js GET|*.css GET|*.swf GET|*.ico GET|*.txt GET|*.otf GET|*.pjs GET|*.svg";
                    parameters = new OServerEntryConfiguration[]{
                            new OServerEntryConfiguration("http.cache:*.htm *.html", "Cache-Control: no-cache, no-store, max-age=0, must-revalidate\r\nPragma: no-cache"),
                            new OServerEntryConfiguration("http.cache:default", "Cache-Control: max-age=120"),
                    };
                }}};
                parameters = new OServerParameterConfiguration[]{
                        new OServerParameterConfiguration("network.http.charset", "UTF-8"),
                        new OServerParameterConfiguration("network.http.jsonResponseError", "true")
                };
            }});
        }};
        configuration.users = new OServerUserConfiguration[]{
                new OServerUserConfiguration("root", "ne0f1ex", "*"),
                new OServerUserConfiguration("admin", "admin", "*"),
        };
        configuration.properties = new OServerEntryConfiguration[]{
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

    public File exportDatabase(String dbName, File file) throws IOException {
        file.getParentFile().mkdirs();
        try (OutputStream os = new FileOutputStream(file)) {
            exportDatabase(dbName, os);
        }
        return file;
    }

    private static int getHanoiTowersSlot(int index) {
        if (index == 0)
            return 0;
        int shift = 0;
        while ((index&(1<<shift)) == 0)
            ++shift;
        return shift + 1;
    }

    private static int getBackupIndex(String fileName) {
        String[] parts = fileName.split("_");
        try {
            return Integer.parseInt(parts[1]);
        }
        catch (Throwable t) {
            return -1;
        }
    }

    public File backupDatabase(String dbName) throws IOException {
        dbName = StringUtils.isEmpty(dbName)?getDbName():dbName;
        List<String> names = listBackupNames(dbName);
        int nextIndex = 0;
        for (int i = names.size() - 1; i >= 0; --i) {
            int index = getBackupIndex(names.get(i));
            if (index >= 0) {
                nextIndex = index + 1;
                break;
            }
        }
        int nextSlot = getHanoiTowersSlot(nextIndex);
        File backups = new File(getHome(), "backups");
        String fileName = String.format("%s_%06d_%03d_%s.zip",
                dbName, nextIndex, nextSlot, new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date()));
        File backup = new File(backups, fileName);
        backupDatabase(dbName, backup);
        names.add(fileName);
        // remove non-protected duplicated slots
        for (int n = names.size() - 1 - getNumOfProtectedBackups(); n > 0; --n) {
            int lastNonProtectedIndex = getBackupIndex(names.get(n));
            if (lastNonProtectedIndex > 0) {
                int slotToRemove = getHanoiTowersSlot(lastNonProtectedIndex);
                for (int i = 0; i < n; ++i) {
                    int indexToTest = getBackupIndex(names.get(i));
                    if (indexToTest > 0) {
                        int slotToTest = getHanoiTowersSlot(indexToTest);
                        if (slotToTest == slotToRemove) {
                            File file = new File(backups, names.get(i));
                            file.delete();
                        }
                    }
                }
                break;
            }
        }
        return backup;
    }

    public File backupDatabase(String dbName, File file) throws IOException {
        file.getParentFile().mkdirs();
        try (OutputStream os = new FileOutputStream(file)) {
            backupDatabase(dbName, os, new HashMap<>());
        }
        return file;
    }

    public void backupDatabase(String dbName, OutputStream os, Map<String, Object> options) throws IOException {
        try (ODatabaseDocumentInternal db = getOServer().openDatabase(dbName)) {
            db.backup(os, options, null, logger::info, 9, 4096);
        }
    }

    public String restoreDatabase(File file) throws IOException {
        String dbName = file.getName().split("_")[0];
        try (InputStream is = new FileInputStream(file)) {
            restoreDatabase(dbName, is, new HashMap<>());
        }
        return file.getAbsolutePath();
    }

    public String restoreDatabase(String fileName) throws IOException {
        File backups = new File(getHome(), "backups");
        return restoreDatabase(new File(backups, fileName));
    }

    public void restoreDatabase(String dbName, InputStream is, Map<String, Object> options) throws IOException {
        try (ODatabaseDocumentInternal db = getOServer().openDatabase(dbName)) {
            db.restore(is, options, null, logger::info);
        }
    }

    public void exportDatabase(String dbName, OutputStream os) throws IOException {
        dbName = StringUtils.isEmpty(dbName)?getDbName():dbName;
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(os)) {
            try (ODatabaseDocumentInternal db = getOServer().openDatabase(dbName)) {
                ODatabaseExport export = new ODatabaseExport(db, gzipOutputStream, logger::info);
                try {
                    export.run();
                } finally {
                    export.close();
                }
            }
        }
    }

    public String importDatabase(String fileName) throws IOException {
        File dir = new File(getHome(), "exports");
        return importDatabase(new File(dir, fileName), "-merge=false");
    }

    public String importDatabase(File file, String options) throws IOException {
        String dbName = file.getName().split("_")[0];
        try (InputStream is = new FileInputStream(file)) {
            importDatabase(dbName, is, options);
        }
        return file.getAbsolutePath();
    }

    public void importDatabase(String dbName, InputStream is, String options) throws IOException {
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(is)) {
            try (ODatabaseDocumentInternal db = getOServer().openDatabase(dbName)) {
                ODatabaseImport import_ = new ODatabaseImport(db, gzipInputStream, logger::info);
                try {
                    import_.setOptions(options);
                    import_.run();
                } finally {
                    import_.close();
                }
            }
        }
    }

    public String vacuum(String dbName) throws IOException {
        File export = exportDatabase(dbName);
        importDatabase(export, "-merge=false");
        return export.getAbsolutePath();
    }

    public List<String> listExportNames(String dbName) {
        File[] files = new File(getHome(), "exports").listFiles();
        return Arrays.stream(files != null ? files : new File[0])
                .map(File::getName)
                .filter(name -> StringUtils.isEmpty(dbName) || name.startsWith(dbName))
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> listExports(String dbName) {
        File[] files = new File(getHome(), "exports").listFiles();
        return Arrays.stream(files != null ? files : new File[0])
                .filter(file -> StringUtils.isEmpty(dbName) || file.getName().startsWith(dbName))
                .map(file -> file.getAbsolutePath().replace("\\", "/"))
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> listBackups(String dbName) {
        File[] files = new File(getHome(), "backups").listFiles();
        return Arrays.stream(files != null ? files : new File[0])
                .filter(file -> StringUtils.isEmpty(dbName) || file.getName().startsWith(dbName))
                .map(file -> file.getAbsolutePath().replace("\\", "/"))
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> listBackupNames(String dbName) {
        File[] files = new File(getHome(), "backups").listFiles();
        return Arrays.stream(files != null ? files : new File[0])
                .map(File::getName)
                .filter(name -> StringUtils.isEmpty(dbName) || name.startsWith(dbName))
                .sorted()
                .collect(Collectors.toList());
    }


    public File exportDatabase(String dbName) throws IOException {
        File export = new File(home, "exports/" + (StringUtils.isEmpty(dbName)?getDbName():dbName) + "_" +
                new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".json.gz");
        return exportDatabase(dbName, export);
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

    public int getNumOfProtectedBackups() {
        return numOfProtectedBackups;
    }

    public void setNumOfProtectedBackups(int numOfProtectedBackups) {
        this.numOfProtectedBackups = numOfProtectedBackups;
    }
}
