package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class DBHandler extends URIHandlerImpl {
    private DBTransaction tx;

    DBHandler(DBTransaction tx) {
        this.tx = tx;
    }

    @Override
    public boolean canHandle(URI uri) {
        return tx.getDbServer().getScheme().equals(uri.scheme());
    }

    @Override
    public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
        return new DBOutputStream(tx, uri, options);
    }

    @Override
    public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
        return new DBInputStream(tx, uri, options);
    }

    @Override
    public void delete(URI uri, Map<?, ?> options) throws IOException {
        tx.delete(uri);
    }

    public DBTransaction getTx() {
        return tx;
    }
}
