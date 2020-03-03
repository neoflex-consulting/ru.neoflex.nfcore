package ru.neoflex.nfcore.application.impl

import org.eclipse.emf.ecore.EClass
import org.eclipse.emf.ecore.util.EcoreUtil
import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.IconName
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder

class ApplicationInit {
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

    static def recreateApplication(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        while (!rs.resources.empty) {
            Context.current.store.deleteResource(rs.resources.remove(0).getURI())
        }
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createApplication()

            if (name == "Налоговая отчетность") {
                application.name = name
                application.iconName = IconName.FA_EYE

                def userComponent5 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Page Not Found", "PageNotFound",false)

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Page Not Found'
                componentElement1.setComponent(userComponent5)
                application.view = componentElement1
            }
            else if (name == "Администрирование") {
                application.name = name
                application.iconName = IconName.FA_COGS
                def row = ApplicationFactory.eINSTANCE.createRow()
                row.name = "row1"
                row.textAlign = TextAlign.LEFT
                row.borderBottom = true
                row.height = '80px'

                def column = ApplicationFactory.eINSTANCE.createColumn()
                column.name = "column1"
                column.span = "9"

                def typography = ApplicationFactory.eINSTANCE.createTypography()
                typography.name = "Администрирование системы"

                def typographyStyle = findOrCreateEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title", "",false)
                typography.setTypographyStyle(typographyStyle)

                column.children.add(typography)
                row.children.add(column)
                application.setView(row)

                def catalogNode1 = ApplicationFactory.eINSTANCE.createCatalogNode()
                catalogNode1.name = "CatalogNodeAdmin"

                def catalogNode2 = ApplicationFactory.eINSTANCE.createCatalogNode()
                catalogNode2.name = "Журналы"
                def viewNode1 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode1.name = 'Журнал активности пользователей'
               def viewNode2 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode2.name = 'Журнал обновлений системы'
               def viewNode3 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode3.name = 'Журнал попыток входа в систему'
               def viewNode4 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode4.name = 'Журнал изменения статуса отчета'
               def viewNode5 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode5.name = 'Журнал изменения данных'
               def viewNode6 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode6.name = 'Журнал загрузки данных из СПУР'
               catalogNode2.children.add(viewNode1)
               catalogNode2.children.add(viewNode2)
               catalogNode2.children.add(viewNode3)
               catalogNode2.children.add(viewNode4)
               catalogNode2.children.add(viewNode5)
               catalogNode2.children.add(viewNode6)

               def catalogNode3 = ApplicationFactory.eINSTANCE.createCatalogNode()
               catalogNode3.name = "Права доступа"
               def viewNode7 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode7.name = 'Пользователи'
               def viewNode8 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode8.name = 'Группы'
               def viewNode9 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode9.name = 'Роли'
               catalogNode3.children.add(viewNode7)
               catalogNode3.children.add(viewNode8)
               catalogNode3.children.add(viewNode9)

               def catalogNode4 = ApplicationFactory.eINSTANCE.createCatalogNode()
               catalogNode4.name = "Установка поставки"
               def viewNode10 = ApplicationFactory.eINSTANCE.createViewNode()
               viewNode10.name = 'Выбор поставки'
               catalogNode4.children.add(viewNode10)

               catalogNode1.children.add(catalogNode2)
               catalogNode1.children.add(catalogNode3)
               catalogNode1.children.add(catalogNode4)

               application.setReferenceTree(catalogNode1)
           }
            else {
                def userComponent1 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Mandatory Reporting", "MandatoryReporting",false)
                def userComponent6 = findOrCreateEObject(ApplicationPackage.Literals.USER_COMPONENT, "Tax Reporting", "TaxReporting",false)

                application.name = name

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Mandatory Reporting'
                componentElement1.setComponent(userComponent1)
                application.view = componentElement1

                def referenceTree = ApplicationFactory.eINSTANCE.createCatalogNode()
                referenceTree.name = "CatalogNode1"
                def componentElement3 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement3.name = 'Mandatory Reporting'
                componentElement3.setComponent(userComponent1)
                def viewNode1 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode1.name = 'Mandatory Reporting'
                viewNode1.view = componentElement3
                referenceTree.children.add(viewNode1)
                def componentElement2 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement2.name = 'Tax Reporting'
                componentElement2.setComponent(userComponent6)
                def viewNode2 = ApplicationFactory.eINSTANCE.createViewNode()
                viewNode2.name = 'Tax Reporting'
                viewNode2.view = componentElement2
                referenceTree.children.add(viewNode2)
                application.setReferenceTree(referenceTree)
            }

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
