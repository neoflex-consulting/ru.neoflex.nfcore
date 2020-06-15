package ru.neoflex.meta.emfgit;

import org.eclipse.emf.ecore.resource.Resource;

import java.util.function.BiConsumer;
import java.util.function.Consumer;

public interface EventsRegistration {
    void registerAfterLoad(Consumer<Resource> consumer);

    void registerBeforeSave(BiConsumer<Resource, Resource> consumer);

    void registerAfterSave(BiConsumer<Resource, Resource> handler);

    void registerBeforeDelete(Consumer<Resource> consumer);
}
