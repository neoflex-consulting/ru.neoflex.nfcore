package ru.neoflex.nfcore.base.components;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EcorePackage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class Publisher {
    interface IEvent {}

    interface ISubscriber {
        void handleEvent(IEvent event);
        boolean canHandle(IEvent event);
    }

    public abstract static class EObjectEvent implements IEvent {
        private EObject eObject;
        public EObjectEvent(EObject eObject) {
            this.eObject = eObject;
        }

        public EObject getEObject() {
            return eObject;
        }

        public void setEObject(EObject eObject) {
            this.eObject = eObject;
        }
    }

    public static class BeforeSaveEvent extends EObjectEvent {
        public BeforeSaveEvent(EObject eObject) {
            super(eObject);
        }
    }

    public static class AfterSaveEvent extends EObjectEvent {
        public AfterSaveEvent(EObject eObject) {
            super(eObject);
        }
    }

    public static class AfterLoadEvent extends EObjectEvent {
        public AfterLoadEvent(EObject eObject) {
            super(eObject);
        }
    }

    public static class BeforeDeleteEvent extends EObjectEvent {
        public BeforeDeleteEvent(EObject eObject) {
            super(eObject);
        }
    }

    public static class AfterDeleteEvent extends EObjectEvent {
        public AfterDeleteEvent(EObject eObject) {
            super(eObject);
        }
    }

    public abstract static class EObjectHandler<T extends EObject> implements ISubscriber {
        EClass eClass;

        public EObjectHandler(EClass eClass) {
            this.eClass = eClass;
        }

        abstract public EObject handleEObject(T eObject);

        @Override
        public void handleEvent(IEvent event) {
            EObjectEvent eObjectEvent = (EObjectEvent) event;
            eObjectEvent.eObject = handleEObject((T) eObjectEvent.eObject);
        }

        @Override
        public boolean canHandle(IEvent event) {
            if (event instanceof EObjectEvent) {
                EObject eObject = ((EObjectEvent)event).eObject;
                return eClass == null || eClass.isSuperTypeOf(eObject.eClass());
            }
            return false;
        }
    }

    public abstract static class BeforeSaveHandler<T extends EObject> extends EObjectHandler<T> {
        public BeforeSaveHandler(EClass eClass) {
            super(eClass);
        }

        @Override
        public boolean canHandle(IEvent event) {
            return event instanceof BeforeSaveEvent && super.canHandle(event);
        }
    }

    public abstract static class AfterSaveHandler<T extends EObject> extends EObjectHandler<T> {
        public AfterSaveHandler(EClass eClass) {
            super(eClass);
        }

        @Override
        public boolean canHandle(IEvent event) {
            return event instanceof AfterSaveEvent && super.canHandle(event);
        }
    }

    public abstract static class AfterLoadHandler<T extends EObject> extends EObjectHandler<T> {
        public AfterLoadHandler(EClass eClass) {
            super(eClass);
        }

        @Override
        public boolean canHandle(IEvent event) {
            return event instanceof AfterLoadEvent && super.canHandle(event);
        }
    }

    public abstract static class BeforeDeleteHandler<T extends EObject> extends EObjectHandler<T> {
        public BeforeDeleteHandler(EClass eClass) {
            super(eClass);
        }

        @Override
        public boolean canHandle(IEvent event) {
            return event instanceof BeforeDeleteEvent && super.canHandle(event);
        }
    }

    public abstract static class AfterDeleteHandler<T extends EObject> extends EObjectHandler<T> {
        public AfterDeleteHandler(EClass eClass) {
            super(eClass);
        }

        @Override
        public boolean canHandle(IEvent event) {
            return event instanceof BeforeDeleteEvent && super.canHandle(event);
        }
    }

    private List<ISubscriber> subscribers = new ArrayList<>();

    public void subscribe(ISubscriber subscriber) {
        subscribers.add(subscriber);
    }

    public boolean unsubscribe(ISubscriber subscriber) {
        return subscribers.remove(subscriber);
    }

    public void publish(IEvent event) {
        for (ISubscriber subscriber: subscribers) {
            if (subscriber.canHandle(event)) {
                subscriber.handleEvent(event);
            }
        }
    }
}
