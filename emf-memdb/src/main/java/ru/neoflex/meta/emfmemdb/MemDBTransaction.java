package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.BinaryResourceImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.prevayler.Transaction;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MemDBTransaction implements Transaction<MemDBModel> {
    private transient MemDBModel prevalentSystem;
    private final transient MemBDServer memBDServer;
    private Map<String, MemDBObject> mObjectMap = new HashMap<>();
    private Set<String> deleted = new HashSet<>();

    public Stream<Map.Entry<String, MemDBObject>> allEntries() {
        Stream<Map.Entry<String, MemDBObject>> baseStream = prevalentSystem != null ? prevalentSystem.mObjectMap.entrySet().stream()
                .filter(entry -> !deleted.contains(entry.getKey()) && !mObjectMap.containsKey(entry.getKey())):
                Stream.empty();
        Stream<Map.Entry<String, MemDBObject>> insertedStream = mObjectMap.entrySet().stream();
        return Stream.concat(
                insertedStream,
                baseStream
        );
    }

    MemDBObject get(String id) {
        MemDBObject dbObject = null;
        if (!deleted.contains(id)) {
            dbObject = mObjectMap.getOrDefault(id,
                    prevalentSystem == null ? null : prevalentSystem.mObjectMap.get(id)
            );
        }
        if (dbObject == null) {
            throw new IllegalArgumentException(String.format("Can't find object %s", id));
        }
        return dbObject;
    }

    public Stream<MemDBObject> all() {
        return allEntries().map(entry -> entry.getValue());
    }

    public Stream<MemDBObject> allOfClass(String classURI) {
        return all().filter(dbObject -> dbObject.getClassURI().equals(classURI));
    }

    public ResourceSet getResourceSet(Stream<MemDBObject> dbObjects) {
        ResourceSet rs = createResourceSet();
        dbObjects.forEach(dbObject -> {
            createResource(rs, dbObject);
        });
        return rs;
    }

    private Resource createResource(ResourceSet rs, MemDBObject dbObject) {
        URI uri = memBDServer.createResourceURI(Stream.of(dbObject));
        Resource resource = rs.createResource(uri);
        return loadResource(resource, dbObject);
    }

    private Resource loadResource(Resource resource, MemDBObject dbObject) {
        ByteArrayInputStream bais = new ByteArrayInputStream(dbObject.getImage());
        try {
            resource.load(bais, null);
            return resource;
        } catch (IOException e) {
            throw new IllegalArgumentException(String.format("Can't load %s[%s]", dbObject.getClassURI(), dbObject.getQName()));
        }
    }

    public Stream<MemDBObject> allOfClassAndQName(String classURI, String qName) {
        return allOfClass(classURI).filter(dbObject -> dbObject.getQName().equals(qName));
    }

    public MemDBTransaction(MemBDServer memBDServer) {
        this.memBDServer = memBDServer;
    }

    public void save(Resource resource) {
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(resource.getURI());
        List<String> ids = MemBDServer.getIds(resource.getURI()).collect(Collectors.toList());
        List<Integer> versions = MemBDServer.getVersions(resource.getURI()).collect(Collectors.toList());
        List<MemDBObject> dbObjects = new ArrayList<>();
        for (int i = 0; i < resource.getContents().size(); ++i) {
            EObject eObject = resource.getContents().get(i);
            String id = i < ids.size() ? ids.get(i) : null;
            if (i >= ids.size() || ids.get(i) == null) {
                dbObjects.add(new MemDBObject());
            }
            else {
                MemDBObject dbObject = get(id);
                if (i >= versions.size() || versions.get(i) == null) {
                    throw new IllegalArgumentException(String.format("Version for updated object %s not defined", id));
                }
                Integer version = versions.get(i);
                if (!version.equals(dbObject.getVersion())) {
                    throw new IllegalArgumentException(String.format(
                            "Version (%d) for updated object %s is not equals to the version in the DB (%d)",
                            version, id, dbObject.getVersion()));
                }
                dbObjects.add(dbObject);
                loadResource(oldResource, dbObject);
            }
        }
        memBDServer.getEvents().fireBeforeSave(oldResource, resource);
        ResourceSet tempRS = createResourceSet();
        for (int i = 0; i < resource.getContents().size(); ++i) {
            EObject eObject = resource.getContents().get(i);
            MemDBObject dbObject = dbObjects.get(i);
            //TODO: copy eObject to dbObject
            Resource tempR = tempRS.createResource(memBDServer.createResourceURI(Stream.of(dbObject)));
            tempR.getContents().add(EcoreUtil.copy(eObject));
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try {
                tempR.save(baos, null);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            dbObject.setImage(baos.toByteArray());
            dbObject.setVersion(dbObject.getVersion() + 1);
            mObjectMap.put(dbObject.getId(), dbObject);
        }
        memBDServer.getEvents().fireAfterSave(oldResource, resource);
        resource.setURI(memBDServer.createResourceURI(dbObjects.stream()));
    }

    public void load(Resource resource) {
        resource.getContents().clear();
        List<MemDBObject> dbObjects = MemBDServer.getIds(resource.getURI()).map(id->get(id)).collect(Collectors.toList());
        dbObjects.forEach(dbObject -> loadResource(resource, dbObject));
        resource.setURI(memBDServer.createResourceURI(dbObjects.stream()));
        memBDServer.getEvents().fireAfterLoad(resource);
    }

    public void delete(URI uri) {
    }

    public void reset() {
        mObjectMap.clear();
        deleted.clear();
    }

    public ResourceSet createResourceSet() {
        ResourceSetImpl resourceSet = new ResourceSetImpl();
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        for (EPackage ePackage : memBDServer.getPackages()) {
            resourceSet.getPackageRegistry()
                    .put(ePackage.getNsURI(), ePackage);
        }
        resourceSet.setURIResourceMap(new HashMap<>());
        resourceSet.getResourceFactoryRegistry()
                .getProtocolToFactoryMap()
                .put(MemDBHandler.MEMDB, new ResourceFactoryImpl() {
                    @Override
                    public Resource createResource(URI uri) {
                        return new BinaryResourceImpl(uri);
                    }
                });
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new MemDBHandler(this));
        return resourceSet;
    }


    public MemDBModel getPrevalentSystem() {
        return prevalentSystem;
    }

    public void setPrevalentSystem(MemDBModel prevalentSystem) {
        this.prevalentSystem = prevalentSystem;
    }

    @Override
    public void executeOn(MemDBModel prevalentSystem, Date executionTime) {
        deleted.stream().forEach(id -> {
            prevalentSystem.mObjectMap.remove(id);
        });
        mObjectMap.entrySet().forEach(entry->{
            prevalentSystem.mObjectMap.put(entry.getKey(), entry.getValue());
        });
    }
}
