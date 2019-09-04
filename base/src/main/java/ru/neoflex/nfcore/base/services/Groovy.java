package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.JsonNode;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import org.eclipse.emf.ecore.EClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

@Service
public class Groovy {
    private static final Logger logger = LoggerFactory.getLogger(Groovy.class);

    @Autowired
    Context context;

    public Object eval(String fullClassName, String method, List args) throws Exception {
        Class scriptClass = Thread.currentThread().getContextClassLoader().loadClass(fullClassName);
        return eval(scriptClass, method, args);
    }

    public Object eval(EClass eClass, String method, List args) throws Exception {
        String fullClassName = eClass.getEPackage().getNsURI() + "." + eClass.getName();
        return eval(fullClassName, method, args);
    }

    public Object eval(Object instance, String method, List args) throws Exception {
        return context.withContext(() -> {
            Binding b = new Binding();
            b.setVariable("instance", instance);
            b.setVariable("method", method);
            b.setVariable("args", args);
            GroovyShell sh = new GroovyShell(b);
            Object result =  sh.evaluate("instance.\"$method\"(*args)");
            return result;
        });
    }

    public Object callStatic(String fullClassName, String method, JsonNode args) throws Exception {
        return callStatic(fullClassName, method, new ArrayList(){{add(args);}});
    }

    public Object callStatic(EClass eClass, String method, List args) throws Exception {
        String fullClassName = eClass.getEPackage().getNsURI() + "." + eClass.getName();
        return callStatic(fullClassName, method, args);
    }

    public Object callStatic(String fullClassName, String method, List args) throws Exception {
        return context.withContext(() -> {
            Class scriptClass = Thread.currentThread().getContextClassLoader().loadClass(fullClassName);
            Class[] argsClasses = (Class[]) args.stream().map((Object object) -> object.getClass()).toArray(size->new Class[size]);
            Method declaredMethod = scriptClass.getDeclaredMethod(method, argsClasses);
            Object result = declaredMethod.invoke(null, args.toArray());
            return result;
        });
    }
}
