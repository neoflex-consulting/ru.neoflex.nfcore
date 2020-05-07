package ru.neoflex.nfcore.base.services;

import com.fasterxml.jackson.databind.JsonNode;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import groovy.util.GroovyScriptEngine;
import org.codehaus.groovy.runtime.InvokerHelper;
import org.eclipse.emf.ecore.EClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.neoflex.meta.emfgit.Transaction;

import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
        Binding b = new Binding();
        b.setVariable("instance", instance);
        b.setVariable("method", method);
        b.setVariable("args", args);
        GroovyShell sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), b);
        Object result =  sh.evaluate("instance.\"$method\"(*args)");
        return result;
    }

    public Object eval(String code, List args) throws Exception {
        Binding b = new Binding();
        if (args != null) {
            b.setVariable("args", args);
        }
        GroovyShell sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), b);
        Object result =  sh.evaluate(code);
        return result;
    }

    public Object eval(String code, Map<String, Object> args) throws Exception {
        Binding b = new Binding();
        if (args != null) {
            for (String name: args.keySet()) {
                b.setVariable(name, args.get(name));
            }
        }
        GroovyShell sh = new GroovyShell(Thread.currentThread().getContextClassLoader(), b);
        Object result =  sh.evaluate(code);
        return result;
    }

    public Object evalScript(String scriptName, List<String> args) throws Exception {
        URL gitRootURL = Transaction.getCurrent().getFileSystem().getRootPath().toUri().toURL();
        GroovyScriptEngine groovyScriptEngine = new GroovyScriptEngine(new URL[] {gitRootURL}, Thread.currentThread().getContextClassLoader());
        return groovyScriptEngine.run(scriptName, new Binding(args.toArray(new String[0])));
    }

    public Object evalScript(String scriptName, Map<String, Object> args) throws Exception {
        URL gitRootURL = Transaction.getCurrent().getFileSystem().getRootPath().toUri().toURL();
        GroovyScriptEngine groovyScriptEngine = new GroovyScriptEngine(new URL[] {gitRootURL}, Thread.currentThread().getContextClassLoader());
        return groovyScriptEngine.run(scriptName, new Binding(args));
    }

    public Object evalStatic(String fullClassName, String method, List args) throws Exception {
        URL gitRootURL = Transaction.getCurrent().getFileSystem().getRootPath().toUri().toURL();
        GroovyScriptEngine groovyScriptEngine = new GroovyScriptEngine(new URL[] {gitRootURL}, Thread.currentThread().getContextClassLoader());
        Class scriptClass = groovyScriptEngine.loadScriptByName(fullClassName.replace(".", "/") + ".groovy");
        return InvokerHelper.invokeMethod(scriptClass, method, args.toArray());
    }

    public Object evalMethod(String fullClassName, String method, List args) throws Exception {
        URL gitRootURL = Transaction.getCurrent().getFileSystem().getRootPath().toUri().toURL();
        GroovyScriptEngine groovyScriptEngine = new GroovyScriptEngine(new URL[] {gitRootURL}, Thread.currentThread().getContextClassLoader());
        Class scriptClass = groovyScriptEngine.loadScriptByName(fullClassName.replace(".", "/") + ".groovy");
        return InvokerHelper.invokeMethod(scriptClass.newInstance(), method, args.toArray());
    }

    public Object callStatic(String fullClassName, String method, JsonNode args) throws Exception {
        return callStatic(fullClassName, method, new ArrayList(){{add(args);}});
    }

    public Object callStatic(EClass eClass, String method, List args) throws Exception {
        String fullClassName = eClass.getEPackage().getNsURI() + "." + eClass.getName();
        return callStatic(fullClassName, method, args);
    }

    public Object callStatic(String fullClassName, String method, List args) throws Exception {
        Class scriptClass = Thread.currentThread().getContextClassLoader().loadClass(fullClassName);
        Class[] argsClasses = (Class[]) args.stream().map((Object object) -> object.getClass()).toArray(size->new Class[size]);
        Method declaredMethod = scriptClass.getDeclaredMethod(method, argsClasses);
        Object result = declaredMethod.invoke(null, args.toArray());
        return result;
    }
}
