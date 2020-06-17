package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.Diagnostician;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.services.providers.*;
import ru.neoflex.nfcore.base.types.TypesPackage;
import ru.neoflex.nfcore.base.util.EmfJson;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Iterator;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;

@Service("ru.neoflex.nfcore.base.services.Store")
@DependsOn({"ru.neoflex.nfcore.base.components.StartUp"})
public class Store implements EventsRegistration {
    private final static Log logger = LogFactory.getLog(Store.class);
    @Autowired
    Workspace workspace;

    public final static Function<EClass, EStructuralFeature> qualifiedNameDelegate = eClass -> {
        for (EAttribute eAttribute: eClass.getEAllAttributes()) {
            if (eAttribute.getEAttributeType() == TypesPackage.Literals.QNAME) {
                return eAttribute;
            }
        }
        return null;
    };

    @Autowired
    private StoreSPI provider;

    public TransactionSPI getCurrentTransaction() throws IOException {
        TransactionSPI tx = provider.getCurrentTransaction();
        if (tx == null) {
            throw new RuntimeException("No current transaction found");
        }
        return tx;
    }

    @PostConstruct
    public void init() {
    }

    public ResourceSet createResourceSet() throws IOException {
        return provider.createResourceSet(getCurrentTransaction());
    }

    public Resource createEmptyResource(ResourceSet resourceSet) {
        return provider.createEmptyResource(resourceSet);
    }

    public Resource createEObject(EObject eObject) throws IOException {
        Resource resource = createEmptyResource(createResourceSet());
        resource.getContents().add(eObject);
        return saveResource(resource);
    }

    public Resource updateEObject(String ref, EObject eObject) throws IOException {
        URI uri = getUriByRef(ref);
        Resource resource = createResourceSet().createResource(uri);
        resource.getContents().add(eObject);
        return saveResource(resource);
    }

    public Resource saveResource(Resource resource) throws IOException {
        EcoreUtil.resolveAll(resource);
        for (EObject eObject: resource.getContents()) {
            Diagnostic diagnostic = Diagnostician.INSTANCE.validate(eObject);
            if (diagnostic.getSeverity() == Diagnostic.ERROR) {
                String message = getDiagnosticMessage(diagnostic);
                throw new RuntimeException(message);
            }
            if (diagnostic.getSeverity() == Diagnostic.WARNING) {
                logger.warn(getDiagnosticMessage(diagnostic));
            }
        }
        return provider.saveResource(resource);
    }

    public String getDiagnosticMessage(Diagnostic diagnostic) {
        String message = diagnostic.getMessage();
        for (Iterator i = diagnostic.getChildren().iterator(); i.hasNext();) {
            Diagnostic childDiagnostic = (Diagnostic)i.next();
            message += "\n" + childDiagnostic.getMessage();
        }
        return message;
    }

    public Resource createEmptyResource() throws IOException {
        ResourceSet resourceSet = createResourceSet();
        return provider.createEmptyResource(resourceSet);
    }

    public String getRef(Resource resource) {
        return provider.getRef(resource);
    }

    public String getId(Resource resource) {
        return provider.getId(resource);
    }

    public Resource loadResource(String ref) throws IOException {
        URI uri = provider.getUriByRef(ref);
        return provider.loadResource(uri, getCurrentTransaction());
    }

    public Resource loadResource(URI uri) throws IOException {
        return provider.loadResource(uri, getCurrentTransaction());
    }

    public void deleteResource(String ref) throws IOException {
        URI uri = provider.getUriByRef(ref);
        provider.deleteResource(uri, getCurrentTransaction());
    }

    public void deleteResource(URI uri) throws IOException {
        provider.deleteResource(uri, getCurrentTransaction());
    }

    public Resource treeToResource(String ref, JsonNode contents) throws IOException {
        URI uri = getUriByRef(ref);
        return EmfJson.treeToResource(provider.createResourceSet(getCurrentTransaction()), uri, contents);
    }

    public URI getUriByIdAndRev(String id, String rev) {
        return provider.getUriByIdAndRev(id, rev);
    }

    public URI getUriByRef(String ref) {
        return provider.getUriByRef(ref);
    }

    public FinderSPI createFinderProvider () {
        return provider.createFinderProvider();
    }

    public StoreSPI getProvider() {
        return provider;
    }

    public <R> R inTransaction(boolean readOnly, StoreSPI.TransactionalFunction<R> f) throws Exception {
        return provider.inTransaction(readOnly, tx -> {
            if (provider instanceof GitDBStoreProvider) {
                return f.call(tx);
            }
            return workspace.getDatabase().inTransaction(
                    workspace.getCurrentBranch(),
                    readOnly? Transaction.LockType.READ: Transaction.LockType.WRITE,
                    wtx -> f.call(tx));
        });
    }

    @Override
    public void registerAfterLoad(Consumer<Resource> consumer) {
        provider.registerAfterLoad(consumer);
    }

    @Override
    public void registerBeforeSave(BiConsumer<Resource, Resource> consumer) {
        provider.registerBeforeSave(consumer);
    }

    @Override
    public void registerAfterSave(BiConsumer<Resource, Resource> consumer) {
        provider.registerAfterSave(consumer);
    }

    @Override
    public void registerBeforeDelete(Consumer<Resource> consumer) {
        provider.registerBeforeDelete(consumer);
    }

    public interface TransactionalProcedure {
        public void call(TransactionSPI tx) throws Exception;
    }

    public void inTransaction(boolean readOnly, TransactionalProcedure f) throws Exception {
        inTransaction(readOnly, tx -> {
            f.call(tx);
            return null;
        });
    }

    public void commit(String message) throws IOException {
        String email = "";
        String username = Authorization.getUserName();
        getCurrentTransaction().commit(message, username, email);
    }
}
