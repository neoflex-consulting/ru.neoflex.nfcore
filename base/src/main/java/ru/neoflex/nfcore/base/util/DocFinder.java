package ru.neoflex.nfcore.base.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.services.providers.FinderSPI;
import ru.neoflex.nfcore.base.services.providers.GitDBTransactionProvider;
import ru.neoflex.nfcore.base.services.providers.NullTransactionProvider;
import ru.neoflex.nfcore.base.services.providers.TransactionSPI;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DocFinder {
    Store store;
    FinderSPI provider;

    private DocFinder(Store store) {
        this.store = store;
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

    public JsonNode getResult() throws IOException {
        return provider.getResult();
    }

    public DocFinder selector(ObjectNode selector) {
        provider.setSelector(selector);
        return this;
    }

    public ObjectNode selector() {
        return provider.selector();
    }

    public DocFinder limit(Integer limit) {
        provider.setLimit(limit);
        return this;
    }

    public DocFinder field(String field) {
        provider.addField(field);
        return this;
    }

    public DocFinder sort(String field, FinderSPI.SortOrder order) {
        provider.addSort(field, order);
        return this;
    }

    public DocFinder sort(String field) {
        provider.addSort(field);
        return this;
    }

    public DocFinder skip(Integer value) {
        provider.setSkip(value);
        return this;
    }

    public DocFinder bookmark(String key) {
        provider.setBookmark(key);
        return this;
    }

    public DocFinder execute() throws IOException {
        provider.execute(store.getCurrentTransaction());
        return this;
    }

    public DocFinder execute(TransactionSPI tx) throws IOException {
        provider.execute(tx);
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

    public List<Resource> getResources() throws IOException {
        return new ArrayList<>(provider.getResourceSet().getResources());
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
        provider.setUpdate(value);
    }

    public DocFinder executionStats(boolean value) {
        provider.setExecutionStats(value);
        return this;
    }
}
