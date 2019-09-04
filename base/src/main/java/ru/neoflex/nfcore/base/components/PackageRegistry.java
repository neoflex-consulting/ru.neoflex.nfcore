package ru.neoflex.nfcore.base.components;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EClassifier;
import org.eclipse.emf.ecore.EPackage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PackageRegistry {
    @Autowired
    List<IModuleRegistry> moduleRegistryList = new ArrayList<>();

    public List<EPackage> getEPackages() {
        List<EPackage> result = new ArrayList<>();
        for (IModuleRegistry registry : moduleRegistryList) {
            List<EPackage> list = registry.getEPackages();
            if (list != null) {
                result.addAll(list);
            }
        }
        return result;
    }

    public List<EClassifier> getEClassifiers() {
        List<EClassifier> result = new ArrayList<>();
        for (EPackage ePackage : getEPackages()) {
            result.addAll(ePackage.getEClassifiers());
        }
        return result;
    }

    public List<EClass> getEClasses() {
        List<EClass> result = new ArrayList<>();
        for (EClassifier eClassifier : getEClassifiers()) {
            if (eClassifier instanceof EClass) {
                result.add((EClass) eClassifier);
            }
        }
        return result;
    }

    public List<EClass> getSubClasses(EClass eClass) {
        List<EClass> result = new ArrayList<>();
        for (EClass aClass: getEClasses()) {
            if (eClass.isSuperTypeOf(aClass)) {
                result.add(aClass);
            }
        }
        return result;
    }
}
