package ru.neoflex.nfcore.base.util;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;

public class EMFUtil {
    public static String getId(Resource eResource) {
        URI uri = eResource.getURI();
        String id = uri.segmentCount() > 0 ? uri.segment(0) : "";
        return id;
    }
}
