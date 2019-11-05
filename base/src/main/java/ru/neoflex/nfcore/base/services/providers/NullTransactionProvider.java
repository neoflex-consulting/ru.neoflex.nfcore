package ru.neoflex.nfcore.base.services.providers;

import java.io.IOException;

public class NullTransactionProvider implements TransactionSPI {
    @Override
    public void commit(String message, String author, String email) throws IOException {

    }

    @Override
    public void close() throws IOException {

    }
}
