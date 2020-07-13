package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class MemDBObject implements Serializable {
    private String id;
    private int version;
    private String classURI;
    private String qName;
    private byte[] image;
    private List<MemDBReference> outRefs = new ArrayList<>();

    MemDBObject() {
        this.id = EcoreUtil.generateUUID();
        this.version = 0;
    }

    public String getId() {
        return id;
    }

    public String getClassURI() {
        return classURI;
    }

    public void setClassURI(String classURI) {
        this.classURI = classURI;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }

    public List<MemDBReference> getOutRefs() {
        return outRefs;
    }

    public void setOutRefs(List<MemDBReference> outRefs) {
        this.outRefs = outRefs;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQName() {
        return qName;
    }

    public void setQName(String qName) {
        this.qName = qName;
    }
}
