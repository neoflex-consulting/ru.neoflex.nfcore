package ru.neoflex.meta.emforientdb;

import com.orientechnologies.lucene.OLuceneIndexFactory;
import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.id.ORID;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OProperty;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.*;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import org.apache.commons.lang.StringUtils;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.*;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Closeable;
import java.sql.Timestamp;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static org.eclipse.emf.ecore.util.EcoreUtil.isAncestor;

public class Session implements Closeable {
    private static final Logger logger = LoggerFactory.getLogger(Session.class);
    public static final String EREFERENCE = "EReference";
    public static final String EOBJECT = "EObject";
    public static final String EPROXY = "EProxy";
    public static final String ORIENTDB_SOURCE = "http://orientdb.com/meta";
    public static final String ANN_O_CLASS_NAME = "oClassName";
    final Map<Resource, ORecord> savedResourcesMap = new HashMap<>();
    private final SessionFactory factory;
    private final ODatabaseDocument db;
    private final ODatabaseDocumentInternal oldDB;

    Session(SessionFactory factory) {
        this.factory = factory;
        this.oldDB = ODatabaseRecordThreadLocal.instance().getIfDefined();
        this.db = factory.createDatabaseDocument();
    }

    @Override
    public void close() {
        db.close();
        if (oldDB != null) {
            ODatabaseRecordThreadLocal.instance().set(oldDB);
        }
    }

    public ODatabaseDocument getDatabaseDocument() {
        return db;
    }

    public SessionFactory getFactory() {
        return factory;
    }

    private OClass getOrCreateEReferenceEdge() {
        OClass oClass = db.getClass(EREFERENCE);
        if (oClass == null) {
            oClass = db.createEdgeClass(EREFERENCE);
            oClass.createProperty("fromFragment", OType.STRING);
            oClass.createProperty("feature", OType.STRING);
            oClass.createProperty("toFragment", OType.STRING);
            oClass.createProperty("index", OType.INTEGER);
            oClass.createProperty("eClass", OType.STRING);
        }
        return oClass;
    }

    public String getOClassName(EClass eClass) {
        String oClassName = getAnnotation(eClass, ANN_O_CLASS_NAME, null);
        if (oClassName != null) {
            return oClassName;
        }
        EPackage ePackage = eClass.getEPackage();
        return ePackage.getNsPrefix() + "_" + eClass.getName();
    }

    private OClass getOrCreateOClass(EClass eClass) {
        String oClassName = getOClassName(eClass);
        OClass oClass = db.getClass(oClassName);
        if (oClass == null) {
            boolean isAbstract = eClass.isAbstract() || isAbstract(eClass);
            oClass = db.createClass(oClassName);
            if (isAbstract) {
                oClass.setAbstract(true);
            }
            if (eClass.getESuperTypes().size() == 0) {
                ensureSuperClass(oClass, getOrCreateEObjectClass());
            }
            for (EClass eSuperClass : eClass.getESuperTypes()) {
                OClass oSuperClass = getOrCreateOClass(eSuperClass);
                ensureSuperClass(oClass, oSuperClass);
            }
        }
        factory.oClassToUriMap.put(oClass.getName(), EcoreUtil.getURI(eClass));
        return oClass;
    }

    private OType convertEDataType(EDataType eDataType) {
        OType oType = OType.getTypeByClass(eDataType.getInstanceClass());
        return oType != null ? oType : OType.STRING;
    }

    private void createProperty(OClass oClass, EStructuralFeature sf) {
        if (sf instanceof EReference) {
            EReference eReference = (EReference) sf;
            if (!eReference.isContainer() && eReference.isContainment()) {
                OClass refOClass = getOrCreateOClass(eReference.getEReferenceType());
                OType oType = eReference.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED;
                oClass.createProperty(sf.getName(), oType, refOClass);
            }
        } else {
            EAttribute eAttribute = (EAttribute) sf;
            OType oType = convertEDataType(eAttribute.getEAttributeType());
            if (eAttribute.isMany()) {
                oClass.createProperty(eAttribute.getName(), OType.EMBEDDEDLIST, oType);
            } else {
                oClass.createProperty(eAttribute.getName(), oType);
            }
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
            oEProxyClass.createProperty("uri", OType.STRING);

        }
        return oEProxyClass;
    }

    private String getAnnotation(EModelElement element, String key, String def) {
        EAnnotation eAnnotation = element.getEAnnotation(ORIENTDB_SOURCE);
        if (eAnnotation != null && eAnnotation.getDetails().containsKey(key)) {
            return eAnnotation.getDetails().get(key);
        }
        return def;
    }

    private boolean isAnnotated(EModelElement element, String key, String def, String value) {
        return getAnnotation(element, key, def).equalsIgnoreCase(value);
    }

    private boolean isAbstract(EClass eClass) {
        if (isAnnotated(eClass, "oAbstract", "false", "true")) {
            return true;
        }
        for (EClass eSuperType : eClass.getEAllSuperTypes()) {
            if (isAnnotated(eSuperType, "oAbstract", "false", "true")) {
                return true;
            }
        }
        return false;
    }

    public void createSchema() {
        ((ODatabaseDocumentInternal) db).setUseLightweightEdges(false);
        getOrCreateEProxyClass();
        getOrCreateEReferenceEdge();
        for (EClass eClass : factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            OProperty idProperty = oClass.getProperty("_id");
            if (idProperty == null) {
                oClass.createProperty("_id", OType.STRING);
            }
            EAttribute id = null;
            for (EStructuralFeature sf : eClass.getEStructuralFeatures()) {
                if (!sf.isDerived() && !sf.isTransient()) {
                    if (sf instanceof EReference && !((EReference) sf).isContainment()) {
                        continue;
                    }
                    OProperty oProperty = oClass.getProperty(sf.getName());
                    if (oProperty == null) {
                        createProperty(oClass, sf);
                    }
                    if (sf instanceof EAttribute) {
                        EAttribute eAttribute = (EAttribute) sf;
                        if (eAttribute.isID()) {
                            id = eAttribute;
                        }
                        createIndexIfRequired(oClass, sf);
                    }
                }
            }
            if (id != null) {
                String name = oClass.getName() + "_" + id.getName() + "_pk";
                if (oClass.getClassIndex(name) == null) {
                    logger.info("Creating unique index " + name);
                    oClass.createIndex(name, OClass.INDEX_TYPE.UNIQUE, id.getName());
                }
            }
            EStructuralFeature qNameFeature = factory.getQNameFeature(eClass);
            if (qNameFeature != null && qNameFeature.getEContainingClass().equals(eClass) && qNameFeature != id) {
                String name = oClass.getName() + "_" + qNameFeature.getName() + "_ak";
                if (oClass.getClassIndex(name) == null) {
                    logger.info("Creating unique index " + name);
                    oClass.createIndex(name, OClass.INDEX_TYPE.UNIQUE, qNameFeature.getName());
                }
            }
        }
    }

    public void createIndexIfRequired(OClass oClass, EStructuralFeature sf) {
        String indexType = getAnnotation(sf, "indexType", null);
        if (indexType != null) {
            String name = oClass.getName() + "_" + sf.getName() + "_ie";
            if (oClass.getClassIndex(name) == null) {
                if (indexType.startsWith("SPATIAL")) {
                    ODocument meta = new ODocument().field("analyzer", StandardAnalyzer.class.getName());
                    oClass.createIndex(name, indexType, null, meta, OLuceneIndexFactory.LUCENE_ALGORITHM, new String[]{sf.getName()});
                }
                else if (indexType.startsWith("FULLTEXT")) {
                    ODocument meta = new ODocument().field("analyzer", StandardAnalyzer.class.getName());
                    oClass.createIndex(name, indexType, null, meta, OLuceneIndexFactory.LUCENE_ALGORITHM, new String[]{sf.getName()});
                }
                else {
                    oClass.createIndex(name, indexType, sf.getName());
                }
            }
        }
    }

    private OVertex loadElement(EObject eObject) {
        EClass eClass = eObject.eClass();
        EAttribute eIDAttribute = eClass.getEIDAttribute();
        if (eIDAttribute != null) {
            return (OVertex) queryElement(
                    "select from " + getOClassName(eClass) +
                            " where " + eIDAttribute.getName() + "=?",
                    objectToOObject(eIDAttribute.getEAttributeType(), eObject.eGet(eIDAttribute)));
        }
        URI uri = EcoreUtil.getURI(eObject);
        return loadElement(uri);
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
            return new Timestamp(((Date) value).getTime());
        }
        return value;
    }

    private void populateOElement(EObject eObject, OVertex oElement) {
        populateOElementContainment(eObject, oElement);
        populateOElementCross(eObject, oElement);
    }

    private void populateOElementContainment(EObject eObject, OElement oElement) {
        oElement.setProperty("_id", EcoreUtil.getURI(eObject).fragment());
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf : eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient()) {
                if (eObject.eIsSet(sf)) {
                    Object value = eObject.eGet(sf);
                    if (sf instanceof EReference && ((EReference) sf).isContainment()) {
                        List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                        List<OElement> embedded = new ArrayList<>();
                        for (EObject cObject : eObjects) {
                            OElement cElement = createOElement(cObject);
                            embedded.add(cElement);
                            populateOElementContainment(cObject, cElement);
                        }
                        oElement.setProperty(sf.getName(), sf.isMany() ? embedded : embedded.get(0), sf.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED);
                    } else if (sf instanceof EAttribute) {
                        if (sf.isMany()) {
                            List eList = (List) value;
                            Stream<Object> oStream = eList.stream().
                                    map(e -> objectToOObject(((EAttribute) sf).getEAttributeType(), e));
                            List<Object> oList = oStream.collect(Collectors.toList());
                            oElement.setProperty(sf.getName(), oList);
                        } else {
                            oElement.setProperty(sf.getName(), objectToOObject(((EAttribute) sf).getEAttributeType(), value));
                        }
                    }
                } else {
                    oElement.removeProperty(sf.getName());
                }
            } else if (sf instanceof EAttribute) {
                oElement.removeProperty(sf.getName());
            }
        }
    }

    private void populateOElementCross(EObject eObject, OVertex oElement) {
        for (OEdge oEdge : oElement.getEdges(ODirection.OUT, EREFERENCE)) {
            if (oEdge.getTo().getSchemaType().get().isSubClassOf(EPROXY)) {
                oEdge.getTo().delete();
            }
            oEdge.delete();
        }
        new EcoreUtil.CrossReferencer(Collections.singleton(eObject)){
            protected void add(InternalEObject internalEObject, EReference eReference, EObject crossReferencedEObject) {
                if (!eReference.isDerived() && !eReference.isTransient()) {
                    String fromFragment = EcoreUtil.getURI(internalEObject).fragment();
                    String feature = eReference.getName();
                    String toFragment = EcoreUtil.getURI(crossReferencedEObject).fragment();
                    int index = !eReference.isMany() ? -1 : ((EList) internalEObject.eGet(eReference)).indexOf(crossReferencedEObject);
                    OVertex crVertex = null;
                    if (!isAncestor(emfObjects, crossReferencedEObject)) { // external reference
                        URI crURI = EcoreUtil.getURI(crossReferencedEObject);
                        ORID orid = factory.getORID(crURI);
                        crVertex = orid != null ?
                                db.load(orid) : createProxyOElement(crURI);
                    }
                    else { // internal reference
                        crVertex = oElement;
                    }
                    OEdge oEdge = oElement.addEdge(crVertex, EREFERENCE);
                    oEdge.setProperty("fromFragment", fromFragment);
                    oEdge.setProperty("feature", feature);
                    oEdge.setProperty("toFragment", toFragment);
                    oEdge.setProperty("index", index);
                    oEdge.setProperty("eClass", EcoreUtil.getURI(crossReferencedEObject.eClass()).toString());
                    oEdge.save();
                }
            }
            {
                crossReference();
            }
        };
    }

    private OVertex createProxyOElement(URI uri) {
        OVertex oElement = db.newVertex(EPROXY);
        oElement.setProperty("uri", uri);
        oElement.save();
        return oElement;
    }

    private OElement createOElement(EObject eObject) {
        EClass eClass = eObject.eClass();
        String oClassName = getOClassName(eClass);
        return db.newElement(oClassName);
    }

    private OVertex createOVertex(EObject eObject) {
        EClass eClass = eObject.eClass();
        String oClassName = getOClassName(eClass);
        return db.newVertex(oClassName);
    }

    public void delete(URI uri) {
        ORID orid = factory.getORID(uri);
        OVertex oVertex = db.load(orid);
        if (oVertex == null) {
            return;
        }
        checkVersion(uri, oVertex);
        checkDependencies(oVertex);
        ResourceSet rs = createResourceSet();
        Resource resource = rs.createResource(uri);
        EObject eObject = createEObject(rs, oVertex);
        resource.getContents().add(eObject);
        populateEObject(resource.getResourceSet(), oVertex, eObject);
        getFactory().getEvents().fireBeforeDelete(resource);
        // workaround for bug if self-link
        deleteLinks(oVertex);
        oVertex.delete();
    }

    private void checkDependencies(OVertex oVertex) {
        Set<String> dependent = StreamSupport.stream(oVertex.getEdges(ODirection.IN).spliterator(), false)
                .filter(oEdge -> !oEdge.getFrom().equals(oVertex))
                .map(oEdge -> oEdge.getFrom().getIdentity().toString())
                .collect(Collectors.toSet());
        if (dependent.size() > 0) {
            String ids = dependent.stream().collect(Collectors.joining(", "));
            throw new IllegalArgumentException(String.format("Can not delete element %s with references from [%s]",
                    oVertex.getIdentity(), ids));
        }
    }

    private static void deleteLinks(OVertex delegate) {
        Iterable<OEdge> allEdges = delegate.getEdges(ODirection.BOTH);
        Set<OEdge> items = new HashSet<>();
        for (OEdge edge : allEdges) {
            items.add(edge);
        }
        for (OEdge edge : items) {
            edge.delete();
        }
    }

    public void save(Resource resource) {
        Resource oldResource = null;
        ORecord firstRecord = null;
        for (EObject eObject: resource.getContents()) {
            OVertex oVertex = loadElement(eObject);
            if (oVertex == null) {
                oVertex = createOVertex(eObject);
            } else {
                checkVersion(resource.getURI(), oVertex);
                checkDependencies(resource, oVertex);
                ResourceSet rs = createResourceSet();
                oldResource = rs.createResource(resource.getURI());
                EObject oldObject = createEObject(rs, oVertex);
                oldResource.getContents().add(oldObject);
                populateEObject(rs, oVertex, oldObject);
            }
            if (firstRecord == null) {
                getFactory().getEvents().fireBeforeSave(oldResource, resource);
            }
            populateOElement(eObject, oVertex);
            ORecord oRecord = oVertex.save();
            if (firstRecord == null) {
                firstRecord = oRecord;
            }
        }
        if (firstRecord != null) {
            resource.setURI(factory.createResourceURI(firstRecord));
            getFactory().getEvents().fireAfterSave(oldResource, resource);
            savedResourcesMap.put(resource, firstRecord);
        }
    }

    private void checkDependencies(Resource resource, OVertex oVertex) {
        Set<String> dependent = StreamSupport.stream(oVertex.getEdges(ODirection.IN).spliterator(), false)
                .filter(oEdge -> resource.getEObject(oEdge.getProperty("toFragment")) == null)
                .map(oEdge -> oEdge.getFrom().getIdentity().toString() + "#" + oEdge.getProperty("fromFragment") +
                        "." + oEdge.getProperty("feature") + "->" +
                        oEdge.getTo().getIdentity().toString() + "#" + oEdge.getProperty("toFragment"))
                .collect(Collectors.toSet());
        if (dependent.size() > 0) {
            String ids = dependent.stream().collect(Collectors.joining(", "));
            throw new IllegalArgumentException(String.format("Can not save element %s with broken references [%s]",
                    oVertex.getIdentity(), ids));
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
        resource.setURI(factory.createResourceURI(oElement));
        populateEObject(resource.getResourceSet(), oElement, eObject);
// Не нужно резолвить здесь! Это ведёт к лишним запросам и ломает Export With Dependencies
//        EcoreUtil.resolveAll(resource);
        getFactory().getEvents().fireAfterLoad(resource);
    }

    public EObject createEObject(ResourceSet rs, OElement oElement) {
        OClass oClass = oElement.getSchemaType().get();
        URI eClassURI = factory.oClassToUriMap.get(oClass.getName());
        EClass eClass = (EClass) rs.getEObject(eClassURI, false);
        EObject eObject = EcoreUtil.create(eClass);
        return eObject;
    }

    private void populateEObject(ResourceSet rs, OVertex oElement, EObject eObject) {
        populateEObjectContains(rs, oElement, eObject);
        populateEObjectRefers(rs, oElement, eObject);
    }

    private void populateEObjectRefers(ResourceSet rs, OVertex oElement, EObject eObject) {
        List<OEdge> oEdges = new ArrayList<>();
        oElement.getEdges(ODirection.OUT, EREFERENCE).forEach(oEdge -> oEdges.add(oEdge));
        Collections.sort(oEdges, Comparator.comparing(oEdge -> oEdge.getProperty("index")));
        for (OEdge oEdge : oEdges) {
            String fromFragment = oEdge.getProperty("fromFragment");
            String feature = oEdge.getProperty("feature");
            EObject internalEObject = StringUtils.isEmpty(fromFragment) ? eObject : eObject.eResource().getEObject(fromFragment);
            if (internalEObject == null) {
                continue;
            }
            EReference sf = (EReference) internalEObject.eClass().getEStructuralFeature(feature);
            if (sf == null) {
                continue;
            }
            OVertex oEdgeTo = oEdge.getTo();
            String eClassURI = oEdge.getProperty("eClass");
            EClass eClass = (EClass) rs.getEObject(URI.createURI(eClassURI), false);
            String toFragment = oEdge.getProperty("toFragment");
            EObject crossReferencedEObject = null;
            if (oEdgeTo.equals(oElement)) {
                crossReferencedEObject = StringUtils.isEmpty(toFragment) ?
                        eObject : eObject.eResource().getEObject(toFragment);
            }
            else {
                crossReferencedEObject = EcoreUtil.create(eClass);
                URI crURI = null;
                if (oEdgeTo.getSchemaType().get().isSubClassOf(EPROXY)) {
                    String uri = oEdgeTo.getProperty("uri");
                    crURI = URI.createURI(uri);
                }
                else {
                    crURI = factory.createResourceURI(oEdgeTo).appendFragment(
                            StringUtils.isNotEmpty(toFragment) ? toFragment : "/");
                }
                ((InternalEObject) crossReferencedEObject).eSetProxyURI(crURI);
            }
            if (sf.isMany()) {
                ((EList) internalEObject.eGet(sf)).add(crossReferencedEObject);
            } else {
                internalEObject.eSet(sf, crossReferencedEObject);
            }
        }
    }

    private OElement queryElement(String sql, Object... args) {
        OElement oElement = null;
        try (OResultSet oResultSet = db.query(sql, args)) {
            while (oResultSet.hasNext()) {
                OResult oResult = oResultSet.next();
                Optional<OElement> oElementOpt = oResult.getElement();
                if (oElementOpt.isPresent()) {
                    oElement = oElementOpt.get();
                    break;
                }
            }

        }
        return oElement;
    }

    private void populateEObjectContains(ResourceSet rs, OElement oElement, EObject eObject) {
        ((OrientDBResource) eObject.eResource()).setID(eObject, oElement.getProperty("_id"));
        EClass eClass = eObject.eClass();
        Set<String> propertyNames = oElement.getPropertyNames();
        for (EStructuralFeature sf : eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient()) {
                if (!propertyNames.contains(sf.getName())) {
                    if (!(sf instanceof EReference) || !((EReference) sf).isContainer()) {
                        eObject.eUnset(sf);
                    }
                    continue;
                }
                Object value = oElement.getProperty(sf.getName());
                if (sf instanceof EAttribute) {
                    EDataType eDataType = ((EAttribute) sf).getEAttributeType();
                    if (sf.isMany()) {
                        List oObjects = (List) value;
                        Stream<Object> objectStream = oObjects.stream().map(o -> oObjectToObject(eDataType, o));
                        List eObjects = objectStream.collect(Collectors.toList());
                        eObject.eSet(sf, eObjects);
                    } else {
                        eObject.eSet(sf, oObjectToObject(eDataType, value));
                    }
                } else if (sf instanceof EReference) {
                    EReference eReference = (EReference) sf;
                    if (eReference.isContainment()) {
                        if (sf.isMany()) {
                            for (OElement crVertex : (List<OElement>) value) {
                                setContainmentReference(rs, eObject, eReference, crVertex);
                            }
                        } else {
                            setContainmentReference(rs, eObject, eReference, (OElement) value);
                        }
                    }
                }
            }
        }
    }

    private void setContainmentReference(ResourceSet rs, EObject eObject, EReference sf, OElement crVertex) {
        EObject crObject = createEObject(rs, crVertex);
        if (sf.isMany()) {
            ((EList) eObject.eGet(sf)).add(crObject);
        } else {
            eObject.eSet(sf, crObject);
        }
        if (crObject.eIsProxy()) {
            if (!sf.isResolveProxies()) {
                crObject = EcoreUtil.resolve(crObject, rs);
            }
        } else {
            populateEObjectContains(rs, crVertex, crObject);
        }
    }

    public ResourceSet createResourceSet() {
        ResourceSet resourceSet = factory.createResourceSet();
        resourceSet.getURIConverter()
                .getURIHandlers()
                .add(0, new OrientDBHandler(this));
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
                    Resource resource = rs.createResource(factory.createResourceURI(oElement));
                    resource.getContents().add(eObject);
                    populateEObject(rs, (OVertex) oElement, eObject);
                    getFactory().getEvents().fireAfterLoad(resource);
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
        try (OResultSet rs = db.query(sql, args)) {
            getResourceList(rs, consumer);
        }
    }

    public void query(String sql, Consumer<Supplier<Resource>> consumer, Map args) {
        try (OResultSet rs = db.query(sql, args)) {
            getResourceList(rs, consumer);
        }
    }

    public Set<Resource> getSavedResources() {
        return savedResourcesMap.keySet();
    }

    public void getDependentResources(ORID orid, Consumer<Supplier<Resource>> consumer) {
        query("select distinct * from (\n" +
                "    select expand(in('EReference')) from ?\n" +
                ")\n" +
                "where @rid != ?", consumer, orid, orid);
    }

    public void getDependentResources(Resource resource, Consumer<Supplier<Resource>> consumer) {
        getDependentResources(resource.getURI(), consumer);
    }

    public void getDependentResources(URI uri, Consumer<Supplier<Resource>> consumer) {
        getDependentResources(factory.getORID(uri), consumer);
    }

    public List<Resource> getDependentResources(ORID orid) {
        List<Resource> resources = new ArrayList<>();
        getDependentResources(orid, resourceSupplier -> {
            resources.add(resourceSupplier.get());
        });
        return resources;
    }

    public List<Resource> getDependentResources(Resource resource) {
        return getDependentResources(factory.getORID(resource.getURI()));
    }

    public void getAll(Consumer<Supplier<Resource>> consumer) {
        query("select from EObject where in('EContains').size() == 0", consumer);
    }

    public List<Resource> getAll() {
        List<Resource> resources = new ArrayList<>();
        getAll(resourceSupplier -> {
            resources.add(resourceSupplier.get());
        });
        return resources;
    }
}
