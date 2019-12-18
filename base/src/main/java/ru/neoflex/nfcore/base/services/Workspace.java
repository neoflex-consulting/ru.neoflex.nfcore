package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import ru.neoflex.meta.emfgit.Database;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.meta.emfgit.TransactionClassLoader;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.services.providers.GitDBTransactionProvider;
import ru.neoflex.nfcore.base.types.TypesPackage;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.concurrent.Callable;

import static ru.neoflex.nfcore.base.services.Store.qualifiedNameDelegate;

@Service
public class Workspace {
    private final static Log logger = LogFactory.getLog(Workspace.class);
    private static final ThreadLocal<String> tlCurrentBranch = new ThreadLocal<String>();
    public static final String BRANCH = "branch";
    @Value("${gitdb.base:${user.home}/.gitdb}")
    String repoBase;
    @Value("${gitdb.name:workspace}")
    String repoName;
    @Value("${gitdb.branch:master}")
    String defaultBranch;
    private Database database;
    @Autowired
    PackageRegistry registry;

    @PostConstruct
    void init() throws GitAPIException, IOException {
        String workspaceRoot = new File(repoBase, repoName).getAbsolutePath();
        database = new Database(workspaceRoot, registry.getEPackages());
        database.setQualifiedNameDelegate(qualifiedNameDelegate);
    }

    @PreDestroy
    void fini() throws IOException {
        database.close();
    }

    public Database getDatabase() {
        return database;
    }

    public String getCurrentBranch() {
        String branch = null;
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            HttpSession session = attr.getRequest().getSession(false);
            if (session != null) {
                branch = (String) session.getAttribute(BRANCH);
            }
        }
        if (branch == null) {
            branch = tlCurrentBranch.get();
        }
        if (branch == null) {
            branch = getDefaultBranch();
        }
        return branch;
    }

    public void setCurrentBranch(String branch) throws IOException {
        if (!database.getBranches().contains(branch)) {
            throw new IOException("Branch " + branch + " does not exists");
        }
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            HttpSession session = attr.getRequest().getSession(false);
            if (session != null) {
                session.setAttribute(BRANCH, branch);
            }
        }
        tlCurrentBranch.set(branch);
    }

    public GitDBTransactionProvider createTransaction(Transaction.LockType lockType) throws IOException {
        return new GitDBTransactionProvider(database, getCurrentBranch(), lockType);
    }

    public GitDBTransactionProvider createTransaction() throws IOException {
        return createTransaction(Transaction.LockType.WRITE);
    }

    public<R> R withClassLoader(Callable<R> f) throws Exception {
        return TransactionClassLoader.withClassLoader(f);
    }

    public boolean pathExists(String path) throws IOException {
        try (Transaction tx = createTransaction(Transaction.LockType.READ)) {
            return Files.exists(tx.getFileSystem().getPath(path));
        }
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }
}
