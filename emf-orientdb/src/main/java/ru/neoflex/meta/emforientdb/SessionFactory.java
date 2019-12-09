package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.exception.OConcurrentModificationException;
import com.orientechnologies.orient.core.id.ORID;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.record.ORecord;
import com.orientechnologies.orient.core.tx.OTransaction;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public abstract class SessionFactory {
    public final static String ORIENTDB = "orientdb";
    private static final Logger logger = LoggerFactory.getLogger(Server.class);
    public final static String QNAME = "name";

    private Function<EClass, EStructuralFeature> qualifiedNameDelegate;
    protected final String dbName;
    protected final List<EPackage> packages;

    public SessionFactory(String dbName, List<EPackage> packages) {
        this.dbName = dbName;
        this.packages = packages;
    }
    public abstract ODatabaseDocument createDatabaseDocument();

    public Session createSession() {
        return new Session(this, createDatabaseDocument());
    }

    public List<EPackage> getPackages() {
        return packages;
    }

    public List<EClass> getEClasses() {
        List<EClass> eClasses = new ArrayList<>();
        for (EPackage ePackage : this.packages) {
            for (EClassifier eClassifier : ePackage.getEClassifiers()) {
                if (eClassifier instanceof EClass) {
                    EClass eClass = (EClass) eClassifier;
                    eClasses.add(eClass);
                }
            }
        }
        return eClasses;
    }

    public void createSchema() {
        try (Session session = createSession()) {
            session.createSchema();
        }
    }

    public URI createURI() {
        return createURI("");
    }

    public URI createURI(String ref) {
        URI uri = URI.createURI(ORIENTDB + "://" +dbName + "/" + (ref == null ? "" : ref));
        if (!uri.hasFragment()) {
            uri = uri.appendFragment("/");
        }
        return uri;
    }

    public URI createURI(ORecord oElement) {
        String ref = getRef(oElement);
        return createURI(ref);
    }

    public String getRef(ORecord oElement) {
        ORID orid = oElement.getIdentity();
        String id = getId(orid);
        return String.format("%s?rev=%d", id, oElement.getVersion());
    }

    public String getId(ORID orid) {
        return String.format("%d-%d", orid.getClusterId(), orid.getClusterPosition());
    }

    public String getId(URI uri) {
        if (uri.segmentCount() < 1) {
            return null;
        }
        return uri.segment(0);
    }

    public ORID getORID(URI uri) {
        String id = getId(uri);
        if (id == null) {
            return null;
        }
        String[] ids = id.split("-", 2);
        if (ids.length != 2) {
            return null;
        }
        return new ORecordId(new Integer(ids[0]), new Long(ids[1]));
    }

    public Integer getVersion(URI uri) {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return null;
        }
        return Integer.valueOf(query.split("rev=")[1]);
    }

    public EPackage getEPackage(String part) {
        for (EPackage ePackage: packages) {
            if (ePackage.getNsPrefix().equals(part)) {
                return ePackage;
            }
        }
        return null;
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
                .getProtocolToFactoryMap()
                .put(ORIENTDB, new ResourceFactoryImpl() {
                    @Override
                    public Resource createResource(URI uri) {
                        return new ResourceImpl(uri) {
                            @Override
                            protected void doSave(OutputStream outputStream, Map<?, ?> options) throws IOException {
                                ((URIConverter.Saveable)outputStream).saveResource(this);
                            }

                            @Override
                            protected void doLoad(InputStream inputStream, Map<?, ?> options) throws IOException {
                                ((URIConverter.Loadable)inputStream).loadResource(this);
                            }
                        };
                    }
                });
        return resourceSet;
    }

    public EStructuralFeature getQNameFeature(EClass eClass) {
        if (qualifiedNameDelegate != null) {
            return qualifiedNameDelegate.apply(eClass);
        }
        return eClass.getEStructuralFeature(QNAME);
    }


    public Function<EClass, EStructuralFeature> getQualifiedNameDelegate() {
        return qualifiedNameDelegate;
    }

    public void setQualifiedNameDelegate(Function<EClass, EStructuralFeature> qualifiedNameDelegate) {
        this.qualifiedNameDelegate = qualifiedNameDelegate;
    }

    public interface SessionFunction<R> {
        R call(Session session) throws Exception;
    }

    public<R> R withSession(SessionFunction<R> f) throws Exception {
        try (Session session = createSession()) {
            return f.call(session);
        }
    }

    public <R> R inTransaction(SessionFunction<R> f) throws Exception {
        int delay = 1;
        int maxDelay = 1000;
        int maxAttempts = 100;
        int attempt = 1;
        while (true) {
            try {
                return withSession(session -> {
                    session.getDatabaseDocument().begin(OTransaction.TXTYPE.OPTIMISTIC);
                    try {
                        return f.call(session);
                    }
                    catch (Throwable tx) {
                        session.getDatabaseDocument().rollback();
                        throw tx;
                    }
                    finally {
                        session.getDatabaseDocument().commit(true);
                    }
                });
            }
            catch (OConcurrentModificationException e) {
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

}
