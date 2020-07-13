package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class MemDBModel implements Serializable {
    Map<String, MemDBObject> mObjectMap = new HashMap<>();

    void insert(MemDBObject dbObject) {
        mObjectMap.entrySet();
    }
}
