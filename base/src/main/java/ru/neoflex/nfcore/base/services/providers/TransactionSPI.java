package ru.neoflex.nfcore.base.services.providers;

import java.io.Closeable;
import java.io.IOException;

public interface TransactionSPI extends Closeable {
    void commit(String message, String author, String email) throws IOException;
}
