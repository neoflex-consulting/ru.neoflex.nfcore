package ru.neoflex.nfcore.utils

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

import java.util.function.Consumer

class Utils {

    static def createEObject(EClass eClass, Map<String, Object> attrs) {
        def eObject = EcoreUtil.create(eClass)
        attrs.each {entry->eObject.eSet(eClass.getEStructuralFeature(entry.key), entry.value)}
        return eObject
    }

    static def findEObject(EClass eClass, String name, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def findEObjectWithConsumer(EClass eClass, String name, Consumer<EObject> consumer=null) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        if (resources.resources.empty) {
            def eObject = createEObject(eClass, ["name": name])
            if (consumer != null) {
                consumer.accept(eObject)
            }
            resources.resources.add(Context.current.store.createEObject(eObject))
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def findEClass(EClass eClass) {
        def resources = DocFinder.create(Context.current.store, eClass)
                .execute().resourceSet
        return resources.resources.get(0).contents.get(0)
    }

    static def findUserComponent(EClass eClass, String name, String componentClassName) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        if (resources.resources.empty) {
            def eObject = EcoreUtil.create(eClass)
            eObject.eSet(eClass.getEStructuralFeature("name"), name)
            if (componentClassName != "") {eObject.eSet(eClass.getEStructuralFeature("componentClassName"), componentClassName)}
            resources.resources.add(Context.current.store.createEObject(eObject))
        }
        return resources.resources.get(0).contents.get(0)
    }

}
