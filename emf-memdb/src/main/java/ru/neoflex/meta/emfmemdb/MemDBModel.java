package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class MemDBModel implements Serializable {
    private Map<String, DBResource> dbResourceMap = new HashMap<>();
    Map<String, Object> indexes = new HashMap<>();

    public Map<String, DBResource> getDbResourceMap() {
        return dbResourceMap;
    }

    public DBResource get(String id) {
        return dbResourceMap.get(id).clone();
    }

    public Stream<DBResource> findAll() {
        return dbResourceMap.values().stream().map(dbResource -> dbResource.clone());
    }

    public void insert(DBResource dbResource) {
        dbResourceMap.put(dbResource.getId(), dbResource);
    }

    public void update(DBResource dbResource) {
        delete(dbResource.getId());
        insert(dbResource);
    }

    public void delete(String id) {
        dbResourceMap.remove(id);
    }

    public void createIndex(DBIndex dbIndex) {
        if (dbIndex.getFields().length < 2) {
            throw new IllegalArgumentException(String.format("Index fields length is less then 2: %d",
                    dbIndex.getFields().length));
        }
        indexes.put(dbIndex.getName(), new HashMap<>());
    }

    public void createIndexEntry(DBIndex dbIndex, String[] entry) {
        if (entry.length != dbIndex.getFields().length) {
            throw new IllegalArgumentException(String.format("Wrong entry size for index %s. Expected %d, found %d",
                    dbIndex.getName(), dbIndex.getFields().length, entry.length));
        }
        Map current = (Map) indexes.get(dbIndex.getName());
        if (current == null) {
            throw new IllegalArgumentException(String.format("Index % s not found", dbIndex.getName()));
        }
        for (int i = 0; i < dbIndex.getFields().length - 1; ++i) {
            if (i == dbIndex.getFields().length - 2) {
                current.put(entry[i], entry[i + 1]);
                break;
            }
            Map next = (Map) current.get(entry[i]);
            if (next == null) {
                next = new HashMap();
                current.put(entry[i], next);
            }
            current = next;
        }
    }

    public void deleteIndexEntry(DBIndex dbIndex, String[] entry) {
        Map current = (Map) indexes.get(dbIndex.getName());
        if (current == null) {
            throw new IllegalArgumentException(String.format("Index % s not found", dbIndex.getName()));
        }
        for (int i = 0; i < dbIndex.getFields().length; ++i) {
            if (i == entry.length - 1) {
                current.remove(entry[i]);
                break;
            }
            current = (Map) current.get(entry[i]);
            if (current == null) {
                break;
            }
        }

    }

    private List<List<String>> tail(Map<Object, Object> current) {
        List<List<String>> result = new ArrayList<>();
        for (Map.Entry entry: current.entrySet()) {
            if (entry.getValue() instanceof Map) {
                for (List<String> row: tail((Map<Object, Object>) entry.getValue())) {
                    row.add(0, entry.getKey().toString());
                    result.add(row);
                }
            }
            else {
                List<String> row = new ArrayList<>();
                row.add(entry.getKey().toString());
                row.add(entry.getValue().toString());
                result.add(row);
            }
        }
        return result;
    }

    public Stream<String[]> getIndexEntries(DBIndex dbIndex, String[] entry) {
        Object current = indexes.get(dbIndex.getName());
        if (current == null) {
            throw new IllegalArgumentException(String.format("Index % s not found", dbIndex.getName()));
        }
        List<String[]> result = new ArrayList<>();
        List<String> row = new ArrayList<>();
        for (int i = 0; i < entry.length && current != null; ++i) {
            if (current instanceof Map) {
                Map currentMap = (Map) current;
                current = currentMap.get(entry[i]);
                if (current != null) {
                    row.add(entry[i]);
                }
            }
            else if (current instanceof String) {
                if (current.equals(entry[i]) && i == entry.length - 1) {
                    row.add(entry[i]);
                    result.add(row.toArray(new String[0]));
                }
                current = null;
            }
            else {
                current = null;
            }
        }
        if (current instanceof String) {
            row.add((String) current);
            result.add(row.toArray(new String[0]));
        }
        else if(current instanceof Map) {
            for (List<String> tail: tail((Map<Object, Object>) current)) {
                tail.addAll(0, row);
                result.add(tail.toArray(new String[0]));
            }
        }
        return result.stream();
    }
}
