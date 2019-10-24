package ru.neoflex.meta.gitdb;

import org.eclipse.emf.ecore.resource.Resource;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Events {
    public interface AfterLoad {
        void handle(Resource resource, Transaction tx) throws IOException;
    }
    private List<AfterLoad> afterLoadList = new ArrayList<>();
    public void fireAfterLoad(Resource resource, Transaction tx) throws IOException {
        for (AfterLoad handler: afterLoadList) {
            handler.handle(resource, tx);
        }
    }
    public void registerAfterLoad(AfterLoad handler) {
        afterLoadList.add(handler);
    }

    public interface BeforeInsert {
        void handle(Resource resource, Transaction tx) throws IOException;
    }
    private List<BeforeInsert> beforeInsertList = new ArrayList<>();
    public void fireBeforeInsert(Resource resource, Transaction tx) throws IOException {
        for (BeforeInsert handler: beforeInsertList) {
            handler.handle(resource, tx);
        }
    }
    public void registerBeforeInsert(BeforeInsert handler) {
        beforeInsertList.add(handler);
    }

    public interface AfterInsert {
        void handle(Resource resource, Transaction tx) throws IOException;
    }
    private List<AfterInsert> afterInsertList = new ArrayList<>();
    public void fireAfterInsert(Resource resource, Transaction tx) throws IOException {
        for (AfterInsert handler: afterInsertList) {
            handler.handle(resource, tx);
        }
    }
    public void registerAfterInsert(AfterInsert handler) {
        afterInsertList.add(handler);
    }

    public interface BeforeUpdate {
        void handle(Resource old, Resource resource, Transaction tx) throws IOException;
    }
    private List<BeforeUpdate> beforeUpdateList = new ArrayList<>();
    public void fireBeforeUpdate(Resource old, Resource resource, Transaction tx) throws IOException {
        for (BeforeUpdate handler: beforeUpdateList) {
            handler.handle(old, resource, tx);
        }
    }
    public void registerBeforeUpdate(BeforeUpdate handler) {
        beforeUpdateList.add(handler);
    }

    public interface AfterUpdate {
        void handle(Resource old, Resource resource, Transaction tx) throws IOException;
    }
    private List<AfterUpdate> afterUpdateList = new ArrayList<>();
    public void fireAfterUpdate(Resource old, Resource resource, Transaction tx) throws IOException {
        for (AfterUpdate handler: afterUpdateList) {
            handler.handle(old, resource, tx);
        }
    }
    public void registerAfterUpdate(AfterUpdate handler) {
        afterUpdateList.add(handler);
    }

    public interface BeforeDelete {
        void handle(Resource resource, Transaction tx) throws IOException;
    }
    private List<BeforeDelete> beforeDeleteList = new ArrayList<>();
    public void fireBeforeDelete(Resource resource, Transaction tx) throws IOException {
        for (BeforeDelete handler: beforeDeleteList) {
            handler.handle(resource, tx);
        }
    }
    public void registerBeforeDelete(BeforeDelete handler) {
        beforeDeleteList.add(handler);
    }
}
