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
public class BaseModuleRegistry implements IModuleRegistry {
    {
        EPackage.Registry.INSTANCE.put(TypesPackage.eNS_URI, TypesPackage.eINSTANCE);
        EPackage.Registry.INSTANCE.put(AuthPackage.eNS_URI, new EPackage.Descriptor() {
            @Override
            public EPackage getEPackage() {
                return AuthPackage.eINSTANCE;
            }

            @Override
            public EFactory getEFactory() {
                return new AuthFactoryExt();
            }
        });
        EPackage.Registry.INSTANCE.put(SchedulerPackage.eNS_URI, new EPackage.Descriptor() {
            @Override
            public EPackage getEPackage() {
                return SchedulerPackage.eINSTANCE;
            }

            @Override
            public EFactory getEFactory() {
                return new SchedulerFactoryExt();
            }
        });
    }
    @Override
    public List<EPackage> getEPackages() {
        List<EPackage> result = new ArrayList<>();
        result.add(TypesPackage.eINSTANCE);
        //AuthPackage.eINSTANCE.setEFactoryInstance(new AuthFactoryExt());
        result.add(AuthPackage.eINSTANCE);
        //SchedulerPackage.eINSTANCE.setEFactoryInstance(new SchedulerFactoryExt());
        result.add(SchedulerPackage.eINSTANCE);
        return result;
    }
}
