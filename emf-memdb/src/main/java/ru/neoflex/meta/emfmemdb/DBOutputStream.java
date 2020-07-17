package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.URIConverter;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;

public class DBOutputStream extends OutputStream implements URIConverter.Saveable {
    private DBTransaction tx;
    private URI uri;
    private Map<?, ?> options;

    public DBOutputStream(DBTransaction tx, URI uri, Map<?, ?> options) {
        this.tx = tx;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public void saveResource(Resource resource) throws IOException {
        tx.save(resource);
    }

    @Override
    public void write(int b) throws IOException {
    }
}
