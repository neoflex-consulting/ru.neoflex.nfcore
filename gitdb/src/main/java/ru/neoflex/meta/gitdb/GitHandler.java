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
    private ObjectMapper mapper;

    public GitHandler(Transaction transaction, ObjectMapper mapper) {
        this.transaction = transaction;
        this.mapper = mapper;
    }

    public void delete(URI uri, Map<?, ?> options) throws IOException {
        String id = uri.segment(0);
        String rev = getRev(uri);
        EntityId entityId = new EntityId(id, rev);
        transaction.delete(entityId);
    }

    public String getRev(URI uri) throws IOException {
        String query = uri.query();
        if (!query.contains("rev=")) {
            throw new IOException("Revision not found: " + uri.toString());
        }
        return query.split("rev=")[1];
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

    public ObjectMapper getMapper() {
        return mapper;
    }
}
