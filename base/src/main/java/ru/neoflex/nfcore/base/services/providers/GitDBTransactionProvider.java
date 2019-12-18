package ru.neoflex.nfcore.base.services.providers;

import ru.neoflex.meta.emfgit.Database;
import ru.neoflex.meta.emfgit.Transaction;

import java.io.IOException;

public class GitDBTransactionProvider extends Transaction implements TransactionSPI {
    public GitDBTransactionProvider(Database database, String branch, LockType lockType) throws IOException {
        super(database, branch, lockType);
    }

    @Override
    public StoreSPI getStore() {
        return (StoreSPI) getDatabase();
    }
}
