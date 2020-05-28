package ru.neoflex.nfcore.masterdata.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

@RestController()
@RequestMapping("/masterdata")
public class MasterdataController {
    private final static Log logger = LogFactory.getLog(MasterdataController.class);
    @Autowired
    MasterdataProvider provider;

    @GetMapping("/select")
    JsonNode select(@RequestParam String sql) {
        logger.debug("Select " + sql);
        return provider.withDatabase(db -> provider.queryNode(sql));
    }

    @PostMapping("/select")
    JsonNode select(@RequestParam String sql, @RequestBody Map args) {
        logger.debug("Select " + sql);
        return provider.withDatabase(db -> provider.queryNode(sql, args));
    }

    @GetMapping("/entity")
    JsonNode loadEntity(@RequestParam String id) {
        logger.debug("Load " + id);
        JsonNode result =  provider.withDatabase(db -> provider.load(db, id).getObjectNode());
        if (result == null) {
            throw new IllegalArgumentException(String.format("entity %s not found", id));
        }
        return result;
    }

    @PutMapping("/entity")
    JsonNode updateEntity(@RequestParam String id, @RequestBody ObjectNode node) {
        logger.debug("Update " + id);
        return provider.withDatabase(db -> provider.update(db, id, node).getObjectNode());
    }

    @PostMapping("/entity")
    JsonNode insertEntity(@RequestBody ObjectNode node) {
        logger.debug("Insert entity");
        return provider.withDatabase(db -> provider.insert(db, node).getObjectNode());
    }

    @DeleteMapping("/entity")
    boolean deleteEntity(@RequestParam String id) {
        provider.withDatabase(db -> provider.delete(db, id));
        return true;
    }

    @PostMapping(value="/import", produces={"application/json"})
    public ObjectNode importMd(@RequestParam(value = "file") final MultipartFile file) throws Exception {
        int count = provider.createExporter().importJson(file.getInputStream()).size();
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode result = mapper.createObjectNode().put("count", count);
        return result;
    }

    @GetMapping(value="/export")
    public ResponseEntity exportMd(@RequestParam String sql) throws IOException {
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
