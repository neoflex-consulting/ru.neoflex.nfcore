package ru.neoflex.nfcore.base.services.providers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.emfjson.couchdb.CouchHandler;
import org.emfjson.couchdb.client.CouchClient;
import org.emfjson.couchdb.client.DB;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.emfjson.jackson.utils.ValueWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.components.Publisher;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

@Service
@ConditionalOnProperty(name = "dbtype", havingValue = "couchdb", matchIfMissing = false)
public class CouchDBStoreProvider implements StoreSPI {
    @Value("${couchdb.host:localhost}")
    String host;
    @Value("${couchdb.port:5984}")
    Integer port;
    @Value("${couchdb.username:admin}")
    String username;
    @Value("${couchdb.password:admin}")
    String password;
    @Value("${couchdb.dbname:models}")
    String defaultDbname;
    @Autowired
    Publisher publisher;
    @Autowired
    PackageRegistry registry;
    DB db;
    URI couchURI;
    URI baseURI;

    @PostConstruct
    public void init() throws IOException {
        URL baseURL = new URL("http", host, port, "");
        String s = baseURL.toString();
        couchURI = URI.createURI(s).appendSegment(defaultDbname).appendSegment("");
        baseURI = URI.createURI("http://" + defaultDbname).appendSegment("");
        CouchClient client = getClient();
        db = client.db(defaultDbname);
        if (!db.exist()) {
            JsonNode status = db.create();
            checkStatus(status);
        }
        initDB();
    }

    public static void checkStatus(JsonNode status) throws IOException {
        if (status == null) {
            throw new IOException();
        }
        if (status.has("error")) {
            String message = status.get("error").asText() + ": " + status.get("reason").asText();
            throw new IOException(message);
        }
    }

    protected void initDB() throws IOException {
        CouchClient client = getDefaultClient();
        Set<String> indexSet = getIndexes(client);
        ObjectMapper mapper = createMapper();
        final String idx_eClass = "idx_eClass";
        if (!indexSet.contains(idx_eClass)) {
            JsonNode indexNode = mapper.createObjectNode()
                    .put("ddoc", idx_eClass)
                    .put("name", idx_eClass)
                    .put("type", "json")
                    .set("index", mapper.createObjectNode()
                            .set("fields", mapper.createArrayNode()
                                    .add("contents.eClass")
                            )
                    );
            client.post("_index", mapper.writeValueAsString(indexNode));
        }
        final String idx_eClass_name = "idx_eClass_name";
        if (!indexSet.contains(idx_eClass_name)) {
            JsonNode indexNode = mapper.createObjectNode()
                    .put("ddoc", idx_eClass_name)
                    .put("name", idx_eClass_name)
                    .put("type", "json")
                    .set("index", mapper.createObjectNode()
                            .set("fields", mapper.createArrayNode()
                                    .add("contents.eClass")
                                    .add("contents.name")
                            )
                    );
            client.post("_index", mapper.writeValueAsString(indexNode));
        }
    }

    private Set<String> getIndexes(CouchClient client) throws IOException {
        Set<String> indexSet = new HashSet<>();
        JsonNode content = client.content("_index");
        ArrayNode indexes = (ArrayNode) content.get("indexes");
        for (JsonNode index : indexes) {
            indexSet.add(index.get("name").textValue());
        }
        return indexSet;
    }

    public CouchClient getDefaultClient() throws IOException {
        return getClient(couchURI, defaultDbname);
    }

    protected CouchClient getClient(URI uri, String database) throws IOException {
        URI baseURI = uri.trimFragment().trimQuery().trimSegments(uri.segmentCount());
        if (database != null) {
            baseURI = baseURI.appendSegment(database).appendSegment("");
        }
        final URL url = new URL(baseURI.toString());
        return new CouchClient(url, createMapper(), username, password);
    }

    private CouchClient getClient() throws IOException {
        return getClient(couchURI, null);
    }

    @Override
    public URI getUriByIdAndRev(String id, String rev) {
        return baseURI.appendSegment(id).appendQuery("rev=" + rev);
    }

    @Override
    public Resource saveResource(Resource resource) throws IOException {
        EObject eObject = resource.getContents().get(0);
        Publisher.BeforeSaveEvent beforeSaveEvent = new Publisher.BeforeSaveEvent(eObject);
        publisher.publish(beforeSaveEvent);
        if (beforeSaveEvent.getEObject() != null) {
            resource.getContents().add(beforeSaveEvent.getEObject());
            while (resource.getContents().size() > 1) {
                resource.getContents().remove(0);
            }
            resource.save(null);
            if (!resource.getContents().isEmpty()) {
                EObject savedObject = resource.getContents().get(0);
                Publisher.AfterSaveEvent afterSaveEvent = new Publisher.AfterSaveEvent(savedObject);
                publisher.publish(afterSaveEvent);
                if (afterSaveEvent.getEObject() != null) {
                    resource.getContents().add(afterSaveEvent.getEObject());
                    while (resource.getContents().size() > 1) {
                        resource.getContents().remove(0);
                    }
                }
            }
        }
        return resource;
    }

    @Override
    public URI getUriByRef(String ref) {
        return ref == null ? baseURI.appendSegment("") : URI.createURI(baseURI.toString() + ref);
    }

    @Override
    public ResourceSet createResourceSet(TransactionSPI tx) {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        for (EPackage ePackage : registry.getEPackages()) {
            resourceSet.getPackageRegistry()
                    .put(ePackage.getNsURI(), ePackage);
        }
        resourceSet.getResourceFactoryRegistry()
                .getExtensionToFactoryMap()
                .put("*", new JsonResourceFactory());
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new CouchHandler(createMapper(), username, password));
        resourceSet.getURIConverter().getURIMap().put(
                baseURI,
                couchURI);
        return resourceSet;
    }

    @Override
    public Resource createEmptyResource(ResourceSet resourceSet) {
        return resourceSet.createResource(baseURI.appendSegment(""));
    }

    @Override
    public Resource loadResource(URI uri, TransactionSPI tx) throws IOException {
        Resource resource = createResourceSet(tx).createResource(uri.trimFragment().trimQuery());
        resource.load(null);
        if (!resource.getContents().isEmpty()) {
            EObject eObject = resource.getContents().get(0);
            Publisher.AfterLoadEvent afterLoadEvent = new Publisher.AfterLoadEvent(eObject);
            publisher.publish(afterLoadEvent);
            //resource.getContents().clear();
            if (afterLoadEvent.getEObject() != null) {
                resource.getContents().add(afterLoadEvent.getEObject());
                while (resource.getContents().size() > 1) {
                    resource.getContents().remove(0);
                }
            }
        }
        return resource;
    }

    @Override
    public void deleteResource(URI uri, TransactionSPI tx) throws IOException {
        ResourceSet resourceSet = createResourceSet(tx);
        Resource resource = resourceSet.createResource(uri);
        resource.load(null);
        if (resource.getContents().isEmpty()) {
            throw new IOException("Resource " + uri.toString() + " not found");
        }
        EObject eObject = resource.getContents().get(0);
        Publisher.BeforeDeleteEvent beforeDeleteEvent = new Publisher.BeforeDeleteEvent(eObject);
        publisher.publish(beforeDeleteEvent);
        resourceSet.createResource(uri).delete(null);
        Publisher.AfterDeleteEvent afterDeleteEvent = new Publisher.AfterDeleteEvent(eObject);
        publisher.publish(afterDeleteEvent);
    }

    @Override
    public String getRef(Resource resource) {
        return getRefByUri(resource.getURI());
    }

    @Override
    public  String getId(Resource eResource) {
        URI uri = eResource.getURI();
        String id = uri.segmentCount() > 0 ? uri.segment(0) : "";
        return id;
    }
    
    public String getRefByUri(URI uri) {
        String ref = uri.segment(0);
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

    public ObjectMapper createMapper() {
        ObjectMapper mapper = new ObjectMapper();
        EMFModule emfModule = new EMFModule();
        emfModule.configure(EMFModule.Feature.OPTION_USE_ID, true);
        emfModule.setTypeInfo(new EcoreTypeInfo("eClass"));
        emfModule.setIdentityInfo(new EcoreIdentityInfo("_id",
                (ValueWriter<EObject, Object>) (eObject, context) -> {
                    URI eObjectURI = EMFContext.getURI(context, eObject);
                    if (eObjectURI == null) {
                        return null;
                    }
                    return eObjectURI.fragment();
                }));
        mapper.registerModule(emfModule);
        mapper.configure(WRITE_DATES_AS_TIMESTAMPS, false);
        return mapper;
    }

    @Override
    public FinderSPI createFinderProvider() {
        return new CouchDBFinderProvider(this);
    }

    @Override
    public TransactionSPI getCurrentTransaction() throws IOException {
        return new NullTransactionProvider();
    }

    @Override
    public <R> R inTransaction(boolean readOnly, Transactional<R> f) throws Exception {
        return f.call(new NullTransactionProvider());
    }
}
