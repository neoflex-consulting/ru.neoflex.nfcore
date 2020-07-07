package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MObject implements Serializable {
    private MemoryModel memoryModel;
    MObject container;
    private long id;
    private long version;
    private String classURI;
    private Map<String, Object> attributes = new HashMap<>();
    private Map<String, Object> refers = new HashMap<>();
    private Map<String, Object> contains = new HashMap<>();
    private transient Map<Long, MObject> contents;

    MObject(MemoryModel memoryModel, long id) {
        this.memoryModel = memoryModel;
        this.id = id;
        this.version = 0;
    }

    public long getId() {
        return id;
    }

    public String getClassURI() {
        return classURI;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    private void attach(MObject mObject) {
        contents.put(mObject.getId(), mObject);
        for (Object o: contains.values()) {
            if (o instanceof MObject) {
                attach((MObject) o);
            }
            else if (o instanceof List) {
                for (Object o2: (List)o) {
                    if (o2 instanceof MObject) {
                        attach((MObject) o2);
                    }
                }
            }
        }
    }

    public Map<Long, MObject> getContents() {
        if (contents == null) {
            contents = new HashMap<>();
            attach(this);
        }
        return contents;
    }

    public void setClassURI(String classURI) {
        this.classURI = classURI;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }
}
