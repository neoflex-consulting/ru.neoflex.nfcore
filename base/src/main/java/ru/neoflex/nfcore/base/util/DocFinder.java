package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import ru.neoflex.nfcore.base.services.Store;

import java.io.IOException;
import java.util.Map;

public class DocFinder {
    public JsonNode getResult() {
        return result;
    }

    public enum SortOrder {
        asc,
        desc
    }

    Store store;
    ObjectMapper mapper;
    ObjectNode rootNode;
    ArrayNode fields;
    ArrayNode sort;
    private ObjectNode result;

    private DocFinder(Store store) {
        this.store = store;
        this.mapper = EMFMapper.getMapper();
        this.rootNode = mapper.createObjectNode();
        this.limit(Integer.MAX_VALUE);
    }

    public DocFinder selector(JsonNode selector) {
        rootNode.set("selector", selector);
        return this;
    }

    public ObjectNode selector() {
        return rootNode.with("selector");
    }

    public DocFinder limit(Integer limit) {
        rootNode.put("limit", limit);
        return this;
    }

    public DocFinder field(String field) {
        if (fields == null) {
            fields = rootNode.putArray("fields");
        }
        fields.add(field);
        return this;
    }

    public DocFinder sort(String field, SortOrder order) {
        getSort().addObject().put(field, order.toString());
        return this;
    }

    private ArrayNode getSort() {
        if (sort == null) {
            sort = rootNode.putArray("sort");
        }
        return sort;
    }

    public DocFinder sort(String field) {
        getSort().add(field);
        return this;
    }

    public DocFinder skip(Integer value) {
        rootNode.put("limit", value);
        return this;
    }

    public DocFinder useIndex(String designDoc, String indexName) {
        rootNode.putArray("use_index").add(designDoc).add(indexName);
        return this;
    }

    public DocFinder useIndex(String designDoc) {
        rootNode.put("use_index", designDoc);
        return this;
    }

    public DocFinder bookmark(String key) {
        rootNode.put("bookmark", key);
        return this;
    }

    public DocFinder update(boolean value) {
        rootNode.put("update", value);
        return this;
    }

    public DocFinder executionStats(boolean value) {
        rootNode.put("execution_stats", value);
        return this;
    }

    public static DocFinder create(Store store) {
        DocFinder DocFinder = new DocFinder(store);
        return DocFinder;
    }

    public static DocFinder create(Store store, EClass eClass) {
        DocFinder docFinder = DocFinder.create(store);
        docFinder.selector().with("contents").put("eClass", EcoreUtil.getURI(eClass).toString());
        return docFinder;
    }

    public static DocFinder create(Store store, EClass eClass, Map<String, String> attributes) {
        DocFinder docFinder = DocFinder.create(store, eClass);
        for (String key: attributes.keySet()) {
            docFinder.selector().with("contents").put(key, attributes.get(key));
        }
        return docFinder;
    }

    public DocFinder execute() throws IOException {
        result = (ObjectNode) store.getDefaultClient().post("_find", mapper.writeValueAsString(rootNode));
        return this;
    }

    public ObjectNode getExecutionStats() {
        return result.with("execution_stats");
    }

    public String getBookmark() {
        return result.get("bookmark") != null ? result.get("bookmark").asText() : null;
    }

    public String getWarning() {
        return result.get("warning") != null ? result.get("warning").asText() : null;
    }

    public ResourceSet getResourceSet() throws IOException {
        ResourceSet resourceSet = store.getResourceSet();
        if (result != null) {
            for (JsonNode doc: result.withArray("docs")) {
                String id = doc.get("_id").textValue();
                String rev = doc.get("_rev").textValue();
                JsonNode contents = doc.get("contents");
                if (!contents.isNull()) {
                    URI uri = store.getUriByIdAndRev(id, rev);
                    EMFMapper.treeToResource(resourceSet, uri, contents);
                }
            }
        }
        return resourceSet;
    }
}
