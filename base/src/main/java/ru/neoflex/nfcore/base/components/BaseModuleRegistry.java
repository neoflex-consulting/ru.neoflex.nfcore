package ru.neoflex.nfcore.base.components;

import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EPackage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.impl.AuthFactoryExt;
import ru.neoflex.nfcore.base.scheduler.SchedulerPackage;
import ru.neoflex.nfcore.base.scheduler.impl.SchedulerFactoryExt;
import ru.neoflex.nfcore.base.types.TypesPackage;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Component
public class BaseModuleRegistry extends ModuleRegistryImpl {
    @PostConstruct
    void init() {
        registerEPackage(TypesPackage.eINSTANCE);
        registerEPackage(AuthPackage.eNS_URI, ()->AuthPackage.eINSTANCE, new AuthFactoryExt());
        registerEPackage(SchedulerPackage.eNS_URI, ()->SchedulerPackage.eINSTANCE, new SchedulerFactoryExt());
    }
}
