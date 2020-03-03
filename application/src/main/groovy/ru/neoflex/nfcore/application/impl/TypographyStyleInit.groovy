package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class TypographyStyleInit {

    static def findOrCreateEObject(EClass eClass, String name, String componentClassName, boolean replace = false) {
        def resources = DocFinder.create(Context.current.store, eClass, [name: name])
                .execute().resourceSet
        while (replace && !resources.resources.empty) {
            Context.current.store.deleteResource(resources.resources.remove(0).getURI())
        }
        if (resources.resources.empty) {
            def eObject = EcoreUtil.create(eClass)
            eObject.eSet(eClass.getEStructuralFeature("name"), name)
            if (componentClassName != "") {eObject.eSet(eClass.getEStructuralFeature("componentClassName"), componentClassName)}
            resources.resources.add(Context.current.store.createEObject(eObject))
        }
        return resources.resources.get(0).contents.get(0)
    }

    static def createTypographyStyle(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.TYPOGRAPHY_STYLE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def typographyStyle = ApplicationFactory.eINSTANCE.createTypographyStyle()
            typographyStyle.name = name
            def typography = ApplicationFactory.eINSTANCE.createTypography()
            typography.name = 'Typo1'
            typography.textAlign = TextAlign.LEFT
            typography.marginTop = '12'
            typography.borderBottom = '1px solid #eeeff0'
            typography.fontSize = '34'
            typography.textIndent = '20'
            typography.height = '70'
            typography.fontWeight = 'lighter'

//            def gradientStyle = ApplicationFactory.eINSTANCE.createGradientStyle()
//
//            typography.setGradientStyle(gradientStyle)

            typographyStyle.setTypography(typography)

            rs.resources.add(Context.current.store.createEObject(typographyStyle))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
