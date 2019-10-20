package ru.neoflex.meta.gitdb;

import com.beijunyi.parallelgit.filesystem.Gfs;
import com.beijunyi.parallelgit.filesystem.GitFileSystem;
import com.beijunyi.parallelgit.filesystem.GitPath;
import com.beijunyi.parallelgit.filesystem.commands.GfsCommit;
import com.beijunyi.parallelgit.filesystem.io.DirectoryNode;
import com.beijunyi.parallelgit.filesystem.io.Node;
import com.beijunyi.parallelgit.utils.exceptions.RefUpdateLockFailureException;
import com.beijunyi.parallelgit.utils.exceptions.RefUpdateRejectedException;
import com.github.marschall.pathclassloader.PathClassLoader;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;

import java.io.Closeable;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

public class Transaction implements Closeable {
    final public static String IDS_PATH = "ids";
    final public static String IDX_PATH = "idx";
    private Database database;
    private String branch;
    private GitFileSystem gfs;
    public enum LockType {DIRTY, READ, WRITE}
    private LockType lockType;
    private static final ThreadLocal<Transaction> tlTransaction = new ThreadLocal<>();

    public static void setCurrent(Transaction tx) {
        tlTransaction.set(tx);
    }

    public static Transaction getCurrent() {
        return tlTransaction.get();
    }

    public Transaction(Database database, String branch, LockType lockType) throws IOException {
        this.database = database;
        this.branch = branch;
        this.lockType = lockType;
        if (lockType == LockType.WRITE) {
            database.getLock().writeLock().lock();
        }
        else if (lockType == LockType.READ) {
            database.getLock().readLock().lock();
        }
        this.gfs =  Gfs.newFileSystem(branch, database.getRepository());
    }

    public Transaction(Database database, String branch) throws IOException {
        this(database, branch, LockType.WRITE);
    }

    @Override
    public void close() throws IOException {
        gfs.close();
        if (lockType == LockType.WRITE) {
            database.getLock().writeLock().unlock();
        }
        else if (lockType == LockType.READ) {
            database.getLock().readLock().unlock();
        }
    }

    public RevCommit getLastCommit(EntityId entityId) throws IOException {
        return getLastCommit(getIdPath(entityId));
    }

    public RevCommit getLastCommit(String path) throws IOException {
        GitPath gfsPath = gfs.getPath(path);
        return getLastCommit(gfsPath);
    }

    private RevCommit getLastCommit(GitPath gfsPath) throws IOException {
        String relPath = gfs.getRootPath().relativize(gfsPath).toString();
        try(RevWalk revCommits = new RevWalk(gfs.getRepository());) {
            revCommits.setTreeFilter(PathFilter.create(relPath));
            ObjectId branchId = gfs.getRepository().resolve(gfs.getStatusProvider().branch());
            revCommits.markStart(revCommits.parseCommit(branchId));
            RevCommit last = revCommits.next();
            return last;
        }
    }

    public void commit(String message, String author, String email) throws IOException {
        if (lockType != LockType.WRITE) {
            throw new IOException("Can't commit readonly transaction");
        }
        GfsCommit commit = Gfs.commit(gfs).message(message);
        if (author != null && email != null) {
            PersonIdent authorId = new PersonIdent(author, email);
            commit.author(authorId);
        }
        commit.execute();
    }

    public void commit(String message) throws IOException {
        commit(message, null, null);
    }

    private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();
    public static String getRandomId(int length) {
        byte[] bytes = new byte[length];
        new Random().nextBytes(bytes);
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars);
    }

    private GitPath getIdPath(EntityId entityId) {
        String idStr = entityId.getId();
        String idDir = idStr.substring(0, 2);
        String idFile = idStr.substring(2);
        return gfs.getPath("/", IDS_PATH, idDir, idFile);
    }

    private static ObjectId getObjectId(GitPath path) throws IOException {
        if(!path.isAbsolute()) throw new IllegalArgumentException(path.toString());
        Node current = path.getFileStore().getRoot();
        for(int i = 0; i < path.getNameCount(); i++) {
            GitPath name = path.getName(i);
            if(current instanceof DirectoryNode) {
                current = ((DirectoryNode) current).getChild(name.toString());
                if (current == null) {
                    return null;
                }
            }
            else
                return null;
        }
        return current.getObjectId(false);
    }

    public Entity create(Entity entity) throws IOException {
        entity.setId(getRandomId(16));
        GitPath path = getIdPath(entity);
        Files.createDirectories(path.getParent());
        Files.write(path, entity.getContent());
        String rev = getObjectId(path).getName();
        entity.setRev(rev);
        createEntityIndexes(entity);
        return entity;
    }

    public void createEntityIndexes(Entity entity) throws IOException {
        for (String indexName: database.getIndexes().keySet()) {
            GitPath indexPath = gfs.getPath("/", IDX_PATH, indexName);
            for (IndexEntry entry: database.getIndexes().get(indexName).getEntries(entity, this)) {
                GitPath indexValuePath = indexPath.resolve(gfs.getPath(".", entry.getPath()).normalize());
                if (Files.exists(indexValuePath)) {
                    throw new IOException("Index file " + indexValuePath.toString() + " already exists");
                }
                Files.createDirectories(indexValuePath.getParent());
                Files.write(indexValuePath, entry.getContent());
            }
        }
    }

    public Entity load(EntityId entityId) throws IOException {
        GitPath path = getIdPath(entityId);
        ObjectId objectId = getObjectId(path);
        if (objectId == null) {
            throw new IOException("Entity not found: " + entityId.getId());
        }
        String rev = objectId.getName();
        byte[] content = Files.readAllBytes(path);
        return new Entity(entityId.getId(), rev, content);
    }

    public Entity update(Entity entity) throws IOException {
        Entity old = load(entity);
        if (old == null || !Objects.equals(old.getRev(), entity.getRev())) {
            throw new ConcurrentModificationException("Entity was updated: " + entity.getId());
        }
        GitPath path = getIdPath(entity);
        Files.createDirectories(path.getParent());
        Files.write(path, entity.getContent());
        String rev = getObjectId(path).getName();
        entity.setRev(rev);
        Set<String> toDelete = new HashSet<>();
        for (String indexName: database.getIndexes().keySet()) {
            GitPath indexPath = gfs.getPath("/", IDX_PATH, indexName);
            for (IndexEntry entry: database.getIndexes().get(indexName).getEntries(old, this)) {
                GitPath indexValuePath = indexPath.resolve(gfs.getPath(".", entry.getPath()).normalize());
                toDelete.add(indexValuePath.toString());
            }
        }
        for (String indexName: database.getIndexes().keySet()) {
            GitPath indexPath = gfs.getPath("/", IDX_PATH, indexName);
            for (IndexEntry entry: database.getIndexes().get(indexName).getEntries(entity, this)) {
                GitPath indexValuePath = indexPath.resolve(gfs.getPath(".", entry.getPath()).normalize());
                if (!toDelete.remove(indexValuePath.toString()) && Files.exists(indexValuePath)) {
                    throw new IOException("Index file " + indexValuePath.toString() + " already exists");
                }
                Files.createDirectories(indexValuePath.getParent());
                Files.write(indexValuePath, entry.getContent());
            }
        }
        for (String indexValuePathString: toDelete) {
            GitPath indexValuePath = gfs.getPath(indexValuePathString);
            Files.delete(indexValuePath);
        }
        return entity;
    }

    public void delete(EntityId entityId) throws IOException {
        Entity old = load(entityId);
        if (old == null || !Objects.equals(old.getRev(), entityId.getRev())) {
            throw new ConcurrentModificationException("Entity was updated: " + entityId.getId());
        }
        GitPath path = getIdPath(entityId);
        Files.delete(path);
        for (String indexName: database.getIndexes().keySet()) {
            GitPath indexPath = gfs.getPath("/", IDX_PATH, indexName);
            for (IndexEntry entry: database.getIndexes().get(indexName).getEntries(old, this)) {
                GitPath indexValuePath = indexPath.resolve(gfs.getPath(".", entry.getPath()).normalize());
                Files.delete(indexValuePath);
            }
        }
    }

    public void reindex() throws IOException {
        GitPath indexRootPath = gfs.getPath("/", IDX_PATH);
        List<Path> pathsToDelete = Files.walk(indexRootPath).sorted(Comparator.reverseOrder()).collect(Collectors.toList());
        for(Path path : pathsToDelete) {
            Files.deleteIfExists(path);
        }
        for (EntityId entityId: all()) {
            Entity entity = load(entityId);
            createEntityIndexes(entity);
        }
    }



    public List<IndexEntry> findByIndex(String indexName, String... path) throws IOException {
        GitPath indexPath = gfs.getPath("/", IDX_PATH, indexName);
        GitPath indexValuePath = indexPath.resolve(gfs.getPath(".", path).normalize());
        try {
            return Files.walk(indexValuePath).filter(Files::isRegularFile).map(file -> {
                IndexEntry entry = new IndexEntry();
                Path relPath = indexPath.relativize(file);
                entry.setPath(relPath.toString().split("/"));
                try {
                    byte[] content = Files.readAllBytes(file);
                    entry.setContent(content);
                    return entry;
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }).collect(Collectors.toList());
        }
        catch (NoSuchFileException e) {
            return new ArrayList<>();
        }
    }

    public List<EntityId> all() throws IOException {
        GitPath idsPath = gfs.getPath("/", IDS_PATH);
        return Files.walk(idsPath).filter(Files::isRegularFile).map(file -> {
            EntityId entityId = new EntityId();
            Path parent = file.getParent();
            entityId.setId(parent.getFileName().toString() + file.getFileName().toString());
            return entityId;
        }).collect(Collectors.toList());
    }

    public Database getDatabase() {
        return database;
    }

    public GitFileSystem getFileSystem() {
        return gfs;
    }
    public ClassLoader getClassLoader(ClassLoader parent) {
        ClassLoader classLoader = new PathClassLoader(gfs.getRootPath(), parent);
        return classLoader;
    }

    public<R> R withClassLoader(Callable<R> f) throws Exception {
        ClassLoader parent = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(getClassLoader(parent));
        try {
            return f.call();
        } finally {
            Thread.currentThread().setContextClassLoader(parent);
        }
    }

    public void withCurrent(Runnable f) {
        setCurrent(this);
        try {
            f.run();
        } finally {
            setCurrent(null);
        }
    }
}
