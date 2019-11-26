package ru.neoflex.nfcore.application.components;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.application.ApplicationPackage;
import ru.neoflex.nfcore.base.components.ModuleRegistryImpl;
import ru.neoflex.nfcore.dataset.DatasetPackage;
import ru.neoflex.nfcore.locales.LocalesPackage;
import ru.neoflex.nfcore.reports.ReportsPackage;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
@Component
public class ApplicationModuleRegistry extends ModuleRegistryImpl {
    ApplicationModuleRegistry() {
        registerEPackage(ApplicationPackage.eINSTANCE);
        registerEPackage(DatasetPackage.eINSTANCE);
        registerEPackage(LocalesPackage.eINSTANCE);
        registerEPackage(ReportsPackage.eINSTANCE);
    }
}
