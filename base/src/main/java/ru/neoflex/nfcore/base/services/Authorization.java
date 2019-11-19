package ru.neoflex.nfcore.base.services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class Authorization {
    private static final Logger logger = LoggerFactory.getLogger(Authorization.class);


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


}
