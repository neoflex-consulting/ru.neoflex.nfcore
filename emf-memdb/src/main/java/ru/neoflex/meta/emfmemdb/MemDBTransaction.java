package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.prevayler.Transaction;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MemDBTransaction extends DBTransaction implements Transaction<MemDBModel> {
    private transient MemDBModel memDBModel;
    private Map<String, DBResource> inserted = new HashMap<>();
    private Map<String, DBResource> updated = new HashMap<>();
    private Set<String> deleted = new HashSet<>();

    @Override
    protected Resource load(Resource resource, String id) {
        DBResource dbResource = get(id);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(dbResource.getImage());
        try {
            resource.load(inputStream, null);
        } catch (IOException e) {
            throw new IllegalArgumentException(String.format("Can't load %s", dbResource.getId()));
        }
        URI uri = getMemDBServer().createURI(id, dbResource.getVersion());
        resource.setURI(uri);
        return resource;
    }

    private DBResource get(String id) {
        if (deleted.contains(id)) {
            throw new IllegalArgumentException(String.format("Can't find object %s", id));
        }
        DBResource dbObject = updated.get(id);
        if (dbObject == null) {
            dbObject = inserted.get(id);
        }
        if (dbObject == null) {
            dbObject = memDBModel.get(id);
        }
        return dbObject;
    }

    public Stream<DBResource> findAll() {
        Stream<DBResource> baseStream = memDBModel.findAll()
                .filter(dbResource -> !deleted.contains(dbResource.getId()) && !updated.containsKey(dbResource.getId()));
        Stream<DBResource> insertedStream = inserted.values().stream();
        Stream<DBResource> updatedStream = updated.values().stream();
        return Stream.concat(
                Stream.concat(insertedStream, updatedStream),
                baseStream
        );
    }

    public Stream<DBResource> findByClass(String classUri) {
        String attributeValue = classUri + ":";
        Stream<DBResource> baseStream = memDBModel.findByClass(classUri)
                .filter(dbResource -> !deleted.contains(dbResource.getId()) && !updated.containsKey(dbResource.getId()));
        Stream<DBResource> insertedStream = inserted.values().stream()
                .filter(dbResource -> dbResource.getNames().stream().anyMatch(s -> s.startsWith(attributeValue)));
        Stream<DBResource> updatedStream = updated.values().stream()
                .filter(dbResource -> dbResource.getNames().stream().anyMatch(s -> s.startsWith(attributeValue)));
        return Stream.concat(
                Stream.concat(insertedStream, updatedStream),
                baseStream
        );
    }

    public Stream<DBResource> findByClassAndQName(String classUri, String qName) {
        String attributeValue = classUri + ":" + qName;
        Stream<DBResource> baseStream = memDBModel.findByClassAndQName(classUri, qName)
                .filter(dbResource -> !deleted.contains(dbResource.getId()) && !updated.containsKey(dbResource.getId()));
        Stream<DBResource> insertedStream = inserted.values().stream()
                .filter(dbResource -> dbResource.getNames().stream().anyMatch(s -> s.equals(attributeValue)));
        Stream<DBResource> updatedStream = updated.values().stream()
                .filter(dbResource -> dbResource.getNames().stream().anyMatch(s -> s.equals(attributeValue)));
        return Stream.concat(
                Stream.concat(insertedStream, updatedStream),
                baseStream
        );
    }

    public Stream<DBResource> findReferencedTo(String id) {
        Stream<DBResource> baseStream = memDBModel.findReferencedTo(id)
                .filter(dbResource -> !deleted.contains(dbResource.getId()) && !updated.containsKey(dbResource.getId()));
        Stream<DBResource> insertedStream = inserted.values().stream()
                .filter(dbResource -> dbResource.getNames().contains(id));
        Stream<DBResource> updatedStream = updated.values().stream()
                .filter(dbResource -> dbResource.getNames().contains(id));
        return Stream.concat(
                Stream.concat(insertedStream, updatedStream),
                baseStream
        );
    }

    @Override
    public void executeOn(MemDBModel prevalentSystem, Date executionTime) {
        deleted.stream().forEach(id -> {
            prevalentSystem.delete(id);
        });
        updated.values().forEach(dbResource->{
            prevalentSystem.update(dbResource);
        });
        inserted.values().forEach(dbResource->{
            prevalentSystem.insert(dbResource);
        });
        reset();
    }

    public MemDBServer getMemDBServer() {
        return (MemDBServer) getDbServer();
    }

    private DBResource createDBResource(Resource resource, String id, Integer version) {
        DBResource dbResource = new DBResource();
        dbResource.setId(id);
        dbResource.setVersion(version);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            resource.save(outputStream, null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        dbResource.setImage(outputStream.toByteArray());
        List<String> names = resource.getContents().stream().map(eObject ->
            EcoreUtil.getURI(eObject.eClass()).toString() + ":" + getMemDBServer().getQName(eObject)
        ).collect(Collectors.toList());
        dbResource.setNames(names);
        Map<EObject, Collection<EStructuralFeature.Setting>> xrs = EcoreUtil.ExternalCrossReferencer.find(resource);
        Set<String> references = xrs.keySet().stream()
                .map(eObject -> getMemDBServer().getId(eObject.eResource().getURI())).collect(Collectors.toSet());
        dbResource.setReferences(references);
        return dbResource;
    }

    @Override
    protected void insert(Resource resource) {
        DBResource dbResource = createDBResource(resource, getNextId(), 0);
        resource.setURI(getMemDBServer().createURI(dbResource.getId(), dbResource.getVersion()));
        inserted.put(dbResource.getId(), dbResource);
    }

    @Override
    protected void update(String id, Resource resource, Integer version) {
        DBResource dbResource = createDBResource(resource, id, version);
        resource.setURI(getMemDBServer().createURI(dbResource.getId(), dbResource.getVersion()));
        updated.put(id, dbResource);
    }

    @Override
    protected void delete(String id) {
        deleted.add(id);
    }

    @Override
    public void commit() {
        if (!isReadOnly()) {
            getMemDBServer().getPrevayler().execute(this);
        }
    }

    public void reset() {
        inserted.clear();
        updated.clear();
        deleted.clear();
    }

    public MemDBModel getMemDBModel() {
        return memDBModel;
    }

    public void setMemDBModel(MemDBModel memDBModel) {
        this.memDBModel = memDBModel;
    }
}
