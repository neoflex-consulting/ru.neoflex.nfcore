package ru.neoflex.nfcore.base.services;

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
import org.eclipse.epsilon.emc.emf.CachedResourceSet;
import org.eclipse.epsilon.emc.emf.EmfModel;
import org.eclipse.epsilon.eol.AbstractModule;
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
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.*;

@Service
public class Epsilon {
    private static final Logger logger = LoggerFactory.getLogger(Epsilon.class);
    public static final String EPSILON_TEMPLATE_ROOT = "org/eclipse/epsilon";

    @Autowired
    Context context;

    @PostConstruct
    void init() {
    }

    public EmfModel createModel(String name, URI uri) throws EolModelLoadingException {
        return createModel(name, uri, context.getStore().getResourceSet());
    }

    public EmfModel createModel(String name, Resource resource) throws EolModelLoadingException {
        return createModel(name, resource, resource.getResourceSet());
    }

    public EmfModel createModel(String name, Resource resource, ResourceSet resourceSet) throws EolModelLoadingException {
        EmfModel model = new EmfModel() {
            protected ResourceSet createResourceSet() {
                return resourceSet;
            }
        };
        model.setName(name);
        model.setStoredOnDisposal(false);
        model.setResource(resource);
        EcoreUtil.resolveAll(resource);
        return model;
    }

    public EmfModel createModel(String name, EObject eObject) throws EolModelLoadingException {
        return createModel(name, eObject.eResource());
    }

    public EmfModel createModel(String name, URI uri, ResourceSet resourceSet) throws EolModelLoadingException {
        EmfModel model = new EmfModel() {
            protected ResourceSet createResourceSet() {
                return resourceSet;
            }
        };
        model.setName(name);
        model.setStoredOnDisposal(false);
        model.setModelFileUri(uri);
        model.load();
        return model;
    }

    public EmfModel createModel(String name, ResourceSet resourceSet) throws EolModelLoadingException {
        EmfModel model = new EmfModel() {
            protected ResourceSet createResourceSet() {
                return resourceSet;
            }
        };
        model.setName(name);
        model.setStoredOnDisposal(false);
        EcoreUtil.resolveAll(resourceSet);
        model.setResource(context.getStore().getEmptyResource(resourceSet));
        return model;
    }

    public String generateFromString(String templateString, Map<String, Object> params, URI uri, ResourceSet resourceSet) throws Exception {
        IModel model = createModel("S", uri, resourceSet);
        return generateFromString(templateString, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generate(String templatePath, Map<String, Object> params, URI uri, ResourceSet resourceSet) throws Exception {
        IModel model = createModel("S", uri, resourceSet);
        return generate(templatePath, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generateFromString(String templateString, Map<String, Object> params, EObject eObject) throws Exception {
        IModel model = createModel("S", eObject);
        return generateFromString(templateString, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generate(String templatePath, Map<String, Object> params, EObject eObject) throws Exception {
        IModel model = createModel("S", eObject);
        return generate(templatePath, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generateFromString(String templateString, Map<String, Object> params, ResourceSet resourceSet) throws Exception {
        IModel model = createModel("S", resourceSet);
        return generateFromString(templateString, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generate(String templatePath, Map<String, Object> params, ResourceSet resourceSet) throws EglRuntimeException, EolModelLoadingException, IOException, URISyntaxException {
        IModel model = createModel("S", resourceSet);
        return generate(templatePath, params, new ArrayList<IModel>() {{
            add(model);
        }});
    }

    public String generate(String templatePath, Map<String, Object> params, List<IModel> models) throws EglRuntimeException, IOException, URISyntaxException {
        EglTemplateFactory factory = getEglTemplateFactory(params, models);
        java.net.URI templateURI = (new ClassPathResource(templatePath)).getURL().toURI();
        EglTemplate template = factory.load(templateURI);
        checkModuleErrors(template.getModule());
        String result = template.process();
        return result;
    }

    public String generateFromString(String templateString, Map<String, Object> params) throws Exception {
        return generateFromString(templateString, params, new ArrayList<>());
    }

    public String generateFromString(String templateString, Map<String, Object> params, List<IModel> models) throws Exception {
        EglTemplateFactory factory = getEglTemplateFactory(params, models);
        EglTemplate template = factory.prepare(templateString);
        checkModuleErrors(template.getModule());
        String result = template.process();
        return result;
    }

    private EglTemplateFactory getEglTemplateFactory(Map<String, Object> params, List<IModel> models) throws EglRuntimeException, IOException, URISyntaxException {
        EglTemplateFactory factory = new EglFileGeneratingTemplateFactory();
        String templateRoot = (new ClassPathResource(EPSILON_TEMPLATE_ROOT)).getURL().toURI().toString();
        factory.setTemplateRoot(templateRoot);
        IEglContext eglContext = factory.getContext();
        initContext(params, models, eglContext);
        return factory;
    }

    private void initContext(Map<String, Object> params, List<IModel> models, IEolContext eglContext) {
        if (models != null) {
            for (IModel model : models) {
                eglContext.getModelRepository().addModel(model);
            }
        }
        if (params != null) {
            FrameStack frameStack = eglContext.getFrameStack();
            for (String key : params.keySet()) {
                frameStack.put(Variable.createReadOnlyVariable(key, params.get(key)));
            }
        }
    }

    private void checkModuleErrors(IEolModule module) {
        if (module.getParseProblems().size() > 0) {
            String message = "Syntax error(s) in ";
            for (ParseProblem problem : module.getParseProblems()) {
                message += problem.toString() + "\n";
            }
            throw new RuntimeException(message);
        }
    }

    public ResourceSet transform(String scriptPath, Map<String, Object> params, EObject eObject) throws Exception {
        IModel source = createModel("S", eObject);
        Resource resource = context.getStore().getEmptyResource();
        EmfModel target = createModel("T", resource);
        List<IModel> models = new ArrayList<IModel>(){{
            add(source);
            add(target);
        }};
        EtlModule module = new EtlModule();
        ececuteScript(scriptPath, params, models, module);
        ResourceSet resourceSet = context.getStore().getResourceSet();
        while (resource.getContents().size() > 0) {
            EObject object = resource.getContents().get(0);
            context.getStore().createEObject(object);
            resourceSet.getResources().add(object.eResource());
        }
        return resourceSet;
    }

    public List<UnsatisfiedConstraint> validate(String scriptPath, Map<String, Object> params, EObject eObject) throws Exception {
        IModel model = createModel("S", eObject);
        return validate(scriptPath, params, new ArrayList<IModel>(){{add(model);}});
    }

    public List<UnsatisfiedConstraint> validate(String scriptPath, Map<String, Object> params, List<IModel> models) throws Exception {
        EvlModule module = new EvlModule();
        ececuteScript(scriptPath, params, models, module);
        return module.getContext().getUnsatisfiedConstraints();
    }

    private Object ececuteScript(String scriptPath, Map<String, Object> params, List<IModel> models, EolModule module) throws Exception {
        try {
            java.net.URI scriptURI = (new ClassPathResource(scriptPath)).getURL().toURI();
            module.parse(scriptURI);
            checkModuleErrors(module);
            initContext(params, models, module.getContext());
            Object result = module.execute();
            return result;
        }
        finally {
            module.getContext().getModelRepository().dispose();
        }
    }
}
