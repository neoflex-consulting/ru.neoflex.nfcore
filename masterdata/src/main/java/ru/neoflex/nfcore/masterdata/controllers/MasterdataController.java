package ru.neoflex.nfcore.masterdata.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.neoflex.nfcore.masterdata.services.MasterdataProvider;

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.Map;

@RestController
@ConditionalOnBean(MasterdataProvider.class)
@RequestMapping("/masterdata")
public class MasterdataController {
    private final static Log logger = LogFactory.getLog(MasterdataController.class);
    @Autowired(required = false)
    MasterdataProvider provider;

    private void checkProvider() {
        if (provider == null) {
            throw new RuntimeException("No masterdata provider found");
        }
    }

    @GetMapping("/select")
    JsonNode select(@RequestParam String sql) {
        checkProvider();
        return provider.withDatabase(db -> provider.queryNode(sql));
    }

    @PostMapping("/select")
    JsonNode select(@RequestParam String sql, @RequestBody Map args) {
        checkProvider();
        return provider.withDatabase(db -> provider.queryNode(sql, args));
    }

    @GetMapping("/entity")
    JsonNode loadEntity(@RequestParam String id) {
        checkProvider();
        JsonNode result =  provider.withDatabase(db -> provider.load(db, id).getObjectNode());
        if (result == null) {
            throw new IllegalArgumentException(String.format("entity %s not found", id));
        }
        return result;
    }

    @PutMapping("/entity")
    JsonNode updateEntity(@RequestParam String id, @RequestBody ObjectNode node) {
        checkProvider();
        return provider.withDatabase(db -> provider.update(db, id, node).getObjectNode());
    }

    @PostMapping("/entity")
    JsonNode insertEntity(@RequestBody ObjectNode node) {
        checkProvider();
        return provider.withDatabase(db -> provider.insert(db, node).getObjectNode());
    }

    @DeleteMapping("/entity")
    boolean deleteEntity(@RequestParam String id) {
        checkProvider();
        provider.withDatabase(db -> provider.delete(db, id));
        return true;
    }

    @PostMapping(value="/import", produces={"application/json"})
    public ObjectNode importMd(@RequestParam(value = "file") final MultipartFile file) throws Exception {
        checkProvider();
        int count = provider.createExporter().importJson(file.getInputStream()).size();
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode result = mapper.createObjectNode().put("count", count);
        return result;
    }

    @GetMapping(value="/export")
    public ResponseEntity exportMd(@RequestParam String sql) throws IOException {
        checkProvider();
        PipedInputStream pipedInputStream = new PipedInputStream();
        PipedOutputStream pipedOutputStream = new PipedOutputStream(pipedInputStream);
        new Thread(() -> {
            try {
                provider.createExporter().exportSQL(sql, pipedOutputStream);
            } catch (Exception e) {
                logger.error("Export MD", e);
            }

        }).start();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "text/plain; charset=UTF-8");
        headers.set("Content-Disposition", "attachment; filename=\"masterdata.json\"");
        return new ResponseEntity(new InputStreamResource(pipedInputStream), headers, HttpStatus.OK);
    }
}
