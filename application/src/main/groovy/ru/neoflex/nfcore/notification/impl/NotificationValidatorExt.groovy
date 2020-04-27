package ru.neoflex.nfcore.notification.impl;

import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.DiagnosticChain;
import org.eclipse.emf.ecore.EObject;
import ru.neoflex.nfcore.notification.Notification;
import ru.neoflex.nfcore.notification.NotificationInstance;
import ru.neoflex.nfcore.notification.NotificationStatus
import ru.neoflex.nfcore.notification.Periodicity;
import ru.neoflex.nfcore.notification.util.NotificationValidator;

class NotificationValidatorExt extends NotificationValidator {

    @Override
    boolean validateNotification_IsValid(Notification notification, DiagnosticChain diagnostics, Map<Object, Object> context) {
//        if (notification.name == null || notification.name.length() == 0) {
//            return validate(notification, diagnostics, context, "name - must be set")
//        }
//        if (notification.shortName == null || notification.shortName.length() == 0) {
//            return validate(notification, diagnostics, context, "shortName - must be set")
//        }
//        if (notification.defaultStatus == null) {
//            return validate(notification, diagnostics, context, "defaultStatus - must be set")
//        }
//
//        if (notification.reportingDateOn.size() == 1 && (notification.deadlineDay == null || notification.deadlineDay.length() == 0)) {
//            return validate(notification, diagnostics, context, "deadlineDay - must be set")
//        }
//        if (notification.reportingDateOn.size() > 1 && notification.deadlineDay != null && notification.deadlineDay.length() != 0) {
//            return validate(notification, diagnostics, context, "deadlineDay - must not be set")
//        }
//
//        if (notification.deadlineTime == null || notification.deadlineTime.length() == 0) {
//            return validate(notification, diagnostics, context, "deadlineTime - must be set")
//        }
//        if (notification.reportingDateOn.size() == 0) {
//            return validate(notification, diagnostics, context, "reportingDateOn - must be set")
//        }
//        if (notification.reportingDateOn.size() == 1 && notification.reportingDateOn[0].name.toInteger() > notification.deadlineDay.toInteger()) {
//            return validate(notification, diagnostics, context, "reportingDateOn - must be greater than or equal to deadlineDay")
//        }

//        if (notification.reportingDateOn.size() > 1 && notification.periodicity != Periodicity.MONTH ) {
//            return validate(notification, diagnostics, context, "periodicity - must be equal to month")
//        }
//        if (notification.reportingDateOn.size() > 1 && notification.calculationInterval != null && notification.calculationInterval != Periodicity.DAY) {
//            return validate(notification, diagnostics, context, "calculationInterval - must be equal to day")
//        }
    }

    @Override
    boolean validateNotificationInstance_IsValid(NotificationInstance notificationInstance, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (notificationInstance.name == null || notificationInstance.name.length() == 0) {
            return validate(notificationInstance, diagnostics, context, "name - must be set")
        }
        if (notificationInstance.notification == null) {
            return validate(notificationInstance, diagnostics, context, "notification - must be set")
        }
        if (notificationInstance.status == null) {
            return validate(notificationInstance, diagnostics, context, "status - must be set")
        }
    }

    @Override
    boolean validateNotificationStatus_IsValid(NotificationStatus notificationStatus, DiagnosticChain diagnostics, Map<Object, Object> context) {
        if (notificationStatus.name == null || notificationStatus.name.length() == 0) {
            return validate(notificationStatus, diagnostics, context, "name - must be set")
        }
        if (notificationStatus.color == null || notificationStatus.color.length() == 0) {
            return validate(notificationStatus, diagnostics, context, "notification - must be set")
        }
    }

    private boolean validate(EObject validateEObject, DiagnosticChain diagnostics, Map<Object, Object> context, String message) {
        if (diagnostics != null) {
            diagnostics.add(createDiagnostic(
                    Diagnostic.ERROR,
                    DIAGNOSTIC_SOURCE,
                    0,
                    "_UI_GenericConstraint_diagnostic",
                    [message, getObjectLabel(validateEObject, context)] as Object[],
                    [validateEObject] as Object[],
                    context
            ))
        }
        return false
    }
}
