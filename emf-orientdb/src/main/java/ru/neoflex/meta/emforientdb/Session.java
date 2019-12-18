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
import java.sql.Timestamp;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Session implements Closeable {
    public static final String EREFERES = "EReferes";
    public static final String ECONTAINS = "EContains";
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

    private OClass getOrCreateEReferencesEdge() {
        OClass oClass = db.getClass(EREFERES);
        if (oClass == null) {
            oClass = db.createEdgeClass(EREFERES);
            oClass.createProperty("name", OType.STRING);
            oClass.createProperty("index", OType.INTEGER);
            oClass.createProperty("isExternal", OType.BOOLEAN);
        }
        return oClass;
    }

    private OClass getOrCreateEContainsEdge() {
        OClass oClass = db.getClass(ECONTAINS);
        if (oClass == null) {
            oClass = db.createEdgeClass(ECONTAINS);
            oClass.createProperty("name", OType.STRING);
            oClass.createProperty("index", OType.INTEGER);
        }
        return oClass;
    }

    public String getOClassName(EClass eClass) {
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

    private void createProperty(OClass oClass, EAttribute sf) {
        OType oType = convertEDataType(sf.getEAttributeType());
        if (sf.isMany()) {
            oClass.createProperty(sf.getName(), OType.EMBEDDEDLIST, oType);
        }
        else {
            oClass.createProperty(sf.getName(), oType);
        }
    }

    public void ensureSuperClass(OClass oClass, OClass oSuperClass) {
        if (!oClass.getAllSuperClasses().contains(oSuperClass)) {
            oClass.addSuperClass(oSuperClass);
        }
    }
    public void createSchema() {
        OClass oEcoreEObjectClass = db.getClass(EOBJECT);
        if (oEcoreEObjectClass == null) {
            oEcoreEObjectClass = db.createVertexClass(EOBJECT);
            oEcoreEObjectClass.setAbstract(true);
        }
        getOrCreateEContainsEdge();
        getOrCreateEReferencesEdge();
        for (EClass eClass: factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            if (eClass.getESuperTypes().size() == 0) {
                ensureSuperClass(oClass, oEcoreEObjectClass);
            }
            for (EClass eSuperClass: eClass.getESuperTypes()) {
                OClass oSuperClass = getOrCreateOClass(eSuperClass);
                ensureSuperClass(oClass, oSuperClass);
            }
            for (EAttribute sf: eClass.getEAllAttributes()) {
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
        if (eDataType.getInstanceClass().isAssignableFrom(Timestamp.class)) {
            return new Timestamp(((Date)value).getTime());
        }
        return value;
    }

    private void clearContents(OVertex oElement) {
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, getOrCreateEContainsEdge())) {
            deleteRecursive(oEdge.getTo());
        }
    }
    private void deleteRecursive(OVertex oElement) {
        for (OEdge oEdge: oElement.getEdges(ODirection.IN, getOrCreateEReferencesEdge())) {
            if (oEdge.getProperty("isExternal")) {
                throw new IllegalArgumentException(String.format("Can not delete element %s with reference from %s",
                        oElement.getIdentity(), oEdge.getFrom().getIdentity()));
            }
        }
        clearContents(oElement);
        oElement.delete();
    }

    private void populateOElement(EObject eObject, OVertex oElement) {
        populateOElementContainment(eObject, oElement);
        populateOElementCross(eObject, oElement);
    }

    private void populateOElementContainment(EObject eObject, OVertex oElement) {
        Set<OVertex> toDelete = new HashSet<>();
        for (OVertex oVertex: oElement.getVertices(ODirection.OUT, getOrCreateEContainsEdge())) {
            toDelete.add(oVertex);
        }
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference && ((EReference) sf).isContainment()) {
                    List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                    for (int index = 0; index < eObjects.size(); ++index) {
                        EObject cObject = eObjects.get(index);
                        OVertex cVertex = loadElement(EcoreUtil.getURI(cObject));
                        if (cVertex == null) {
                            cVertex = createOElement(cObject);
                        }
                        else {
                            toDelete.remove(cVertex);
                            for (OEdge oEdge: cVertex.getEdges(ODirection.IN, getOrCreateEContainsEdge())) {
                                oEdge.delete();
                            }
                        }
                        populateOElementContainment(cObject, cVertex);
                        OEdge oEdge = oElement.addEdge(cVertex, getOrCreateEContainsEdge());
                        oEdge.setProperty("name", sf.getName());
                        oEdge.setProperty("index", index);
                        cVertex.save();
                        ((OrientDBResource) cObject.eResource()).setID(cObject, factory.getId(cVertex.getIdentity()));
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
            else if (sf instanceof EAttribute) {
                oElement.removeProperty(sf.getName());
            }
        }
        for (OVertex oVertex: toDelete) {
            deleteRecursive(oVertex);
        }
    }

    private void populateOElementCross(EObject eObject, OVertex oElement) {
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, getOrCreateEReferencesEdge())) {
            oEdge.delete();
        }
        EClass eClass = eObject.eClass();
        EObject rootContainer = EcoreUtil.getRootContainer(eObject);
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference && !((EReference) sf).isContainer()) {
                    List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                    if (((EReference) sf).isContainment()) {
                        for (EObject cObject: eObjects) {
                            URI uri = EcoreUtil.getURI(cObject);
                            ORID orid = factory.getORID(uri);
                            OVertex cVertex = db.load(orid);
                            populateOElementCross(cObject, cVertex);
                        }
                    }
                    else {
                        for (int index = 0; index < eObjects.size(); ++index) {
                            EObject crObject = eObjects.get(index);
                            boolean isExternal = !EcoreUtil.isAncestor(rootContainer, crObject);
                            URI crURI = EcoreUtil.getURI(crObject);
                            ORID orid = factory.getORID(crURI);
                            OVertex crVertex = db.load(orid);
                            OEdge oEdge = oElement.addEdge(crVertex, getOrCreateEReferencesEdge());
                            oEdge.setProperty("isExternal", isExternal);
                            oEdge.setProperty("name", sf.getName());
                            oEdge.setProperty("index", index);
                        }
                    }
                }
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

    public void delete(URI uri) {
        ORID orid = factory.getORID(uri);
        OVertex oVertex = db.load(orid);
        if (oVertex == null) {
            return;
        }
        checkVersion(uri, oVertex);
        deleteRecursive(oVertex);
    }

    public void save(Resource resource) {
        if (resource.getContents().isEmpty()) {
            delete(resource.getURI());
            return;
        }
        for (EObject eObject: resource.getContents()) {
            OVertex oVertex = loadElement(resource.getURI());
            if (oVertex == null) {
                oVertex = createOElement(eObject);
            }
            else {
                checkVersion(resource.getURI(), oVertex);
            }
            populateOElement(eObject, oVertex);
            ORecord oRecord = oVertex.save();
            savedResourcesMap.put(resource, oRecord);
            resource.setURI(factory.createURI(oRecord));
        }
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
        populateEObject(resource.getResourceSet(), oElement, eObject);
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

    private void populateEObject(ResourceSet rs, OVertex oElement, EObject eObject) {
        ((OrientDBResource) eObject.eResource()).setID(eObject, factory.getId(oElement.getIdentity()));
        EClass eClass = eObject.eClass();
        Set<String> propertyNames = oElement.getPropertyNames();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (sf instanceof EAttribute && !sf.isDerived() && !sf.isTransient()) {
                if (!propertyNames.contains(sf.getName())) {
                    eObject.eUnset(sf);
                }
                else {
                    Object value = oElement.getProperty(sf.getName());
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
        List<OEdge> oEdges = new ArrayList<>();
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT)) {
            oEdges.add(oEdge);
        }
        oEdges.sort(Comparator.comparingInt(o -> ((int) o.getProperty("index"))));
        for (OEdge oEdge: oEdges) {
            String name = oEdge.getProperty("name");
            EReference sf = (EReference) eClass.getEStructuralFeature(name);
            OVertex crVertex = oEdge.getTo();
            EObject crObject = createEObject(crVertex);
            if (!sf.isContainment() || sf.isResolveProxies()) {
                URI crURI = factory.createURI(crVertex);
                ((InternalEObject) crObject).eSetProxyURI(crURI);
            }
            if (sf.isMany()) {
                ((EList) eObject.eGet(sf)).add(crObject);
            }
            else {
                eObject.eSet(sf, crObject);
            }
            if (sf.isContainment() && !sf.isResolveProxies()) {
                populateEObject(rs, crVertex, crObject);
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

    private void getResourceList(OResultSet rs, Consumer<Supplier<Resource>> consumer) {
        ResourceSet resourceSet = createResourceSet();
        while (rs.hasNext()) {
            OResult oResult = rs.next();
            Optional<OElement> oElementOpt = oResult.getElement();
            if (oElementOpt.isPresent()) {
                OElement oElement = oElementOpt.get();
                consumer.accept(() -> {
                    EObject eObject = createEObject(oElement);
                    Resource resource = resourceSet.createResource(factory.createURI(oElement));
                    resource.getContents().add(eObject);
                    populateEObject(resourceSet, (OVertex) oElement, eObject);
                    return resource;
                });
            }
        }
    }

    public List<Resource> query(String sql, Object... args) {
        List<Resource> result = new ArrayList<>();
        query(sql, resourceSupplier -> {
            result.add(resourceSupplier.get());
        }, args);
        return result;
    }

    public List<Resource> query(String sql, Map args) {
        List<Resource> result = new ArrayList<>();
        query(sql, resourceSupplier -> {
            result.add(resourceSupplier.get());
        }, args);
        return result;
    }

    public void query(String sql, Consumer<Supplier<Resource>> consumer, Object... args) {
        try (OResultSet rs = db.query(sql, args);) {
            getResourceList(rs, consumer);
        }
    }

    public void query(String sql, Consumer<Supplier<Resource>> consumer, Map args) {
        try (OResultSet rs = db.query(sql, args);) {
            getResourceList(rs, consumer);
        }
    }

    public Set<Resource> getSavedResources() {
        return savedResourcesMap.keySet();
    }
}
