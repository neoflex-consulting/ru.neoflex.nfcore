package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.util.*;

import static java.lang.Integer.max;
import static java.lang.Integer.min;

public class Finder {
    private String warning;
    private int skip = 0;
    private int limit = -1;
    private ResourceSet resourceSet;
    private ObjectNode selector = new ObjectMapper().createObjectNode();

    private Finder() {
    }

    public static Finder create() {
        return new Finder();
    }

    public static Finder create(EClass eClass) {
        Finder finder = create();
        finder.selector().with("contents").put("eClass", EcoreUtil.getURI(eClass).toString());
        return finder;
    }

    public static Finder create(EClass eClass, Map<String, String> attributes) {
        Finder finder = create(eClass);
        for (String key: attributes.keySet()) {
            finder.selector().with("contents").put(key, attributes.get(key));
        }
        return finder;
    }

    public Finder skip(int value) {
        skip = value;
        return this;
    }

    public Finder limit(int value) {
        limit = value;
        return this;
    }


    public Finder execute(Transaction tx) throws IOException {
        Database database = tx.getDatabase();
        List<EntityId> ids = findIds(selector, tx);
        resourceSet = database.createResourceSet(tx);
        ObjectMapper mapper = new ObjectMapper();
        int startIndex = max(min(skip, ids.size()), 0);
        int length = min(limit, ids.size() - startIndex);
        for (EntityId entityId: ids.subList(startIndex, startIndex + length)) {
            Entity entity = tx.load(entityId);
            ObjectNode object = (ObjectNode) mapper.readTree(entity.getContent());
            if (match(entity, object, selector)) {
                Resource resource = resourceSet.createResource(database.createURI(entity.getId(), entity.getRev()));
                database.loadResource(object, resource);
            }
        }
        return this;
    }

    private boolean match(EntityId entityId, ObjectNode object, ObjectNode query) throws IOException {
        String _id = query.get("id").asText();
        if (_id != null && !_id.equals(entityId.getId())) {
            return false;
        }
        String _rev = query.get("rev").asText();
        if (_rev != null && !_rev.equals(entityId.getRev())) {
            return false;
        }
        JsonNode contents = query.get("contents");
        if (contents != null) {
            if (!matchNodes(object, contents)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchOp(String op, JsonNode object, JsonNode query) {
        if ("$and".equals(op)) {
            return matchAnd(object, query);
        }
        if ("$or".equals(op)) {
            return matchOr(object, query);
        }
        if ("$not".equals(op)) {
            return matchNot(object, query);
        }
        if ("$nor".equals(op)) {
            return matchNor(object, query);
        }
        if ("$all".equals(op)) {
            return matchAll(object, query);
        }
        if ("$elemMatch".equals(op)) {
            return matchElemMatch(object, query);
        }
        if ("$allMatch".equals(op)) {
            return matchAllMatch(object, query);
        }
        if ("$lt".equals(op)) {
            return matchLt(object, query);
        }
        if ("$gt".equals(op)) {
            return matchGt(object, query);
        }
        if ("$lte".equals(op)) {
            return matchLe(object, query);
        }
        if ("$gte".equals(op)) {
            return matchGe(object, query);
        }
        if ("$eq".equals(op)) {
            return object.equals(query);
        }
        if ("$ne".equals(op)) {
            return !object.equals(query);
        }
        if ("$exists".equals(op)) {
            return query.asBoolean() == (object != null && !object.isNull() && !object.isMissingNode());
        }
        if ("$size".equals(op)) {
            return matchSize(object, query);
        }
        if ("$type".equals(op)) {
            return query.asText().equals(object.getNodeType().name());
        }
        if ("$in".equals(op)) {
            return matchIn(object, query);
        }
        if ("$nin".equals(op)) {
            return !matchIn(object, query);
        }
        if ("$regex".equals(op)) {
            return object.asText().matches(query.asText());
        }
        return false;
    }

    private int compare(JsonNode object, JsonNode query) {
        if (object.isNumber() && query.isNumber()) {
            return object.decimalValue().compareTo(query.decimalValue());
        }
        if (object.isTextual() && query.isTextual()) {
            return object.asText().compareTo(query.asText());
        }
        if (object.isBoolean() && query.isBoolean()) {
            return new Boolean(object.asBoolean()).compareTo(query.asBoolean());
        }
        throw new IllegalArgumentException("Can't compare values: " + object.toString() + ", " + query.toString());
    }

    private boolean matchSize(JsonNode object, JsonNode query) {
        return object.isArray() && object.size() == query.asInt();
    }
    private boolean matchLt(JsonNode object, JsonNode query) {
        return compare(object, query) < 0;
    }

    private boolean matchLe(JsonNode object, JsonNode query) {
        return compare(object, query) <= 0;
    }

    private boolean matchGt(JsonNode object, JsonNode query) {
        return compare(object, query) > 0;
    }

    private boolean matchGe(JsonNode object, JsonNode query) {
        return compare(object, query) >= 0;
    }

    private boolean matchElemMatch(JsonNode object, JsonNode query) {
        if (!object.isArray()) {
            return false;
        }
        for (JsonNode objectNode: object) {
            if (matchNodes(objectNode, query)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchAllMatch(JsonNode object, JsonNode query) {
        if (!object.isArray()) {
            return false;
        }
        for (JsonNode objectNode: object) {
            if (!matchNodes(objectNode, query)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchNot(JsonNode object, JsonNode query) {
        return !matchNodes(object, query);
    }

    private boolean matchAll(JsonNode object, JsonNode query) {
        if (!object.isArray()) {
            return false;
        }
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode queryNode: query) {
            boolean found = false;
            for (JsonNode objectNode: object) {
                if (objectNode.equals(queryNode)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }

    private boolean matchNor(JsonNode object, JsonNode query) {
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode node: query) {
            if (matchNodes(object, node)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchIn(JsonNode object, JsonNode query) {
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode node: query) {
            if (object.equals(node)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchNodes(JsonNode object, JsonNode query) {
        if (object == null || object.isNull()) {
            return query == null || query.isNull();
        }
        if (query == null) {
            return true;
        }
        if (object.isObject() || object.isArray()) {
            if (!query.isObject()) {
                return false;
            }
            return matchFields(object, query);
        }
        return matchPlain(object, query);
    }

    private boolean matchPlain(JsonNode object, JsonNode query) {
        if (query.isObject()) {
            return matchFields(object, query);
        }
        return object.equals(query);
    }

    private boolean matchAnd(JsonNode object, JsonNode query) {
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode node: query) {
            if (!matchNodes(object, node)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchFields(JsonNode object, JsonNode query) {
        if (!query.isObject()) {
            return false;
        }
        for (Iterator<String> it = query.fieldNames(); it.hasNext();) {
            String fieldName = it.next();
            JsonNode queryNode = query.get(fieldName);
            if (fieldName.startsWith("$")) {
                if (!matchOp(fieldName, object, queryNode)) {
                    return false;
                }
            }
            JsonNode objectNode = object.get(unescape(fieldName));
            if (!matchNodes(objectNode, queryNode)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchOr(JsonNode object, JsonNode query) {
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode node: query) {
            if (matchNodes(object, node)) {
                return true;
            }
        }
        return false;
    }

    private String unescape(String fieldName) {
        return fieldName.replaceAll("^[\\\\]\\$", "\\$");
    }

    private List<EntityId> findIds(ObjectNode query, Transaction tx) throws IOException {
        Database database = tx.getDatabase();
        if (query.has("id")) {
            String id = query.get("id").asText();
            EntityId entityId = new EntityId(id, null);
            if (Files.exists(tx.getIdPath(entityId))) {
                return Collections.singletonList(entityId);
            }
            return Collections.emptyList();
        }
        JsonNode contents = query.get("contents");
        if (contents != null && contents instanceof ObjectNode) {
            JsonNode classURI = contents.get("eClass");
            if (classURI != null) {
                ResourceSet resourceSet = database.createResourceSet(tx);
                EClass eClass = (EClass) resourceSet.getEObject(URI.createURI(classURI.asText()), false);
                if (eClass != null) {
                    String name = null;
                    EStructuralFeature nameSF = database.getQNameFeature(eClass);
                    if (nameSF != null) {
                        String featureName = nameSF.getName();
                        name = contents.get(featureName).asText();
                    }
                    List<IndexEntry> ieList = database.findEClassIndexEntries(eClass, name, tx);
                    List<EntityId> result = new ArrayList<>();
                    for (IndexEntry ie: ieList) {
                        result.add(new EntityId(new String(ie.getContent()), null));
                    }
                    return result;
                }
            }
        }
        setWarning("No index used");
        return tx.all();
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }

    public ResourceSet getResourceSet() {
        return resourceSet;
    }

    public ObjectNode selector() {
        return selector;
    }
}
