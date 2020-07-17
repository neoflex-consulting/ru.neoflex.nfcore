package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.ecore.resource.Resource;

import java.util.List;

public interface DBIndex {
    String getName();
    String[] getFields();
    List<String[]> getEntries(Resource resource);
}
