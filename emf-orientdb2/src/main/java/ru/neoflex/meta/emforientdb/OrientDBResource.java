package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.xmi.impl.XMLResourceImpl;

public class OrientDBResource extends XMLResourceImpl {

    public OrientDBResource(URI uri) {
        super(uri);
    }

    protected boolean useUUIDs()
    {
        return true;
    }

    public void setID(EObject eObject, String id) {
        if (isGUID(id)) {
            super.setID(eObject, id);
        }
    }

    private boolean isGUID(String id) {
        return id != null && id.length() == 23 && id.startsWith("_");
    }
}
