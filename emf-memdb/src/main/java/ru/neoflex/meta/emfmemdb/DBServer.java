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

import java.io.IOException;
import java.io.Serializable;
import java.util.List;
import java.util.function.Function;

public abstract class DBServer implements AutoCloseable {
    protected final List<EPackage> packages;
    protected final String dbName;
    private final Events events = new Events();
    private Function<EClass, EStructuralFeature> qualifiedNameDelegate = eClass -> eClass.getEStructuralFeature("name");

    public DBServer(List<EPackage> packages, String dbName) {
        this.packages = packages;
        this.dbName = dbName;
    }

    public static String getId(URI uri) {
        if (uri.segmentCount() >= 1) {
            return uri.segment(0);
        }
        return null;
    }

    public static Integer getVersion(URI uri) {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return null;
        }
        String versionStr = query.split("rev=", -1)[1];
        return StringUtils.isEmpty(versionStr) ? null : Integer.valueOf(versionStr);
    }

    public abstract void commit(DBTransaction tx);

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

    public URI createURI(DBResource dbResource) {
        return createURI(dbResource.getId(), dbResource.getVersion());
    }

    private String createURIString(String id) {
        return getScheme() + "://" + dbName + "/" + (id != null ? id : "");
    }

    public URI createURI(String id) {
        return URI.createURI(createURIString(id));
    }

    public URI createURI(String id, Integer version) {
        return URI.createURI(String.format("%s?rev=%s", createURIString(id), String.valueOf(version)));
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

    protected <R> R withTransaction(DBTransaction tx, TxFunction<R> f) throws Exception {
        return f.call(tx);
    }

    public <R> R inTransaction(boolean readOnly, TxFunction<R> f) throws Exception {
        try (DBTransaction tx = createDBTransaction(readOnly)) {
            R r = withTransaction(tx, f);
            if (!readOnly) {
                commit(tx);
            }
            return r;
        }
    }
}
