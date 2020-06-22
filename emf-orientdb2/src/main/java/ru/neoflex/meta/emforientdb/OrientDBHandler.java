package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class OrientDBHandler extends URIHandlerImpl {
    private Session session;

    OrientDBHandler(Session session) {
        this.session = session;
    }

    @Override
    public boolean canHandle(URI uri) {
        return SessionFactory.ORIENTDB.equals(uri.scheme());
    }

    @Override
    public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
        return new OrientDBOutputStream(session, uri, options);
    }

    @Override
    public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
        return new OrientDBInputStream(session, uri, options);
    }

    @Override
    public void delete(URI uri, Map<?, ?> options) throws IOException {
        session.delete(uri);
    }

    public Session getSession() {
        return session;
    }
}
