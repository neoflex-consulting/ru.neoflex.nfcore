package ru.neoflex.nfcore.base.services.providers;

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
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.util.EmfJson;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.function.Supplier;

public abstract class AbstractSimpleFinderProvider implements FinderSPI {
    protected TransactionSPI lastTx;
    protected String warning;
    protected int skip = 0;
    protected int skipped = 0;
    protected int limit = -1;
    protected int idsLoaded = 0;
    protected long idsLoadedMs = 0;
    protected int resLoaded = 0;
    protected long resLoadedMs = 0;
    protected ResourceSet resourceSet;
    protected ObjectNode selector = new ObjectMapper().createObjectNode();

    private String getRev(URI uri) {
        String query = uri.query();
        if (query == null || !query.contains("rev=")) {
            return null;
        }
        return query.split("rev=")[1];
    }

    @Override
    public JsonNode getResult() throws IOException {
        ObjectMapper mapper = EmfJson.createMapper();
        ObjectNode root = mapper.createObjectNode();
        ArrayNode docs = root.withArray("docs");
        for (Resource resource: new ArrayList<>(getResourceSet().getResources())) {
            ObjectNode doc = docs.addObject();
            URI uri = resource.getURI();
            doc.put("_id", lastTx.getStore().getId(resource));
            doc.put("_rev", getRev(uri));
            doc.put("contents", mapper.valueToTree(resource));
        }
        root.put("warning", getWarning());
        root.put("execution_stats", getExecutionStats());
        return root;
    }

    @Override
    public void setSelector(ObjectNode selector) {
        this.selector = selector;
    }

    @Override
    public ObjectNode selector() {
        return selector;
    }

    @Override
    public void setSkip(Integer value) {
        skip = value;
    }

    @Override
    public void setLimit(Integer value) {
        limit = value;
    }

    @Override
    public void addSort(String field, SortOrder order) {

    }

    @Override
    public void addSort(String field) {

    }

    @Override
    public void addField(String field) {

    }

    @Override
    public void setBookmark(String key) {

    }

    void findResources(ObjectNode query, TransactionSPI tx, Consumer<Supplier<Resource>> consumer) throws IOException {
        if (query.has("id")) {
            String id = query.get("id").asText();
            findResourcesById(id, tx, consumer);
            return;
        }
        JsonNode contents = query.get("contents");
        if (contents != null && contents instanceof ObjectNode) {
            JsonNode classURI = contents.get("eClass");
            if (classURI != null) {
                ResourceSet resourceSet = tx.getStore().createResourceSet(tx);
                EClass eClass = (EClass) resourceSet.getEObject(URI.createURI(classURI.asText()), false);
                if (eClass != null) {
                    String name = null;
                    EStructuralFeature nameSF = Store.qualifiedNameDelegate.apply(eClass);
                    if (nameSF != null) {
                        JsonNode nameNode = contents.get(nameSF.getName());
                        if (nameNode != null) {
                            name = nameNode.asText();
                        }
                    }
                    findResourcesByClass(eClass, name, tx, consumer);
                    return;
                }
            }
        }
        warning = "No index used";
        findAll(tx, consumer);
    }

    @Override
    public void execute(TransactionSPI tx) throws IOException {
        long startTime = System.currentTimeMillis();
        lastTx = tx;
        StoreSPI store = tx.getStore();
        resourceSet = store.createResourceSet(tx);
        idsLoaded = 0;
        skipped = 0;
        resLoaded = 0;
        findResources(selector, tx, resourceSupplier -> {
            ++idsLoaded;
            if (skip > 0 && skipped < skip) {
                return;
            }
            if (limit >= 0 && resLoaded >= limit) {
                return;
            }
            Resource resource = resourceSupplier.get();
            String id = tx.getStore().getId(resource);
            String rev = getRev(resource.getURI());
            if (match(id, rev, resource.getContents().get(0), selector)) {
                if (skip > 0) {
                    ++skipped;
                    return;
                }
                resourceSet.getResources().add(resource);
                ++resLoaded;
            }
        });
        long idsLoadedTime = System.currentTimeMillis();
        long resLoadedTime = System.currentTimeMillis();
        idsLoadedMs = idsLoadedTime - startTime;
        resLoadedMs = resLoadedTime - idsLoadedTime;
    }

    private boolean match(String id, String rev, EObject eObject, ObjectNode query) {
        JsonNode _id = query.get("id");
        if (_id != null && !Objects.equals(_id.textValue(), id)) {
            return false;
        }
        JsonNode _rev = query.get("rev");
        if (_rev != null && !Objects.equals(_rev.textValue(), rev)) {
            return false;
        }
        JsonNode contents = query.get("contents");
        if (contents != null) {
            if (!matchNodes(eObject, contents)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchOp(String op, Object object, JsonNode query) {
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
            return object.toString().equals(query.asText());
        }
        if ("$ne".equals(op)) {
            return !object.equals(query);
        }
        if ("$exists".equals(op)) {
            return query.asBoolean() == (object != null);
        }
        if ("$size".equals(op)) {
            return matchSize(object, query);
        }
        if ("$type".equals(op)) {
            return query.asText().equals(object.getClass().getSimpleName());
        }
        if ("$in".equals(op)) {
            return matchIn(object, query);
        }
        if ("$nin".equals(op)) {
            return !matchIn(object, query);
        }
        if ("$regex".equals(op)) {
            return object.toString().matches(query.asText());
        }
        return false;
    }

    private int compare(Object object, JsonNode query) {
        if (object instanceof Number && query.isNumber()) {
            return new BigDecimal(object.toString()).compareTo(query.decimalValue());
        }
        if (object instanceof String && query.isTextual()) {
            return ((String) object).compareTo(query.asText());
        }
        if (object instanceof Boolean && query.isBoolean()) {
            return new Boolean((Boolean) object).compareTo(query.asBoolean());
        }
        throw new IllegalArgumentException("Can't compare values: " + object.toString() + ", " + query.toString());
    }

    private boolean matchSize(Object object, JsonNode query) {
        return object instanceof List && ((List) object).size() == query.asInt();
    }
    private boolean matchLt(Object object, JsonNode query) {
        return compare(object, query) < 0;
    }

    private boolean matchLe(Object object, JsonNode query) {
        return compare(object, query) <= 0;
    }

    private boolean matchGt(Object object, JsonNode query) {
        return compare(object, query) > 0;
    }

    private boolean matchGe(Object object, JsonNode query) {
        return compare(object, query) >= 0;
    }

    private boolean matchElemMatch(Object object, JsonNode query) {
        if (!(object instanceof List)) {
            return false;
        }
        for (Object objectNode: (List) object) {
            if (matchNodes(objectNode, query)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchAllMatch(Object object, JsonNode query) {
        if (!(object instanceof List)) {
            return false;
        }
        for (Object objectNode: (List) object) {
            if (!matchNodes(objectNode, query)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchNot(Object object, JsonNode query) {
        return !matchNodes(object, query);
    }

    private boolean matchAll(Object object, JsonNode query) {
        if (!(object instanceof List)) {
            return false;
        }
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode queryNode: query) {
            boolean found = false;
            for (Object objectNode: (List) object) {
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

    private boolean matchNor(Object object, JsonNode query) {
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

    private boolean matchIn(Object object, JsonNode query) {
        if (!query.isArray()) {
            return false;
        }
        for (JsonNode node: query) {
            if (object.toString().equals(node.asText())) {
                return true;
            }
        }
        return false;
    }

    private boolean matchNodes(Object object, JsonNode query) {
        if (object == null) {
            return query == null || query.isNull();
        }
        if (query == null) {
            return true;
        }
        if (object instanceof EObject || object instanceof List) {
            if (!query.isObject()) {
                return false;
            }
            return matchFields(object, query);
        }
        return matchPlain(object, query);
    }

    private boolean matchPlain(Object object, JsonNode query) {
        if (query.isObject()) {
            return matchFields(object, query);
        }
        return object.toString().equals(query.asText());
    }

    private boolean matchAnd(Object object, JsonNode query) {
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

    private Object getField(Object object, String name) {
        if (object instanceof EObject) {
            EObject eObject = (EObject) object;
            EClass eClass = eObject.eClass();
            EStructuralFeature sf = eClass.getEStructuralFeature(name);
            if (sf != null) {
                return eObject.eGet(sf);
            }
        }
        return null;
    }

    private boolean matchFields(Object object, JsonNode query) {
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
                continue;
            }
            if (fieldName.equals("eClass")) {
                if (!EcoreUtil.getURI(((EObject) object).eClass()).toString().equals(queryNode.asText())) {
                    return false;
                }
                continue;
            }
            Object objectNode = getField(object, unescape(fieldName));
            if (!matchNodes(objectNode, queryNode)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchOr(Object object, JsonNode query) {
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

    @Override
    public ObjectNode getExecutionStats() {
        ObjectNode executionStats = new ObjectMapper().createObjectNode();
        executionStats.put("idsLoaded", idsLoaded);
        executionStats.put("idsLoadedMs", idsLoadedMs);
        executionStats.put("resLoaded", resLoaded);
        executionStats.put("resLoadedMs", resLoadedMs);
        return executionStats;
    }

    @Override
    public String getBookmark() {
        return null;
    }

    @Override
    public String getWarning() {
        return warning;
    }

    @Override
    public ResourceSet getResourceSet() throws IOException {
        return resourceSet;
    }

    @Override
    public void useIndex(String designDoc, String indexName) {

    }

    @Override
    public void useIndex(String designDoc) {

    }

    @Override
    public void setUpdate(boolean value) {

    }

    @Override
    public void setExecutionStats(boolean value) {

    }

    protected abstract void findResourcesByClass(EClass eClass, String name, TransactionSPI tx, Consumer<Supplier<Resource>> consumer);

    protected abstract void findResourcesById(String id, TransactionSPI tx, Consumer<Supplier<Resource>> consumer);
}
