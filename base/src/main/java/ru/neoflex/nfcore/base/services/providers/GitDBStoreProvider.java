package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.gitdb.Database;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.services.Workspace;

import java.io.IOException;

@Service
@ConditionalOnProperty(name = "dbtype", havingValue = "gitdb", matchIfMissing = true)
public class GitDBStoreProvider implements StoreSPI {
    @Autowired
    Workspace workspace;

    @Override
    public URI getUriByIdAndRev(String id, String rev) {
        return workspace.getDatabase().createURI(id, rev);
    }

    @Override
    public Resource saveResource(Resource resource) throws IOException {
        resource.save(null);
        return resource;
    }

    @Override
    public URI getUriByRef(String ref) {
        return workspace.getDatabase().createURIByRef(ref);
    }

    @Override
    public ResourceSet createResourceSet(TransactionSPI tx) {
        return workspace.getDatabase().createResourceSet((Transaction) tx);
    }

    @Override
    public Resource createEmptyResource(ResourceSet resourceSet) {
        return workspace.getDatabase().createResource(resourceSet, null, null);
    }

    @Override
    public Resource loadResource(URI uri, TransactionSPI tx) throws IOException {
        Database db = workspace.getDatabase();
        Resource resource = db.createResourceSet((Transaction) tx).createResource(uri);
        resource.load(null);
        return resource;
    }

    @Override
    public void deleteResource(URI uri, TransactionSPI tx) throws IOException {
        Database db = workspace.getDatabase();
        Resource resource = db.createResourceSet((Transaction) tx).createResource(uri);
        resource.delete(null);
    }

    @Override
    public String getRef(Resource resource) {
        URI uri = resource.getURI();
        Database db = workspace.getDatabase();
        String ref = db.getId(uri);
        String query = uri.query();
        if (query != null) {
            ref = ref + "?" + query;
        }
        String fragment = uri.fragment();
        if (fragment != null) {
            ref = ref + "#" + fragment;
        }
        return ref;
    }

    @Override
    public String getId(Resource resource) {
        String id = workspace.getDatabase().getResourceId(resource);
        return id;
    }

    @Override
    public ObjectMapper createMapper() {
        return workspace.getDatabase().getMapper();
    }

    @Override
    public Resource treeToResource(ResourceSet resourceSet, URI uri, JsonNode contents) throws IOException {
        Resource resource = resourceSet.createResource(uri);
        return workspace.getDatabase().loadResource(contents, resource);
    }

    @Override
    public FinderSPI createFinderProvider() {
        return new GitDBFinderProvider();
    }

    public Transaction createTransaction(boolean readOnly) throws IOException {
        return new GitDBTransactionProvider(
                workspace.getDatabase(),
                workspace.getCurrentBranch(),
                readOnly ? Transaction.LockType.READ : Transaction.LockType.WRITE
        );
    }

    @Override
    public TransactionSPI getCurrentTransaction() throws IOException {
        {
            Transaction current = Transaction.getCurrent();
            return (GitDBTransactionProvider)current;
        }
    }

    public TransactionSPI setCurrentTransaction(TransactionSPI tx) throws IOException {
        Transaction current = Transaction.getCurrent();
        Transaction.setCurrent((Transaction)tx);
        return current instanceof TransactionSPI ? (TransactionSPI)current : null;
    }

    @Override
    public <R> R inTransaction(boolean readOnly, Transactional<R> f) throws Exception {
        return workspace.getDatabase().inTransaction(
                () -> createTransaction(readOnly),
                tx -> {
                    TransactionSPI old = getCurrentTransaction();
                    setCurrentTransaction((TransactionSPI) tx);
                    try {
                        return f.call((TransactionSPI) tx);
                    } finally {
                        setCurrentTransaction(old);
                    }
                });
    }
}
