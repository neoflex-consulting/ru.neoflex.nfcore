package ru.neoflex.nfcore.application.impl


import ru.neoflex.nfcore.application.ApplicationFactory
import ru.neoflex.nfcore.application.ApplicationPackage
import ru.neoflex.nfcore.application.GlobalSettings
import ru.neoflex.nfcore.application.IconName
import ru.neoflex.nfcore.application.TextAlign
import ru.neoflex.nfcore.base.services.Context
import ru.neoflex.nfcore.base.util.DocFinder
import ru.neoflex.nfcore.notification.NotificationPackage
import ru.neoflex.nfcore.notification.NotificationStatus
import ru.neoflex.nfcore.utils.Utils

class ApplicationInit {

    static def createApplication(String name) {
        def rs = DocFinder.create(Context.current.store, ApplicationPackage.Literals.APPLICATION, [name: name])
                .execute().resourceSet
        if (rs.resources.empty) {

            def application = ApplicationFactory.eINSTANCE.createApplication()

            if (name == "Налоговая отчетность") {
                application.name = name
                application.iconName = IconName.FA_EYE

                def userComponent5 = Utils.findUserComponent(ApplicationPackage.Literals.USER_COMPONENT, "Page Not Found", "PageNotFound")

                def componentElement1 = ApplicationFactory.eINSTANCE.createComponentElement()
                componentElement1.name = 'Page Not Found'
                componentElement1.setComponent(userComponent5)
                application.view = componentElement1
            }
                else if (name == "Администрирование") {
                application.name = name
                application.iconName = IconName.FA_COGS
                def row1 = ApplicationFactory.eINSTANCE.createRow()
                row1.name = "row1"
                row1.textAlign = TextAlign.LEFT
                row1.borderBottom = true

                def row2 = ApplicationFactory.eINSTANCE.createRow()
                row2.name = "row2"
                row2.textAlign = TextAlign.LEFT
                row2.borderBottom = true
                row2.height = '80px'

                def row3 = ApplicationFactory.eINSTANCE.createRow()
                row3.name = "row3"
                row3.textAlign = TextAlign.LEFT
                row3.borderBottom = true

                def column = ApplicationFactory.eINSTANCE.createColumn()
                column.name = "column1"
                column.span = "9"

                def typography = ApplicationFactory.eINSTANCE.createTypography()
                typography.name = "Администрирование"

                def typographyStyle = Utils.findEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title")
                typography.setTypographyStyle(typographyStyle)


                column.children.add(typography)
                row1.children.add(row2)
                row1.children.add(row3)
                row2.children.add(column)
                application.setView(row1)

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
            else if (name == "Обязательная отчетность") {
                application.name = name
                application.iconName = IconName.FA_COINS
                def row1 = ApplicationFactory.eINSTANCE.createRow()
                row1.name = "row1"
                row1.textAlign = TextAlign.LEFT
                row1.borderBottom = true

                def row2 = ApplicationFactory.eINSTANCE.createRow()
                row2.name = "row2"
                row2.textAlign = TextAlign.LEFT
                row2.borderBottom = true
                row2.height = '80px'

                def row3 = ApplicationFactory.eINSTANCE.createRow()
                row3.name = "row3"
                row3.textAlign = TextAlign.LEFT
                row3.borderBottom = true

                def column = ApplicationFactory.eINSTANCE.createColumn()
                column.name = "column1"
                column.span = "9"

                def typography = ApplicationFactory.eINSTANCE.createTypography()
                typography.name = "Обязательная отчетность"

                def typographyStyle = Utils.findEObject(ApplicationPackage.Literals.TYPOGRAPHY_STYLE, "Title")
                typography.setTypographyStyle(typographyStyle)

                def calendar = ApplicationFactory.eINSTANCE.createCalendar()
                calendar.name = "Обязательная отчетность"
                def notification1 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "A 1993")
                def notification2 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "Ф 2020")
                def notification3 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "Проверить почту")
                def notification4 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "Ф110")

                def notification5 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "К 210")
                def notification6 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "M 250")
                def notification7 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "Я 666")

                def notification8 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "A 1994")
                def notification9 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "A 1995")
                def notification10 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "A 1996")
                def notification11 = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION, "Ф 230")


                calendar.notifications.add(notification1)
                calendar.notifications.add(notification2)
                calendar.notifications.add(notification3)
                calendar.notifications.add(notification4)
                calendar.notifications.add(notification4)
                calendar.notifications.add(notification5)
                calendar.notifications.add(notification6)
                calendar.notifications.add(notification7)
                calendar.notifications.add(notification8)
                calendar.notifications.add(notification9)
                calendar.notifications.add(notification10)
                calendar.notifications.add(notification11)

                def globalSettings = Utils.findEClass(ApplicationPackage.Literals.GLOBAL_SETTINGS) as GlobalSettings
                def workDaysYearBook = globalSettings.getWorkingDaysCalendar()

                calendar.setYearBook(workDaysYearBook)

                def defaultStatus = Utils.findEObject(NotificationPackage.Literals.NOTIFICATION_STATUS, 'Личная заметка') as NotificationStatus
                calendar.setDefaultStatus(defaultStatus)

                column.children.add(typography)
                row1.children.add(row2)
                row1.children.add(row3)
                row2.children.add(column)
                row3.children.add(calendar)
                application.setView(row1)
           }

            rs.resources.add(Context.current.store.createEObject(application))
        }
        return rs.resources.get(0).contents.get(0)
    }

}
