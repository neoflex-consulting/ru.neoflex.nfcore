package ru.neoflex.nfcore.base.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
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

    @PutMapping(value="/branch/{name}", produces = "application/json; charset=utf-8")
    public JsonNode setCurrentBranch(@PathVariable String name) throws IOException {
        workspace.setCurrentBranch(name);
        return getBranchInfo();
    }
}
