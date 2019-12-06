package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDB;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.config.*;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.*;
import java.util.function.Function;

public class Database implements Closeable {
    private static final Logger logger = LoggerFactory.getLogger(Database.class);
    public final static String QNAME = "name";
    public final static String ORIENTDB = "orientdb";
    private List<EPackage> packages;
    private Map<String, Index> indexes = new HashMap<>();
    private Events events = new Events();
    private Function<EClass, EStructuralFeature> qualifiedNameDelegate;
    private Map<EClass, List<EClass>> descendants = new HashMap<>();
    private String dbName;
    OServer server;
    OServerConfiguration configuration;
    OrientDB orientDB;

    public Database(String dbPath, String dbName, List<EPackage> packages) throws Exception {
        System.setProperty("ORIENTDB_HOME", dbPath);
        this.dbName = dbName;
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
//                new OServerEntryConfiguration("orientdb.www.path", "C:/work/dev/orientechnologies/orientdb/releases/1.0rc1-SNAPSHOT/www/"),
//                new OServerEntryConfiguration("orientdb.config.file", "C:/work/dev/orientechnologies/orientdb/releases/1.0rc1-SNAPSHOT/config/orientdb-server-config.xml"),
                new OServerEntryConfiguration("server.cache.staticResources", "false"),
                new OServerEntryConfiguration("log.console.level", "info"),
                new OServerEntryConfiguration("log.console.level", "info"),
                new OServerEntryConfiguration("log.file.level", "fine"),
        };
        server.startup(configuration);
        server.activate();
        if (!server.existsDatabase(dbName)) {
            server.createDatabase(dbName, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        }
        ODatabaseDocument databaseDocument = server.openDatabase(dbName);
        databaseDocument.createClassIfNotExist("ecore_EObject");
        OClass oClass = databaseDocument.createClassIfNotExist("etl_Project");
        oClass.addSuperClass(databaseDocument.getClass("ecore_EObject"));
        databaseDocument.close();
        orientDB = new OrientDB("embedded:/" + dbPath, OrientDBConfig.defaultConfig());
        orientDB.createIfNotExists(dbName, ODatabaseType.PLOCAL);

        this.packages = packages;
        preCalcDescendants();
        createTypeNameIndex();
        createRefIndex();
        registerEvents();
    }

    @Override
    public void close() {
        orientDB.close();
        server.shutdown();
    }

    private void preCalcDescendants() {
        for (EPackage ePackage : this.packages) {
            for (EClassifier eClassifier : ePackage.getEClassifiers()) {
                if (eClassifier instanceof EClass) {
                    EClass eClass = (EClass) eClassifier;
                    if (!eClass.isAbstract()) {
                        for (EClass superType : eClass.getEAllSuperTypes()) {
                            getConcreteDescendants(superType).add(eClass);
                        }
                    }
                }
            }
        }
    }

    public List<EClass> getConcreteDescendants(EClass eClass) {
        return descendants.computeIfAbsent(eClass, (c) -> new ArrayList<EClass>() {
            {
                if (!eClass.isAbstract()) {
                    add(eClass);
                }
            }
        });
    }

    private void registerEvents() {
    }

    public EStructuralFeature getQNameFeature(EClass eClass) {
        if (qualifiedNameDelegate != null) {
            return qualifiedNameDelegate.apply(eClass);
        }
        return eClass.getEStructuralFeature(QNAME);
    }

    public EStructuralFeature checkAndGetQNameFeature(EClass eClass) {
        EStructuralFeature feature = getQNameFeature(eClass);
        if (feature == null) {
            throw new IllegalArgumentException(String.format(
                    "Qualified name not found for eClass: %s", EcoreUtil.getURI(eClass)));
        }
        return eClass.getEStructuralFeature("name");
    }


    private void createTypeNameIndex() {
    }

    private void createRefIndex() {
    }

    public Resource createResource(Transaction tx, String id) {
        ResourceSet resourceSet = createResourceSet(tx);
        return createResource(resourceSet, id);
    }

    public Resource createResource(ResourceSet resourceSet, String id) {
        URI uri = createURI(id);
        return resourceSet.createResource(uri);
    }

    public URI createURI(String id) {
        StringBuffer buffer = new StringBuffer("");
        if (id != null) {
            buffer.append(id);
        }
        buffer.append("?rev=-1");
        return createURIByRef(buffer.toString());
    }

    public URI createURIByRef(String ref) {
        URI uri = URI.createURI(ORIENTDB + "://" +dbName + "/" + (ref == null ? "" : ref));
        return uri;
    }

    public ResourceSet createResourceSet() {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        for (EPackage ePackage : packages) {
            resourceSet.getPackageRegistry()
                    .put(ePackage.getNsURI(), ePackage);
        }
        resourceSet.getResourceFactoryRegistry()
                .getExtensionToFactoryMap()
                .put("*", new ResourceFactoryImpl() {
                    @Override
                    public Resource createResource(URI uri) {
                        Resource resource = new ResourceImpl(uri) {
                            @Override
                            public void load(Map<?, ?> options) throws IOException {
                                super.load(options);
                            }

                            @Override
                            public void save(Map<?, ?> options) throws IOException {
                                super.save(options);
                            }
                        };
                        return resource;
                    }
                });
        return resourceSet;
    }

    public ResourceSet createResourceSet(Transaction tx) {
        ResourceSet resourceSet = createResourceSet();
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new OrientDBHandler(tx));
        return resourceSet;
    }

    public String getRev(URI uri) throws IOException {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return null;
        }
        return query.split("rev=")[1];
    }

    public String checkAndGetRev(URI uri) throws IOException {
        String rev = getRev(uri);
        if (rev == null) {
            throw new IOException("Revision not found: " + uri.toString());
        }
        return rev;
    }

    public String getId(URI uri) {
        if (uri.segmentCount() == 0) {
            return null;
        }
        return uri.segment(0);
    }

    public String getResourceId(Resource resource) {
        return getId(resource.getURI());
    }

    public String checkAndGetId(URI uri) throws IOException {
        String id = getId(uri);
        if (id == null) {
            throw new IOException("Can't handle resource without id: " + uri.toString());
        }
        return id;
    }

    public String checkAndGetResourceId(Resource resource) throws IOException {
        return checkAndGetId(resource.getURI());
    }

    public byte[] getResourceContent(Resource resource) throws IOException {
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        resource.save(os, null);
        return os.toByteArray();
    }

    public List<Resource> getDependentResources(Resource resource, Transaction tx) throws IOException {
        String id = checkAndGetResourceId(resource);
        List<Resource> resources = getDependentResources(id, tx);
        return resources;
    }

    public List<Resource> getDependentResources(List<Resource> resources, Transaction tx) throws IOException {
        List<Resource> result = new ArrayList<>();
        for (Resource resource: resources) {
            if (!result.stream().anyMatch(r->r.getURI().equals(resource.getURI()))) {
                result.add(resource);
            }
            for (Resource dep: getDependentResources(resource, tx)) {
                if (!result.stream().anyMatch(r->r.getURI().equals(dep.getURI()))) {
                    result.add(dep);
                }
            }
        }
        return result;
    }

    public List<Resource> getDependentResources(List<Resource> resources, Transaction tx, boolean recursive) throws IOException {
        if (recursive) {
            return getDependentResourcesRecursive(resources, tx);
        }
        else {
            return getDependentResources(resources, tx);
        }
    }

    public List<Resource> getDependentResourcesRecursive(List<Resource> resources, Transaction tx) throws IOException {
        List<Resource> result = new ArrayList<>();
        Queue<Resource> queue = new ArrayDeque<>(resources);
        while (!queue.isEmpty()) {
            Resource resource = queue.remove();
            if (!result.stream().anyMatch(r->r.getURI().equals(resource.getURI()))) {
                result.add(resource);
                queue.addAll(getDependentResources(resource, tx));
            }
        }
        return result;
    }

    public List<Resource> getDependentResources(String id, Transaction tx) throws IOException {
        List<Resource> resources = new ArrayList<>();
        // TODO: to implement
        return resources;
    }

    public ResourceSet findByEClass(EClass eClass, String name, Transaction tx) throws IOException {
        ResourceSet resourceSet = createResourceSet(tx);
        List<IndexEntry> ieList = findEClassIndexEntries(eClass, name, tx);
        for (IndexEntry entry : ieList) {
            String id = new String(entry.getContent());
            loadResource(resourceSet, id);
        }
        return resourceSet;
    }

    public List<IndexEntry> findEClassIndexEntries(EClass eClass, String name, Transaction tx) throws IOException {
        String nsURI = eClass.getEPackage().getNsURI();
        String className = eClass.getName();
        List<IndexEntry> ieList = null;
        if (name == null || name.length() == 0) {
            // TODO: to implement
        } else {
            // TODO: to implement
        }
        return ieList;
    }

    public Resource loadResource(ResourceSet resourceSet, String id) throws IOException {
        URI uri = createURI(id);
        Resource resource = resourceSet.createResource(uri);
        resource.load(null);
        return resource;
    }

    public Resource loadResource(String id, Transaction tx) throws IOException {
        ResourceSet resourceSet = createResourceSet(tx);
        return loadResource(resourceSet, id);
    }

    public List<EPackage> getPackages() {
        return packages;
    }

    public Transaction createTransaction(String branch) throws IOException {
        return new Transaction(this, branch);
    }

    public Transaction createTransaction(String branch, Transaction.LockType lockType) throws IOException {
        return new Transaction(this, branch, lockType);
    }

    public <R> R inTransaction(String branch, Transaction.LockType lockType, Transactional<R> f) throws Exception {
        return inTransaction(() -> createTransaction(branch, lockType), f);
    }

    public interface TxSupplier<T> {
        T get() throws Exception;
    }

    public <R> R inTransaction(TxSupplier<Transaction> transactionSupplier, Transactional<R> f) throws Exception {
        int delay = 1;
        int maxDelay = 1000;
        int maxAttempts = 100;
        int attempt = 1;
        while (true) {
            try (Transaction tx = transactionSupplier.get()) {
                return f.call(tx);
            }
            catch (Exception e) {
                String message = e.getClass().getSimpleName() + ": " + e.getMessage() + " attempt no " + attempt;
                logger.debug(message);
                if (++attempt > maxAttempts) {
                    throw e;
                }
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ex) {
                }
                if (delay < maxDelay) {
                    delay *= 2;
                }
                continue;
            }
        }
    }

    public Map<String, Index> getIndexes() {
        return indexes;
    }

    public Events getEvents() {
        return events;
    }

    public Function<EClass, EStructuralFeature> getQualifiedNameDelegate() {
        return qualifiedNameDelegate;
    }

    public void setQualifiedNameDelegate(Function<EClass, EStructuralFeature> qualifiedNameDelegate) {
        this.qualifiedNameDelegate = qualifiedNameDelegate;
    }

    public interface Transactional<R> {
        public R call(Transaction tx) throws Exception;
    }
}
