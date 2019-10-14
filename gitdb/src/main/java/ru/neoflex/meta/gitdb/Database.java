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
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import static org.eclipse.jgit.lib.Constants.DOT_GIT;

public class Database implements Closeable {
    private Repository repository;
    private Map<String, Index> indexes = new HashMap<>();
    private ReadWriteLock lock = new ReentrantReadWriteLock();

    public Database(String repoPath) throws IOException, GitAPIException {
        File repoFile = new File(repoPath);
        repository = new File(repoFile, DOT_GIT).exists() ?
                RepositoryUtils.openRepository(repoFile, false):
                RepositoryUtils.createRepository(repoFile, false);
        if (getBranches().size() == 0) {
            try(Git git = new Git(repository);) {
                git.commit().setMessage("Initial commit").setAllowEmpty(true).call();
            }
        }
    }
    public Set<String> getBranches() throws IOException {
        return BranchUtils.getBranches(repository).keySet();
    }

    public void createBranch(String branch, String from) throws IOException {
        BranchUtils.createBranch(branch, from, getRepository());
    }

    public Transaction createTransaction(String branch) throws IOException {
        return new Transaction(this, branch);
    }

    public Transaction createTransaction(String branch, boolean readonly) throws IOException {
        return new Transaction(this, branch, readonly);
    }

    @Override
    public void close() throws IOException {
        repository.close();
    }

    public Repository getRepository() {
        return repository;
    }

    public void setIndexes(Map<String, Index> indexes) {
        this.indexes = indexes;
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
