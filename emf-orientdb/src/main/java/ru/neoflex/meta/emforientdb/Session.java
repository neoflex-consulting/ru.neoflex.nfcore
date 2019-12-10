package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.id.ORID;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OProperty;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.ORecord;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.URIHandlerImpl;
import org.eclipse.emf.ecore.util.EcoreUtil;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Session implements Closeable {
    private final SessionFactory factory;
    private final ODatabaseDocument db;

    public Session(SessionFactory factory, ODatabaseDocument db) {
        this.factory = factory;
        this.db = db;
    }

    @Override
    public void close() {
        db.close();
    }

    public ODatabaseDocument getDatabaseDocument() {
        return db;
    }

    public SessionFactory getSessionFactory() {
        return factory;
    }

    private OClass getOrCreateOClass(String oClassName, boolean isAbstract) {
        OClass oClass = db.getClass(oClassName);
        if (oClass == null) {
            oClass = db.createClass(oClassName);
        }
        if (isAbstract) {
            oClass.setAbstract(true);
        }
        return oClass;
    }

    private OClass getOrCreateEObjectClass() {
        return getOrCreateOClass("ecore_EObject", true);
    }

    private String getOClassName(EClass eClass) {
        EPackage ePackage = eClass.getEPackage();
        return ePackage.getNsPrefix() + "_" + eClass.getName();
    }

    private OClass getOrCreateOClass(EClass eClass) {
        String oClassName = getOClassName(eClass);
        boolean isAbstract = eClass.isAbstract();
        return getOrCreateOClass(oClassName, isAbstract);
    }

    private OType convertEDataType(EDataType eDataType) {
        OType oType = OType.getTypeByClass(eDataType.getInstanceClass());
        return oType != null ? oType : OType.STRING;
    }

    private void createProperty(OClass oClass, EStructuralFeature sf) {
        if (sf instanceof EReference) {
            EReference eReference = (EReference) sf;
            if (!eReference.isContainer()) {
                OClass refOClass = eReference.isContainment() ?
                        getOrCreateOClass(eReference.getEReferenceType()):
                        null;
                OType oType = (eReference.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED);
                oClass.createProperty(sf.getName(), oType, refOClass);
            }
        }
        else if (sf instanceof EAttribute) {
            if (sf.isMany()) {
                oClass.createProperty(sf.getName(), OType.EMBEDDEDLIST);
            }
            else {
                OType oType = convertEDataType(((EAttribute) sf).getEAttributeType());
                oClass.createProperty(sf.getName(), oType);
            }
        }
    }

    public void createSchema() {
        OClass oEcoreEObjectClass = getOrCreateEObjectClass();
        for (EClass eClass: factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            if (eClass.getESuperTypes().size() == 0) {
                oClass.addSuperClass(oEcoreEObjectClass);
            }
            for (EClass eSuperClass: eClass.getESuperTypes()) {
                OClass oSuperClass = getOrCreateOClass(eSuperClass);
                oClass.addSuperClass(oSuperClass);
            }
            for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
                if (!sf.isDerived() && !sf.isTransient()) {
                    OProperty oProperty = oClass.getProperty(sf.getName());
                    if (oProperty == null) {
                        createProperty(oClass, sf);
                    }
                }
            }
            EStructuralFeature sf = factory.getQNameFeature(eClass);
            if (sf != null) {
                oClass.createIndex(oClass.getName() + "_" + sf.getName() + "_ak", OClass.INDEX_TYPE.UNIQUE, sf.getName());
            }
        }
    }

    private OElement loadElement(URI uri) {
        ORID orid = factory.getORID(uri);
        if (orid == null) {
            return null;
        }
        return db.load(orid);
    }

    private OElement loadElementOrThrow(URI uri) {
        OElement oElement = loadElement(uri);
        if (oElement == null) {
            throw new RuntimeException("Can not load element with uri: " + uri);
        }
        return oElement;
    }

    private OElement createOReference(EObject eObject, EStructuralFeature sf, EObject toObject) {
        EObject root = EcoreUtil.getRootContainer(eObject);
        EObject toRoot = EcoreUtil.getRootContainer(toObject);
        String fragment = EcoreUtil.getRelativeURIFragmentPath(toRoot, toObject);
        OElement element = db.newElement();
        if (fragment != null && !fragment.isEmpty()) {
            element.setProperty("fragment", fragment);
        }
        if (root.equals(toRoot)) {
            return element;
        }
        URI uri = toRoot.eResource().getURI();
        OElement toElement = loadElementOrThrow(uri);
        element.setProperty("element", toElement);
        if (!sf.getEType().equals(toObject.eClass())) {
            element.setProperty("eClass", EcoreUtil.getURI(toObject.eClass()).toString());
        }
        return element;
    }

    private Object objectToOObject(EDataType eDataType, Object value) {
        OType oType = convertEDataType(eDataType);
        if (oType == OType.STRING) {
            return EcoreUtil.convertToString(eDataType, value);
        }
        return value;
    }

    private Object oObjectToObject(EDataType eDataType, Object value) {
        OType oType = convertEDataType(eDataType);
        if (oType == OType.STRING) {
            return EcoreUtil.createFromString(eDataType, value.toString());
        }
        return value;
    }

    private void populateOElement(EObject eObject, OElement oElement) {
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference) {
                    if (sf.isMany()) {
                        EList<EObject> eList = (EList<EObject>) value;
                        List<OElement> elements = ((EReference) sf).isContainment() ?
                                eList.stream().map(e-> createAdnPopulateOElement(e)).collect(Collectors.toList()) :
                                eList.stream().map(e-> createOReference(eObject, sf, e)).collect(Collectors.toList());
                        oElement.setProperty(sf.getName(), elements);
                    }
                    else {
                        if (((EReference) sf).isContainment()) {
                            oElement.setProperty(sf.getName(), createAdnPopulateOElement((EObject) value));
                        }
                        else {
                            oElement.setProperty(sf.getName(), createOReference(eObject, sf, (EObject) value));
                        }
                    }
                }
                else if (sf instanceof EAttribute) {
                    if (sf.isMany()) {
                        List eList = (List) value;
                        Stream<Object> oStream = eList.stream().
                                map(e -> objectToOObject(((EAttribute) sf).getEAttributeType(), e));
                        List<Object> oList = oStream.collect(Collectors.toList());
                        oElement.setProperty(sf.getName(), oList);
                    }
                    else {
                        oElement.setProperty(sf.getName(), objectToOObject(((EAttribute) sf).getEAttributeType(), value));
                    }
                }
            }
            else {
                oElement.removeProperty(sf.getName());
            }
        }
    }

    private OElement createOElement(EObject eObject) {
        EClass eClass = eObject.eClass();
        EPackage ePackage = eClass.getEPackage();
        String oClassName = ePackage.getNsPrefix() + "_" + eClass.getName();
        OElement oElement = db.newElement(oClassName);
        return oElement;
    }

    private OElement createAdnPopulateOElement(EObject eObject) {
        OElement oElement = createOElement(eObject);
        populateOElement(eObject, oElement);
        return oElement;
    }

    public void delete(URI uri) {
        db.delete(factory.getORID(uri), factory.getVersion(uri));
    }

    public void save(Resource resource) {
        if (resource.getContents().isEmpty()) {
            delete(resource.getURI());
            return;
        }
        if (resource.getContents().size() > 1) {
            throw new IllegalArgumentException("Can not save resource with multiple EObjects");
        }
        EObject eObject = resource.getContents().get(0);
        OElement oElement = loadElement(resource.getURI());
        if (oElement == null) {
            oElement = createOElement(eObject);
        }
        populateOElement(eObject, oElement);
        ORecord oRecord = oElement.save();
        resource.setURI(factory.createURI(oRecord));
    }

    public void load(Resource resource) {
        OElement oElement = loadElementOrThrow(resource.getURI());
        EObject eObject = createEObject(oElement);
        populateEObject(resource.getResourceSet(), oElement, eObject);
        resource.getContents().clear();
        resource.getContents().add(eObject);
        resource.setURI(factory.createURI(oElement));
    }

    public EObject createEObject(OElement oElement) {
        String oClassName = oElement.getSchemaType().get().getName();
        String[] parts = oClassName.split("_", 2);
        EPackage ePackage = factory.getEPackage(parts[0]);
        if (ePackage == null) {
            throw new IllegalArgumentException("EPackage " + parts[0] + " not found");
        }
        EClassifier eClassifier = ePackage.getEClassifier(parts[1]);
        if (eClassifier == null || !(eClassifier instanceof EClass)) {
            throw new IllegalArgumentException("EClass " + parts[1] + " not found in EPackage " + parts[0]);
        }
        EObject eObject = EcoreUtil.create((EClass) eClassifier);
        return eObject;
    }

    static class RefHolder {
        public EObject eObject;
        EStructuralFeature sf;
        OElement oElement;

        RefHolder(EObject e, EStructuralFeature f, OElement o) {
            eObject = e;
            sf = f;
            oElement = o;
        }
    }
    private void populateEObject(ResourceSet rs, OElement oElement, EObject eObject) {
        List<RefHolder> refs = new ArrayList<>();
        populateEObject(rs, oElement, eObject, refs);
        refs.forEach(r -> {
            EObject e = createReference(rs, r.eObject, r.sf, r.oElement);
            if (r.sf.isMany()) {
                ((List) r.eObject.eGet(r.sf)).add(e);
            }
            else {
                r.eObject.eSet(r.sf, e);
            }
        });
    }

    private void populateEObject(ResourceSet rs, OElement oElement, EObject eObject, List<RefHolder> refs) {
        EClass eClass = eObject.eClass();
        Set<String> propertyNames = oElement.getPropertyNames();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && propertyNames.contains(sf.getName())) {
                Object value = oElement.getProperty(sf.getName());
                if (sf instanceof EReference) {
                    if (sf.isMany()) {
                        List<OElement> oObjects = (List) value;
                        if (((EReference) sf).isContainment()) {
                            oObjects.forEach(o-> {
                                EObject e = createEObject(o);
                                ((List) eObject.eGet(sf)).add(e);
                                populateEObject(rs, o, e, refs);
                            });
                        }
                        else {
                            oObjects.forEach(o-> {
                                refs.add(new RefHolder(eObject, sf, o));
                            });
                        }
                    }
                    else {
                        if (((EReference) sf).isContainment()) {
                            EObject contained = createEObject((OElement) value);
                            eObject.eSet(sf, contained);
                            populateEObject(rs, (OElement) value, contained, refs);
                        }
                        else {
                            refs.add(new RefHolder(eObject, sf, (OElement) value));
                        }
                    }
                }
                else if (sf instanceof EAttribute) {
                    EDataType eDataType = ((EAttribute) sf).getEAttributeType();
                    if (sf.isMany()) {
                        List oObjects = (List) value;
                        Stream<Object> objectStream = oObjects.stream().map(o->oObjectToObject(eDataType, o));
                        List eObjects = objectStream.collect(Collectors.toList());
                        eObject.eSet(sf, eObjects);
                    }
                    else {
                        eObject.eSet(sf, oObjectToObject(eDataType, value));
                    }
                }
            }
        }
    }

    private EObject createReference(ResourceSet rs, EObject fromObject, EStructuralFeature sf, OElement value) {
        OElement element = value.getProperty("element");
        String eClassURI = value.getProperty("eClass");
        String fragment = value.getProperty("fragment");
        EObject eObject = null;
        if (element == null) {
            eObject = EcoreUtil.getRootContainer(fromObject);
            if (fragment != null && !fragment.isEmpty()) {
                eObject = EcoreUtil.getEObject(eObject, fragment);
                if (eObject == null) {
                    throw new RuntimeException("Can not resolve local fragment " + fragment);
                }
            }
        }
        else {
            URI elementURI = factory.createURI(element);
            if (fragment != null && !fragment.isEmpty()) {
                elementURI = elementURI.trimFragment().appendFragment("//" + fragment);
            }
            EClass eClass = (EClass) sf.getEType();
            if (eClassURI != null && !eClassURI.isEmpty()) {
                eClass = (EClass) rs.getEObject(URI.createURI(eClassURI), false);
            }
            eObject = EcoreUtil.create(eClass);
            ((InternalEObject) eObject).eSetProxyURI(elementURI);
        }
        return eObject;
    }

    public ResourceSet createResourceSet() {
        ResourceSet resourceSet = factory.createResourceSet();
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new URIHandlerImpl() {
                    @Override
                    public boolean canHandle(URI uri) {
                        return SessionFactory.ORIENTDB.equals(uri.scheme());
                    }

                    @Override
                    public OutputStream createOutputStream(URI uri, Map<?, ?> options) throws IOException {
                        return new OrientDBOutputStream(Session.this, uri, options);
                    }

                    @Override
                    public InputStream createInputStream(URI uri, Map<?, ?> options) throws IOException {
                        return new OrientDBInputStream(Session.this, uri, options);
                    }

                    @Override
                    public void delete(URI uri, Map<?, ?> options) throws IOException {
                        Session.this.delete(uri);
                    }
                });
        return resourceSet;
    }

    private List<Resource> getResourceList(OResultSet rs) {
        ResourceSet resourceSet = createResourceSet();
        List<Resource> result = new ArrayList<>();
        while (rs.hasNext()) {
            OResult oResult = rs.next();
            Optional<OElement> oElementOpt = oResult.getElement();
            if (oElementOpt.isPresent()) {
                OElement oElement = oElementOpt.get();
                EObject eObject = createEObject(oElement);
                Resource resource = resourceSet.createResource(factory.createURI(oElement));
                resource.getContents().add(eObject);
                populateEObject(resourceSet, oElement, eObject);
                result.add(resource);
            }
        }
        return result;
    }

    public List<Resource> query(String sql, Object... args) {
        OResultSet rs = db.query(sql, args);
        return getResourceList(rs);
    }

    public List<Resource> query(String sql, Map args) {
        OResultSet rs = db.query(sql, args);
        return getResourceList(rs);
    }
}
