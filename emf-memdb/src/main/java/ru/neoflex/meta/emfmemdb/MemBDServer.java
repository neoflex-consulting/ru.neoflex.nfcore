package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.prevayler.Prevayler;
import org.prevayler.PrevaylerFactory;
import org.prevayler.Query;

import java.io.Closeable;
import java.io.IOException;
import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MemBDServer implements Closeable {
    private final Prevayler<MemDBModel> prevayler;
    private final List<EPackage> packages;
    private final String dbName;
    private final Events events = new Events();
    private Function<EClass, EStructuralFeature> qualifiedNameDelegate = eClass -> eClass.getEStructuralFeature("name");

    public MemBDServer(String prevalenceBase, String dbName, List<EPackage> packages) throws Exception {
        this.dbName = dbName;
        this.packages = packages;
        prevayler = PrevaylerFactory.createPrevayler(new MemDBModel(), prevalenceBase);
    }

    @Override
    public void close() throws IOException {
        try {
            prevayler.takeSnapshot();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        prevayler.close();
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

    public interface TxFunction<R> extends Serializable {
        R call(MemDBTransaction tx) throws Exception;
    }

    public <R> R inTransaction(boolean readOnly, TxFunction<R> f) throws Exception {
        MemDBTransaction tx = new MemDBTransaction(MemBDServer.this);
        R result = prevayler.execute((Query<MemDBModel, R>) (prevalentSystem, executionTime) -> {
            tx.setPrevalentSystem(prevalentSystem);
            return f.call(tx);
        });
        if (!readOnly) {
            prevayler.execute(tx);
        }
        return result;
    }

    public static Stream<String> getIds(URI uri) {
        if (uri.segmentCount() >= 1) {
            return Arrays.stream(uri.segment(0).split(","));
        }
        return Stream.empty();

    }

    public static Stream<Integer> getVersions(URI uri) {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return Stream.empty();
        }
        return Arrays.stream(query.split("rev=", -1)[1].split(",")).filter(s->s.length() > 0).map(Integer::valueOf);
    }

    public URI createResourceURI(Stream<MemDBObject> dbObjects) {
        List<MemDBObject> dbObjectsList = dbObjects.collect(Collectors.toList());
        String id = dbObjectsList.stream().map(MemDBObject::getId).collect(Collectors.joining(","));
        String rev = dbObjectsList.stream().map(dbObject -> String.valueOf(dbObject.getVersion())).collect(Collectors.joining(","));
        String ref = String.format("%s?rev=%s", id, rev);
        return URI.createURI(MemDBHandler.MEMDB + "://" + dbName + "/" + ref);
    }

    public URI createIdsURI(Stream<String> ids) {
        String id = ids.collect(Collectors.joining(","));
        return URI.createURI(MemDBHandler.MEMDB + "://" + dbName + "/" + id);
    }

}
