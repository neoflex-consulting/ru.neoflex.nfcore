package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceImpl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

public class OrientDBOutputStream extends ByteArrayOutputStream implements URIConverter.Saveable {
    private OrientDBHandler handler;
    private URI uri;
    private Map<?, ?> options;

    public OrientDBOutputStream(OrientDBHandler handler, URI uri, Map<?, ?> options) {
        this.handler = handler;
        this.uri = uri;
        this.options = options;
    }

    @Override
    public void saveResource(Resource resource) throws IOException {
        Transaction transaction = handler.getTransaction();
        Database db = transaction.getDatabase();
        String id = db.getResourceId(resource);
        boolean isNew = id == null || id.length() == 0;
        String rev = isNew ? null : db.checkAndGetRev(uri);
        Resource oldResource = null;
        db.getEvents().fireBeforeSave(oldResource, resource, transaction);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ((XMIResourceImpl) resource).doSave(os, options);
        byte[] content = os.toByteArray();
        Entity entity = new Entity(id, rev, content);
        if (isNew) {
            transaction.create(entity);
            id = entity.getId();
        }
        else {
            transaction.update(entity);
        }
        rev = entity.getRev();
        URI newURI = db.createURI(id);
        resource.setURI(newURI);
        db.getEvents().fireAfterSave(oldResource, resource, transaction);
    }
}