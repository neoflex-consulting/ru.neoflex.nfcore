package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;
import java.util.Set;

public class MemDBResource implements Serializable, Cloneable {
    private String id;
    private int version;
    private Set<String> names;
    private Set<String> references;
    private byte[] image;

    MemDBResource() {
        this.id = null;
        this.version = 0;
    }

    public MemDBResource clone() {
        try {
            MemDBResource copy = (MemDBResource) super.clone();
            if (image != null) {
                copy.image = image.clone();
            }
            return copy;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    public String getId() {
        return id;
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

    public void setId(String id) {
        this.id = id;
    }

    public Set<String> getReferences() {
        return references;
    }

    public void setReferences(Set<String> references) {
        this.references = references;
    }

    public Set<String> getNames() {
        return names;
    }

    public void setNames(Set<String> names) {
        this.names = names;
    }
}
