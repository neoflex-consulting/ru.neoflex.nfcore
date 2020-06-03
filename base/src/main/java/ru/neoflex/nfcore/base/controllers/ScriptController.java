package ru.neoflex.nfcore.base.controllers;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Groovy;

import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController()
@RequestMapping("/script")
public class ScriptController {
    private final static Log logger = LogFactory.getLog(ScriptController.class);
    @Autowired
    Context context;
    @Autowired
    Groovy groovy;

    @PostMapping("/eval")
    Object eval(@RequestParam final Map<String,Object> params, @RequestBody String script) throws Exception {
        logger.debug(params);
        Object result = context.inContextWithClassLoaderInTransaction(()-> groovy.eval(script, params));
        logger.debug(result);
        return result;
    }

    @PostMapping("/evaluate")
    Object evaluate(@RequestParam final Map<String,Object> params, @RequestBody String script) throws Exception {
        logger.debug(params);
        Writer out = new StringWriter();
        params.put("out", out);
        Object result = context.inContextWithClassLoaderInTransaction(()-> groovy.eval(script, params));
        logger.debug(result);
        Map ret = new HashMap();
        ret.put("result", result);
        ret.put("out", out.toString());
        return ret;
    }

    @PostMapping("/static/{fullClassName:.+}/{method}")
    Object callStatic(@PathVariable("fullClassName") final String fullClassName,
                      @PathVariable("method") final String method,
                      @RequestBody final List<Object> params) throws Exception {
        logger.debug(params);
        Object result = context.inContextWithClassLoaderInTransaction(()-> groovy.evalStatic(fullClassName, method, params));
        logger.debug(result);
        return result;
    }

    @PostMapping("/method/{fullClassName:.+}/{method}")
    Object callMethod(@PathVariable("fullClassName") final String fullClassName,
                      @PathVariable("method") final String method,
                      @RequestBody final List<Object> params) throws Exception {
        logger.debug(params);
        Object result = context.inContextWithClassLoaderInTransaction(()-> groovy.evalMethod(fullClassName, method, params));
        logger.debug(result);
        return result;
    }

    @PostMapping("/resource")
    Object evalResource(@RequestParam final String path,
                        @RequestBody final Map<String, Object> params) throws Exception {
        logger.debug(params);
        Object result = context.inContextWithClassLoaderInTransaction(()-> {
            return groovy.evalScript(path, params);
        });
        logger.debug(result);
        return result;
    }
}
