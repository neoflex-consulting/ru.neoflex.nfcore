package ru.neoflex.nfcore.base.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController()
@RequestMapping("/system")
public class SysController {

    @GetMapping(value="/user", produces = "application/json; charset=utf-8")
    public Principal getUser(Principal principal) {
        return principal;
    }
}
