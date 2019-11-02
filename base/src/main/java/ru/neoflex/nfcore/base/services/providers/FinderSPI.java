package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.resource.ResourceSet;
import ru.neoflex.nfcore.base.util.DocFinder;

import java.io.IOException;

public interface FinderSPI {
    enum SortOrder {
        asc,
        desc
    }

    JsonNode getResult();

    void selector(JsonNode selector);

    ObjectNode selector();

    void skip(Integer value);

    void limit(Integer limit);

    void sort(String field, SortOrder order);

    void sort(String field);

    void field(String field);

    void bookmark(String key);

    void execute() throws IOException;

    ObjectNode getExecutionStats();

    String getBookmark();

    String getWarning();

    ResourceSet getResourceSet() throws IOException;

    void useIndex(String designDoc, String indexName);

    void useIndex(String designDoc);

    void update(boolean value);

    void executionStats(boolean value);
}
