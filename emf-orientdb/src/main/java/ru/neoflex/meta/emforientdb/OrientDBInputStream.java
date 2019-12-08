package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceImpl;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class OrientDBInputStream extends InputStream implements URIConverter.Loadable {
    private Session session;
    private URI uri;
    private Map<?, ?> options;

    public OrientDBInputStream(Session session, URI uri, Map<?, ?> options) {
        this.session = session;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public int read() throws IOException {
        return 0;
    }

    @Override
    public void loadResource(Resource resource) throws IOException {
        session.load(resource);
    }
}
