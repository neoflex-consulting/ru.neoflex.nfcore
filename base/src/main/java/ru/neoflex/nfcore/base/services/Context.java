package ru.neoflex.nfcore.base.services;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.components.Publisher;

import java.util.concurrent.Callable;

@Service
public class Context {
    private final static Log logger = LogFactory.getLog(Context.class);

    @Autowired
    private Store store;
    @Autowired
    private Groovy groovy;
    @Autowired
    private Workspace workspace;
    @Autowired
    private Publisher publisher;
    @Autowired
    private Epsilon epsilon;
    @Autowired
    private PackageRegistry registry;
    @Autowired
    private Scheduler scheduler;

    private static final ThreadLocal<Context> tlContext = new ThreadLocal<Context>();

    public static Context getCurrent() {
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

    public Publisher getPublisher() {
        return publisher;
    }

    public Epsilon getEpsilon() {
        return epsilon;
    }

    public PackageRegistry getRegistry() {
        return registry;
    }

    public<R> R inContext(Callable<R> f) throws Exception {
        setCurrent();
        return f.call();
    }

    public<R> R inContextWithClassLoaderInTransaction(Callable<R> f) throws Exception {
        return workspace.withClassLoaderInTransaction(false, ()->{return inContext(f);});
    }

    public Scheduler getScheduler() {
        return scheduler;
    }
}
