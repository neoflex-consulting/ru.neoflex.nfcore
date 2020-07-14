package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
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

    public MemDBObject get(String id) {
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

    public Stream<MemDBReference> allReferences() {
        return allEntries().flatMap(entry -> entry.getValue().getOutRefs().stream());
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
        loadResource(resource, dbObject);
        return resource;
    }

    private void loadResource(Resource resource, MemDBObject dbObject) {
        List<String> ids = MemBDServer.getIds(resource.getURI()).collect(Collectors.toList());
        ByteArrayInputStream bais = new ByteArrayInputStream(dbObject.getImage());
        try {
            resource.load(bais, null);
        } catch (IOException e) {
            throw new IllegalArgumentException(String.format("Can't load %s[%s]", dbObject.getClassURI(), dbObject.getQName()));
        }
//        dbObject.getOutRefs().forEach(reference -> {
//            int rootIndex = ids.indexOf(reference.getInId());
//            EObject eObject = resource.getContents().get(rootIndex);
//            EObject internalEObject = reference.getInFragment().length() == 0 ? eObject :
//                    EcoreUtil.getEObject(eObject, reference.getInFragment());
//            EStructuralFeature sf = internalEObject.eClass().getEStructuralFeature(reference.getFeature());
//            EObject crossReferencedEObject = null;
//            if (reference.getInId().equals(reference.getOutId())) {
//                crossReferencedEObject = reference.getOutFragment().length() == 0 ? eObject :
//                        EcoreUtil.getEObject(eObject, reference.getOutFragment());
//            }
//            else {
//                EClass eClass = (EClass) resource.getResourceSet().getEObject(URI.createURI(reference.getOutClassURI()), false);
//                crossReferencedEObject = EcoreUtil.create(eClass);
//                URI crURI = memBDServer.createResourceURI(Stream.of(get(reference.getOutId())))
//                        .appendFragment("/" + reference.getOutFragment());
//                ((InternalEObject) crossReferencedEObject).eSetProxyURI(crURI);
//            }
//            if (sf.isMany()) {
//                ((List) internalEObject.eGet(sf)).add(crossReferencedEObject);
//            }
//            else {
//                internalEObject.eSet(sf, crossReferencedEObject);
//            }
//        });
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
            saveEObject(tempRS, eObject, dbObject);
            dbObject.setVersion(dbObject.getVersion() + 1);
            mObjectMap.put(dbObject.getId(), dbObject);
        }
        resource.setURI(memBDServer.createResourceURI(dbObjects.stream()));
        memBDServer.getEvents().fireAfterSave(oldResource, resource);
    }

    private void saveEObject(ResourceSet tempRS, EObject eObject, MemDBObject dbObject) {
        dbObject.getOutRefs().clear();
        new EcoreUtil.ExternalCrossReferencer(eObject) {
            {
                crossReference();
            }
            protected void add(InternalEObject internalEObject, EReference eReference, EObject crossReferencedEObject) {
                if (!eReference.isDerived() && !eReference.isTransient() && !eReference.isContainer() && internalEObject.eIsSet(eReference)) {
                    EObject eObject = EcoreUtil.getRootContainer(internalEObject);
                    String inId = dbObject.getId();
                    String fromFragment = EcoreUtil.getRelativeURIFragmentPath(eObject, internalEObject);
                    String feature = eReference.getName();
                    EObject crossReferencedRoot = EcoreUtil.getRootContainer(crossReferencedEObject);
                    String toFragment = EcoreUtil.getRelativeURIFragmentPath(crossReferencedRoot, crossReferencedEObject);
                    int index = !eReference.isMany() ? -1 : ((EList) internalEObject.eGet(eReference)).indexOf(crossReferencedEObject);
                    String outId = MemBDServer.getIds(crossReferencedRoot.eResource().getURI())
                            .collect(Collectors.toList()).get(
                                    crossReferencedRoot.eResource().getContents().indexOf(crossReferencedRoot));
                    MemDBReference reference = new MemDBReference();
                    reference.setInId(inId);
                    reference.setInFragment(fromFragment);
                    reference.setFeature(feature);
                    reference.setIndex(index);
                    reference.setOutId(outId);
                    reference.setOutFragment(toFragment);
                    reference.setOutClassURI(EcoreUtil.getURI(crossReferencedEObject.eClass()).toString());
                    dbObject.getOutRefs().add(reference);
                }
                super.add(internalEObject, eReference, crossReferencedEObject);
            }
        };
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Resource tempR = tempRS.createResource(memBDServer.createResourceURI(Stream.of(dbObject)));
            tempR.getContents().add(EcoreUtil.copy(eObject));
            tempR.save(baos, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        dbObject.setImage(baos.toByteArray());
        dbObject.setClassURI(EcoreUtil.getURI(eObject.eClass()).toString());
        EStructuralFeature sf = memBDServer.getQualifiedNameDelegate().apply(eObject.eClass());
        if (sf != null && eObject.eIsSet(sf)) {
            dbObject.setQName(eObject.eGet(sf).toString());
        }
    }

    public void load(Resource resource) {
        resource.unload();
        List<MemDBObject> dbObjects = MemBDServer.getIds(resource.getURI()).map(id->get(id)).collect(Collectors.toList());
        dbObjects.forEach(dbObject -> loadResource(resource, dbObject));
        resource.setURI(memBDServer.createResourceURI(dbObjects.stream()));
        memBDServer.getEvents().fireAfterLoad(resource);
    }

    public void delete(URI uri) {
        ResourceSet rs = createResourceSet();
        Resource oldResource = rs.createResource(uri);
        List<String> ids = MemBDServer.getIds(uri).collect(Collectors.toList());
        List<Integer> versions = MemBDServer.getVersions(uri).collect(Collectors.toList());
        List<MemDBObject> dbObjects = new ArrayList<>();
        for (int i = 0; i < ids.size(); ++i) {
            String id = ids.get(i);
            MemDBObject dbObject = get(id);
            if (i >= versions.size() || versions.get(i) == null) {
                throw new IllegalArgumentException(String.format("Version for deleted object %s not defined", id));
            }
            Integer version = versions.get(i);
            if (!version.equals(dbObject.getVersion())) {
                throw new IllegalArgumentException(String.format(
                        "Version (%d) for deleted object %s is not equals to the version in the DB (%d)",
                        version, id, dbObject.getVersion()));
            }
            dbObjects.add(dbObject);
            loadResource(oldResource, dbObject);
        }
        memBDServer.getEvents().fireBeforeDelete(oldResource);
        dbObjects.forEach(dbObject -> deleted.add(dbObject.getId()));
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
