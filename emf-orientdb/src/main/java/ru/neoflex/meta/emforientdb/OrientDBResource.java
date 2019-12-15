package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.resource.impl.ResourceImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

public class OrientDBResource extends ResourceImpl {
    private Map<String, EObject> idToEObjectMap = new HashMap<>();
    private Map<EObject, String> eObjectToIDMap = new HashMap<>();
    private SessionFactory factory;

    public OrientDBResource(URI uri, SessionFactory factory) {
        super(uri);
        this.factory = factory;
    }

    @Override
    protected EObject getEObjectByID(String id) {
        EObject eObject = idToEObjectMap.get(id);
        return eObject != null ? eObject : super.getEObjectByID(id);
    }

    @Override
    public String getURIFragment(EObject eObject) {
        String id = eObjectToIDMap.get(eObject);
        return id != null ? id : super.getURIFragment(eObject);
    }

//    @Override
//    protected boolean isAttachedDetachedHelperRequired() {
//        return true;
//    }
//
//    @Override
//    protected void attachedHelper(EObject eObject) {
//        super.attachedHelper(eObject);
//        String id = eObjectToIDMap.get(eObject);
//        if (id == null) {
//            id = factory.getId(EcoreUtil.getURI(eObject));
//        }
//        if (id != null) {
//            idToEObjectMap.put(id, eObject);
//            eObjectToIDMap.put(eObject, id);
//        }
//    }
//
//    @Override
//    protected void detachedHelper(EObject eObject) {
//        String oldID = eObjectToIDMap.remove(eObject);
//        if (oldID != null) {
//            idToEObjectMap.remove(oldID);
//        }
//        super.detachedHelper(eObject);
//    }
//
    public void setID(EObject eObject, String id) {
         String oldID = id != null ?
                eObjectToIDMap.put(eObject, id):
                eObjectToIDMap.remove(eObject);

        if (oldID != null) {
            idToEObjectMap.remove(oldID);
        }

        if (id != null) {
            idToEObjectMap.put(id, eObject);
        }
    }

    @Override
    protected void doSave(OutputStream outputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Saveable)outputStream).saveResource(this);
    }

    @Override
    protected void doLoad(InputStream inputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Loadable)inputStream).loadResource(this);
    }
}
