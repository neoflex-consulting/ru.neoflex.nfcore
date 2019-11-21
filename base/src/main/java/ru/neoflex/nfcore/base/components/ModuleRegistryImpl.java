package ru.neoflex.nfcore.base.components;

import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EValidator;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.base.auth.AuthPackage;
import ru.neoflex.nfcore.base.auth.impl.AuthFactoryExt;
import ru.neoflex.nfcore.base.scheduler.SchedulerPackage;
import ru.neoflex.nfcore.base.scheduler.impl.SchedulerFactoryExt;
import ru.neoflex.nfcore.base.types.TypesPackage;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;

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

    public void registerEPackage(String uri, Supplier<EPackage> ePackageCB, EFactory eFactory) {
        EPackage.Registry.INSTANCE.put(uri, new EPackage.Descriptor() {
            @Override
            public EPackage getEPackage() {
                return ePackageCB.get();
            }

            @Override
            public EFactory getEFactory() {
                return eFactory;
            }
        });
        ePackageCB.get().setEFactoryInstance(eFactory);
        ePackages.add(ePackageCB.get());
    }

    public void registerEPackage(String uri, Supplier<EPackage> ePackageCB, EFactory eFactory, EValidator eValidator) {
        registerEPackage(uri, ePackageCB, eFactory);
        EValidator.Registry.INSTANCE.put(ePackageCB.get(), eValidator);
    }
}
