package ru.neoflex.nfcore.masterdata.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.record.OElement;

import java.io.IOException;

public class OEntity {
    private OElement oElement;
    private ObjectNode objectNode;

    public OEntity(OElement oElement) {
        this.oElement = oElement;
    }

    public OEntity(ObjectNode objectNode) {
        this.objectNode = objectNode;
    }

    public ObjectNode getObjectNode() {
        if (objectNode == null) {
            if (oElement != null) {
                objectNode = oElementToNode(oElement);
            }
        }
        return objectNode;
    }

    public String getRid() {
        if (oElement != null) {
            return oElement.getIdentity().toString();
        }
        if (objectNode != null) {
            return objectNode.get("@rid").asText();
        }
        return null;
    }

    public ObjectNode oElementToNode(OElement oElement) {
        try {
            String jsonString = oElement.toJSON(/*"rid,version,class"*/);
            return (ObjectNode) (new ObjectMapper()).readTree(jsonString);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public OElement getOElement() {
        return oElement;
    }
}
