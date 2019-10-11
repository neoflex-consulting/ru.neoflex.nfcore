package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class GitInputStream extends InputStream implements URIConverter.Loadable {
    private GitHandler handler;
    private URI uri;
    private Map<?, ?> options;

    public GitInputStream(GitHandler handler, URI uri, Map<?, ?> options) {
        this.handler = handler;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public int read() throws IOException {
        return 0;
    }

    @Override
    public void loadResource(Resource resource) throws IOException {
        String id = uri.segmentCount() > 0 ? uri.segment(0) : null;
        Transaction transaction = handler.getTransaction();
        EntityId entityId = new EntityId(id, null);
        Entity entity = transaction.load(entityId);
        String rev = entity.getRev();
        if (!resource.getContents().isEmpty()) {
            resource.getContents().clear();
        }
        ResourceSet resourceSet = resource.getResourceSet();
        if (resourceSet == null) {
            resourceSet = new ResourceSetImpl();
        }
        JsonNode content = handler.getMapper().readTree(entity.getContent());
        ContextAttributes attributes = ContextAttributes
                .getEmpty()
                .withSharedAttribute("resourceSet", resourceSet)
                .withSharedAttribute("resource", resource);
        handler.getMapper().reader()
                .with(attributes)
                .withValueToUpdate(resource)
                .treeToValue(content, Resource.class);
        URI newURI = resource.getURI().trimFragment().trimQuery().trimSegments(1).appendSegment(id).appendQuery("rev=" + rev);
        resource.setURI(newURI);
    }
}
