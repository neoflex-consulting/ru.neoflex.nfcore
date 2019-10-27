package ru.neoflex.meta.gitdb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Finder {

    public ResourceSet find(ObjectNode query, Transaction tx) throws IOException {
        Database database = tx.getDatabase();
        if (query.has("id")) {
            String id = query.get("id").asText();
            Resource resource = database.createResource(tx, id, null);
            resource.load(null);
            return resource.getResourceSet();
        }
        JsonNode contents = query.get("contents");
        if (contents == null) {
            return database.createResourceSet(tx);
        }
        JsonNode eClass = contents.get("eClass");
        if (eClass != null) {

        }
        ResourceSet resourceSet = database.createResourceSet(tx);
        return resourceSet;
    }

    private List<EntityId> findIds(ObjectNode query, Transaction tx) {
        return new ArrayList<>();
    }

    private ResourceSet filterIds(List<EntityId> ids, ObjectNode query, Transaction tx) {
        Database database = tx.getDatabase();
        return database.createResourceSet(tx);
    }

    private Index chooseIndex(ObjectNode query, Transaction tx) {
        return null;
    }
}
