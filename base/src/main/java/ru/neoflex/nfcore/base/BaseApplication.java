package ru.neoflex.nfcore.base;

import org.eclipse.jgit.http.server.GitServlet;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import ru.neoflex.meta.emfgit.TransactionClassLoader;
import ru.neoflex.nfcore.base.filters.ContextFilter;
import ru.neoflex.nfcore.base.filters.GitClasspathFilter;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
@EnableSwagger2
public class BaseApplication {

    @Value("${repo.base:${user.home}/.gitdb}")
    String repoBase;
    @Value("${repo.name:workspace}")
    String repoName;

    public static void main(String[] args) {
        TransactionClassLoader.withClassLoader(()->{
            new SpringApplication(BaseApplication.class).run(args);
        });
    }

    @Bean
    public FilterRegistrationBean<GitClasspathFilter> gitClasspathFilter(){
        FilterRegistrationBean<GitClasspathFilter> registrationBean
                = new FilterRegistrationBean<>();

        registrationBean.setFilter(new GitClasspathFilter());
        registrationBean.addUrlPatterns("*");

        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean<ContextFilter> contextFilter(){
        FilterRegistrationBean<ContextFilter> registrationBean
                = new FilterRegistrationBean<>();

        registrationBean.setFilter(new ContextFilter());
        registrationBean.addUrlPatterns("/emf/*");

        return registrationBean;
    }

    @Bean
    public ServletRegistrationBean servletRegistrationBean(){
        ServletRegistrationBean registration = new ServletRegistrationBean(new GitServlet(),"/git/*");
        Map<String,String> params = new HashMap<>();
        params.put("base-path", repoBase);
        params.put("export-all", "1");
        registration.setInitParameters(params);
        return registration;
    }

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }
}
