package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.xmi.impl.XMLResourceImpl;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class OrientDBResource extends XMLResourceImpl {

    public OrientDBResource(URI uri, SessionFactory factory) {
        super(uri);
    }

    @Override
    public void doSave(OutputStream outputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Saveable)outputStream).saveResource(this);
    }

    protected boolean useUUIDs()
    {
        return true;
    }

    protected void attachedHelper(EObject eObject) {
        super.attachedHelper(eObject);
        for(EObject contained: eObject.eContents()) {
            attachedHelper(contained);
        }
    }

    public void setID(EObject eObject, String id) {
        if (id != null && !id.startsWith(("_"))) {
            return;
        }
        super.setID(eObject, id);
    }

    @Override
    public void doLoad(InputStream inputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Loadable)inputStream).loadResource(this);
    }
}
