package ru.neoflex.nfcore.base.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsImpl;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.services.UserDetail;
import ru.neoflex.nfcore.base.util.DocFinder;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;

@Configuration
@EnableWebSecurity
public class Security extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("HEAD");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("PATCH");
        source.registerCorsConfiguration("/**", config);
        http
                .httpBasic()
                .and()
                    .authorizeRequests()
                    .antMatchers("/locales/**").permitAll()
                    .antMatchers("/emf/*").permitAll()
                    .antMatchers("/system/user/**").authenticated()
                    .antMatchers("/app/**").authenticated()
                .and()
                     .cors().configurationSource(source)
                .and()
                     .logout().logoutRequestMatcher(new AntPathRequestMatcher("/logout")).deleteCookies("JSESSIONID").clearAuthentication(true).invalidateHttpSession(true).logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK))
                .and()
                     .csrf().disable();
    }

    @Configuration
    protected static class BaseConfiguration extends
            GlobalAuthenticationConfigurerAdapter {

        @Autowired
        private UserDetail userDetailService;

        @Override
        public void init(AuthenticationManagerBuilder auth) throws Exception {
            auth.eraseCredentials(false).userDetailsService(userDetailService);
        }
    }

    @Configuration
    protected static class LdapConfiguration extends
            GlobalAuthenticationConfigurerAdapter {

        @Autowired
        Store store;

        @Value("${ldap.host:}")
        private String host;
        @Value("${ldap.domain:}")
        private String domain;
        @Value("${ldap.port:}")
        private String port;
        @Value("${ldap.base:}")
        private String base;

        @Override
        public void init(AuthenticationManagerBuilder auth) throws Exception {
            if (!StringUtils.isAnyEmpty(host, port, domain, base)) {
                final String url = "ldap://" + host + ":" + port;
                final ActiveDirectoryLdapAuthenticationProvider provider =
                        new ActiveDirectoryLdapAuthenticationProvider(domain, url, base);
                final LdapUserDetailsMapper ldapUserDetailsMapper = new LdapUserDetailsMapper();
                final HashSet<GrantedAuthority> au = new HashSet<>();
                final HashSet<String> rolesFromLdap = new HashSet<>();
                final HashSet<String> rolesFromDB = new HashSet<>();

                provider.setUserDetailsContextMapper(new UserDetailsContextMapper() {

                    @Override
                    public UserDetails mapUserFromContext(DirContextOperations ctx, String username, Collection<? extends GrantedAuthority> authorities) {
                        UserDetails userDetails = ldapUserDetailsMapper.mapUserFromContext(ctx, username, authorities);

                        //Get roles from Ldap
                        for (GrantedAuthority grantedAuthority : userDetails.getAuthorities()) {
                            String temp = grantedAuthority.toString();
                            rolesFromLdap.add(temp);
                        }

                        //Get roles from Databases (from roles and from groups)
                        DocFinder docFinder = DocFinder.create(store);
                        ObjectMapper objectMapper = new ObjectMapper();
                        ObjectNode selector = objectMapper.createObjectNode();
                        selector
                                .with("contents")
                                .put("eClass", "ru.neoflex.nfcore.base.auth#//Role");
                        try {
                            docFinder
                                    .executionStats(true)
                                    .selector(selector)
                                    .execute();
                            EList<Resource> resources = docFinder.getResourceSet().getResources();

                            for (Resource resource: resources) {
                                ru.neoflex.nfcore.base.auth.Role role = (ru.neoflex.nfcore.base.auth.Role) resource.getContents().get(0);
                                if (!role.getName().isEmpty()) {
                                    rolesFromDB.add(role.getName());
                                }
                            }

                            //Add roles from Ldap that are contained in Databases
                            for (String roleFromLdap:rolesFromLdap) {
                                if (rolesFromDB.contains(roleFromLdap)) {
                                    au.add(new SimpleGrantedAuthority(roleFromLdap));
                                }
                            }

                        } catch (IOException e) {
                            throw new UsernameNotFoundException(e.getMessage());
                        }

                        LdapUserDetailsImpl.Essence essence = new LdapUserDetailsImpl.Essence((LdapUserDetails) userDetails);
                        essence.setAuthorities(au);
                        return essence.createUserDetails();
                    }

                    @Override
                    public void mapUserToContext(UserDetails user, DirContextAdapter ctx) {
                        ldapUserDetailsMapper.mapUserToContext(user, ctx);
                    }
                });
                auth.eraseCredentials(false).authenticationProvider(provider);
            }
        }
}
}

