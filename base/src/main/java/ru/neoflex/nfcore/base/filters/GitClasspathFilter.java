package ru.neoflex.nfcore.base.filters;

import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.components.SpringContext;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Workspace;
import ru.neoflex.nfcore.base.services.providers.GitDBTransactionProvider;

import javax.servlet.*;
import java.io.IOException;

public class GitClasspathFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        Workspace workspace = SpringContext.getBean(Workspace.class);
        try {
            workspace.getDatabase().inTransaction(
                () -> new GitDBTransactionProvider(
                        workspace.getDatabase(),
                        workspace.getCurrentBranch(),
                        Transaction.LockType.READ
                ),
                tx -> {
                    filterChain.doFilter(servletRequest, servletResponse);
                    return null;
                }
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
