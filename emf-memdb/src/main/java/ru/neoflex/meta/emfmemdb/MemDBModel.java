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
    private IndexedCollection<DBResource> indexedCollection;
    public static final Attribute<DBResource, String> ID = QueryFactory.attribute("id", DBResource::getId);
    public static final Attribute<DBResource, String> NAMES = QueryFactory.attribute(String.class, "classUri", DBResource::getNames);
    public static final Attribute<DBResource, String> REFERENCES = QueryFactory.attribute(String.class,"references", DBResource::getReferences);

    public DBResource get(String id) {
        return getIndexedCollection().retrieve(QueryFactory.equal(ID, id)).uniqueResult();
    }

    public Stream<DBResource> findAll() {
        return getIndexedCollection().retrieve(QueryFactory.all(DBResource.class)).stream();
    }

    public Stream<DBResource> findByClass(String classUri) {
        String attributeValue = classUri + ":";
        return getIndexedCollection().retrieve(QueryFactory.startsWith(NAMES, attributeValue)).stream();
    }

    public Stream<DBResource> findByClassAndQName(String classUri, String qName) {
        String attributeValue = classUri + ":" + qName;
        return getIndexedCollection().retrieve(QueryFactory.equal(NAMES, attributeValue)).stream();
    }

    public Stream<DBResource> findReferencedTo(String id) {
        return getIndexedCollection().retrieve(QueryFactory.equal(REFERENCES, id)).stream();
    }

    public void insert(DBResource dbResource) {
        getIndexedCollection().add(dbResource);
    }

    public void update(DBResource dbResource) {
        delete(dbResource.getId());
        insert(dbResource);
    }

    public void delete(String id) {
        DBResource dbResource = get(id);
        getIndexedCollection().remove(dbResource);
    }

    public IndexedCollection<DBResource> getIndexedCollection() {
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
        List<DBResource> dbResources = findAll().collect(Collectors.toList());
        out.writeObject(dbResources);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        List<DBResource> dbResources = (List<DBResource>) in.readObject();
        getIndexedCollection().addAll(dbResources);
    }
}
