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
import ru.neoflex.meta.gitdb.Database;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.types.TypesPackage;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Files;
import java.util.concurrent.Callable;

@Service
public class Workspace {
    private final static Log logger = LogFactory.getLog(Workspace.class);
    public static final String MASTER = "master";
    private static final ThreadLocal<String> tlCurrentBranch = new ThreadLocal<String>();
    public static final String BRANCH = "branch";
    @Value("${workspace.root:${user.dir}/workspace}")
    String workspaceRoot;
    private static Database database;
    @Autowired
    PackageRegistry registry;

    @PostConstruct
    void init() throws GitAPIException, IOException {
        database = new Database(workspaceRoot, registry.getEPackages());
        database.setQualifiedNameDelegate(eClass -> {
            for (EAttribute eAttribute: eClass.getEAllAttributes()) {
                if (eAttribute.getEAttributeType() == TypesPackage.Literals.QNAME) {
                    return eAttribute;
                }
            }
            return eClass.getEStructuralFeature("name");
        });
    }

    @PreDestroy
    void fini() throws IOException {
        database.close();
    }

    public static Database getDatabase() {
        return database;
    }

    public static String getCurrentBranch() {
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
            branch = MASTER;
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

    public Transaction createTransaction(Transaction.LockType lockType) throws IOException {
        return database.createTransaction(getCurrentBranch(), lockType);
    }

    public Transaction createTransaction() throws IOException {
        return createTransaction(Transaction.LockType.WRITE);
    }

    public<R> R withClassLoader(Callable<R> f, Transaction.LockType lockType) throws Exception {
        try (Transaction tx = createTransaction(lockType)) {
            return tx.withClassLoader(f);
        }
    }

    public boolean pathExists(String path) throws IOException {
        try (Transaction tx = createTransaction(Transaction.LockType.DIRTY)) {
            return Files.exists(tx.getFileSystem().getPath(path));
        }
    }
}
