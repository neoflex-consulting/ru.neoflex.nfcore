package ru.neoflex.nfcore.base.services.providers;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;

public abstract class AbstractStoreSPI implements StoreSPI {

    @Override
    public Resource saveResource(Resource resource) throws IOException {
        resource.save(null);
        return resource;
    }

    @Override
    public Resource loadResource(URI uri, TransactionSPI tx) throws IOException {
        Resource resource = createResourceSet(tx).createResource(uri.trimFragment().trimQuery());
        resource.load(null);
        return resource;
    }

    @Override
    public void deleteResource(URI uri, TransactionSPI tx) throws IOException {
        ResourceSet resourceSet = createResourceSet(tx);
        Resource resource = resourceSet.createResource(uri);
        resource.load(null);
        if (resource.getContents().isEmpty()) {
            throw new IOException("Resource " + uri.toString() + " not found");
        }
        resource.delete(null);
    }
}
