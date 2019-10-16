package ru.neoflex.nfcore.base.filters;

import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.services.Workspace;

import javax.servlet.*;
import java.io.IOException;

public class GitClasspathFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        try (Transaction tx = Workspace.getDatabase().createTransaction(Workspace.getCurrentBranch(), Transaction.LockType.DIRTY)) {
            tx.withClassLoader(() -> {
                filterChain.doFilter(servletRequest, servletResponse);
                return 0;
            });
        } catch (Exception e) {
            throw new IOException(e);
        }

    }
}
