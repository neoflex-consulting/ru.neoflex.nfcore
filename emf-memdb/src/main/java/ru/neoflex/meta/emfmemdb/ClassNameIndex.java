package ru.neoflex.meta.emfmemdb;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.util.ArrayList;
import java.util.List;

public class ClassNameIndex implements DBIndex {
    @Override
    public String getName() {
        return "ClassNameIndex";
    }

    @Override
    public String[] getFields() {
        return new String[] {"classUri", "qName", "uri"};
    }

    @Override
    public List<String[]> getEntries(Resource resource) {
        DBHandler dbHandler = (DBHandler) resource.getResourceSet().getURIConverter().getURIHandlers().get(0);
        MemDBServer dbServer = dbHandler.getTx().getDbServer();
        List<String[]> result = new ArrayList<>();
        for (EObject eObject: resource.getContents()) {
            String classUri = EcoreUtil.getURI(eObject.eClass()).toString();
            String qName = dbServer.getQName(eObject);
            String uri = EcoreUtil.getURI(eObject).toString();
            result.add(new String[]{classUri, qName, uri});
        }
        return result;
    }
}
