package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.utils.ValueWriter;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

public class EMFMapper {
    public static EMFModule getModule() {
        EMFModule emfModule = new EMFModule();
        emfModule.configure(EMFModule.Feature.OPTION_USE_ID, true);
        emfModule.setTypeInfo(new EcoreTypeInfo("eClass"));
        emfModule.setIdentityInfo(new EcoreIdentityInfo("_id",
                new ValueWriter<EObject, Object>() {
                    @Override
                    public Object writeValue(EObject eObject, SerializerProvider context) {
                        URI eObjectURI = EMFContext.getURI(context, eObject);
                        if (eObjectURI == null) {
                            return null;
                        }
                        return eObjectURI.fragment();
                    }
                }));
        return emfModule;
    }

    public static ObjectMapper getMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(getModule());
        mapper.configure(WRITE_DATES_AS_TIMESTAMPS, false);
        return mapper;
    }

    public static Resource treeToResource(ResourceSet resourceSet, URI uri, JsonNode contents) throws JsonProcessingException {
        Resource resource = resourceSet.createResource(uri);
        ContextAttributes attributes = ContextAttributes
                .getEmpty()
                .withSharedAttribute("resourceSet", resourceSet)
                .withSharedAttribute("resource", resource);
        EMFMapper.getMapper().reader()
                .with(attributes)
                .withValueToUpdate(resource)
                .treeToValue(contents, Resource.class);
        return resource;
    }


}
