package ru.neoflex.nfcore.application.components;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.application.ApplicationPackage;
import ru.neoflex.nfcore.application.impl.ApplicationFactoryExt;
import ru.neoflex.nfcore.application.impl.ApplicationValidatorExt;
import ru.neoflex.nfcore.base.components.ModuleRegistryImpl;
import ru.neoflex.nfcore.dataset.DatasetPackage;
import ru.neoflex.nfcore.locales.LocalesPackage;
import ru.neoflex.nfcore.supply.SupplyPackage;
import ru.neoflex.nfcore.notification.NotificationPackage;
import ru.neoflex.nfcore.dataset.impl.DatasetFactoryExt;
import ru.neoflex.nfcore.dataset.impl.DatasetValidatorExt;
import ru.neoflex.nfcore.notification.impl.NotificationFactoryExt;
import ru.neoflex.nfcore.notification.impl.NotificationValidatorExt;

@SpringBootApplication
@ComponentScan("ru.neoflex.nfcore")
@Component
public class ApplicationModuleRegistry extends ModuleRegistryImpl {
    ApplicationModuleRegistry() {
        registerEPackage(ApplicationPackage.eNS_URI, ()->ApplicationPackage.eINSTANCE, new ApplicationFactoryExt(), new ApplicationValidatorExt());
        registerEPackage(DatasetPackage.eNS_URI, ()->DatasetPackage.eINSTANCE, new DatasetFactoryExt(), new DatasetValidatorExt());
        registerEPackage(LocalesPackage.eINSTANCE);
        registerEPackage(NotificationPackage.eNS_URI, ()->NotificationPackage.eINSTANCE, new NotificationFactoryExt(), new NotificationValidatorExt());
        registerEPackage(SupplyPackage.eINSTANCE);


    }
}
