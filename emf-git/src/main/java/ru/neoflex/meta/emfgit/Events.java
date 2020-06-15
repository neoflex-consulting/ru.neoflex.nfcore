package ru.neoflex.meta.emfgit;

import org.eclipse.emf.ecore.resource.Resource;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

public class Events implements EventsRegistration {
    private List<Consumer<Resource>> afterLoadList = new ArrayList<>();
    public void fireAfterLoad(Resource resource) {
        for (Consumer<Resource> consumer: afterLoadList) {
            consumer.accept(resource);
        }
    }
    @Override
    public void registerAfterLoad(Consumer<Resource> consumer) {
        afterLoadList.add(consumer);
    }

    private List<BiConsumer<Resource, Resource>> beforeSaveList = new ArrayList<>();
    public void fireBeforeSave(Resource old, Resource resource) {
        for (BiConsumer<Resource, Resource> consumer: beforeSaveList) {
            consumer.accept(old, resource);
        }
    }
    @Override
    public void registerBeforeSave(BiConsumer<Resource, Resource> consumer) {
        beforeSaveList.add(consumer);
    }

    private List<BiConsumer<Resource, Resource>> afterSaveList = new ArrayList<>();
    public void fireAfterSave(Resource old, Resource resource) {
        for (BiConsumer<Resource, Resource> handler: afterSaveList) {
            handler.accept(old, resource);
        }
    }
    @Override
    public void registerAfterSave(BiConsumer<Resource, Resource> handler) {
        afterSaveList.add(handler);
    }

    private List<Consumer<Resource>> beforeDeleteList = new ArrayList<>();
    public void fireBeforeDelete(Resource resource) {
        for (Consumer<Resource> consumer: beforeDeleteList) {
            consumer.accept(resource);
        }
    }
    @Override
    public void registerBeforeDelete(Consumer<Resource> consumer) {
        beforeDeleteList.add(consumer);
    }
}
