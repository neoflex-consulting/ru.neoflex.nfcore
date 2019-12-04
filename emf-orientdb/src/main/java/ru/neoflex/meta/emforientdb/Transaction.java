package ru.neoflex.meta.emforientdb;

import java.io.Closeable;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

public class Transaction implements Closeable {
    private Database database;
    private String branch;
    public enum LockType {READ, WRITE, EXCLUSIVE}
    private LockType lockType;
    private static final ThreadLocal<Transaction> tlTransaction = new ThreadLocal<>();

    public static void setCurrent(Transaction tx) {
        tlTransaction.set(tx);
    }

    public static Transaction getCurrent() {
        return tlTransaction.get();
    }

    public Transaction(Database database, String branch, LockType lockType) throws IOException {
    }

    public Transaction(Database database, String branch) throws IOException {
        this(database, branch, LockType.WRITE);
    }

    @Override
    public void close() throws IOException {
    }

    public void commit(String message, String author, String email) throws IOException {
    }

    public void commit(String message) throws IOException {
    }

    public Entity create(Entity entity) throws IOException {
        return entity;
    }

    public Entity load(EntityId entityId) throws IOException {
    }

    public Entity update(Entity entity) throws IOException {
    }

    public void delete(EntityId entityId) throws IOException {
    }

    public List<EntityId> all() throws IOException {
    }

    public Database getDatabase() {
        return database;
    }

    public<R> R withCurrent(Callable<R> f) throws Exception {
        Transaction old = getCurrent();
        setCurrent(this);
        try {
            return f.call();
        } finally {
            setCurrent(old);
        }
    }
}
