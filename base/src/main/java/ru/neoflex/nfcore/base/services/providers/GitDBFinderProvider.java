package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import ru.neoflex.meta.gitdb.Database;
import ru.neoflex.meta.gitdb.Finder;
import ru.neoflex.meta.gitdb.Transaction;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GitDBFinderProvider extends Finder implements FinderSPI {
    private Transaction lastTx;

    @Override
    public JsonNode getResult() throws IOException {
        Database db = lastTx.getDatabase();
        ObjectMapper mapper = db.getMapper();
        ObjectNode root = mapper.createObjectNode();
        ArrayNode docs = root.withArray("docs");
        for (Resource resource: new ArrayList<>(getResourceSet().getResources())) {
            ObjectNode doc = docs.addObject();
            URI uri = resource.getURI();
            doc.put("_id", db.getId(uri));
            doc.put("_rev", db.getRev(uri));
            doc.put("contents", mapper.valueToTree(resource));
        }
        root.put("warning", getWarning());
        root.put("execution_stats", getExecutionStats());
        return root;
    }

    @Override
    public void setSelector(ObjectNode selector) {
        super.selector(selector);
    }

    @Override
    public void setSkip(Integer value) {
        super.skip(value);
    }

    @Override
    public void setLimit(Integer limit) {
        super.limit(limit);
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

    @Override
    public void execute(TransactionSPI tx) throws IOException {
        this.lastTx = (GitDBTransactionProvider) tx;
        super.execute(lastTx);
    }

    @Override
    public String getBookmark() {
        return null;
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
}
