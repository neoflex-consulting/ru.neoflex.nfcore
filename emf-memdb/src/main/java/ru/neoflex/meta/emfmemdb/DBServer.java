package ru.neoflex.meta.emfmemdb;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.impl.BinaryResourceImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

public abstract class DBServer implements AutoCloseable {
    private static final Logger logger = LoggerFactory.getLogger(DBServer.class);
    protected final List<EPackage> packages;
    protected final String dbName;
    private final Events events = new Events();
    private Function<EClass, EStructuralFeature> qualifiedNameDelegate = eClass -> eClass.getEStructuralFeature("name");

    public DBServer(List<EPackage> packages, String dbName) {
        this.packages = packages;
        this.dbName = dbName;
    }

    public String getId(URI uri) {
        if (uri.segmentCount() >= 1) {
            return uri.segment(0);
        }
        return null;
    }

    public String getVersion(URI uri) {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return null;
        }
        String versionStr = query.split("rev=", -1)[1];
        return StringUtils.isEmpty(versionStr) ? null : versionStr;
    }

    @Override
    public void close() throws IOException {
    }

    public List<EPackage> getPackages() {
        return packages;
    }

    public Function<EClass, EStructuralFeature> getQualifiedNameDelegate() {
        return qualifiedNameDelegate;
    }

    public void setQualifiedNameDelegate(Function<EClass, EStructuralFeature> qualifiedNameDelegate) {
        this.qualifiedNameDelegate = qualifiedNameDelegate;
    }

    public Events getEvents() {
        return events;
    }

    public Resource createResource(URI uri) {
        return new BinaryResourceImpl(uri);
    }

    protected abstract DBTransaction createDBTransaction(boolean readOnly);

    private String createURIString(String id) {
        return getScheme() + "://" + dbName + "/" + (id != null ? id : "");
    }

    public URI createURI(String id) {
        return URI.createURI(createURIString(id));
    }

    public URI createURI(String id, String version) {
        return URI.createURI(String.format("%s?rev=%s", createURIString(id), version));
    }

    public String getQName(EObject eObject) {
        EStructuralFeature sf = getQualifiedNameDelegate().apply(eObject.eClass());
        if (sf == null || !eObject.eIsSet(sf)) {
            throw new IllegalArgumentException(String.format("Can't get qName for eObject of class %s", EcoreUtil.getURI(eObject.eClass()).toString()));
        }
        return eObject.eGet(sf).toString();
    }

    public abstract String getScheme();

    public interface TxFunction<R> extends Serializable {
        R call(DBTransaction tx) throws Exception;
    }

    protected <R> R callWithTransaction(DBTransaction tx, TxFunction<R> f) throws Exception {
        return f.call(tx);
    }

    public <R> R inTransaction(boolean readOnly, TxFunction<R> f) throws Exception {
        return inTransaction(() -> createDBTransaction(readOnly), f);
    }

    public static class TxRetryStrategy {
        public int delay = 1;
        public int maxDelay = 1000;
        public int maxAttempts = 10;
        public List<Class<?>> retryClasses = new ArrayList<>();
    }

    protected TxRetryStrategy createTxRetryStrategy() {
        return new TxRetryStrategy();
    }

    public <R> R inTransaction(Supplier<DBTransaction> txSupplier, TxFunction<R> f) throws Exception {
        TxRetryStrategy retryStrategy = createTxRetryStrategy();
        int attempt = 1;
        int delay = retryStrategy.delay;
        while (true) {
            try (DBTransaction tx = txSupplier.get()) {
                tx.begin();
                try {
                    return callWithTransaction(tx, f);
                }
                catch (Throwable e) {
                    tx.rollback();
                    throw e;
                }
                finally {
                    tx.commit();
                }
            }
            catch (Throwable e) {
                boolean retry = retryStrategy.retryClasses.stream().anyMatch(aClass -> aClass.isAssignableFrom(e.getClass()));
                if (!retry) {
                    throw e;
                }
                if (++attempt > retryStrategy.maxAttempts) {
                    throw e;
                }
                String message = e.getClass().getSimpleName() + ": " + e.getMessage() + " attempt no " + attempt + " after " + delay + "ms";
                logger.info(message);
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ex) {
                }
                if (delay < retryStrategy.maxDelay) {
                    delay *= 2;
                }
                continue;
            }
        }
    }
}
