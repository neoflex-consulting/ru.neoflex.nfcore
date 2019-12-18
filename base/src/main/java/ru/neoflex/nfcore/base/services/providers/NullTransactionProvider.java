package ru.neoflex.nfcore.base.services.providers;

import java.io.IOException;

public class NullTransactionProvider implements TransactionSPI {
    private StoreSPI store;

    public NullTransactionProvider(StoreSPI store) {
        this.store = store;
    }
    @Override
    public void commit(String message, String author, String email) throws IOException {

    }

    @Override
    public StoreSPI getStore() {
        return store;
    }

    @Override
    public void close() throws IOException {

    }
}
