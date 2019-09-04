package ru.neoflex.nfcore.base.types.impl

import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.base.components.Publisher
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.types.TypesPackage
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.base.util.EMFUtil

class QNameInit {
    {
        Context.current.publisher.subscribe(new Publisher.BeforeSaveHandler<EObject>(null) {
            @Override
            EObject handleEObject(EObject eObject) {
                def id = EMFUtil.getId(eObject.eResource())
                def nameType = TypesPackage.Literals.QNAME;
                def nameAttrs = eObject.eClass().EAllAttributes.findAll {it.EAttributeType == nameType && !it.isMany()}
                nameAttrs.each {
                    def eClass = it.EContainingClass
                    def name = eObject.eGet(it) as String
                    Context.current.registry.getSubClasses(eClass).find {!it.abstract}.each {aClass->
                        def dup = DocFinder.create(Context.current.store, aClass, [(it.name): name])
                                .execute().resourceSet.resources.findAll {EMFUtil.getId(it) != id}.size()
                        if (dup > 0) {
                            throw new IllegalArgumentException("Found ${dup} instance(s) of ${EcoreUtil.getURI(aClass)} with ${it.name}='${name}'")
                        }
                    }
                }
                return eObject
            }
        })
    }
    public QNameInit() {}
}
