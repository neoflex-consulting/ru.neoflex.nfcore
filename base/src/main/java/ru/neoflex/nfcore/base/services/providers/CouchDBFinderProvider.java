package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;

public class CouchDBFinderProvider implements FinderSPI {
    protected ObjectNode result;
    CouchDBStoreProvider store;
    ObjectMapper mapper;
    ObjectNode rootNode;
    ArrayNode fields;
    ArrayNode sort;

    public CouchDBFinderProvider(CouchDBStoreProvider store) {
        this.store = store;
        this.mapper = store.createMapper();
        this.rootNode = mapper.createObjectNode();
    }

    @Override
    public JsonNode getResult() {
        return result;
    }

    @Override
    public void selector(JsonNode selector) {
        rootNode.set("selector", selector);
    }

    @Override
    public ObjectNode selector() {
        return rootNode.with("selector");
    }

    @Override
    public void limit(Integer limit) {
        rootNode.put("limit", limit);
    }

    @Override
    public void field(String field) {
        if (fields == null) {
            fields = rootNode.putArray("fields");
        }
        fields.add(field);
    }

    @Override
    public void sort(String field, SortOrder order) {
        getSort().addObject().put(field, order.toString());
    }

    public ArrayNode getSort() {
        if (sort == null) {
            sort = rootNode.putArray("sort");
        }
        return sort;
    }

    @Override
    public void sort(String field) {
        getSort().add(field);
    }

    @Override
    public void skip(Integer value) {
        rootNode.put("limit", value);
    }

    @Override
    public void bookmark(String key) {
        rootNode.put("bookmark", key);
    }

    @Override
    public void execute() throws IOException {
        result = (ObjectNode) store.getDefaultClient().post("_find", mapper.writeValueAsString(rootNode));
    }

    @Override
    public ObjectNode getExecutionStats() {
        return result.with("execution_stats");
    }

    @Override
    public String getBookmark() {
        return result.get("bookmark") != null ? result.get("bookmark").asText() : null;
    }

    @Override
    public String getWarning() {
        return result.get("warning") != null ? result.get("warning").asText() : null;
    }

    @Override
    public ResourceSet getResourceSet() throws IOException {
        ResourceSet resourceSet = store.createResourceSet();
        if (result != null) {
            for (JsonNode doc: result.withArray("docs")) {
                String id = doc.get("_id").textValue();
                String rev = doc.get("_rev").textValue();
                JsonNode contents = doc.get("contents");
                if (!contents.isNull()) {
                    URI uri = store.getUriByIdAndRev(id, rev);
                    store.treeToResource(resourceSet, uri, contents);
                }
            }
        }
        return resourceSet;
    }

    @Override
    public void useIndex(String designDoc, String indexName) {
        rootNode.putArray("use_index").add(designDoc).add(indexName);
    }

    @Override
    public void useIndex(String designDoc) {
        rootNode.put("use_index", designDoc);
    }

    @Override
    public void update(boolean value) {
        rootNode.put("update", value);
    }

    @Override
    public void executionStats(boolean value) {
        rootNode.put("execution_stats", value);
    }

}
