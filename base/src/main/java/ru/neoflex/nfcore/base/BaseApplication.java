package ru.neoflex.nfcore.base;

import org.eclipse.jgit.http.server.GitServlet;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import ru.neoflex.meta.gitdb.TransactionClassLoader;
import ru.neoflex.nfcore.base.filters.GitClasspathFilter;
import ru.neoflex.nfcore.base.services.Workspace;
import ru.neoflex.nfcore.base.util.FileUtils;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
public class BaseApplication {

    @Value("${workspace.root:${user.dir}/workspace}")
    String workspaceRoot;

    public static void main(String[] args) {
        TransactionClassLoader.withClassLoader(()->{
            new SpringApplication(BaseApplication.class).run(args);
        });
    }

    @Bean
    public FilterRegistrationBean<GitClasspathFilter> loggingFilter(){
        FilterRegistrationBean<GitClasspathFilter> registrationBean
                = new FilterRegistrationBean<>();

        registrationBean.setFilter(new GitClasspathFilter());
        registrationBean.addUrlPatterns("/*");

        return registrationBean;
    }

    @Bean
    public ServletRegistrationBean servletRegistrationBean(){
        ServletRegistrationBean registration = new ServletRegistrationBean(new GitServlet(),"/git/*");
        Map<String,String> params = new HashMap<>();
        File repo = new File(workspaceRoot);
        params.put("base-path",repo.getParent());
        params.put("export-all", "1");
        registration.setInitParameters(params);
        return registration;
    }
}
