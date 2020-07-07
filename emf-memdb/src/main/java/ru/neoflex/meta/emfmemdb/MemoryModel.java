package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class MemoryModel implements Serializable {
    long lastId = 0;
    Map<Long, MObject> mObjectMap = new HashMap<>();

    public MObject createMObject() {
        return new MObject(this, ++lastId);
    }
}
