package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class GitHandler extends URIHandlerImpl {
    private Transaction transaction;

    public GitHandler(Transaction transaction) {
        this.transaction = transaction;
    }

    public void delete(URI uri, Map<?, ?> options) throws IOException {
        EMFJSONDB db = (EMFJSONDB) transaction.getDatabase();
        String id = uri.segment(0);
        String rev = db.getRev(uri);
        EntityId entityId = new EntityId(id, rev);
        transaction.delete(entityId);
    }

    @Override
    public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
        return new GitInputStream(this, uri, options);
    }

    @Override
    public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
        return new GitOutputStream(this, uri, options);
    }


    public Transaction getTransaction() {
        return transaction;
    }
}
