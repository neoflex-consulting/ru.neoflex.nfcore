package ru.neoflex.nfcore.base.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.neoflex.nfcore.base.services.Workspace;

import java.io.IOException;
import java.security.Principal;

@RestController()
@RequestMapping("/system")
public class SysController {
    @Autowired
    Workspace workspace;

    @GetMapping(value="/user", produces = "application/json; charset=utf-8")
    public Principal getUser(Principal principal) {
        return principal;
    }

    @GetMapping(value="/branches", produces = "application/json; charset=utf-8")
    public JsonNode getBranches(Principal principal) throws IOException {
        ArrayNode result = new ObjectMapper().createArrayNode();
        for (String branch: workspace.getDatabase().getBranches()) {
            result.add(branch);
        }
        return result;
    }

    @GetMapping(value="/branch", produces = "application/json; charset=utf-8")
    public String getCurrentBranch() throws IOException {
        return Workspace.getCurrentBranch();
    }

    @PutMapping(value="/branch", produces = "application/json; charset=utf-8")
    public String setCurrentBranch(String name) throws IOException {
        String prev = Workspace.getCurrentBranch();
        workspace.setCurrentBranch(name);
        return prev;
    }
}
