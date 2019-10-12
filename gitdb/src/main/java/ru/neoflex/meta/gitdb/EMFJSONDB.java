package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.emfjson.jackson.annotations.EcoreIdentityInfo;
import org.emfjson.jackson.annotations.EcoreTypeInfo;
import org.emfjson.jackson.databind.EMFContext;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.emfjson.jackson.utils.ValueWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

public class EMFJSONDB extends Database {
    private ObjectMapper mapper;
    private List<EPackage> packages;

    public EMFJSONDB(String repoPath, List<EPackage> packages) throws IOException, GitAPIException {
        super(repoPath);
        this.mapper = createMapper();
        this.packages = packages;
        createTypeNameIndex();
        createRefIndex();
    }

    private void createTypeNameIndex() {
        createIndex(new Index() {
            @Override
            public String getName() {
                return "type_name";
            }

            @Override
            public List<IndexEntry> getEntries(Entity entity, Transaction transaction) throws IOException {
                ArrayList<IndexEntry> result = new ArrayList<IndexEntry>();
                Resource resource = loadResource(entity.getContent(), transaction);
                EObject eObject = resource.getContents().get(0);
                EClass eClass = eObject.eClass();
                EStructuralFeature nameSF = eClass.getEStructuralFeature("name");
                if (nameSF != null) {
                    String name = (String) eObject.eGet(nameSF);
                    if (name == null && name.length() == 0) {
                        throw new IOException("Empty feature name");
                    }
                    EPackage ePackage = eClass.getEPackage();
                    IndexEntry entry = new IndexEntry();
                    entry.setPath(new String[]{ePackage.getNsURI(), eClass.getName(), name});
                    entry.setContent(entity.getId().getBytes("utf-8"));
                    result.add(entry);
                }
                return result;
            }
        });
    }

    private void createRefIndex() {
        createIndex(new Index() {
            @Override
            public String getName() {
                return "ref";
            }

            @Override
            public List<IndexEntry> getEntries(Entity entity, Transaction transaction) throws IOException {
                ArrayList<IndexEntry> result = new ArrayList<IndexEntry>();
                Resource resource = loadResource(entity.getContent(), transaction);
                Map<EObject, Collection<EStructuralFeature.Setting>> cr =  EcoreUtil.CrossReferencer.find(resource.getContents());
                for (EObject eObject: cr.keySet()) {
                    URI uri = eObject.eResource().getURI();
                    String id = uri.segment(0);
                    IndexEntry entry = new IndexEntry();
                    entry.setPath(new String[]{id.substring(0, 2), id.substring(2), entity.getId()});
                    entry.setContent(new byte[0]);
                    result.add(entry);
                }
                return result;
            }
        });
    }

    public Resource loadResource(byte[] content, Transaction transaction) throws IOException {
        Resource resource = createResource(transaction, null, null);
        return loadResource(content, resource);
    }

    public Resource loadResource(byte[] content, Resource resource) throws IOException {
        JsonNode node = mapper.readTree(content);
        ContextAttributes attributes = ContextAttributes
                .getEmpty()
                .withSharedAttribute("resourceSet", resource.getResourceSet())
                .withSharedAttribute("resource", resource);
        mapper.reader()
                .with(attributes)
                .withValueToUpdate(resource)
                .treeToValue(node, Resource.class);
        return resource;
    }

    public Resource createResource(Transaction transaction, String id, String rev) {
        ResourceSet resourceSet = createResourceSet(transaction);
        URI uri = createURI(id, rev);
        return resourceSet.createResource(uri);
    }

    public URI createURI(String id, String rev) {
        URI uri = URI.createURI("http:/");
        if (id != null) {
            uri = uri.appendSegment(id);
        }
        if (rev != null) {
            uri = uri.appendQuery("rev=" + rev);
        }
        return uri;
    }

    public ResourceSet createResourceSet(Transaction transaction) {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        for (EPackage ePackage: packages) {
            resourceSet.getPackageRegistry()
                    .put(ePackage.getNsURI(), ePackage);
        }
        resourceSet.getResourceFactoryRegistry()
                .getExtensionToFactoryMap()
                .put("*", new JsonResourceFactory());
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new GitHandler(transaction));
        return resourceSet;
    }

    public static EMFModule createModule() {
        EMFModule emfModule = new EMFModule();
        emfModule.configure(EMFModule.Feature.OPTION_USE_ID, true);
        emfModule.setTypeInfo(new EcoreTypeInfo("eClass"));
        emfModule.setIdentityInfo(new EcoreIdentityInfo("_id",
                new ValueWriter<EObject, Object>() {
                    @Override
                    public Object writeValue(EObject eObject, SerializerProvider context) {
                        URI eObjectURI = EMFContext.getURI(context, eObject);
                        if (eObjectURI == null) {
                            return null;
                        }
                        return eObjectURI.fragment();
                    }
                }));
        return emfModule;
    }

    public static ObjectMapper createMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(createModule());
        mapper.configure(WRITE_DATES_AS_TIMESTAMPS, false);
        return mapper;
    }

    public static String getRev(URI uri) throws IOException {
        String query = uri.query();
        if (!query.contains("rev=")) {
            throw new IOException("Revision not found: " + uri.toString());
        }
        return query.split("rev=")[1];
    }

    public static String getId(URI uri) throws IOException {
        if (uri.segmentCount() == 0) {
            throw new IOException("Can't handle resource without id: " + uri.toString());
        }
        return uri.segment(0);
    }

    public byte[] getResourceContent(Resource resource) throws JsonProcessingException {
        JsonNode contentNode = mapper.valueToTree(resource);
        return mapper.writeValueAsBytes(contentNode);
    }

    public ResourceSet getDependentResources(Resource resource, Transaction transaction) throws IOException {
        String id = getId(resource.getURI());
        ResourceSet resourceSet = getDependentResources(id, transaction);
        return resourceSet;
    }

    public ResourceSet getDependentResources(String id, Transaction transaction) throws IOException {
        ResourceSet resourceSet = createResourceSet(transaction);
        List<IndexEntry> refList = transaction.findByIndex("ref", id.substring(0, 2), id.substring(2));
        for (IndexEntry entry: refList) {
            String refId = entry.getPath()[entry.getPath().length - 1];
            loadResource(resourceSet, refId);
        }
        return resourceSet;
    }

    public ResourceSet findByEClass(EClass eClass, String name, Transaction transaction) throws IOException {
        ResourceSet resourceSet = createResourceSet(transaction);
        String nsURI = eClass.getEPackage().getNsURI();
        String className = eClass.getName();
        List<IndexEntry> ieList;
        if (name == null || name.length() == 0) {
            ieList = transaction.findByIndex("type_name", nsURI, className);
        }
        else {
            ieList = transaction.findByIndex("type_name", nsURI, className, name);
        }
        for (IndexEntry entry: ieList) {
            String id = new String(entry.getContent());
            loadResource(resourceSet, id);
        }
        return resourceSet;
    }

    public Resource loadResource(ResourceSet resourceSet, String id) throws IOException {
        URI uri = createURI(id, null);
        Resource resource = resourceSet.createResource(uri);
        resource.load(null);
        return resource;
    }

    public Resource loadResource(String id, Transaction transaction) throws IOException {
        ResourceSet resourceSet = createResourceSet(transaction);
        return loadResource(resourceSet, id);
    }
}
