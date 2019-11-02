package ru.neoflex.nfcore.base.filters;

import org.eclipse.jgit.api.errors.GitAPIException;
import ru.neoflex.meta.gitdb.Database;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.meta.gitdb.TransactionClassLoader;
import ru.neoflex.nfcore.base.components.SpringContext;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Workspace;

import javax.servlet.*;
import java.io.IOException;

public class GitClasspathFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        Context context = SpringContext.getBean(Context.class);
        Database db = context.getWorkspace().getDatabase();
        try (Transaction tx = db.createTransaction(Workspace.getCurrentBranch(), Transaction.LockType.DIRTY)) {
            tx.withCurrent(()->{
                try {
                    filterChain.doFilter(servletRequest, servletResponse);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });
        }
    }
}
