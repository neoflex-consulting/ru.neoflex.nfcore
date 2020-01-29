package ru.neoflex.nfcore.base.components;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.ecore.EPackage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.eclipse.emf.ecore.EClassifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;

import javax.annotation.PostConstruct;

@Component("ru.neoflex.nfcore.base.components.StartUp")
@DependsOn({"ru.neoflex.nfcore.base.components.PackageRegistry"})
public class StartUp {
    private static final Logger logger = LoggerFactory.getLogger(StartUp.class);
    @Autowired
    Context context;
    @Autowired
    Store store;
    @Autowired
    PackageRegistry registry;

    @PostConstruct
    void init() throws Exception {
        context.inContext(() -> {
            return store.inTransaction(false, tx -> {
                for (EPackage ePackage: registry.getEPackages()) {
                    String nsURI = ePackage.getNsURI();
                    String name = StringUtils.capitalize(ePackage.getName());
                    String initClassName = nsURI + ".impl." + name + "PackageInit";
                    try {
                        Thread.currentThread().getContextClassLoader().loadClass(initClassName).getDeclaredConstructor().newInstance();
                        logger.info(String.format("%s: instantiated", initClassName));
                    }
                    catch (ClassNotFoundException e) {
                    }
                    catch (Throwable e) {
                        logger.error(initClassName, e);
                    }
                }
                for (EClassifier eClassifier: registry.getEClassifiers()) {
                    String nsURI = eClassifier.getEPackage().getNsURI();
                    String name = StringUtils.capitalize(eClassifier.getName());
                    String initClassName = nsURI + ".impl." + name + "Init";
                    try {
                        Thread.currentThread().getContextClassLoader().loadClass(initClassName).getDeclaredConstructor().newInstance();
                        logger.info(String.format("%s: instantiated", initClassName));
                    }
                    catch (ClassNotFoundException|NoSuchMethodException|InstantiationException e) {
                    }
                    catch (Throwable e) {
                        logger.error(initClassName, e);
                    }
                }
                store.commit("StartUp");
                return null;
            });
        });
    }
}
