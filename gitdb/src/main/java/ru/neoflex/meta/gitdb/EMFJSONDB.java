package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.cfg.ContextAttributes;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.emfjson.jackson.resource.JsonResourceFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class EMFJSONDB extends Database {
    private ObjectMapper mapper;
    private List<EPackage> packages;

    public EMFJSONDB(String repoPath, ObjectMapper mapper, List<EPackage> packages) throws IOException, GitAPIException {
        super(repoPath);
        this.mapper = mapper;
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
                IndexEntry entry = new IndexEntry();
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                ResourceSet resourceSet = getResourceSet(transaction);
                Resource resource = resourceSet.createResource(URI.createURI("http://"));
                ContextAttributes attributes = ContextAttributes
                        .getEmpty()
                        .withSharedAttribute("resourceSet", resourceSet)
                        .withSharedAttribute("resource", resource);
                mapper.reader()
                        .with(attributes)
                        .withValueToUpdate(resource)
                        .treeToValue(node, Resource.class);
                EObject eObject = resource.getContents().get(0);
                EClass eClass = eObject.eClass();
                EPackage ePackage = eClass.getEPackage();
                entry.setPath(new String[]{ePackage.getNsURI(), eClass.getName(), (String) eObject.eGet(eClass.getEStructuralFeature("name"))});
                entry.setContent(entity.getId().getBytes("utf-8"));
                return new ArrayList<IndexEntry>(){{add(entry);}};
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
                ObjectNode node = (ObjectNode) mapper.readTree(entity.getContent());
                ResourceSet resourceSet = getResourceSet(transaction);
                Resource resource = resourceSet.createResource(URI.createURI("http://"));
                ContextAttributes attributes = ContextAttributes
                        .getEmpty()
                        .withSharedAttribute("resourceSet", resourceSet)
                        .withSharedAttribute("resource", resource);
                mapper.reader()
                        .with(attributes)
                        .withValueToUpdate(resource)
                        .treeToValue(node, Resource.class);
                if (!resource.getContents().isEmpty()) {
                    Map<EObject, Collection<EStructuralFeature.Setting>> cr =  EcoreUtil.CrossReferencer.find(resource.getContents());
                    for (EObject eObject: cr.keySet()) {
                        URI uri = eObject.eResource().getURI();
                        String id = uri.segment(0);
                        IndexEntry entry = new IndexEntry();
                        entry.setPath(new String[]{id.substring(0, 2), id.substring(2), entity.getId()});
                        entry.setContent(new byte[0]);
                        result.add(entry);
                    }
                }
                return result;
            }
        });
    }

    public ResourceSet getResourceSet(Transaction transaction) {
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
                .add(0, new GitHandler(transaction, getMapper()));
        return resourceSet;
    }
    public ObjectMapper getMapper() {
        return mapper;
    }
}
