package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.*;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.utils.ValueWriter;
import ru.neoflex.nfcore.base.services.Store;

import java.io.IOException;
import java.util.List;
import java.util.Map;
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

    public static Object fromJson(Store store, EClassifier eType, Object arg) throws IOException {
        if (arg == null) {
            return null;
        }
        if (eType.getName().equals("EStringToStringMapEntry")) {
            ObjectMapper oMapper = new ObjectMapper();
            Map<String, String> params = oMapper.convertValue(arg, Map.class);
            EMap<String, String> updatedParams = new BasicEMap<String, String>();
            for(Map.Entry<String, String> entry : params.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                updatedParams.put(key, value);
            }
            return updatedParams;
        }
        if (eType instanceof EClass) {
            EClass eClass = (EClass) eType;
            if (arg instanceof Map) {
                Map node = (Map) arg;
                String ref = (String) node.get("$ref");
                if (ref != null) {
                    Resource resource = store.loadResource(ref);
                    return resource.getContents().get(0);
                }
                else {
                    EObject eObject = EcoreUtil.create(eClass);
                    for (EAttribute attr: eClass.getEAllAttributes()) {
                        if (node.containsKey(attr.getName())) {
                            eObject.eSet(attr, node.get(attr.getName()));
                        }
                    }
                }
            }
            if (arg instanceof List) {
                List<Map> argList = (List<Map>) arg;
                EList<EObject> conditions = new BasicEList();
                for (Map node: argList) {
                    EObject eObject = EcoreUtil.create(eClass);
                    for (EAttribute attr: eClass.getEAllAttributes()) {
                        if (node.containsKey(attr.getName())) {
                            eObject.eSet(attr, node.get(attr.getName()));
                        }
                    }
                    conditions.add(eObject);
                }
                return conditions;
            }
        }
        if (eType instanceof EDataType) {
            EDataType eDataType = (EDataType) eType;
            return EcoreUtil.createFromString(eDataType, arg.toString());
        }
        return arg;
    }

    public static EList<?> createEOperationArguments(Store store, EOperation eOperation, List<Object> args) {
        return ECollections.toEList(IntStream.range(0, eOperation.getEParameters().size()).mapToObj(i -> {
            if (i >= args.size()) {
                return null;
            }
            Object arg = args.get(i);
            EParameter eParameter = eOperation.getEParameters().get(i);
            EClassifier eType = eParameter.getEType();
            try {
                return fromJson(store, eType, arg);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).collect(Collectors.toList()));
    }
}
