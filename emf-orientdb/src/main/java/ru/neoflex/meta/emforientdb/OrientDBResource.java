package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.xmi.impl.XMLResourceImpl;

public class OrientDBResource extends XMLResourceImpl {

    public OrientDBResource(URI uri) {
        super(uri);
    }

    @Override
    protected boolean isAttachedDetachedHelperRequired() {
        return true;
    }

    protected boolean useIDs() {
        return true;
    }

    @Override
    public EObject getEObjectByID(String id)
    {
        return super.getEObjectByID(id);
    }
}
