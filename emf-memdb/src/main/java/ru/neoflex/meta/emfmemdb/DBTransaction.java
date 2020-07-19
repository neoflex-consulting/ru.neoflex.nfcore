package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceFactoryImpl;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.util.HashMap;
import java.util.stream.Stream;

public abstract class DBTransaction implements AutoCloseable {
    private transient boolean readOnly;
    private transient DBServer dbServer;

    protected abstract void load(String id, Resource resource);
    public abstract Stream<Resource> findAll(ResourceSet rs);
    public abstract Stream<Resource> findByClass(ResourceSet rs, String classUri);
    public abstract Stream<Resource> findByClassAndQName(ResourceSet rs, String classUri, String qName);
    public abstract Stream<Resource> findReferencedTo(Resource resource);
    protected abstract void insert(Resource resource);
    protected abstract void update(String id, Resource resource);
    protected abstract void delete(String id);
    public void begin() {}
    public void commit() {}
    public void rollback() {}

    public Stream<Resource> findByClass(ResourceSet rs, EClass eClass) {
        return findByClass(rs, EcoreUtil.getURI(eClass).toString());
    }

    public Stream<Resource> findByClassAndQName(ResourceSet rs, EClass eClass, String qName) {
        return findByClassAndQName(rs, EcoreUtil.getURI(eClass).toString(), qName);
    }

    public void save(Resource resource) {
        String id = dbServer.getId(resource.getURI());
        String version = dbServer.getVersion(resource.getURI());
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(resource.getURI());
        if (id != null) {
            if (version == null) {
                throw new IllegalArgumentException(String.format("Version for updated resource %s not defined", id));
            }
            load(id, oldResource);
            String oldVersion = dbServer.getVersion(oldResource.getURI());
            if (!version.equals(oldVersion)) {
                throw new IllegalArgumentException(String.format(
                        "Version (%d) for updated resource %s is not equals to the version in the DB (%d)",
                        version, id, oldVersion));
            }
        }
        dbServer.getEvents().fireBeforeSave(oldResource, resource);
        if (id == null) {
            insert(resource);
        }
        else {
            update(id, resource);
        }
        dbServer.getEvents().fireAfterSave(oldResource, resource);
    }

    protected String getNextId() {
        return EcoreUtil.generateUUID();
    }

    public void load(Resource resource) {
        resource.unload();
        String id = dbServer.getId(resource.getURI());
        load(id, resource);
        dbServer.getEvents().fireAfterLoad(resource);
    }

    public void delete(URI uri) {
        String id = dbServer.getId(uri);
        if (id == null) {
            throw new IllegalArgumentException("Id for deleted object not defined");
        }
        String version = dbServer.getVersion(uri);
        if (version == null) {
            throw new IllegalArgumentException(String.format("Version for deleted object %s not defined", id));
        }
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(uri);
        load(id, oldResource);
        String oldVersion = dbServer.getVersion(oldResource.getURI());
        if (!version.equals(oldVersion)) {
            throw new IllegalArgumentException(String.format(
                    "Version (%d) for deleted object %s is not equals to the version in the DB (%d)",
                    version, id, oldResource));
        }
        dbServer.getEvents().fireBeforeDelete(oldResource);
        delete(id);
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

    public void setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
    }

    public void setDbServer(DBServer dbServer) {
        this.dbServer = dbServer;
    }
}
