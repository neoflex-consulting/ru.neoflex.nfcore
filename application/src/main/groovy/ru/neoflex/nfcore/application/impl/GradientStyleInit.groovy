package ru.neoflex.nfcore.application.impl

import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class GradientStyleInit {

    static def createGradientStyle(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.GRADIENT_STYLE, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {
            def gradientStyle = ApplicationFactory.eINSTANCE.createGradientStyle()
            gradientStyle.name = name
            gradientStyle.position = '90deg'

            def color1 = ApplicationFactory.eINSTANCE.createColor()
            color1.name = 'rgb(61,197,255)'
            def color2 = ApplicationFactory.eINSTANCE.createColor()
            color2.name = 'rgb(66,189,251)'
            def color3 = ApplicationFactory.eINSTANCE.createColor()
            color3.name = 'rgb(69,183,249)'
            def color4 = ApplicationFactory.eINSTANCE.createColor()
            color4.name = 'rgb(73,177,246)'
            def color5 = ApplicationFactory.eINSTANCE.createColor()
            color5.name = 'rgb(77,171,273)'
            def color6 = ApplicationFactory.eINSTANCE.createColor()
            color6.name = 'rgb(80,166,241)'
            def color7 = ApplicationFactory.eINSTANCE.createColor()
            color7.name = 'rgb(83,161,239)'
            def color8 = ApplicationFactory.eINSTANCE.createColor()
            color8.name = 'rgb(87,155,236)'
            def color9 = ApplicationFactory.eINSTANCE.createColor()
            color9.name = 'rgb(90,149,233)'
            def color10 = ApplicationFactory.eINSTANCE.createColor()
            color10.name = 'rgb(94,143,230)'
            def color11 = ApplicationFactory.eINSTANCE.createColor()
            color11.name = 'rgb(98,136,227)'
            def color12 = ApplicationFactory.eINSTANCE.createColor()
            color12.name = 'rgb(101,130,225)'
            def color13 = ApplicationFactory.eINSTANCE.createColor()
            color13.name = 'rgb(107,121,221)'
            def color14 = ApplicationFactory.eINSTANCE.createColor()
            color14.name = 'rgb(110,115,218)'
            def color15 = ApplicationFactory.eINSTANCE.createColor()
            color15.name = 'rgb(114,110,215)'
            def color16 = ApplicationFactory.eINSTANCE.createColor()
            color16.name = 'rgb(117,104,213)'
            def color17 = ApplicationFactory.eINSTANCE.createColor()
            color17.name = 'rgb(121,98,210)'
            def color18 = ApplicationFactory.eINSTANCE.createColor()
            color18.name = 'rgb(124,93,208)'
            def color19 = ApplicationFactory.eINSTANCE.createColor()
            color19.name = 'rgb(128,86,205)'
            def color20 = ApplicationFactory.eINSTANCE.createColor()
            color20.name = 'rgb(132,80,202)'
            def color21 = ApplicationFactory.eINSTANCE.createColor()
            color21.name = 'rgb(135,75,199)'
            def color22 = ApplicationFactory.eINSTANCE.createColor()
            color22.name = 'rgb(138,69,198)'

            gradientStyle.colors.add(color1)
            gradientStyle.colors.add(color2)
            gradientStyle.colors.add(color3)
            gradientStyle.colors.add(color4)
            gradientStyle.colors.add(color5)
            gradientStyle.colors.add(color6)
            gradientStyle.colors.add(color7)
            gradientStyle.colors.add(color8)
            gradientStyle.colors.add(color9)
            gradientStyle.colors.add(color10)
            gradientStyle.colors.add(color11)
            gradientStyle.colors.add(color12)
            gradientStyle.colors.add(color13)
            gradientStyle.colors.add(color14)
            gradientStyle.colors.add(color15)
            gradientStyle.colors.add(color16)
            gradientStyle.colors.add(color17)
            gradientStyle.colors.add(color18)
            gradientStyle.colors.add(color19)
            gradientStyle.colors.add(color20)
            gradientStyle.colors.add(color21)
            gradientStyle.colors.add(color22)

            rs.resources.add(Context.current.store.createEObject(gradientStyle))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
