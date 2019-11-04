package ru.neoflex.nfcore.base.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.logging.log4j.util.Strings;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.util.DocFinder;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController()
@RequestMapping("/emf")
public class EMFController {
    @Autowired
    Store store;
    @Autowired
    PackageRegistry registry;
    @Autowired
    Context context;
    ObjectMapper mapper;

    @PostConstruct
    void init() {
        mapper = store.createMapper();
    }

    private ObjectNode resourceToTree(Resource resource) {
        ObjectNode result = mapper.createObjectNode();
        result.put("uri", store.getRef(resource));
        result.withArray("contents").add(mapper.valueToTree(resource.getContents().get(0)));
        return result;
    }

    private ObjectNode resourceSetToTree(ResourceSet resourceSet) {
        ObjectNode result = mapper.createObjectNode();
        List<Resource> resources = new ArrayList<>(resourceSet.getResources());
        result.withArray("resources");
        for (Resource resource: resources) {
            result.withArray("resources").add(resourceToTree(resource));
        }
        return result;
    }

    @GetMapping("/resource")
    JsonNode getObject(@RequestParam String ref) throws Exception {
        return store.withTransaction(true, tx -> {
            Resource resource = store.loadResource(ref);
            ObjectNode result = resourceToTree(resource);
            return result;
        });
    }

    @DeleteMapping("/resource")
    JsonNode deleteObject(@RequestParam String ref) throws Exception {
        return store.withTransaction(false, tx -> {
            store.deleteResource(ref);
            store.commit("Delete " + ref);
            return mapper.createObjectNode().put("result", "ok");
        });
    }

    @PutMapping("/resource")
    JsonNode putObject(@RequestParam(required = false) String ref, @RequestBody JsonNode contents) throws Exception {
        return getObject(store.withTransaction(false, tx -> {
            Resource resource = store.treeToResource(ref, contents);
            store.saveResource(resource);
            store.commit("Put " + ref);
            return store.getRef(resource);
        }));
    }

    @GetMapping("/packages")
    JsonNode getPackages() {
        ArrayNode nodes = mapper.createArrayNode();
        for (EPackage ePackage: registry.getEPackages()) {
            nodes.add(mapper.valueToTree(ePackage));
        }
        return nodes;
    }

    @PostMapping("/find")
    JsonNode find(@RequestBody ObjectNode selector) throws IOException {
        DocFinder docFinder = DocFinder.create(store)
                .executionStats(true)
                .selector(selector)
                .execute();
        ObjectNode resourceSetNode = resourceSetToTree(docFinder.getResourceSet());
        resourceSetNode.set("executionStats", docFinder.getExecutionStats());
        resourceSetNode.put("warning", docFinder.getWarning());
        resourceSetNode.put("bookmark", docFinder.getBookmark());
        return resourceSetNode;
    }

    @PostMapping("/call")
    JsonNode call(@RequestParam String ref, @RequestParam String method, @RequestBody List<Object> args) throws Exception {
        Resource resource = store.loadResource(ref);
        Object result =  context.getGroovy().eval(resource.getContents().get(0), method, args);
        return mapper.valueToTree(result);
    }

    @PostMapping("/calltx")
    JsonNode callTx(@RequestParam String ref, @RequestParam String method, @RequestBody List<Object> args) throws Exception {
        return store.withTransaction(false, tx -> {
            Resource resource = store.loadResource(ref);
            Object result =  context.getGroovy().eval(resource.getContents().get(0), method, args);
            store.commit("Call with tx " + method + "(" + ref + ", " +
                    args.stream().map(Object::toString).collect(Collectors.joining(", ")) + ")");
            return mapper.valueToTree(result);
        });
    }
}

