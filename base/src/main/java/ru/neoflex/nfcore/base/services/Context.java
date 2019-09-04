package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.components.PackageRegistry;
import ru.neoflex.nfcore.base.components.Publisher;
import ru.neoflex.nfcore.base.util.FileUtils;

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
    private
    PackageRegistry registry;

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

    public<R> R withContext(Callable<R> f) throws Exception {
        setCurrent();
        return f.call();
    }

    public<R> R withClassLoader(Callable<R> f) throws Exception {
        return FileUtils.withClassLoader(()->{return withContext(f);});
    }
}
