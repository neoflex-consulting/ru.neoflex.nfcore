package ru.neoflex.nfcore.base.controllers;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.LoggingEvent;
import ch.qos.logback.core.AppenderBase;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Groovy;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

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

    private<R> R withLogAppender(Writer out, Supplier<R> supplier) {
        AppenderBase appender = new AppenderBase<LoggingEvent>() {
            @Override
            protected void append(LoggingEvent event) {
                try {
                    out.write(event.getMessage() + "\n");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        };
        Logger log = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        log.addAppender(appender);
        appender.start();
        try {
            return supplier.get();
        }
        finally {
            appender.stop();
            log.detachAppender(appender);
        }
    }

    @PostMapping("/evaluate")
    Object evaluate(@RequestParam String name, @RequestBody String script) throws Exception {
        Map<String, Object> params = new HashMap<>();
        Writer out = new StringWriter();
        params.put("out", out);
        return withLogAppender(out, () -> {
            try {
                Object result = context.inContextWithClassLoaderInTransaction(()-> groovy.eval(name, script, params));
                Map ret = new HashMap();
                if (result != null) {
                    ret.put("result", result);
                }
                ret.put("out", out.toString());
                return ret;
            }
            catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
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
