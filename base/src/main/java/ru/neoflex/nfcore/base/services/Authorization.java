package ru.neoflex.nfcore.base.services;

import org.eclipse.emf.ecore.EObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.neoflex.nfcore.base.auth.ActionType;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.GrantStatus;
import ru.neoflex.nfcore.base.auth.Role;
import ru.neoflex.nfcore.base.util.DocFinder;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class Authorization {
    @Autowired
    Store store;

    private static final Logger logger = LoggerFactory.getLogger(Authorization.class);
    private Map<String, Role> allRoles;


    public static UserDetails getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                return (UserDetails)principal;
            }
        }
        return null;
    }

    public static String getUserName() {
        UserDetails userDetails = getUserDetails();
        if (userDetails != null) {
            return userDetails.getUsername();
        }
        return "";
    }

    public static boolean isUserInRole(String roleName) {
        UserDetails userDetails = getUserDetails();
        return userDetails != null &&
                userDetails.getAuthorities().stream().
                        filter(a->a.getAuthority().equals(roleName)).count() > 0;
    }

    public boolean isUserPermitted(ActionType actionType, EObject eObject) throws IOException {
        UserDetails userDetails = getUserDetails();
        Map<String, Role> allRoles = getAllRoles();
        return userDetails != null &&
                userDetails.getAuthorities().stream().
                        map(a->allRoles.get(a.getAuthority())).anyMatch(r-> r!= null && r.permitted(actionType, eObject) == GrantStatus.GRANTED);
    }

    public synchronized Map<String, Role> getAllRoles() throws IOException {
        if (allRoles == null) {
            allRoles = new HashMap<>();
            DocFinder.create(store, AuthPackage.Literals.ROLE).execute().getResources().
                    stream().map(r->(Role) r.getContents().get(0)).forEach(r->allRoles.put(r.getName(), r));
        }
        return allRoles;
    }
}
