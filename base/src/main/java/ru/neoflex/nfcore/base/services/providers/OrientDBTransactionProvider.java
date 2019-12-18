package ru.neoflex.nfcore.base.services.providers;

import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.meta.emforientdb.Session;

import java.io.IOException;

public class OrientDBTransactionProvider extends NullTransactionProvider {
    private Session session;
    private boolean commited = false;
    private static final ThreadLocal<OrientDBTransactionProvider> tlTransaction = new ThreadLocal<>();

    public static void setCurrent(OrientDBTransactionProvider tx) {
        tlTransaction.set(tx);
    }

    public static OrientDBTransactionProvider getCurrent() {
        return tlTransaction.get();
    }


    OrientDBTransactionProvider(StoreSPI store, Session session) {
        super(store);
        this.session = session;
    }

    @Override
    public void commit(String message, String author, String email) throws IOException {
        commited = true;
    }

    @Override
    public void close() throws IOException {
        session.close();
    }

    public boolean isCommited() {
        return commited;
    }

    public Session getSession() {
        return session;
    }
}
