package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.emf.ecore.xmi.XMLParserPool;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceImpl;
import org.eclipse.emf.ecore.xmi.impl.XMLParserPoolImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.util.*;
import java.util.function.Function;

import static org.eclipse.emf.ecore.xmi.XMLResource.*;

public class Database implements Closeable {
    private static final Logger logger = LoggerFactory.getLogger(Database.class);
    public final static String QNAME = "name";
    public final static String ORIENTDB = "orientdb";
    private List<EPackage> packages;
    private Map<String, Index> indexes = new HashMap<>();
    private Events events = new Events();
    private Function<EClass, EStructuralFeature> qualifiedNameDelegate;
    private Map<EClass, List<EClass>> descendants = new HashMap<>();
    private String repoName;
    private XMLParserPool xmlParserPool = new XMLParserPoolImpl();

    public Database(String repoPath, List<EPackage> packages) {
        this.repoName = new File(repoPath).getName();
        this.packages = packages;
        preCalcDescendants();
        createTypeNameIndex();
        createRefIndex();
        registerEvents();
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
        URI uri = URI.createURI(ORIENTDB + "://" +repoName + "/" + (ref == null ? "" : ref));
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
                .put("*", new XMIResourceFactoryImpl() {
                    @Override
                    public Resource createResource(URI uri) {
                        XMIResourceImpl resource = new XMIResourceImpl(uri);
                        resource.getDefaultSaveOptions().put(OPTION_ENCODING, "UTF-8");
                        resource.getDefaultSaveOptions().put(OPTION_CONFIGURATION_CACHE, true);
                        resource.getDefaultLoadOptions().put(OPTION_USE_PARSER_POOL, xmlParserPool);
                        resource.getDefaultLoadOptions().put(OPTION_USE_DEPRECATED_METHODS, false);
                        resource.getDefaultLoadOptions().put(OPTION_DEFER_ATTACHMENT, true);
                        resource.getDefaultLoadOptions().put(OPTION_DEFER_IDREF_RESOLUTION, true);
                        return resource;
                    }
                });
        return resourceSet;
    }

    public ResourceSet createResourceSet(Transaction tx) {
        ResourceSet resourceSet = createResourceSet();
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new GitHandler(tx));
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

    @Override
    public void close() throws IOException {
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
