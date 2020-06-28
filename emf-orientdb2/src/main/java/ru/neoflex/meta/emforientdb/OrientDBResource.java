package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.xmi.impl.XMLResourceImpl;

public class OrientDBResource extends XMLResourceImpl {

    public OrientDBResource(URI uri) {
        super(uri);
    }

    protected boolean useUUIDs()
    {
        return false;
    }

    protected boolean useIDs() {
        return true;
    }

//    public void setID(EObject eObject, String id) {
//        if (id == null || !id.startsWith("ui_generated")) {
//            super.setID(eObject, id);
//        }
//    }

//    private boolean isGUID(String id) {
//        return id != null && id.length() == 23 && id.startsWith("_");
//    }
}
