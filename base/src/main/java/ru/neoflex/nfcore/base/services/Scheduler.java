package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ScheduledFuture;

@Service
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

    @PostConstruct
    void init() throws Exception {
        refreshScheduler();
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
                ScheduledFuture scheduledFuture = scheduledTasks.get(id);
                if (scheduledFuture == null) {
                    SchedulingPolicy schedulingPolicy = task.getSchedulingPolicy();
                    scheduledFuture = schedulingPolicy.schedule(taskScheduler, new Runnable() {
                        @Override
                        public void run() {
                            if (task.isImporsonate()) {
                                login(task.getRunAsUser(), task.getRunAsPassword());
                            }
                            try {
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
                                        ececute(uri);
                                    } catch (Exception e) {
                                        logger.error(task.getName(), e);
                                    }
                                    return null;
                                });
                            }
                            finally {
                                logout();
                            }
                        }
                    });
                    if (scheduledFuture != null) {
                        result.put(SCHEDULED, result.get(SCHEDULED).intValue() + 1);
                        task.setLastScheduleTime(new Timestamp(new Date().getTime()));
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

    public void ececute(URI uri) throws Exception {
        context.inContextWithClassLoaderInTransaction((Callable<Void>) () -> {
            Resource currResource = Context.getCurrent().getStore().loadResource(uri);
            ScheduledTask currTask = (ScheduledTask) currResource.getContents().get(0);
            Binding b = new Binding();
            for (Parameter p: currTask.getParameters()) {
                b.setVariable(p.getName(), p.getValue());
            }
            EObject eObject = currTask.getEObject();
            b.setVariable("eObject", eObject);
            StringWriter stringWriter = new StringWriter();
            PrintWriter printWriter = new PrintWriter(stringWriter);
            b.setVariable("out", printWriter);
            GroovyShell sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), b);
            try {
                Object result =  sh.evaluate(currTask.getScript());
                printWriter.println("result: " + result.getClass().getTypeName() + " = " + result);
                logger.info(stringWriter.toString());
                currTask.setLastRunTime(new Timestamp(new Date().getTime()));
                currTask.setLastResult(stringWriter.toString());
                if (currTask.getSchedulingPolicy() instanceof OnceSchedulingPolicy &&
                        ((OnceSchedulingPolicy) currTask.getSchedulingPolicy()).isDisableAfterRun()) {
                    currTask.setEnabled(false);
                }
            }
            catch (Throwable e) {
                logger.error(currTask.getName(), e);
                currTask.setLastErrorTime(new Timestamp(new Date().getTime()));
                currTask.setLastError(ExceptionUtils.getStackTrace(e));
            }
            Context.getCurrent().getStore().saveResource(currResource);
            Context.getCurrent().getStore().commit("Task " + currTask.getName() + " executed");
            return null;
        });
    }

    public void login(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public void logout() {
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(null);
        SecurityContextHolder.clearContext();
    }
}
