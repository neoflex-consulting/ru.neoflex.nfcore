package ru.neoflex.nfcore.dsl

import org.apache.commons.lang3.StringUtils
import org.codehaus.groovy.control.CompilerConfiguration
import org.eclipse.emf.common.util.EList
import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EPackage
import org.eclipse.emf.ecore.util.EcoreUtil

class EcoreBuilder {
    Map<String, EObjectBuilder> builders = new HashMap<>();
    GroovyShell sh

    private GroovyShell shell() {
        if (sh == null) {
            def cc = new CompilerConfiguration()
            cc.setScriptBaseClass(DelegatingScript.class.getName())
            sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), new Binding(), cc)
        }
        return sh
    }

    void eval(String code) {
        def script = shell().parse(code) as DelegatingScript
        script.setDelegate(this)
        EObjectBuilder builder =  script.run() as EObjectBuilder
        builders.put(builder.id, builder)
    }

    List<EObject> resolve() {
        builders.values().each {builder->
            builder.extRefList.each {
                def id =  (StringUtils.isEmpty(it.id) || it.id == "/") ? builder.id : it.id
                def fragment = (StringUtils.isEmpty(it.fragment) || it.fragment == "/") ? builder.id : it.fragment
                def refBuilder = builders.get(id)
                def refObject = refBuilder.idToEObjects.get(fragment)
                if (it.eReference.isMany()) {
                    EList<EObject> eList = it.eObject.eGet(it.eReference) as EList<EObject>
                    eList.add(refObject)
                }
                else {
                    it.eObject.eSet(it.eReference, refObject)
                }
            }
        }
        return builders.values().collect {it.eObject}
    }

    static EObjectBuilder build(String nsPrefix, String className, @DelegatesTo(EObjectBuilder) Closure closure) {
        EcoreBuilder builder = new EcoreBuilder()
        return builder.eObject(nsPrefix, className, closure)
    }

    EObjectBuilder eObject(String nsPrefix, String className, @DelegatesTo(EObjectBuilder) Closure closure) {
        EPackage ePackage = EPackage.Registry.INSTANCE.values().find { ePackage->(ePackage as EPackage).nsPrefix == nsPrefix} as EPackage
        if (ePackage == null) {
            throw new IllegalArgumentException("EPackage ${nsPrefix} not found")
        }
        def eClass = ePackage.getEClassifier(className) as EClass
        if (eClass == null) {
            throw new IllegalArgumentException("EClass ${className} not found")
        }
        def eObject = EcoreUtil.create(eClass)
        def builder = new EObjectBuilder(eObject)
        closure.resolveStrategy = Closure.DELEGATE_FIRST
        closure.delegate = builder
        closure.call()
        builders.put(builder.id, builder)
        return builder
    }
}
