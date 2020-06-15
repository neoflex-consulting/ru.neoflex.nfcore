package ru.neoflex.nfcore.base.services.providers;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;

public interface StoreSPI extends EventsRegistration {
    URI getUriByIdAndRev(String id, String rev);

    Resource saveResource(Resource resource) throws IOException;

    URI getUriByRef(String ref);

    ResourceSet createResourceSet(TransactionSPI tx);

    Resource createEmptyResource(ResourceSet resourceSet);

    Resource loadResource(URI uri, TransactionSPI tx) throws IOException;

    void deleteResource(URI uri, TransactionSPI tx) throws IOException;

    String getRef(Resource resource);

    String getId(Resource resource);

    FinderSPI createFinderProvider();

    TransactionSPI getCurrentTransaction() throws IOException;

    public interface TransactionalFunction<R> {
        public R call(TransactionSPI tx) throws Exception;
    }

    public <R> R inTransaction(boolean readOnly, TransactionalFunction<R> f) throws Exception;
}
