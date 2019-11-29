package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClassifier;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EOperation;
import org.eclipse.emf.ecore.EParameter;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.utils.ValueWriter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

public class EmfJson {
    public static Resource treeToResource(ResourceSet resourceSet, URI uri, JsonNode contents) throws IOException {
        Resource resource = resourceSet.createResource(uri);
        return treeToResource(contents, resource);
    }

    public static ObjectMapper createMapper() {
        ObjectMapper mapper = new ObjectMapper();
        EMFModule emfModule = new EMFModule();
        emfModule.configure(EMFModule.Feature.OPTION_USE_ID, true);
        emfModule.setTypeInfo(new EcoreTypeInfo("eClass"));
        emfModule.setIdentityInfo(new EcoreIdentityInfo("_id",
                (ValueWriter<EObject, Object>) (eObject, context) -> {
                    URI eObjectURI = EMFContext.getURI(context, eObject);
                    if (eObjectURI == null) {
                        return null;
                    }
                    return eObjectURI.fragment();
                }));
        mapper.registerModule(emfModule);
        mapper.configure(WRITE_DATES_AS_TIMESTAMPS, false);
        return mapper;
    }

    public static Resource treeToResource(JsonNode contents, Resource resource) throws JsonProcessingException {
        ContextAttributes attributes = ContextAttributes
                .getEmpty()
                .withSharedAttribute("resourceSet", resource.getResourceSet())
                .withSharedAttribute("resource", resource);
        createMapper().reader()
                .with(attributes)
                .withValueToUpdate(resource)
                .treeToValue(contents, Resource.class);
        return resource;
    }

    public static EList<?> createEOperationArguments(EOperation eOperation, List<Object> args) {
        return ECollections.toEList(IntStream.range(0, eOperation.getEParameters().size()).mapToObj(i -> {
            if (i >= args.size()) {
                return null;
            }
            Object arg = args.get(i);
            EParameter eParameter = eOperation.getEParameters().get(i);
            EClassifier eType = eParameter.getEType();
            if (eType.getInstanceClass().isAssignableFrom(String.class)) {
                return arg;
            }
            return arg;
        }).collect(Collectors.toList()));
    }
}
