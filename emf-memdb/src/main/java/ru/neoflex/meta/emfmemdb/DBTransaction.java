package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Stream;

public abstract class DBTransaction implements AutoCloseable {
    private final transient boolean readOnly;
    protected final transient DBServer dbServer;

    protected abstract DBResource get(String id);
    protected abstract void insert(DBResource dbResource);
    protected abstract void update(DBResource dbResource);
    protected abstract void delete(DBResource dbResource);
    public void begin() {}
    public void commit() {}
    public void rollback() {}


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

    public DBTransaction(DBServer dbServer, boolean readOnly) {
        this.dbServer = dbServer;
        this.readOnly = readOnly;
    }

    public void save(Resource resource) {
        String id = DBServer.getId(resource.getURI());
        Integer version = DBServer.getVersion(resource.getURI());
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
        if (dbResource.getId() != null) {
            dbResource.setId(getNextId());
            insert(dbResource);
        }
        else {
            update(dbResource);
        }
        resource.setURI(dbServer.createURI(dbResource.getId()));
        dbServer.getEvents().fireAfterSave(oldResource, resource);
    }

    protected String getNextId() {
        return EcoreUtil.generateUUID();
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
        delete(dbResource);
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

    public DBServer getDbServer() {
        return dbServer;
    }

    @Override
    public void close() throws Exception {
    }

    public boolean isReadOnly() {
        return readOnly;
    }
}
