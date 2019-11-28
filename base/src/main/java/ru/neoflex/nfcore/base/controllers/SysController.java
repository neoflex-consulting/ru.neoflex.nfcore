package ru.neoflex.nfcore.base.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.neoflex.meta.emfgit.Exporter;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.services.Authorization;
import ru.neoflex.nfcore.base.services.Workspace;

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController()
@RequestMapping("/system")
public class SysController {
    private final static Log logger = LogFactory.getLog(SysController.class);
    @Autowired
    Workspace workspace;

    @GetMapping(value="/user", produces = "application/json; charset=utf-8")
    public Principal getUser(Principal principal) {
        return principal;
    }

    @GetMapping(value="/branch", produces = "application/json; charset=utf-8")
    public JsonNode getBranchInfo() throws IOException {
        ObjectNode branchInfo = new ObjectMapper().createObjectNode();
        branchInfo.put("current", workspace.getCurrentBranch());
        branchInfo.put("default", workspace.getDefaultBranch());
        ArrayNode branches = branchInfo.withArray("branches");
        for (String branch: workspace.getDatabase().getBranches()) {
            branches.add(branch);
        }
        return branchInfo;
    }

    @PostMapping(value="/importdb", produces={"application/json"})
    public ObjectNode importDb(@RequestParam(value = "file") final MultipartFile file) throws Exception {
        return workspace.getDatabase().inTransaction(workspace.getCurrentBranch(), Transaction.LockType.WRITE, (tx)->{
            int count =  new Exporter(workspace.getDatabase()).unzip(file.getInputStream(), tx);
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode result = mapper.createObjectNode().put("count", count);
            tx.commit("Import database: " + mapper.writeValueAsString(result), Authorization.getUserName(), "");
            return result;
        });
    }

    @GetMapping(value="/exportdb")
    public ResponseEntity exportDb() throws IOException {
        PipedInputStream pipedInputStream = new PipedInputStream();
        PipedOutputStream pipedOutputStream = new PipedOutputStream(pipedInputStream);
        new Thread(() -> {
            try {
                new Exporter(workspace.getDatabase()).zipAll(workspace.getCurrentBranch(), pipedOutputStream);
            } catch (Exception e) {
                logger.error("Export DB", e);
            }

        }).start();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/zip");
        headers.set("Content-Disposition", "attachment; filename=\"database.zip\"");
        return new ResponseEntity(new InputStreamResource(pipedInputStream), headers, HttpStatus.OK);
    }

    @PostMapping(value="/exportdb", consumes={"application/json"})
    public ResponseEntity exportDb(
            @RequestBody List<String> ids,
            @RequestParam boolean withReferences,
            @RequestParam boolean withDependents,
            @RequestParam boolean recursiveDependents
    ) throws IOException {
        PipedInputStream pipedInputStream = new PipedInputStream();
        PipedOutputStream pipedOutputStream = new PipedOutputStream(pipedInputStream);
        String branch = workspace.getCurrentBranch();
        new Thread(() -> {
            try {
                workspace.getDatabase().inTransaction(branch, Transaction.LockType.READ, tx->{
                    ResourceSet rs = workspace.getDatabase().createResourceSet(tx);
                    List<Resource> resources = new ArrayList<>();
                    for (String id: ids) {
                        resources.add(workspace.getDatabase().loadResource(rs, id));
                    }
                    if (withDependents) {
                        resources = workspace.getDatabase().getDependentResources(resources, tx, recursiveDependents);
                    }
                    if (withReferences) {
                        ResourceSet wr = workspace.getDatabase().createResourceSet(tx);
                        wr.getResources().addAll(resources);
                        EcoreUtil.resolveAll(wr);
                        resources = new ArrayList<>(wr.getResources());
                    }
                    new Exporter(workspace.getDatabase()).zip(resources, pipedOutputStream);
                    return null;
                });
            } catch (Exception e) {
                logger.error("Export DB", e);
            }

        }).start();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/zip");
        headers.set("Content-Disposition", "attachment; filename=\"database.zip\"");
        return new ResponseEntity(new InputStreamResource(pipedInputStream), headers, HttpStatus.OK);
    }

    @PutMapping(value="/branch/{name}", produces = "application/json; charset=utf-8")
    public JsonNode setCurrentBranch(@PathVariable String name) throws IOException {
        workspace.setCurrentBranch(name);
        return getBranchInfo();
    }
}
