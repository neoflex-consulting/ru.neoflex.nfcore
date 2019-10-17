package ru.neoflex.nfcore.base;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import ru.neoflex.meta.gitdb.TransactionClassLoader;
import ru.neoflex.nfcore.base.filters.GitClasspathFilter;
import ru.neoflex.nfcore.base.services.Workspace;
import ru.neoflex.nfcore.base.util.FileUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
public class BaseApplication {

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
}
