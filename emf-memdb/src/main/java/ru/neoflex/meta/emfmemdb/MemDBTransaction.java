package ru.neoflex.meta.emfmemdb;

import org.prevayler.Transaction;

import java.util.*;
import java.util.stream.Stream;

public class MemDBTransaction extends DBTransaction implements Transaction<MemDBModel> {
    private Map<String, DBResource> dbResourceMap = new HashMap<>();
    private Set<String> deleted = new HashSet<>();

    public MemDBTransaction(MemDBServer dbServer, boolean readOnly) {
        super(dbServer, readOnly);
    }

    public Stream<Map.Entry<String, DBResource>> allEntries() {
        Stream<Map.Entry<String, DBResource>> baseStream = getMemDBServer().getPrevayler().prevalentSystem().getDbResourceMap().entrySet().stream()
                .filter(entry -> !deleted.contains(entry.getKey()) && !dbResourceMap.containsKey(entry.getKey()));
        Stream<Map.Entry<String, DBResource>> insertedStream = dbResourceMap.entrySet().stream();
        return Stream.concat(
                insertedStream,
                baseStream
        );
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

    public MemDBServer getMemDBServer() {
        return (MemDBServer) dbServer;
    }

    @Override
    public DBResource get(String id) {
        DBResource dbObject = null;
        if (!deleted.contains(id)) {
            dbObject = dbResourceMap.getOrDefault(id, getMemDBServer().getPrevayler().prevalentSystem().getDbResourceMap().get(id)
            );
        }
        if (dbObject == null) {
            throw new IllegalArgumentException(String.format("Can't find object %s", id));
        }
        return dbObject.clone();
    }

    @Override
    protected void insert(DBResource dbResource) {
        dbResourceMap.put(dbResource.getId(), dbResource);
    }

    @Override
    protected void update(DBResource dbResource) {
        dbResourceMap.put(dbResource.getId(), dbResource);
    }

    @Override
    protected void delete(DBResource dbResource) {
        deleted.add(dbResource.getId());
    }

    @Override
    public void commit() {
        if (!isReadOnly()) {
            getMemDBServer().getPrevayler().execute(this);
//            executeOn(getMemDBServer().getPrevayler().prevalentSystem(), new Date());
        }
    }

    public void reset() {
        dbResourceMap.clear();
        deleted.clear();
    }
}
