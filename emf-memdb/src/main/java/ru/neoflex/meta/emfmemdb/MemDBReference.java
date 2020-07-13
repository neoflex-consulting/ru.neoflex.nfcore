package ru.neoflex.meta.emfmemdb;

import java.io.Serializable;

public class MemDBReference implements Serializable {
    private String inId;
    private String inFragment;
    private String feature;
    private int index;
    private String outId;
    private String outFragment;
    private String outClassURI;

    public String getInId() {
        return inId;
    }

    public void setInId(String inId) {
        this.inId = inId;
    }

    public String getInFragment() {
        return inFragment;
    }

    public void setInFragment(String inFragment) {
        this.inFragment = inFragment;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getOutId() {
        return outId;
    }

    public void setOutId(String outId) {
        this.outId = outId;
    }

    public String getOutFragment() {
        return outFragment;
    }

    public void setOutFragment(String outFragment) {
        this.outFragment = outFragment;
    }

    public String getOutClassURI() {
        return outClassURI;
    }

    public void setOutClassURI(String outClassURI) {
        this.outClassURI = outClassURI;
    }
}
