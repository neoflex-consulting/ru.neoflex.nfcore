package ru.neoflex.nfcore.masterdata.components;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;
import ru.neoflex.nfcore.base.components.ModuleRegistryImpl;
import ru.neoflex.nfcore.masterdata.MasterdataPackage;
import ru.neoflex.nfcore.masterdata.impl.MasterdataFactoryExt;
import ru.neoflex.nfcore.masterdata.impl.MasterdataValidatorExt;

@ComponentScan("ru.neoflex.nfcore")
@Component
class MasterdataModuleRegistry extends ModuleRegistryImpl {
    MasterdataModuleRegistry () {
        registerEPackage(MasterdataPackage.eNS_URI, ()->MasterdataPackage.eINSTANCE, new MasterdataFactoryExt(), new MasterdataValidatorExt());
    }
}
