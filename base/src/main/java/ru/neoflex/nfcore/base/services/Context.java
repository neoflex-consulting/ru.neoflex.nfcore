package ru.neoflex.nfcore.base.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.components.SpringContext;
import ru.neoflex.nfcore.base.services.providers.GitDBStoreProvider;

import java.util.concurrent.Callable;

@Service("ru.neoflex.nfcore.base.services.Context")
public class Context {
    private static final Logger logger = LoggerFactory.getLogger(Context.class);

    private final Store store;
    private final Groovy groovy;
    private final Workspace workspace;
    private final Epsilon epsilon;
    private final PackageRegistry registry;
    private final Authorization authorization;

    private static final ThreadLocal<Context> tlContext = new ThreadLocal<Context>();

    public Context(Store store, Groovy groovy, Workspace workspace, Epsilon epsilon, PackageRegistry registry, Authorization authorization) {
        this.store = store;
        this.groovy = groovy;
        this.workspace = workspace;
        this.epsilon = epsilon;
        this.registry = registry;
        this.authorization = authorization;
    }

    public static Context getCurrent() {
        if (tlContext.get() == null) {
            Context context = SpringContext.getBean(Context.class);
            tlContext.set(context);
        }
        return tlContext.get();
    }

    public void setCurrent() {
        tlContext.set(this);
    }

    public Store getStore() {
        return store;
    }

    public Groovy getGroovy() {
        return groovy;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public Epsilon getEpsilon() {
        return epsilon;
    }

    public PackageRegistry getRegistry() {
        return registry;
    }

    public <R> R inContext(Callable<R> f) throws Exception {
        setCurrent();
        return f.call();
    }

    public <R> R inContextWithClassLoaderInTransaction(Callable<R> f) throws Exception {
        return inContextWithClassLoaderInTransaction(false, f);
    }

    public <R> R inContextWithClassLoader(Callable<R> f) throws Exception {
        return inContext(() -> workspace.withClassLoader(f));
    }

    public <R> R inContextWithClassLoaderInTransaction(boolean readOnly, Callable<R> f) throws Exception {
        return inContextWithClassLoader(() -> store.inTransaction(readOnly, tx -> {
            return f.call();
        }));
    }

    public <R> R transact(String message, Callable<R> f) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String author = authentication != null ? authentication.getName() : null;
        return inContext(() ->
                workspace.withClassLoader(() ->
                        store.inTransaction(message == null,
                                tx -> {
                                    R result;
                                    if (store.getProvider() instanceof GitDBStoreProvider) {
                                        result = f.call();
                                        if (message != null) {
                                            tx.commit(message, author, "");
                                        }
                                    } else {
                                        result = workspace.getDatabase().inTransaction(workspace.getCurrentBranch(), message == null ? Transaction.LockType.READ : Transaction.LockType.WRITE, tx1 -> {
                                            R result1 = f.call();
                                            if (message != null) {
                                                tx1.commit(message);
                                            }
                                            return result1;
                                        });
                                        if (message != null) {
                                            tx.commit(message, author, "");
                                        }
                                    }
                                    return result;
                                })));
    }

    public Authorization getAuthorization() {
        return authorization;
    }
}
