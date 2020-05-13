package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.utils.Utils

class TypographyStyleInit {

    static def createTypographyStyle(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.TYPOGRAPHY_STYLE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def typographyStyle = ApplicationFactory.eINSTANCE.createTypographyStyle()
            typographyStyle.name = name
            typographyStyle.textAlign = TextAlign.LEFT
            typographyStyle.marginTop = '12px'
            typographyStyle.marginBottom = '16px'
            typographyStyle.fontSize = '34px'
            typographyStyle.textIndent = '20px'
            typographyStyle.height = '70px'
            typographyStyle.fontWeight = 'inherit'

            def gradientStyle = Utils.findEObject(ApplicationPackage.Literals.GRADIENT_STYLE, "Neoflex")
            typographyStyle.setGradientStyle(gradientStyle)

            rs.resources.add(Context.current.store.createEObject(typographyStyle))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
