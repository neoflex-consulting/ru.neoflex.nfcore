package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.ecore.EPackage;
import org.prevayler.Prevayler;
import org.prevayler.PrevaylerFactory;
import org.prevayler.Query;

import java.io.IOException;
import java.util.List;

public class MemDBServer extends DBServer {
    public static final String MEMDB = "memdb";
    protected final Prevayler<MemDBModel> prevayler;

    public MemDBServer(String prevalenceBase, String dbName, List<EPackage> packages) throws Exception {
        super(packages, dbName);
        prevayler = PrevaylerFactory.createPrevayler(new MemDBModel(), prevalenceBase);
    }

    @Override
    public void commit(DBTransaction tx) {
        prevayler.execute((MemDBTransaction) tx);
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

    public Prevayler<MemDBModel> getPrevayler() {
        return prevayler;
    }

    @Override
    protected DBTransaction createDBTransaction(boolean readOnly) {
        return new MemDBTransaction(this, readOnly);
    }

    @Override
    public String getScheme() {
        return MEMDB;
    }

    @Override
    protected  <R> R callWithTransaction(DBTransaction tx, TxFunction<R> f) throws Exception {
        return prevayler.execute((Query<MemDBModel, R>) (prevalentSystem, executionTime) -> {
            return f.call(tx);
        });
    }

}
