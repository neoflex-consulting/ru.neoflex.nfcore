package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class MemDBHandler extends URIHandlerImpl {
    public static final String MEMDB = "memdb";
    private MemDBTransaction tx;

    MemDBHandler(MemDBTransaction tx) {
        this.tx = tx;
    }

    @Override
    public boolean canHandle(URI uri) {
        return MEMDB.equals(uri.scheme());
    }

    @Override
    public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
        return new MemDBOutputStream(tx, uri, options);
    }

    @Override
    public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
        return new MemDBInputStream(tx, uri, options);
    }

    @Override
    public void delete(URI uri, Map<?, ?> options) throws IOException {
        tx.delete(uri);
    }

    public MemDBTransaction getTx() {
        return tx;
    }
}
