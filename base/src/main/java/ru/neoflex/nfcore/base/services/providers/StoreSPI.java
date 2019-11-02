package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;

public interface StoreSPI {
    URI getUriByIdAndRev(String id, String rev);

    Resource saveResource(Resource resource) throws IOException;

    URI getUriByRef(String ref);

    ResourceSet createResourceSet();

    Resource createEmptyResource(ResourceSet resourceSet);

    Resource loadResource(URI uri) throws IOException;

    void deleteResource(URI uri) throws IOException;

    String getRef(Resource resource);

    ObjectMapper createMapper();

    Resource treeToResource(ResourceSet resourceSet, URI uri, JsonNode contents) throws JsonProcessingException;

    FinderSPI createFinderProvider();
}
