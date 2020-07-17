package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.Serializable;

public class DBResource implements Serializable {
    private String id;
    private int version;
    private byte[] image;

    DBResource() {
        this.id = EcoreUtil.generateUUID();
        this.version = 0;
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
