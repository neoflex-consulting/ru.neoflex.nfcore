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
import org.apache.lucene.analysis.standard.StandardAnalyzer;
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
    public static final String ORIENTDB_SOURCE = "http://orientdb.com/meta";
    public static final String ANN_O_CLASS_NAME = "oClassName";
    final Map<Resource, ORecord> savedResourcesMap = new HashMap<>();
    private final SessionFactory factory;
    private final ODatabaseDocument db;
    private final ODatabaseDocumentInternal currentDB;

    Session(SessionFactory factory, ODatabaseDocument db, ODatabaseDocumentInternal currentDB) {
        this.factory = factory;
        this.db = db;
        this.currentDB = currentDB;
    }

    @Override
    public void close() {
        db.close();
        if (currentDB != null) {
            ODatabaseRecordThreadLocal.instance().set(currentDB);
        }
    }

    public ODatabaseDocument getDatabaseDocument() {
        return db;
    }

    public SessionFactory getFactory() {
        return factory;
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
        String oClassName = getAnnotation(eClass, ANN_O_CLASS_NAME, null);
        if (oClassName != null) {
            return oClassName;
        }
        EPackage ePackage = eClass.getEPackage();
        return ePackage.getNsPrefix() + "_" + eClass.getName();
    }

    private String getEdgeName(EReference sf) {
        return getOClassName(sf.getEContainingClass()) + "_" + sf.getName();
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
            if (!eReference.isContainer()) {
                OClass refOClass = getOrCreateOClass(eReference.getEReferenceType());
                OType oType = eReference.isContainment() ?
                        (eReference.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED) :
                        (eReference.isMany() ? OType.LINKLIST : OType.LINK);
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
            oEProxyClass.createProperty("eClass", OType.STRING);
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

    private boolean isEmbedded(EClass eClass) {
        if (isAnnotated(eClass, "embedded", "false", "true")) {
            return true;
        }
        if (isAnnotated(eClass.getEPackage(), "embedded", "false", "true")) {
            return true;
        }
        for (EClass eSuperType : eClass.getEAllSuperTypes()) {
            if (isAnnotated(eSuperType, "embedded", "false", "true")) {
                return true;
            }
        }
        return false;
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

    private boolean isEmbedded(EReference eReference) {
        return isAnnotated(eReference, "embedded", "false", "true") ||
                isEmbedded(eReference.getEReferenceType());
    }

    public void createSchema() {
        ((ODatabaseDocumentInternal) db).setUseLightweightEdges(true);
        getOrCreateEProxyClass();
        getOrCreateEContainsEdge();
        getOrCreateERefersEdge();
        for (EClass eClass : factory.getEClasses()) {
            OClass oClass = getOrCreateOClass(eClass);
            EAttribute id = null;
            for (EAttribute sf : eClass.getEAttributes()) {
                if (!sf.isDerived() && !sf.isTransient()) {
                    OProperty oProperty = oClass.getProperty(sf.getName());
                    if (oProperty == null) {
                        createProperty(oClass, sf);
                    }
                    if (sf.isID()) {
                        id = sf;
                    }
                    createIndexIfRequired(oClass, sf);
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
            for (EReference sf : eClass.getEReferences()) {
                if (!sf.isDerived() && !sf.isTransient() && !sf.isContainer()) {
                    if (isEmbedded(sf)) {
                        if (oClass.getProperty(sf.getName()) == null) {
                            createProperty(oClass, sf);
                        }
                    } else {
                        String edgeName = getEdgeName(sf);
                        if (db.getClass(edgeName) == null) {
                            OClass edgeClass = db.createClass(edgeName, sf.isContainment() ? ECONTAINS : EREFERS);
                            edgeClass.setCustom("feature", sf.getName());
                        }
                    }
                    createIndexIfRequired(oClass, sf);
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

    private void clearContents(OVertex oElement) {
        for (OEdge oEdge : oElement.getEdges(ODirection.OUT, ECONTAINS)) {
            deleteRecursive(oEdge.getTo());
        }
    }

    private void deleteRecursive(OVertex oElement) {
        clearContents(oElement);
        oElement.delete();
    }

    private void populateOElement(EObject eObject, OElement oElement) {
        populateOElementContainment(eObject, oElement);
        populateOElementCross(eObject, oElement);
    }

    private void populateOElementContainment(EObject eObject, OElement oElement) {
        Set<OVertex> toDelete = new HashSet<>();
        if (oElement instanceof OVertex) {
            for (OVertex oVertex : ((OVertex) oElement).getVertices(ODirection.OUT, ECONTAINS)) {
                toDelete.add(oVertex);
            }
        }
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf : eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient()) {
                if (eObject.eIsSet(sf)) {
                    Object value = eObject.eGet(sf);
                    if (sf instanceof EReference && ((EReference) sf).isContainment()) {
                        List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                        List<OElement> embedded = new ArrayList<>();
                        for (EObject cObject : eObjects) {
                            OElement cElement = loadElement(cObject);
                            if (cElement == null) {
                                if (isEmbedded((EReference) sf)) {
                                    cElement = createOElement(cObject);
                                    embedded.add(cElement);
                                } else {
                                    cElement = createOVertex(cObject);
                                }
                            } else if (cElement instanceof OVertex) {
                                toDelete.remove(cElement);
                                for (OEdge oEdge : ((OVertex) cElement).getEdges(ODirection.IN, ECONTAINS)) {
                                    oEdge.delete();
                                }
                            }
                            populateOElementContainment(cObject, cElement);
                            if (!isEmbedded((EReference) sf)) {
                                if (!(oElement instanceof OVertex)) {
                                    throw new IllegalArgumentException("Can't reference from embedded element " +
                                            oElement + " with edge");
                                }
                                ((OVertex) oElement).addEdge((OVertex) cElement, getEdgeName((EReference) sf));
                                cElement.save();
                                ((OrientDBResource) cObject.eResource()).setID(cObject, factory.getId(cElement.getIdentity()));
                            }
                        }
                        if (isEmbedded((EReference) sf)) {
                            oElement.setProperty(sf.getName(), sf.isMany() ? embedded : embedded.get(0), sf.isMany() ? OType.EMBEDDEDLIST : OType.EMBEDDED);
                        }
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
        for (OVertex oVertex : toDelete) {
            deleteRecursive(oVertex);
        }
    }

    private void populateOElementCross(EObject eObject, OElement oElement) {
        if (oElement instanceof OVertex) {
            for (OEdge oEdge : ((OVertex) oElement).getEdges(ODirection.OUT, EREFERS)) {
                if (oEdge.getTo().getSchemaType().get().isSubClassOf(EPROXY)) {
                    oEdge.getTo().delete();
                }
                oEdge.delete();
            }
        }
        EClass eClass = eObject.eClass();
        for (EStructuralFeature sf : eClass.getEAllStructuralFeatures()) {
            if (!sf.isDerived() && !sf.isTransient() && eObject.eIsSet(sf)) {
                Object value = eObject.eGet(sf);
                if (sf instanceof EReference && !((EReference) sf).isContainer()) {
                    List<EObject> eObjects = sf.isMany() ? (List<EObject>) value : Collections.singletonList((EObject) value);
                    if (((EReference) sf).isContainment()) {
                        for (int i = 0; i < eObjects.size(); ++i) {
                            EObject cObject = eObjects.get(i);
                            if (!isEmbedded((EReference) sf)) {
                                URI uri = EcoreUtil.getURI(cObject);
                                ORID orid = factory.getORID(uri);
                                OElement oElement1 = db.load(orid);
                                populateOElementCross(cObject, oElement1);
                            } else {
                                OElement cElement = sf.isMany() ?
                                        ((List<OElement>) oElement.getProperty(sf.getName())).get(i) :
                                        oElement.getProperty(sf.getName());
                                populateOElementCross(cObject, cElement);
                            }
                        }
                    } else {
                        List<ORID> embedded = new ArrayList<>();
                        for (int i = 0; i < eObjects.size(); ++i) {
                            EObject crObject = eObjects.get(i);
                            URI crURI = EcoreUtil.getURI(crObject);
                            ORID orid = factory.getORID(crURI);
                            if (!isEmbedded((EReference) sf)) {
                                if (!(oElement instanceof OVertex)) {
                                    throw new IllegalArgumentException("References from embedded element can only be embedded: " + oElement);
                                }
                                OVertex crVertex = orid != null ? db.load(orid) : createProxyOElement(crObject.eClass(), crURI);
                                ((OVertex) oElement).addEdge(crVertex, getEdgeName((EReference) sf));
                                crVertex.save();
                            } else {
                                embedded.add(orid);
                            }
                        }
                        if (isEmbedded((EReference) sf)) {
                            oElement.setProperty(sf.getName(), sf.isMany() ? embedded : embedded.get(0));
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
        List<Resource> dependent = getDependentResources(orid);
        if (dependent.size() > 0) {
            String ids = dependent.stream().map(resource -> factory.getORID(resource.getURI()).toString()).collect(Collectors.joining(", "));
            throw new IllegalArgumentException(String.format("Can not delete element %s with references from [%s]",
                    oVertex.getIdentity(), ids));
        }
        deleteRecursive(oVertex);
    }

    public void save(Resource resource) {
        ORecord firstRecord = null;
        for (EObject eObject : resource.getContents()) {
            OVertex oVertex = loadElement(eObject);
            if (oVertex == null) {
                oVertex = createOVertex(eObject);
            } else {
                checkVersion(resource.getURI(), oVertex);
            }
            populateOElement(eObject, oVertex);
            ORecord oRecord = oVertex.save();
            if (firstRecord == null) {
                firstRecord = oRecord;
            }
        }
        if (firstRecord != null) {
            resource.setURI(factory.createResourceURI(firstRecord));
            savedResourcesMap.put(resource, firstRecord);
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
        EcoreUtil.resolveAll(resource);
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
        } else {
            URI eClassURI = factory.oClassToUriMap.get(oClass.getName());
            EClass eClass = (EClass) rs.getEObject(eClassURI, false);
            EObject eObject = EcoreUtil.create(eClass);
            return eObject;
        }
    }

    private void populateEObject(ResourceSet rs, OElement oElement, EObject eObject) {
        populateEObjectContains(rs, oElement, eObject);
        populateEObjectRefers(rs, oElement, eObject);
    }

    private void populateEObjectRefers(ResourceSet rs, OElement oElement, EObject eObject) {
        if (oElement instanceof OVertex) {
            for (OEdge oEdge : ((OVertex) oElement).getEdges(ODirection.OUT, ECONTAINS)) {
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
            for (OEdge oEdge : ((OVertex) oElement).getEdges(ODirection.OUT, EREFERS)) {
                EReference sf = getEReference(eObject, oEdge);
                if (sf == null || sf.isContainment()) {
                    continue;
                }
                OVertex crVertex = oEdge.getTo();
                setNonContainedReference(rs, eObject, sf, crVertex);
            }
        }
        for (EReference eReference : eObject.eClass().getEAllReferences()) {
            if (!eReference.isContainer() && isEmbedded(eReference) && oElement.getPropertyNames().contains(eReference.getName())) {
                Object value = oElement.getProperty(eReference.getName());
                if (eReference.isContainment()) {
                    if (eReference.isMany()) {
                        List<OElement> valueList = (List<OElement>) value;
                        List<EObject> objectList = (List<EObject>) eObject.eGet(eReference);
                        for (int i = 0; i < valueList.size(); ++ i) {
                            populateEObjectRefers(rs, valueList.get(i), objectList.get(i));
                        }

                    } else {
                        populateEObjectRefers(rs, (OElement) value, (EObject) eObject.eGet(eReference));
                    }
                }
                else {
                    if (eReference.isMany()) {
                        for (OElement crVertex : (List<OElement>) value) {
                            setNonContainedReference(rs, eObject, eReference, crVertex);
                        }

                    } else {
                        setNonContainedReference(rs, eObject, eReference, (OElement) value);
                    }
                }
            }
        }
    }

    private void setNonContainedReference(ResourceSet rs, EObject eObject, EReference sf, OElement oElement) {
        EObject crObject = createEObject(rs, oElement);
        if (!crObject.eIsProxy()) {
            OElement top = getTopElement(oElement);
            //OElement top = crVertex;
            URI crURI = factory.createResourceURI(top).appendFragment(factory.getId(oElement.getIdentity()));
            ((InternalEObject) crObject).eSetProxyURI(crURI);
        }
        if (sf.isMany()) {
            ((EList) eObject.eGet(sf)).add(crObject);
        } else {
            eObject.eSet(sf, crObject);
        }
    }

    private OElement getTopElement(OElement crVertex) {
        return queryElement("select * from (traverse in('EContains') from ?) where in('EContains').size() == 0",
                crVertex.getIdentity());
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
        ORID orid = oElement.getIdentity();
        if (orid.isValid()) {
            ((OrientDBResource) eObject.eResource()).setID(eObject, factory.getId(orid));
        }
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
                    if (eReference.isContainment() && isEmbedded(eReference)) {
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
        if (oElement instanceof OVertex) {
            for (OEdge oEdge : ((OVertex) oElement).getEdges(ODirection.OUT, ECONTAINS)) {
                EReference sf = getEReference(eObject, oEdge);
                if (sf == null || !sf.isContainment()) {
                    continue;
                }
                OVertex crVertex = oEdge.getTo();
                setContainmentReference(rs, eObject, sf, crVertex);
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
                    Resource resource = rs.createResource(factory.createResourceURI(oElement));
                    resource.getContents().add(eObject);
                    populateEObject(rs, oElement, eObject);
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
                "  traverse in('EContains') from (\n" +
                "    select expand(in('ERefers')) from (\n" +
                "      traverse out('EContains') from ?\n" +
                "    )\n" +
                "  )\n" +
                ")\n" +
                "where in('EContains').size() == 0 and @rid != ?", consumer, orid, orid);
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
