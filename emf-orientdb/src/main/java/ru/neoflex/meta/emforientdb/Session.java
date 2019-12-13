package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.id.ORID;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OProperty;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.*;
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
    public static final String REFERENCE = "Reference";
    public static final String EOBJECT = "EObject";
    private final SessionFactory factory;
    private final ODatabaseDocument db;
    final Map<Resource, ORecord> savedResourcesMap = new HashMap<>();

    Session(SessionFactory factory, ODatabaseDocument db) {
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

    public SessionFactory getFactory() {
        return factory;
    }

    private OClass getOrCreateOClass(String oClassName, boolean isAbstract) {
        OClass oClass = db.getClass(oClassName);
        if (oClass == null) {
            oClass = db.createClass(oClassName);
            if (isAbstract) {
                oClass.setAbstract(true);
            }
        }
        return oClass;
    }

    private OClass getOrCreateReferenceClass() {
        OClass oClass = db.getClass(REFERENCE);
        if (oClass == null) {
            oClass = db.createEdgeClass(REFERENCE);
            oClass.createProperty("name", OType.STRING);
            oClass.createProperty("fromFragment", OType.STRING);
            oClass.createProperty("fromFeature", OType.STRING);
            oClass.createProperty("fromIndex", OType.INTEGER);
            oClass.createProperty("toFragment", OType.STRING);
            oClass.createProperty("isExternal", OType.BOOLEAN);
            oClass.createProperty("eClass", OType.STRING);
        }
        return oClass;
    }

    private OClass getOrCreateEObjectClass() {
        OClass oClass = db.getClass(EOBJECT);
        if (oClass == null) {
            oClass = db.createVertexClass(EOBJECT);
            oClass.setAbstract(true);
        }
        return oClass;
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
            if (eReference.isContainment()) {
                OClass refOClass = getOrCreateOClass(eReference.getEReferenceType());
                OType oType = (eReference.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED);
                oClass.createProperty(sf.getName(), oType, refOClass);
            }
        }
        else if (sf instanceof EAttribute) {
            OType oType = convertEDataType(((EAttribute) sf).getEAttributeType());
            if (sf.isMany()) {
                oClass.createProperty(sf.getName(), OType.EMBEDDEDLIST, oType);
            }
            else {
                oClass.createProperty(sf.getName(), oType);
            }
        }
    }

    public void ensureSuperClass(OClass oClass, OClass oSuperClass) {
        if (!oClass.getAllSuperClasses().contains(oSuperClass)) {
            oClass.addSuperClass(oSuperClass);
        }
    }
    public void createSchema() {
        OClass oEcoreEObjectClass = getOrCreateEObjectClass();
        getOrCreateReferenceClass();
        for (EClass eClass: factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            if (eClass.getESuperTypes().size() == 0) {
                ensureSuperClass(oClass, oEcoreEObjectClass);
            }
            for (EClass eSuperClass: eClass.getESuperTypes()) {
                OClass oSuperClass = getOrCreateOClass(eSuperClass);
                ensureSuperClass(oClass, oSuperClass);
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
            if (sf != null && sf.getEContainingClass().equals(eClass)) {
                String name = oClass.getName() + "_" + sf.getName() + "_ak";
                if (oClass.getClassIndex(name) == null) {
                    oClass.createIndex(name, OClass.INDEX_TYPE.UNIQUE, sf.getName());
                }
            }
        }
    }

    private OVertex loadElement(URI uri) {
        ORID orid = factory.getORID(uri);
        if (orid == null) {
            return null;
        }
        return db.load(orid);
    }

    private OVertex loadElementOrThrow(URI uri) {
        OVertex oElement = loadElement(uri);
        if (oElement == null) {
            throw new RuntimeException("Can not load element with uri: " + uri);
        }
        return oElement;
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

    private void populateOElement(EObject eObject, OElement oElement, boolean top) {
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference) {
                    if (((EReference) sf).isContainment()) {
                        if (sf.isMany()) {
                            EList<EObject> eList = (EList<EObject>) value;
                            List<OVertex> elements = eList.stream().map(e-> createAndPopulateOElement(e, false)).collect(Collectors.toList());
                            oElement.setProperty(sf.getName(), elements);
                        }
                        else {
                            oElement.setProperty(sf.getName(), createAndPopulateOElement((EObject) value, false));
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
        if (top && oElement instanceof OVertex) {
            Map<String, OEdge> oEdgeMap = new HashMap<>();
            for (OEdge oEdge: ((OVertex) oElement).getEdges(ODirection.OUT, getOrCreateReferenceClass())) {
                oEdgeMap.put(oEdge.getProperty("name"), oEdge);
            }
            Map<EObject, Collection<EStructuralFeature.Setting>> cr = EcoreUtil.CrossReferencer.find(Collections.singleton(eObject));
            for (EObject crObject: cr.keySet()) {
                String crClass = EcoreUtil.getURI(crObject.eClass()).toString();
                boolean isExternal = !EcoreUtil.isAncestor(eObject, crObject);
                URI crURI = EcoreUtil.getURI(crObject);
                OVertex crVertex = isExternal ? loadElementOrThrow(crURI) : (OVertex) oElement;
                for (EStructuralFeature.Setting setting: cr.get(crObject)) {
                    EObject localObject = setting.getEObject();
                    EStructuralFeature sf = setting.getEStructuralFeature();
                    int fromIndex = -1;
                    if (sf.isMany()) {
                        fromIndex = ((List<EObject>) localObject.eGet(sf)).indexOf(crObject);
                    }
                    String fromFragment = EcoreUtil.getRelativeURIFragmentPath(eObject, localObject);
                    String fromFeature = sf.getName();
                    String toFragment = EcoreUtil.getRelativeURIFragmentPath(null, crObject);
                    String name = fromFragment + "@" + fromFeature +
                            (fromIndex >= 0 ? "." + fromIndex : "") + "->" + crVertex.getIdentity() + toFragment;
                    OEdge oEdge = oEdgeMap.remove(name);
                    if (oEdge == null) {
                        oEdge = ((OVertex) oElement).addEdge(crVertex, getOrCreateReferenceClass());
                    }
                    oEdge.setProperty("name", name);
                    oEdge.setProperty("fromFragment", fromFragment);
                    oEdge.setProperty("fromFeature", fromFeature);
                    oEdge.setProperty("fromIndex", fromIndex);
                    oEdge.setProperty("toFragment", toFragment);
                    oEdge.setProperty("isExternal", isExternal);
                    oEdge.setProperty("eClass", crClass);
                }
            }
            for (OEdge oEdge: oEdgeMap.values()) {
                oEdge.delete();
            }
        }
    }

    private OVertex createOElement(EObject eObject) {
        EClass eClass = eObject.eClass();
        EPackage ePackage = eClass.getEPackage();
        String oClassName = ePackage.getNsPrefix() + "_" + eClass.getName();
        OVertex oElement = db.newVertex(oClassName);
        return oElement;
    }

    private OVertex createAndPopulateOElement(EObject eObject, boolean top) {
        OVertex oElement = createOElement(eObject);
        populateOElement(eObject, oElement, top);
        return oElement;
    }

    public void delete(URI uri) {
        ORID orid = factory.getORID(uri);
        OVertex oVertex = db.load(orid);
        if (oVertex == null) {
            return;
        }
        checkVersion(uri, oVertex);
        checkInReferences(oVertex);
        db.delete(orid, factory.getVersion(uri));
    }

    public void checkInReferences(OVertex oVertex) {
        for (OEdge oEdge: oVertex.getEdges(ODirection.IN, getOrCreateReferenceClass())) {
            boolean isExternal = oEdge.getProperty("isExternal");
            if (isExternal) {
                throw new IllegalArgumentException("OElement " + oVertex.getIdentity() + " referenced by " + oEdge.getIdentity() + " edge");
            }
        }
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
        OVertex oVertex = loadElement(resource.getURI());
        if (oVertex == null) {
            oVertex = createOElement(eObject);
        }
        else {
            checkVersion(resource.getURI(), oVertex);
        }
        populateOElement(eObject, oVertex, true);
        ORecord oRecord = oVertex.save();
        savedResourcesMap.put(resource, oRecord);
        resource.setURI(factory.createURI(oRecord));
    }

    public void checkVersion(URI uri, OVertex oElement) {
        if (oElement.getVersion() != factory.getVersion(uri)) {
            throw new ConcurrentModificationException("OElement " + factory.getORID(uri) +
                    " has modified.\nDatabase version is " + oElement.getVersion() + ", record version is " +
                    factory.getVersion(uri));
        }
    }

    public void load(Resource resource) {
        OVertex oElement = loadElementOrThrow(resource.getURI());
        EObject eObject = createEObject(oElement);
        resource.getContents().clear();
        resource.getContents().add(eObject);
        resource.setURI(factory.createURI(oElement));
        populateEObject(resource.getResourceSet(), oElement, eObject, true);
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

    private void populateEObject(ResourceSet rs, OElement oElement, EObject eObject, boolean top) {
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
                                populateEObject(rs, o, e, false);
                            });
                        }
                    }
                    else {
                        if (((EReference) sf).isContainment()) {
                            EObject contained = createEObject((OElement) value);
                            eObject.eSet(sf, contained);
                            populateEObject(rs, (OVertex) value, contained, false);
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
        if (top && oElement instanceof OVertex) {
            List<OEdge> oEdges = new ArrayList<>();
            for (OEdge oEdge: ((OVertex) oElement).getEdges(ODirection.OUT, getOrCreateReferenceClass())) {
                oEdges.add(oEdge);
            }
            oEdges.sort(Comparator.comparingInt(o -> ((int) o.getProperty("fromIndex"))));
            for (OEdge oEdge: oEdges) {
                String toFragment = oEdge.getProperty("toFragment");
                boolean isExternal = oEdge.getProperty("isExternal");
                EObject crObject = null;
                if (isExternal) {
                    String eClassURI = oEdge.getProperty("eClass");
                    EClass crClass = (EClass) rs.getEObject(URI.createURI(eClassURI), false);
                    crObject = EcoreUtil.create(crClass);
                    ORID orid = oEdge.getTo().getIdentity();
                    URI crURI = factory.createURI(orid);
                    crURI = crURI.trimFragment().appendFragment("//" + toFragment);
                    ((InternalEObject) crObject).eSetProxyURI(crURI);
                }
                else {
                    crObject = EcoreUtil.getEObject(eObject, toFragment);
                    if (crObject == null) {
                        throw new RuntimeException("Can not resolve local toFragment " + toFragment);
                    }
                }
                EObject localObject = eObject;
                String fromFragment = oEdge.getProperty("fromFragment");
                if (fromFragment != null && !fromFragment.isEmpty()) {
                    localObject = EcoreUtil.getEObject(eObject, fromFragment);
                    if (localObject == null) {
                        throw new RuntimeException("Can not resolve local fromFragment " + fromFragment);
                    }
                }
                String fromFeature = oEdge.getProperty("fromFeature");
                EStructuralFeature sf = localObject.eClass().getEStructuralFeature(fromFeature);
                if (sf.isMany()) {
                    ((EList) localObject.eGet(sf)).add(crObject);
                }
                else {
                    localObject.eSet(sf, crObject);
                }
            }
        }
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
                populateEObject(resourceSet, (OVertex) oElement, eObject, true);
                result.add(resource);
            }
        }
        return result;
    }

    public List<Resource> query(String sql, Object... args) {
        try (OResultSet rs = db.query(sql, args);) {
            return getResourceList(rs);
        }
    }

    public List<Resource> query(String sql, Map args) {
        try (OResultSet rs = db.query(sql, args);) {
            return getResourceList(rs);
        }
    }

    public Set<Resource> getSavedResources() {
        return savedResourcesMap.keySet();
    }
}
