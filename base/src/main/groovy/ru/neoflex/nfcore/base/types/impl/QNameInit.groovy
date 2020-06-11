package ru.neoflex.nfcore.base.types.impl

import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.types.TypesPackage
import ru.neoflex.nfcore.base.util.DocFinder

import java.util.function.BiConsumer

class QNameInit {
    {
        Context.current.store.registerBeforeSave(new BiConsumer<Resource, Resource>() {
            @Override
            void accept(Resource oldResource, Resource resource) {
                def eObject = resource.contents[0]
                def id = Context.current.store.getId(resource)
                def nameType = TypesPackage.Literals.QNAME;
                def nameAttrs = eObject.eClass().EAllAttributes.findAll {it.EAttributeType == nameType && !it.isMany()}
                nameAttrs.each {
                    def eClass = it.EContainingClass
                    def name = eObject.eGet(it) as String
                    def dup = DocFinder.create(Context.current.store, eClass, [(it.name): name])
                            .execute().resourceSet.getResources().findAll {Context.current.store.getId(it) != id}.size()
                    if (dup > 0) {
                        throw new IllegalArgumentException("Found ${dup} instance(s) of ${EcoreUtil.getURI(eClass)} with ${it.name}='${name}'")
                    }
                }
            }
        })
    }
    public QNameInit() {}
}
