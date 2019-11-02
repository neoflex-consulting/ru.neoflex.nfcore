package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.services.providers.CouchDBFinderProvider;
import ru.neoflex.nfcore.base.services.providers.CouchDBStoreProvider;
import ru.neoflex.nfcore.base.services.providers.FinderSPI;
import ru.neoflex.nfcore.base.services.providers.StoreSPI;

import javax.annotation.PostConstruct;
import java.io.IOException;

@Service
public class Store {
    @Autowired
    StoreSPI provider;

    @PostConstruct
    public void init() {
    }

    public ResourceSet createResourceSet() {
        return provider.createResourceSet();
    }

    public Resource createEmptyResource(ResourceSet resourceSet) {
        return provider.createEmptyResource(resourceSet);
    }

    public Resource createEObject(EObject eObject) throws IOException {
        Resource resource = createEmptyResource();
        resource.getContents().add(eObject);
        return saveResource(resource);
    }

    public Resource updateEObject(String ref, EObject eObject) throws IOException {
        URI uri = getUriByRef(ref);
        Resource resource = createResourceSet().createResource(uri);
        resource.getContents().add(eObject);
        return saveResource(resource);
    }

    public Resource saveResource(Resource resource) throws IOException {
        return provider.saveResource(resource);
    }

    public Resource createEmptyResource() {
        ResourceSet resourceSet = provider.createResourceSet();
        return provider.createEmptyResource(resourceSet);
    }

    public String getRef(Resource resource) {
        return provider.getRef(resource);
    }

    public Resource loadResource(String ref) throws IOException {
        URI uri = provider.getUriByRef(ref);
        return provider.loadResource(uri);
    }

    public Resource loadResource(URI uri) throws IOException {
        return provider.loadResource(uri);
    }

    public void deleteResource(String ref) throws IOException {
        URI uri = provider.getUriByRef(ref);
        provider.deleteResource(uri);
    }

    public void deleteResource(URI uri) throws IOException {
        provider.deleteResource(uri);
    }

    public Resource treeToResource(String ref, JsonNode contents) throws JsonProcessingException {
        URI uri = getUriByRef(ref);
        return provider.treeToResource(provider.createResourceSet(), uri, contents);
    }

    public URI getUriByIdAndRev(String id, String rev) {
        return provider.getUriByIdAndRev(id, rev);
    }

    public URI getUriByRef(String ref) {
        return provider.getUriByRef(ref);
    }

    public ObjectMapper createMapper() {
        return provider.createMapper();
    }

    public FinderSPI createFinderProvider () {
        return provider.createFinderProvider();
    }
}
