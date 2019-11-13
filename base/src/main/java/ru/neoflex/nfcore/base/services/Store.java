package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.Diagnostician;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.services.providers.FinderSPI;
import ru.neoflex.nfcore.base.services.providers.GitDBTransactionProvider;
import ru.neoflex.nfcore.base.services.providers.StoreSPI;
import ru.neoflex.nfcore.base.services.providers.TransactionSPI;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Iterator;

@Service
public class Store {
    private final static Log logger = LogFactory.getLog(Store.class);

    @Autowired
    private
    StoreSPI provider;

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
//        for (EObject eObject: resource.getContents()) {
//            Diagnostic diagnostic = Diagnostician.INSTANCE.validate(eObject);
//            if (diagnostic.getSeverity() == Diagnostic.ERROR) {
//                String message = getDiagnosticMessage(diagnostic);
//                throw new RuntimeException(message);
//            }
//            if (diagnostic.getSeverity() == Diagnostic.WARNING) {
//                logger.warn(getDiagnosticMessage(diagnostic));
//            }
//        }
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
        return provider.treeToResource(provider.createResourceSet(getCurrentTransaction()), uri, contents);
    }

    public URI getUriByIdAndRev(String id, String rev) {
        return provider.getUriByIdAndRev(id, rev);
    }

    public URI getUriByRef(String ref) {
        return provider.getUriByRef(ref);
    }

    public ObjectMapper createMapper() {
        return provider.createMapper();
    }

    public FinderSPI createFinderProvider () {
        return provider.createFinderProvider();
    }

    public StoreSPI getProvider() {
        return provider;
    }

    public interface Transactional<R> {
        public R call(TransactionSPI tx) throws Exception;
    }
    public <R> R withTransaction(boolean readOnly, Transactional<R> f) throws Exception {
        try (TransactionSPI tx = provider.createTransaction(readOnly)) {
            TransactionSPI old = provider.getCurrentTransaction();
            provider.setCurrentTransaction(tx);
            try {
                return f.call(tx);
            }
            finally {
                provider.setCurrentTransaction(old);
            }
        }
    }

    public void commit(String message) throws IOException {
        String username = "";
        String email = "";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                username = ((UserDetails)principal).getUsername();
            } else {
                username = principal.toString();
            }
        }
        getCurrentTransaction().commit(message, username, email);
    }
}
