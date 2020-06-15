package ru.neoflex.nfcore.base.services.providers;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import ru.neoflex.meta.emfgit.*;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

public class GitDBFinderProvider extends AbstractSimpleFinderProvider {
    @Override
    protected void findResourcesByClass(EClass eClass, String name, TransactionSPI tx, Consumer<Supplier<Resource>> consumer) {
        Transaction gitTx = (GitDBTransactionProvider) tx;
        Database database = gitTx.getDatabase();
        ResourceSet resourceSet = database.createResourceSet(gitTx);
        try {
            List<IndexEntry> ieList = database.findEClassIndexEntries(eClass, name, gitTx);
            for (IndexEntry ie: ieList) {
                EntityId entityId = new EntityId(new String(ie.getContent()), null);
                consumeResource(consumer, gitTx, database, resourceSet, entityId);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void findResourcesById(String id, TransactionSPI tx, Consumer<Supplier<Resource>> consumer) {
        Transaction gitTx = (GitDBTransactionProvider) tx;
        Database database = gitTx.getDatabase();
        ResourceSet resourceSet = database.createResourceSet(gitTx);
        EntityId entityId = new EntityId(id, null);
        if (Files.exists(gitTx.getIdPath(entityId))) {
            consumeResource(consumer, gitTx, database, resourceSet, entityId);
        }
    }

    private void consumeResource(Consumer<Supplier<Resource>> consumer, Transaction gitTx, Database database, ResourceSet resourceSet, EntityId entityId) {
        consumer.accept(() -> {
            try {
                Entity entity = gitTx.load(entityId);
                Resource resource = resourceSet.createResource(database.createURI(entity.getId(), entity.getRev()));
                database.loadResource(entity.getContent(), resource);
                return resource;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public void findAll(TransactionSPI tx, Consumer<Supplier<Resource>> consumer) throws IOException {
        Transaction gitTx = (GitDBTransactionProvider) tx;
        for (EntityId entityId: gitTx.all()) {
            Resource resource = gitTx.getDatabase().loadResource(entityId.getId(), gitTx);
            consumer.accept(() -> resource);
        }
    }

    @Override
    public void getDependentResources(Resource resource, TransactionSPI tx, Consumer<Supplier<Resource>> consumer) throws IOException {
        Transaction gitTx = (GitDBTransactionProvider) tx;
        for (Resource dep: gitTx.getDatabase().getDependentResources(resource, gitTx)) {
            consumer.accept(() -> dep);
        }
    }
}
