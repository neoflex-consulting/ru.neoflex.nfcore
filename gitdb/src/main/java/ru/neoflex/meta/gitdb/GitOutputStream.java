package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.JsonNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

public class GitOutputStream extends ByteArrayOutputStream implements URIConverter.Saveable {
    private GitHandler handler;
    private URI uri;
    private Map<?, ?> options;

    public GitOutputStream(GitHandler handler, URI uri, Map<?, ?> options) {
        this.handler = handler;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public void saveResource(Resource resource) throws IOException {
        String id = uri.segmentCount() > 0 ? uri.segment(0) : null;
        String rev = id == null || id.length() == 0 ? null : handler.getRev(uri);
        JsonNode contentNode = handler.getMapper().valueToTree(resource);
        byte[] content = handler.getMapper().writeValueAsBytes(contentNode);
        Transaction transaction = handler.getTransaction();
        Entity entity = new Entity(id, rev, content);
        if (rev == null) {
            transaction.create(entity);
            id = entity.getId();
        }
        else {
            transaction.update(entity);
        }
        rev = entity.getRev();
        URI newURI = resource.getURI().trimFragment().trimQuery().trimSegments(1).appendSegment(id).appendQuery("rev=" + rev);
        resource.setURI(newURI);
    }
}
