package ru.neoflex.meta.gitdb;

import java.io.IOException;
import java.util.List;

public interface Index {
    String getName();
    List<IndexEntry> getEntries(Entity entity, Transaction transaction) throws IOException;
}
