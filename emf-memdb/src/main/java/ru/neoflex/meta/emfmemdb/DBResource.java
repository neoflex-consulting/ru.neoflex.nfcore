package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;

public class DBResource implements Serializable, Cloneable {
    private String id;
    private int version;
    private byte[] image;

    DBResource() {
        this.id = null;
        this.version = 0;
    }

    public DBResource clone() {
        try {
            DBResource copy = (DBResource) super.clone();
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
}
