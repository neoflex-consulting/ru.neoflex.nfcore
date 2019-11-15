package ru.neoflex.nfcore.base.components;

import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EPackage;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.impl.AuthFactoryExt;
import ru.neoflex.nfcore.base.scheduler.SchedulerPackage;
import ru.neoflex.nfcore.base.scheduler.impl.SchedulerFactoryExt;
import ru.neoflex.nfcore.base.types.TypesPackage;

import java.util.ArrayList;
import java.util.List;

@Component
public class ModuleRegistryImpl implements IModuleRegistry {
    private List<EPackage> ePackages = new ArrayList<>();

    @Override
    public List<EPackage> getEPackages() {
        return ePackages;
    }

    public void registerEPackage(EPackage ePackage) {
        EPackage.Registry.INSTANCE.put(ePackage.getNsURI(), ePackage);
        ePackages.add(ePackage);
    }

    public void registerEPackage(EPackage ePackage, EFactory eFactory) {
        ePackage.setEFactoryInstance(eFactory);
        EPackage.Registry.INSTANCE.put(SchedulerPackage.eNS_URI, new EPackage.Descriptor() {
            @Override
            public EPackage getEPackage() {
                return ePackage;
            }

            @Override
            public EFactory getEFactory() {
                return eFactory;
            }
        });
        ePackages.add(ePackage);
    }
}
