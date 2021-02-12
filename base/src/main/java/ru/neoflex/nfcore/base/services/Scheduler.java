package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.retry.RetryCallback;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.scheduler.*;
import ru.neoflex.nfcore.base.util.DocFinder;

import javax.annotation.PostConstruct;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ScheduledFuture;

@Service
@DependsOn({"ru.neoflex.nfcore.base.configuration.Security"})
public class Scheduler {
    private static final Logger logger = LoggerFactory.getLogger(Scheduler.class);
    public final static String CANCELLED = "cancelled";
    public final static String SCHEDULED = "scheduled";
    private Map<String, ScheduledFuture> scheduledTasks = new HashMap<>();

    @Autowired
    private TaskScheduler taskScheduler;
    @Autowired
    Context context;
    @Autowired
    Store store;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    Workspace workspace;

    @PostConstruct
    void init() {
//        taskScheduler.scheduleWithFixedDelay(() -> {
//            try {
//                refreshScheduler();
//            } catch (Exception e) {
//                logger.error("Scheduler: ", e);
//            }
//        }, Duration.ofSeconds(10));
        taskScheduler.schedule(() -> {
            try {
                refreshScheduler();
            } catch (Exception e) {
                logger.error("Refresh Scheduler: ", e);
            }
        }, Instant.now().plus(10, ChronoUnit.SECONDS));
    }

    public synchronized ObjectNode refreshScheduler() throws Exception {
        return context.inContextWithClassLoaderInTransaction(()->{
            ObjectNode result = refreshSchedulerInt();
            String message = "refreshScheduler: " + new ObjectMapper().writeValueAsString(result);
            logger.info(message);
            if (result.get(CANCELLED).intValue() + result.get(SCHEDULED).intValue() > 0) {
                store.commit(message);
            }
            return result;
        });
    }

    public synchronized ObjectNode debugRescheduleAll() throws Exception {
        return context.inContextWithClassLoaderInTransaction(()->{
            int cancelled = 0;
            for(Iterator<Map.Entry<String, ScheduledFuture>> it = scheduledTasks.entrySet().iterator(); it.hasNext(); ) {
                Map.Entry<String, ScheduledFuture> entry = it.next();
                entry.getValue().cancel(false);
                ++cancelled;
            }
            scheduledTasks.clear();
            ObjectNode result = refreshSchedulerInt();
            result.put(CANCELLED, cancelled);
            String message = "debugRescheduleAll: " + new ObjectMapper().writeValueAsString(result);
            logger.info(message);
            if (result.get(CANCELLED).intValue() + result.get(SCHEDULED).intValue() > 0) {
                store.commit(message);
            }
            return result;
        });
    }

    public ObjectNode refreshSchedulerInt() throws Exception {
        ObjectNode result = new ObjectMapper().createObjectNode()
                .put(CANCELLED, 0)
                .put(SCHEDULED, 0);
        Map<String, ScheduledFuture> newTasks = new HashMap<>();
        List<Resource> resources = DocFinder.create(store, SchedulerPackage.Literals.SCHEDULED_TASK).execute().getResources();
        for (Resource resource: resources) {
            String id = store.getId(resource);
            ScheduledTask task = (ScheduledTask) resource.getContents().get(0);
            URI uri = resource.getURI();
            if (task.isEnabled()) {
                String branch = StringUtils.isNotEmpty(task.getBranch()) ?
                        task.getBranch() : workspace.getCurrentBranch();
                ScheduledFuture scheduledFuture = scheduledTasks.get(id);
                if (scheduledFuture == null) {
                    SchedulingPolicy schedulingPolicy = task.getSchedulingPolicy();
                    scheduledFuture = schedulingPolicy.schedule(taskScheduler, new Runnable() {
                        @Override
                        public void run() {
                            RetryTemplate retryTemplate = new RetryTemplate();
                            BackOffPolicyFactory backOffPolicyFactory = task.getBackOffPolicyFactory();
                            if (backOffPolicyFactory == null) {
                                backOffPolicyFactory = SchedulerFactory.eINSTANCE.createNoBackOffPolicyFactory();
                            }
                            retryTemplate.setBackOffPolicy(backOffPolicyFactory.createPolicy());
                            RetryPolicyFactory retryPolicyFactory = task.getRetryPolicyFactory();
                            if (retryPolicyFactory == null) {
                                retryPolicyFactory = SchedulerFactory.eINSTANCE.createNeverRetryPolicyFactory();
                            }
                            retryTemplate.setRetryPolicy(retryPolicyFactory.createPolicy());
                            retryTemplate.execute((RetryCallback<Void, RuntimeException>) ctx -> {
                                try {
                                    workspace.setCurrentBranch(branch);
                                    execute(uri);
                                } catch (Exception e) {
                                    logger.error(task.getName(), e);
                                }
                                return null;
                            });
                        }
                    });
                    if (scheduledFuture != null) {
                        result.put(SCHEDULED, result.get(SCHEDULED).intValue() + 1);
                        task.setLastScheduleTime(new Timestamp(new Date().getTime()));
                        Context.getCurrent().getStore().saveResource(resource);
                    }
                }
                if (scheduledFuture != null) {
                    newTasks.put(id, scheduledFuture);
                }
            }
        }
        for(Iterator<Map.Entry<String, ScheduledFuture>> it = scheduledTasks.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<String, ScheduledFuture> entry = it.next();
            if(!newTasks.containsKey(entry.getKey())) {
                entry.getValue().cancel(false);
                result.put(CANCELLED, result.get(CANCELLED).intValue() + 1);
            }
        }
        scheduledTasks = newTasks;
        return result;
    }

    public Object execute(URI uri) throws Exception {
        return context.inContextWithClassLoader(() -> {
            ScheduledTask task = store.inTransaction(true, tx -> {
                Resource resource = store.loadResource(uri);
                return (ScheduledTask) resource.getContents().get(0);
            });
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (task.isImporsonate()) {
                login(task.getRunAsUser(), task.getRunAsPassword());
            }
            try {
                Binding b = new Binding();
                for (Parameter p: task.getParameters()) {
                    b.setVariable(p.getName(), p.getValue());
                }
                EObject eObject = task.getEObject();
                b.setVariable("eObject", eObject);
                StringWriter stringWriter = new StringWriter();
                PrintWriter printWriter = new PrintWriter(stringWriter);
                b.setVariable("out", printWriter);
                GroovyShell sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), b);
                Object result = null;
                try {
                    if (task.isTransactional()) {
                        result =  store.inTransaction(false, tx -> {return sh.evaluate(task.getScript());});
                    }
                    else {
                        result =  sh.evaluate(task.getScript());
                    }
                    printWriter.println("result: " + (result == null ? "<null>" : result.getClass().getTypeName() + " = " + result));
                    logger.debug(stringWriter.toString());
                    task.setLastRunTime(new Timestamp(new Date().getTime()));
                    task.setLastResult(stringWriter.toString());
                    if (task.getSchedulingPolicy() instanceof OnceSchedulingPolicy &&
                            ((OnceSchedulingPolicy) task.getSchedulingPolicy()).isDisableAfterRun()) {
                        task.setEnabled(false);
                    }
                }
                catch (Throwable e) {
                    logger.error(task.getName(), e);
                    task.setLastErrorTime(new Timestamp(new Date().getTime()));
                    task.setLastError(ExceptionUtils.getStackTrace(e));
                }
                store.inTransaction(false, tx -> {
                    Resource newResource = store.createEmptyResource();
                    newResource.setURI(task.eResource().getURI());
                    newResource.getContents().add(task);
                    store.saveResource(newResource);
                });
                return result;
            }
            finally {
                if (task.isImporsonate()) {
                    logout(authentication);
                }
            }
        });
    }

    public void login(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public void logout(Authentication old) {
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(old);
        //SecurityContextHolder.clearContext();
    }
}
