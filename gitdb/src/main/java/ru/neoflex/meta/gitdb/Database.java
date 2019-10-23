package ru.neoflex.meta.gitdb;

import com.beijunyi.parallelgit.utils.BranchUtils;
import com.beijunyi.parallelgit.utils.RepositoryUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Function;

import static org.eclipse.jgit.lib.Constants.DOT_GIT;

public class Database implements Closeable {
    private final Repository repository;
    private Map<String, Index> indexes = new HashMap<>();
    private ReadWriteLock lock = new ReentrantReadWriteLock();
    {
        try {
            GitURLStreamHandler.registerFactory();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Database(String repoPath) throws IOException, GitAPIException {
        this.repository = openRepository(repoPath);
    }

    public Set<String> getBranches() throws IOException {
        return BranchUtils.getBranches(repository).keySet();
    }

    public void createBranch(String branch, String from) throws IOException {
        BranchUtils.createBranch(branch, from, repository);
    }

    public Transaction createTransaction(String branch) throws IOException {
        return new Transaction(this, branch);
    }

    public Transaction createTransaction(String branch, Transaction.LockType lockType) throws IOException {
        return new Transaction(this, branch, lockType);
    }

    public interface Transactional<R> {
        public R call(Transaction tx) throws IOException;
    }

    public<R> R withTransaction(String branch, Transaction.LockType lockType, Transactional<R> f) throws IOException {
        try (Transaction tx = createTransaction(branch, lockType)) {
            return f.call(tx);
        }
    }


    @Override
    public void close() throws IOException {
    }

    public Repository getRepository() {
        return repository;
    }

    public Repository openRepository(String repoPath) throws IOException, GitAPIException {
        File repoFile = new File(repoPath);
        Repository repository = new File(repoFile, DOT_GIT).exists() ?
                RepositoryUtils.openRepository(repoFile, false):
                RepositoryUtils.createRepository(repoFile, false);
        if (BranchUtils.getBranches(repository).size() == 0) {
            try(Git git = new Git(repository);) {
                git.commit().setMessage("Initial commit").setAllowEmpty(true).call();
            }
        }
        return repository;
    }

    public Map<String, Index> getIndexes() {
        return indexes;
    }

    public void createIndex(Index index) {
        getIndexes().put(index.getName(), index);
    }

    public ReadWriteLock getLock() {
        return lock;
    }
}
