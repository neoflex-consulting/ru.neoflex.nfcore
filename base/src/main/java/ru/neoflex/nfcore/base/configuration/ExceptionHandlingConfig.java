package ru.neoflex.nfcore.base.configuration;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

//@ControllerAdvice
public class ExceptionHandlingConfig {
    private final static Log logger = LogFactory.getLog(ExceptionHandlingConfig.class);

//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    @ExceptionHandler
//    public @ResponseBody
//    Map handleError(HttpServletRequest req, Throwable exception) {
//        //logger.error(req.getRequestURI(), exception);
//        //exception.printStackTrace();
//        Map errInfo = new HashMap();
//        StringWriter sw = new StringWriter();
//        exception.printStackTrace(new PrintWriter(sw));
//        errInfo.put("trace", sw.toString());
//        errInfo.put("path", req.getRequestURL());
//        List<String> msgs = new LinkedList<>();
//        while (exception != null) {
//            String message = exception.getMessage();
//            if (message == null) {
//                message = exception.toString();
//            }
//            msgs.add(message);
//            exception = exception.getCause();
//        }
//        errInfo.put("messages", msgs);
//        errInfo.put("message", msgs.size() > 0 ? msgs.get(msgs.size() - 1) : "Unknown error");
//        return errInfo;
//    }
}
