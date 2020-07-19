package ru.neoflex.meta.emfmemdb;

import com.googlecode.cqengine.ConcurrentIndexedCollection;
import com.googlecode.cqengine.IndexedCollection;
import com.googlecode.cqengine.attribute.Attribute;
import com.googlecode.cqengine.index.hash.HashIndex;
import com.googlecode.cqengine.index.radix.RadixTreeIndex;
import com.googlecode.cqengine.index.unique.UniqueIndex;
import com.googlecode.cqengine.query.QueryFactory;

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MemDBModel implements Externalizable {
    private IndexedCollection<MemDBResource> indexedCollection;
    public static final Attribute<MemDBResource, String> ID = QueryFactory.attribute("id", MemDBResource::getId);
    public static final Attribute<MemDBResource, String> NAMES = QueryFactory.attribute(String.class, "classUri", MemDBResource::getNames);
    public static final Attribute<MemDBResource, String> REFERENCES = QueryFactory.attribute(String.class,"references", MemDBResource::getReferences);

    public MemDBResource get(String id) {
        return getIndexedCollection().retrieve(QueryFactory.equal(ID, id)).uniqueResult();
    }

    public Stream<MemDBResource> findAll() {
        return getIndexedCollection().retrieve(QueryFactory.all(MemDBResource.class)).stream();
    }

    public Stream<MemDBResource> findByClass(String classUri) {
        String attributeValue = classUri + ":";
        return getIndexedCollection().retrieve(QueryFactory.startsWith(NAMES, attributeValue)).stream();
    }

    public Stream<MemDBResource> findByClassAndQName(String classUri, String qName) {
        String attributeValue = classUri + ":" + qName;
        return getIndexedCollection().retrieve(QueryFactory.equal(NAMES, attributeValue)).stream();
    }

    public Stream<MemDBResource> findReferencedTo(String id) {
        return getIndexedCollection().retrieve(QueryFactory.equal(REFERENCES, id)).stream();
    }

    public void insert(MemDBResource dbResource) {
        getIndexedCollection().add(dbResource);
    }

    public void update(MemDBResource dbResource) {
        delete(dbResource.getId());
        insert(dbResource);
    }

    public void delete(String id) {
        MemDBResource dbResource = get(id);
        getIndexedCollection().remove(dbResource);
    }

    public IndexedCollection<MemDBResource> getIndexedCollection() {
        if (indexedCollection == null) {
            indexedCollection = new ConcurrentIndexedCollection<>();
            indexedCollection.addIndex(UniqueIndex.onAttribute(ID));
            indexedCollection.addIndex(RadixTreeIndex.onAttribute(NAMES));
            indexedCollection.addIndex(HashIndex.onAttribute(REFERENCES));
        }
        return indexedCollection;
    }

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        List<MemDBResource> dbResources = findAll().collect(Collectors.toList());
        out.writeObject(dbResources);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        List<MemDBResource> dbResources = (List<MemDBResource>) in.readObject();
        getIndexedCollection().addAll(dbResources);
    }
}
