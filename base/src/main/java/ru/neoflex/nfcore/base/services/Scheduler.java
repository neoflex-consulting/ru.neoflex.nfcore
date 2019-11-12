package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.eclipse.epsilon.common.parse.problem.ParseProblem;
import org.eclipse.epsilon.egl.EglFileGeneratingTemplateFactory;
import org.eclipse.epsilon.egl.EglTemplate;
import org.eclipse.epsilon.egl.EglTemplateFactory;
import org.eclipse.epsilon.egl.exceptions.EglRuntimeException;
import org.eclipse.epsilon.egl.execute.context.IEglContext;
import org.eclipse.epsilon.emc.emf.EmfModel;
import org.eclipse.epsilon.eol.EolModule;
import org.eclipse.epsilon.eol.IEolModule;
import org.eclipse.epsilon.eol.exceptions.models.EolModelLoadingException;
import org.eclipse.epsilon.eol.execute.context.FrameStack;
import org.eclipse.epsilon.eol.execute.context.IEolContext;
import org.eclipse.epsilon.eol.execute.context.Variable;
import org.eclipse.epsilon.eol.models.IModel;
import org.eclipse.epsilon.etl.EtlModule;
import org.eclipse.epsilon.evl.EvlModule;
import org.eclipse.epsilon.evl.execute.UnsatisfiedConstraint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.scheduler.ScheduledTask;
import ru.neoflex.nfcore.base.scheduler.SchedulerPackage;
import ru.neoflex.nfcore.base.util.DocFinder;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @PostConstruct
    void init() throws Exception {
        context.inContextWithClassLoaderInTransaction(()->{
            ObjectNode result = refreshScheduler();
            if (result.get(CANCELLED).intValue() + result.get(SCHEDULED).intValue() > 0) {
                String message = "refreshScheduler: " + new ObjectMapper().writeValueAsString(result);
                logger.info(message);
                context.getStore().commit(message);
            }
            return 0;
        });
    }

    public synchronized ObjectNode refreshScheduler() throws Exception {
        ObjectNode result = new ObjectMapper().createObjectNode()
                .put(CANCELLED, 0)
                .put(SCHEDULED, 0);
        List<Resource> resources = DocFinder.create(context.getStore(), SchedulerPackage.Literals.SCHEDULED_TASK).execute().getResources();
        Map<String, ScheduledFuture> newTasks = new HashMap<>();
        for (Resource resource: resources) {
            ScheduledTask task = (ScheduledTask) resource.getContents().get(0);
            if (task.isEnabled()) {
                String id = context.getStore().getId(resource);
                ScheduledFuture scheduledFuture = scheduledTasks.get(id);
            }
        }
        return result;
    }
}
