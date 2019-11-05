package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;
import java.util.List;

public interface FinderSPI {
    enum SortOrder {
        asc,
        desc
    }

    JsonNode getResult() throws IOException;

    void setSelector(ObjectNode selector);

    ObjectNode selector();

    void setSkip(Integer value);

    void setLimit(Integer limit);

    void addSort(String field, SortOrder order);

    void addSort(String field);

    void addField(String field);

    void setBookmark(String key);

    void execute(TransactionSPI tx) throws IOException;

    ObjectNode getExecutionStats();

    String getBookmark();

    String getWarning();

    ResourceSet getResourceSet() throws IOException;

    void useIndex(String designDoc, String indexName);

    void useIndex(String designDoc);

    void setUpdate(boolean value);

    void setExecutionStats(boolean value);
}
