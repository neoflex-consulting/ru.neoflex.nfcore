package ru.neoflex.nfcore.base.filters;

import ru.neoflex.nfcore.base.components.SpringContext;
import ru.neoflex.nfcore.base.services.Context;

import javax.servlet.*;
import java.io.IOException;

public class ContextFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        Context context = SpringContext.getBean(Context.class);
        context.setCurrent();
        filterChain.doFilter(servletRequest, servletResponse);
    }
}
