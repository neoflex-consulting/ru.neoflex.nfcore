package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
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
    public static final String EREFERS = "ERefers";
    public static final String ECONTAINS = "EContains";
    public static final String EOBJECT = "EObject";
    public static final String EPROXY = "EProxy";
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

    private OClass getOrCreateERefersEdge() {
        OClass oClass = db.getClass(EREFERS);
        if (oClass == null) {
            oClass = db.createEdgeClass(EREFERS);
        }
        return oClass;
    }

    private OClass getOrCreateEContainsEdge() {
        OClass oClass = db.getClass(ECONTAINS);
        if (oClass == null) {
            oClass = db.createEdgeClass(ECONTAINS);
        }
        return oClass;
    }

    public String getOClassName(EClass eClass) {
        EPackage ePackage = eClass.getEPackage();
        return ePackage.getNsPrefix() + "_" + eClass.getName();
    }

    private String getEdgeName(EReference sf) {
        return getOClassName(sf.getEContainingClass()) + "_" + sf.getName();
    }

    private OClass getOrCreateOClass(EClass eClass) {
        String oClassName = getOClassName(eClass);
        boolean isAbstract = eClass.isAbstract();
        OClass oClass = getOrCreateOClass(oClassName, isAbstract);
        oClass.setCustom("uri", EcoreUtil.getURI(eClass).toString());
        return oClass;
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

    public OClass getOrCreateEObjectClass() {
        OClass oEcoreEObjectClass = db.getClass(EOBJECT);
        if (oEcoreEObjectClass == null) {
            oEcoreEObjectClass = db.createVertexClass(EOBJECT);
            oEcoreEObjectClass.setAbstract(true);
        }
        return oEcoreEObjectClass;
    }

    public OClass getOrCreateEProxyClass() {
        OClass oEProxyClass = db.getClass(EPROXY);
        if (oEProxyClass == null) {
            oEProxyClass = db.createClass(EPROXY);
            ensureSuperClass(oEProxyClass, getOrCreateEObjectClass());
            oEProxyClass.createProperty("eClass", OType.STRING);
            oEProxyClass.createProperty("uri", OType.STRING);

        }
        return oEProxyClass;
    }

    public void createSchema() {
        ((ODatabaseDocumentInternal) db).setUseLightweightEdges(true);
        OClass oEcoreEObjectClass = getOrCreateEObjectClass();
        getOrCreateEProxyClass();
        getOrCreateEContainsEdge();
        getOrCreateERefersEdge();
        for (EClass eClass: factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            if (eClass.getESuperTypes().size() == 0) {
                ensureSuperClass(oClass, oEcoreEObjectClass);
            }
            for (EClass eSuperClass: eClass.getESuperTypes()) {
                OClass oSuperClass = getOrCreateOClass(eSuperClass);
                ensureSuperClass(oClass, oSuperClass);
            }
            EAttribute id = null;
            for (EAttribute sf: eClass.getEAttributes()) {
                if (!sf.isDerived() && !sf.isTransient()) {
                    OProperty oProperty = oClass.getProperty(sf.getName());
                    if (oProperty == null) {
                        createProperty(oClass, sf);
                    }
                    if (sf.isID()) {
                        id = sf;
                    }
                }
            }
            if (id != null) {
                String name = oClass.getName() + "_" + id.getName() + "_pk";
                if (oClass.getClassIndex(name) == null) {
                    oClass.createIndex(name, OClass.INDEX_TYPE.UNIQUE, id.getName());
                }
            }
            EStructuralFeature qNameFeature = factory.getQNameFeature(eClass);
            if (qNameFeature != null && qNameFeature.getEContainingClass().equals(eClass) && qNameFeature != id) {
                String name = oClass.getName() + "_" + qNameFeature.getName() + "_ak";
                if (oClass.getClassIndex(name) == null) {
                    oClass.createIndex(name, OClass.INDEX_TYPE.UNIQUE, qNameFeature.getName());
                }
            }
            for (EReference sf: eClass.getEReferences()) {
                if (!sf.isDerived() && !sf.isTransient() && !sf.isContainer()) {
                    String edgeName = getEdgeName(sf);
                    if (db.getClass(edgeName) == null) {
                        OClass edgeClass = db.createClass(edgeName, sf.isContainment() ? ECONTAINS : EREFERS);
                        edgeClass.setCustom("feature", sf.getName());
                    }
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
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, ECONTAINS)) {
            deleteRecursive(oEdge.getTo());
        }
    }
    private void deleteRecursive(OVertex oElement) {
        clearContents(oElement);
        oElement.delete();
    }

    private void populateOElement(EObject eObject, OVertex oElement) {
        populateOElementContainment(eObject, oElement);
        populateOElementCross(eObject, oElement);
    }

    private void populateOElementContainment(EObject eObject, OVertex oElement) {
        Set<OVertex> toDelete = new HashSet<>();
        for (OVertex oVertex: oElement.getVertices(ODirection.OUT, ECONTAINS)) {
            toDelete.add(oVertex);
        }
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf: eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference && ((EReference) sf).isContainment()) {
                    List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                    for (EObject cObject: eObjects) {
                        OVertex cVertex = loadElement(EcoreUtil.getURI(cObject));
                        if (cVertex == null) {
                            cVertex = createOElement(cObject);
                        }
                        else {
                            toDelete.remove(cVertex);
                            for (OEdge oEdge: cVertex.getEdges(ODirection.IN, ECONTAINS)) {
                                oEdge.delete();
                            }
                        }
                        populateOElementContainment(cObject, cVertex);
                        oElement.addEdge(cVertex, getEdgeName((EReference) sf));
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
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, EREFERS)) {
            if (oEdge.getTo().getSchemaType().get().isSubClassOf(EPROXY)) {
                oEdge.getTo().delete();
            }
            oEdge.delete();
        }
        EClass eClass = eObject.eClass();
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
                        for (EObject crObject: eObjects) {
                            URI crURI = EcoreUtil.getURI(crObject);
                            ORID orid = factory.getORID(crURI);
                            OVertex crVertex = orid != null ? db.load(orid) : createProxyOElement(crObject.eClass(), crURI);
                            oElement.addEdge(crVertex, getEdgeName((EReference) sf));
                        }
                    }
                }
            }
        }
    }

    private OVertex createProxyOElement(EClass eClass, URI uri) {
        OVertex oElement = db.newVertex(EPROXY);
        oElement.setProperty("eClass", EcoreUtil.getURI(eClass).toString());
        oElement.setProperty("uri", uri);
        return oElement;
    }

    private OVertex createOElement(EObject eObject) {
        String oClassName = getOClassName(eObject.eClass());
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
        List<Resource> dependent = getDependentResources(orid);
        if (dependent.size() > 0) {
            String ids = dependent.stream().map(resource -> factory.getORID(resource.getURI()).toString()).collect(Collectors.joining(", "));
            throw new IllegalArgumentException(String.format("Can not delete element %s with references from [%s]",
                    oVertex.getIdentity(), ids));
        }
        deleteRecursive(oVertex);
    }

    public void save(Resource resource) {
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
        EObject eObject = createEObject(resource.getResourceSet(), oElement);
        resource.getContents().clear();
        resource.getContents().add(eObject);
        resource.setURI(factory.createURI(oElement));
        populateEObject(resource.getResourceSet(), oElement, eObject);
    }

    public EObject createEObject(ResourceSet rs, OElement oElement) {
        OClass oClass = oElement.getSchemaType().get();
        if (oClass.isSubClassOf(EPROXY)) {
            String eClassURI = oElement.getProperty("eClass");
            EClass eClass = (EClass) rs.getEObject(URI.createURI(eClassURI), false);
            EObject eObject = EcoreUtil.create(eClass);
            String uri = oElement.getProperty("uri");
            ((InternalEObject) eObject).eSetProxyURI(URI.createURI(uri));
            return eObject;
        }
        else {
            String eClassURI = oClass.getCustom("uri");
            EClass eClass = (EClass) rs.getEObject(URI.createURI(eClassURI), false);
            EObject eObject = EcoreUtil.create(eClass);
            return eObject;
        }
    }

    private void populateEObject(ResourceSet rs, OVertex oElement, EObject eObject) {
        populateEObjectContains(rs, oElement, eObject);
        populateEObjectRefers(rs, oElement, eObject);
    }

    private void populateEObjectRefers(ResourceSet rs, OVertex oElement, EObject eObject) {
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, ECONTAINS)) {
            EReference sf = getEReference(eObject, oEdge);
            if (sf == null || !sf.isContainment()) {
                continue;
            }
            OVertex crVertex = oEdge.getTo();
            EObject crObject = ((OrientDBResource) eObject.eResource()).getEObjectByID(factory.getId(crVertex.getIdentity()));
            if (crObject != null) {
                populateEObjectRefers(rs, crVertex, crObject);
            }
        }
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, EREFERS)) {
            EReference sf = getEReference(eObject, oEdge);
            if (sf == null || sf.isContainment()) {
                continue;
            }
            OVertex crVertex = oEdge.getTo();
            EObject crObject = createEObject(rs, crVertex);
            if (!crObject.eIsProxy()) {
                URI crURI = factory.createURI(crVertex);
                ((InternalEObject) crObject).eSetProxyURI(crURI);
            }
            if (sf.isMany()) {
                ((EList) eObject.eGet(sf)).add(crObject);
            }
            else {
                eObject.eSet(sf, crObject);
            }
        }
    }

    private void populateEObjectContains(ResourceSet rs, OVertex oElement, EObject eObject) {
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
        for (OEdge oEdge: oElement.getEdges(ODirection.OUT, ECONTAINS)) {
            EReference sf = getEReference(eObject, oEdge);
            if (sf == null || !sf.isContainment()) {
                continue;
            }
           OVertex crVertex = oEdge.getTo();
            EObject crObject = createEObject(rs, crVertex);
            if (!crObject.eIsProxy() && sf.isResolveProxies()) {
                URI crURI = factory.createURI(crVertex);
                ((InternalEObject) crObject).eSetProxyURI(crURI);
            }
            if (sf.isMany()) {
                ((EList) eObject.eGet(sf)).add(crObject);
            }
            else {
                eObject.eSet(sf, crObject);
            }
            if (!sf.isResolveProxies()) {
                populateEObjectContains(rs, crVertex, crObject);
            }
        }
    }

    private EReference getEReference(EObject eObject, OEdge oEdge) {
        if (!oEdge.getSchemaType().isPresent()) {
            return null;
        }
        OClass oClass = oEdge.getSchemaType().get();
        String feature = oClass.getCustom("feature");
        if (feature == null) {
            return null;
        }
        EStructuralFeature sf = eObject.eClass().getEStructuralFeature(feature);
        if (sf == null || !(sf instanceof EReference)) {
            return null;
        }
        return (EReference) sf;
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

    private void getResourceList(OResultSet oResultSet, Consumer<Supplier<Resource>> consumer) {
        ResourceSet rs = createResourceSet();
        while (oResultSet.hasNext()) {
            OResult oResult = oResultSet.next();
            Optional<OElement> oElementOpt = oResult.getElement();
            if (oElementOpt.isPresent()) {
                OElement oElement = oElementOpt.get();
                consumer.accept(() -> {
                    EObject eObject = createEObject(rs, oElement);
                    Resource resource = rs.createResource(factory.createURI(oElement));
                    resource.getContents().add(eObject);
                    populateEObject(rs, (OVertex) oElement, eObject);
                    EcoreUtil.resolveAll(resource);
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

    public void getDependentResources(ORID orid, Consumer<Supplier<Resource>> consumer) {
        query("select distinct * from (\n" +
                "  traverse in('EContains') from (\n" +
                "    select expand(in('ERefers')) from (\n" +
                "      traverse out('EContains') from ?\n" +
                "    )\n" +
                "  )\n" +
                ")\n" +
                "where in('EContains').size() == 0 and @rid != ?", consumer, orid, orid);
    }

    public List<Resource> getDependentResources(Resource resource) {
        return getDependentResources(resource.getURI());
    }

    public List<Resource> getDependentResources(URI uri) {
        return getDependentResources(factory.getORID(uri));
    }

    public List<Resource> getDependentResources(ORID orid) {
        List<Resource> resources = new ArrayList<>();
        getDependentResources(orid, resourceSupplier -> {
            resources.add(resourceSupplier.get());
        });
        return resources;
    }
}
