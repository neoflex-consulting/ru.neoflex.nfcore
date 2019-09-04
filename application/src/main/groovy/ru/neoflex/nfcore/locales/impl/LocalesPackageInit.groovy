package ru.neoflex.nfcore.locales.impl

import ru.neoflex.nfcore.locales.LocalesFactory
import ru.neoflex.nfcore.locales.LocalesPackage
import ru.neoflex.nfcore.locales.Lang
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class LocalesPackageInit {
    static def createLangIfNotExists(String lang) {
        def rs = DocFinder.create(Context.current.store, LocalesPackage.Literals.LANG, [name: lang])
                .execute().resourceSet
        if (rs.resources.empty) {
            def eObject = LocalesFactory.eINSTANCE.createLang()
            eObject.name = lang
            rs.resources.add(Context.current.store.createEObject(eObject))
        }
        return rs.resources.get(0).contents.get(0)
    }

    {
        Lang.metaClass.static.createLangIfNotExists = {String lang->
            createLangIfNotExists(lang)
        }
        Lang.createLangIfNotExists("en")
        Lang.createLangIfNotExists("ru")
        Lang.createLangIfNotExists("ch")
    }

    LocalesPackageInit() {}
}
