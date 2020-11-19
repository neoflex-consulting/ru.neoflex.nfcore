package ru.neoflex.nfcore.base.services;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.GrantType;
import ru.neoflex.nfcore.base.auth.Role;
import ru.neoflex.nfcore.base.util.DocFinder;

import java.util.*;
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

    public synchronized Map<String, Role> getAllRoles() {
        if (allRoles == null) {
            try {
                allRoles = new HashMap<>();
                DocFinder.create(store, AuthPackage.Literals.ROLE).execute().getResources().
                        stream().map(r->(Role) r.getContents().get(0)).forEach(r->allRoles.put(r.getName(), r));
            }
            catch (Throwable e) {
                throw new RuntimeException(e);
            }
        }
        return allRoles;
    }

    public synchronized void clearRolesCache() {
        allRoles = null;
    }

    public List<Role> getUserRoles() {
        UserDetails userDetails = getUserDetails();
        if (userDetails != null) {
            return getAuthoritiesRoles(userDetails.getAuthorities());
        }
        return Collections.emptyList();
    }

    public List<Role> getAuthoritiesRoles(Collection<? extends GrantedAuthority> authorities) {
        List<Role> result = new ArrayList<>();
        if (authorities != null) {
            result = authorities.stream()
                    .map(a->getAllRoles().getOrDefault(a.getAuthority(), null))
                    .filter(r->r != null).collect(Collectors.toList());
        }
        return result;
    }

    public int isEObjectPermitted(EObject eObject) {
        int result = 0;
        for (Role role: getUserRoles()) {
            result |= role.isEObjectPermitted(eObject);
        }
        return result;
    }

    public int isResourcePermitted(final String path) {
        return isResourcePermitted(getUserRoles(), path);
    }

    public int isResourcePermitted(Collection<Role> roles, final String path) {
        int result = 0;
        for (Role role: roles) {
            result |= role.isResourcePermitted(path);
        }
        return result;
    }

    public static GrantType getGrantType(int grantValue) {
        if ((grantValue&GrantType.DENIED_VALUE) != 0) {
            return GrantType.DENIED;
        }
        if ((grantValue&GrantType.WRITE_VALUE) != 0) {
            return GrantType.WRITE;
        }
        if ((grantValue&GrantType.READ_VALUE) != 0) {
            return GrantType.READ;
        }
        return GrantType.DENIED;
    }
}
