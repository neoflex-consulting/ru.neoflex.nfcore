package ru.neoflex.nfcore.notification.impl

import ru.neoflex.nfcore.notification.Notification


class NotificationFactoryExt extends NotificationFactoryImpl {

    @Override
    Notification createNotification() {
        return new NotificationExt()
    }
}
