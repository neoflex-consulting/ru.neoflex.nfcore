package ru.neoflex.nfcore.masterdata.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.neoflex.nfcore.masterdata.services.MasterdataProvider;

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
        return provider.withDatabase(db -> provider.load(db, id)).getObjectNode();
    }

    @PutMapping("/entity")
    JsonNode updateEntity(@RequestParam String id, @RequestBody ObjectNode node) {
        logger.debug("Update " + id);
        return provider.withDatabase(db -> provider.update(db, id, node)).getObjectNode();
    }

    @PostMapping("/entity")
    JsonNode insertEntity(@RequestBody ObjectNode node) {
        logger.debug("Insert entity");
        return provider.withDatabase(db -> provider.insert(db, node)).getObjectNode();
    }

    @DeleteMapping("/entity")
    boolean deleteEntity(@RequestParam String id) {
        provider.withDatabase(db -> provider.delete(db, id));
        return true;
    }
}
