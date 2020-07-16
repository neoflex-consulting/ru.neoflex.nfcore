package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.prevayler.Transaction;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Stream;

public class DBTransaction implements Transaction<MemDBModel>, AutoCloseable {
    private final transient boolean readOnly;
    private final transient MemDBServer dbServer;
    private Map<String, DBResource> dbResourceMap = new HashMap<>();
    private Set<String> deleted = new HashSet<>();

    public Stream<Map.Entry<String, DBResource>> allEntries() {
        Stream<Map.Entry<String, DBResource>> baseStream = dbServer.getPrevayler().prevalentSystem().getDbResourceMap().entrySet().stream()
                .filter(entry -> !deleted.contains(entry.getKey()) && !dbResourceMap.containsKey(entry.getKey()));
        Stream<Map.Entry<String, DBResource>> insertedStream = dbResourceMap.entrySet().stream();
        return Stream.concat(
                insertedStream,
                baseStream
        );
    }

    public DBResource get(String id) {
        DBResource dbObject = null;
        if (!deleted.contains(id)) {
            dbObject = dbResourceMap.getOrDefault(id,dbServer.getPrevayler().prevalentSystem().getDbResourceMap().get(id)
            );
        }
        if (dbObject == null) {
            throw new IllegalArgumentException(String.format("Can't find object %s", id));
        }
        return dbObject;
    }

    public ResourceSet getResourceSet(Stream<DBResource> dbResourceStream) {
        ResourceSet rs = createResourceSet();
        dbResourceStream.forEach(dbObject -> {
            createResource(rs, dbObject);
        });
        return rs;
    }

    private Resource createResource(ResourceSet rs, DBResource dbResource) {
        URI uri = dbServer.createURI(dbResource);
        Resource resource = rs.createResource(uri);
        loadResource(resource, dbResource);
        return resource;
    }

    private void loadResource(Resource resource, DBResource dbResource) {
        ByteArrayInputStream inputStream = new ByteArrayInputStream(dbResource.getImage());
        try {
            resource.load(inputStream, null);
        } catch (IOException e) {
            throw new IllegalArgumentException(String.format("Can't load %s", dbResource.getId()));
        }
    }

    public DBTransaction(MemDBServer dbServer, boolean readOnly) {
        this.dbServer = dbServer;
        this.readOnly = readOnly;
    }

    public void save(Resource resource) {
        String id = MemDBServer.getId(resource.getURI());
        Integer version = MemDBServer.getVersion(resource.getURI());
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(resource.getURI());
        DBResource dbResource = null;
        if (id != null) {
            if (version == null) {
                throw new IllegalArgumentException(String.format("Version for updated resource %s not defined", id));
            }
            dbResource = get(id);
            if (!version.equals(dbResource.getVersion())) {
                throw new IllegalArgumentException(String.format(
                        "Version (%d) for updated resource %s is not equals to the version in the DB (%d)",
                        version, id, dbResource.getVersion()));
            }
            loadResource(oldResource, dbResource);
        }
        else {
            dbResource = new DBResource();
        }
        dbServer.getEvents().fireBeforeSave(oldResource, resource);
        saveResource(resource, dbResource);
        dbResource.setVersion(dbResource.getVersion() + 1);
        dbResourceMap.put(dbResource.getId(), dbResource);
        resource.setURI(dbServer.createURI(dbResource.getId()));
        dbServer.getEvents().fireAfterSave(oldResource, resource);
    }

    private void saveResource(Resource resource, DBResource dbResource) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            resource.save(outputStream, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        dbResource.setImage(outputStream.toByteArray());
    }

    public void load(Resource resource) {
        resource.unload();
        String id = MemDBServer.getId(resource.getURI());
        DBResource dbResource = get(id);
        loadResource(resource, dbResource);
        resource.setURI(dbServer.createURI(dbResource.getId(), dbResource.getVersion()));
        dbServer.getEvents().fireAfterLoad(resource);
    }

    public void delete(URI uri) {
        String id = MemDBServer.getId(uri);
        if (id == null) {
            throw new IllegalArgumentException("Id for deleted object not defined");
        }
        Integer version = MemDBServer.getVersion(uri);
        if (version == null) {
            throw new IllegalArgumentException(String.format("Version for deleted object %s not defined", id));
        }
        DBResource dbResource = get(id);
        if (!version.equals(dbResource.getVersion())) {
            throw new IllegalArgumentException(String.format(
                    "Version (%d) for deleted object %s is not equals to the version in the DB (%d)",
                    version, id, dbResource.getVersion()));
        }
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(uri);
        loadResource(oldResource, dbResource);
        dbServer.getEvents().fireBeforeDelete(oldResource);
        deleted.add(dbResource.getId());
    }

    public void reset() {
        dbResourceMap.clear();
        deleted.clear();
    }

    public ResourceSet createResourceSet() {
        ResourceSetImpl resourceSet = new ResourceSetImpl();
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        for (EPackage ePackage : dbServer.getPackages()) {
            resourceSet.getPackageRegistry()
                    .put(ePackage.getNsURI(), ePackage);
        }
        resourceSet.setURIResourceMap(new HashMap<>());
        resourceSet.getResourceFactoryRegistry()
                .getProtocolToFactoryMap()
                .put(dbServer.getScheme(), new ResourceFactoryImpl() {
                    @Override
                    public Resource createResource(URI uri) {
                        return dbServer.createResource(uri);
                    }
                });
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new DBHandler(this));
        return resourceSet;
    }

    @Override
    public void executeOn(MemDBModel prevalentSystem, Date executionTime) {
        deleted.stream().forEach(id -> {
            prevalentSystem.getDbResourceMap().remove(id);
        });
        dbResourceMap.entrySet().forEach(entry->{
            prevalentSystem.getDbResourceMap().put(entry.getKey(), entry.getValue());
        });
        reset();
    }

    public MemDBServer getDbServer() {
        return dbServer;
    }

    @Override
    public void close() throws Exception {
    }
}
