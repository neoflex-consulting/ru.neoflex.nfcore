package ru.neoflex.nfcore.base.services.providers;

import ru.neoflex.meta.emfgit.Database;
import ru.neoflex.meta.emfgit.Transaction;
import ru.neoflex.nfcore.base.components.SpringContext;

import java.io.IOException;

public class GitDBTransactionProvider extends Transaction implements TransactionSPI {
    private StoreSPI storeSPI;
    public GitDBTransactionProvider(Database database, String branch, LockType lockType) throws IOException {
        super(database, branch, lockType);
    }

    @Override
    public StoreSPI getStore() {
        if (storeSPI == null) {
            storeSPI = SpringContext.getBean(GitDBStoreProvider.class);
        }
        return storeSPI;
    }
}
