package ru.neoflex.meta.emfgit;

import org.eclipse.emf.ecore.resource.Resource;

import java.util.List;

public interface Index {
    String getName();
    List<IndexEntry> getEntries(Resource resource, Transaction transaction);
}
