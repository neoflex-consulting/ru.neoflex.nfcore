package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceImpl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;

public class OrientDBOutputStream extends OutputStream implements URIConverter.Saveable {
    private Session session;
    private URI uri;
    private Map<?, ?> options;

    public OrientDBOutputStream(Session session, URI uri, Map<?, ?> options) {
        this.session = session;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public void saveResource(Resource resource) throws IOException {
        session.save(resource);
    }

    @Override
    public void write(int b) throws IOException {
    }
}
