package ru.neoflex.nfcore.base;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import ru.neoflex.nfcore.base.services.Workspace;
import ru.neoflex.nfcore.base.util.FileUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
public class BaseApplication {

    public static void main(String[] args) {
        try {
            FileUtils.withClassLoader(() -> {
                new SpringApplication(BaseApplication.class).run(args);
                return null;
            });
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

}
