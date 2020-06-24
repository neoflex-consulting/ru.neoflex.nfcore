package ru.neoflex.meta.emforientdb;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.URIConverter;
import org.eclipse.emf.ecore.resource.impl.ResourceImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class OrientDBResource extends ResourceImpl {

    public OrientDBResource(URI uri, SessionFactory factory) {
        super(uri);
    }

    @Override
    protected void doSave(OutputStream outputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Saveable)outputStream).saveResource(this);
    }

    @Override
    protected void doLoad(InputStream inputStream, Map<?, ?> options) throws IOException {
        ((URIConverter.Loadable)inputStream).loadResource(this);
    }

    public String getID(EObject eObject) {
        return EcoreUtil.getURI(eObject).fragment();
    }

    public void setID(EObject eObject, String id) {}
}
