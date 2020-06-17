package ru.neoflex.nfcore.base.services.providers;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.emfgit.Database;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.services.Workspace;

import java.io.IOException;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

@Service
@ConditionalOnProperty(name = "dbtype", havingValue = "gitdb", matchIfMissing = false)
public class GitDBStoreProvider extends AbstractStoreSPI {
    @Autowired
    Workspace workspace;

    @Override
    public URI getUriByIdAndRev(String id, String rev) {
        return workspace.getDatabase().createURI(id, rev);
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
    public FinderSPI createFinderProvider() {
        return new GitDBFinderProvider();
    }

    private Transaction createTransaction(boolean readOnly) throws IOException {
        return new GitDBTransactionProvider(
                workspace.getDatabase(),
                workspace.getCurrentBranch(),
                readOnly ? Transaction.LockType.READ : Transaction.LockType.WRITE
        );
    }

    @Override
    public TransactionSPI getCurrentTransaction() throws IOException {
        Transaction current = Transaction.getCurrent();
        return (GitDBTransactionProvider)current;
    }

    public TransactionSPI setCurrentTransaction(TransactionSPI tx) throws IOException {
        Transaction current = Transaction.getCurrent();
        Transaction.setCurrent((Transaction)tx);
        return current instanceof TransactionSPI ? (TransactionSPI)current : null;
    }

    @Override
    public <R> R inTransaction(boolean readOnly, TransactionalFunction<R> f) throws Exception {
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

    @Override
    public void registerAfterLoad(Consumer<Resource> consumer) {
        workspace.getDatabase().getEvents().registerAfterLoad(consumer);
    }

    @Override
    public void registerBeforeSave(BiConsumer<Resource, Resource> consumer) {
        workspace.getDatabase().getEvents().registerBeforeSave(consumer);
    }

    @Override
    public void registerAfterSave(BiConsumer<Resource, Resource> consumer) {
        workspace.getDatabase().getEvents().registerAfterSave(consumer);
    }

    @Override
    public void registerBeforeDelete(Consumer<Resource> consumer) {
        workspace.getDatabase().getEvents().registerBeforeDelete(consumer);
    }
}
