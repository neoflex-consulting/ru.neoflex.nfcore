package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.URIConverter;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class MemDBInputStream extends InputStream implements URIConverter.Loadable {
    private MemDBTransaction tx;
    private URI uri;
    private Map<?, ?> options;

    public MemDBInputStream(MemDBTransaction tx, URI uri, Map<?, ?> options) {
        this.tx = tx;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public int read() throws IOException {
        return 0;
    }

    @Override
    public void loadResource(Resource resource) throws IOException {
        tx.load(resource);
    }
}
