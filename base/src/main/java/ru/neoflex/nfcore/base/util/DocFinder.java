package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.services.providers.FinderSPI;

import java.io.IOException;
import java.util.Map;

public class DocFinder {

    FinderSPI provider;

    private DocFinder(Store store) {
        this.provider = store.createFinderProvider();
        this.limit(Integer.MAX_VALUE);
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

    public JsonNode getResult() {
        return provider.getResult();
    }

    public DocFinder selector(JsonNode selector) {
        provider.selector(selector);
        return this;
    }

    public ObjectNode selector() {
        return provider.selector();
    }

    public DocFinder limit(Integer limit) {
        provider.limit(limit);
        return this;
    }

    public DocFinder field(String field) {
        provider.field(field);
        return this;
    }

    public DocFinder sort(String field, FinderSPI.SortOrder order) {
        provider.sort(field, order);
        return this;
    }

    public DocFinder sort(String field) {
        provider.sort(field);
        return this;
    }

    public DocFinder skip(Integer value) {
        provider.skip(value);
        return this;
    }

    public DocFinder bookmark(String key) {
        provider.bookmark(key);
        return this;
    }

    public DocFinder execute() throws IOException {
        provider.execute();
        return this;
    }

    public ObjectNode getExecutionStats() {
        return provider.getExecutionStats();
    }

    public String getBookmark() {
        return provider.getBookmark();
    }

    public String getWarning() {
        return provider.getWarning();
    }

    public ResourceSet getResourceSet() throws IOException {
        return provider.getResourceSet();
    }

    public DocFinder useIndex(String designDoc, String indexName) {
        provider.useIndex(designDoc, indexName);
        return this;
    }

    public DocFinder useIndex(String designDoc) {
        provider.useIndex(designDoc);
        return this;
    }

    public void update(boolean value) {
        provider.update(value);
    }

    public DocFinder executionStats(boolean value) {
        provider.executionStats(value);
        return this;
    }
}
