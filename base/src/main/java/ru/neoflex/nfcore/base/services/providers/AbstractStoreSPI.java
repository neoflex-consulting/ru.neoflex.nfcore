package ru.neoflex.nfcore.base.services.providers;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.springframework.beans.factory.annotation.Autowired;
import ru.neoflex.nfcore.base.components.Publisher;

import java.io.IOException;

public abstract class AbstractStoreSPI implements StoreSPI {
    @Autowired
    Publisher publisher;

    @Override
    public Resource saveResource(Resource resource) throws IOException {
        EObject eObject = resource.getContents().get(0);
        Publisher.BeforeSaveEvent beforeSaveEvent = new Publisher.BeforeSaveEvent(eObject);
        publisher.publish(beforeSaveEvent);
        if (beforeSaveEvent.getEObject() != null) {
            resource.getContents().add(beforeSaveEvent.getEObject());
            while (resource.getContents().size() > 1) {
                resource.getContents().remove(0);
            }
            resource.save(null);
            if (!resource.getContents().isEmpty()) {
                EObject savedObject = resource.getContents().get(0);
                Publisher.AfterSaveEvent afterSaveEvent = new Publisher.AfterSaveEvent(savedObject);
                publisher.publish(afterSaveEvent);
                if (afterSaveEvent.getEObject() != null) {
                    resource.getContents().add(afterSaveEvent.getEObject());
                    while (resource.getContents().size() > 1) {
                        resource.getContents().remove(0);
                    }
                }
            }
        }
        return resource;
    }

    @Override
    public Resource loadResource(URI uri, TransactionSPI tx) throws IOException {
        Resource resource = createResourceSet(tx).createResource(uri.trimFragment().trimQuery());
        resource.load(null);
        if (!resource.getContents().isEmpty()) {
            EObject eObject = resource.getContents().get(0);
            Publisher.AfterLoadEvent afterLoadEvent = new Publisher.AfterLoadEvent(eObject);
            publisher.publish(afterLoadEvent);
            //resource.getContents().clear();
            if (afterLoadEvent.getEObject() != null) {
                resource.getContents().add(afterLoadEvent.getEObject());
                while (resource.getContents().size() > 1) {
                    resource.getContents().remove(0);
                }
            }
        }
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
        EObject eObject = resource.getContents().get(0);
        Publisher.BeforeDeleteEvent beforeDeleteEvent = new Publisher.BeforeDeleteEvent(eObject);
        publisher.publish(beforeDeleteEvent);
        resourceSet.createResource(uri).delete(null);
        Publisher.AfterDeleteEvent afterDeleteEvent = new Publisher.AfterDeleteEvent(eObject);
        publisher.publish(afterDeleteEvent);
    }

}
