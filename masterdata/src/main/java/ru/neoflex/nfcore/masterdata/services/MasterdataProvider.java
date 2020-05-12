package ru.neoflex.nfcore.masterdata.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.lucene.OLuceneIndexFactory;
import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.exception.OConcurrentModificationException;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OProperty;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.tx.OTransaction;
import com.orientechnologies.orient.server.OServer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.services.Authorization;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.services.providers.OrientDBStoreProvider;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.masterdata.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;

@Service
public class MasterdataProvider {
    private static final Logger logger = LoggerFactory.getLogger(MasterdataProvider.class);
    @Autowired
    OrientDBStoreProvider provider;
    @Autowired
    Store store;
    @Autowired
    Context context;
    @Value("${masterdata.dbname:masterdata}")
    String masterdataDbName;

    @PostConstruct
    public void init() throws Exception {
        OServer oServer = provider.getServer().getOServer();
        if (!oServer.existsDatabase(masterdataDbName)) {
            oServer.createDatabase(masterdataDbName, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        }
        context.transact("Init Master Data Service", () -> {
            initTypes();
            return null;
        });
    }

    private void activateAllEntities() throws IOException {
        List<Resource> resList = DocFinder.create(store, MasterdataPackage.Literals.ENTITY_TYPE)
                .execute().getResources();
        for (Resource r: resList) {
            EntityType entity = (EntityType) r.getContents().get(0);
            if (!entity.isActive()) {
                activateEntityType(entity);
            }
        }
    }

    public void ensureSuperClass(OClass oClass, OClass oSuperClass) {
        if (!oClass.getAllSuperClasses().contains(oSuperClass)) {
            oClass.addSuperClass(oSuperClass);
        }
    }

    private OType getOType(Classifier classifier) throws ClassNotFoundException {
        if (classifier instanceof ArrayType) {
            ArrayType arrayType = (ArrayType) classifier;
            return arrayType.getElementType() instanceof EntityType ? OType.LINKLIST : OType.EMBEDDEDLIST;
        }
        if (classifier instanceof MapType) {
            MapType mapType = (MapType) classifier;
            return mapType.getValueType() instanceof EntityType ? OType.LINKMAP : OType.EMBEDDEDMAP;
        }
        if (classifier instanceof PlainType) {
            PlainType plainType = (PlainType) classifier;
            Class<?> iClass = Class.forName(plainType.getJavaClassName());
            OType oType = OType.getTypeByClass(iClass);
            if (oType == null) {
                throw new IllegalArgumentException(String.format("Can't get OType of %s", plainType.getName()));
            }
            return oType;
        }
        if (classifier instanceof EnumType) {
            return OType.STRING;
        }
        if (classifier instanceof EntityType) {
            return OType.LINK;
        }
        if (classifier instanceof DocumentType) {
            return OType.EMBEDDED;
        }
        throw new IllegalArgumentException(String.format("Unknown OType for %s", classifier.getName()));
    }

    private void createProperty(ODatabaseDocument database, OClass oClass, String name, Classifier classifier) throws ClassNotFoundException {
        if (classifier instanceof ArrayType) {
            ArrayType arrayType = (ArrayType) classifier;
            OType oType = arrayType.getElementType() instanceof EntityType ? OType.EMBEDDEDLIST : OType.LINKLIST;
            if (arrayType.getElementType() instanceof DocumentType) {
                OClass oClass2 = getOClass(database, arrayType.getElementType().getName());
                oClass.createProperty(name, oType, oClass2);
            }
            else {
                OType oType2 = getOType(arrayType.getElementType());
                oClass.createProperty(name, oType, oType2);
            }
        }
        else if (classifier instanceof MapType) {
            MapType mapType = (MapType) classifier;
            OType oType =  mapType.getValueType() instanceof EntityType ? OType.EMBEDDEDMAP : OType.LINKMAP;
            if (mapType.getValueType() instanceof DocumentType) {
                OClass oClass2 = getOClass(database, mapType.getValueType().getName());
                oClass.createProperty(name, oType, oClass2);
            }
            else {
                OType oType2 = getOType(mapType.getValueType());
                oClass.createProperty(name, oType, oType2);
            }
        }
        else if (classifier instanceof PlainType) {
            OType oType2 = getOType(classifier);
            oClass.createProperty(name, oType2);
        }
        else if (classifier instanceof EnumType) {
            oClass.createProperty(name, OType.STRING);
        }
        else if (classifier instanceof DocumentType) {
            OClass oClass2 = getOClass(database, classifier.getName());
            OType oType = classifier instanceof EntityType ? OType.LINK : OType.EMBEDDED;
            oClass.createProperty(name, oType, oClass2);
        }
    }

    private OClass getOClass(ODatabaseDocument database, String name) {
        OClass oClass = database.getClass(name);
        if (oClass == null) {
            throw new IllegalArgumentException(String.format("OClass %s does not exists", name));
        }
        return oClass;
    }

    public void deactivateEntityType(EntityType entity, boolean deleteTables) throws IOException {
        if (!entity.isActive()) {
            throw new IllegalArgumentException(String.format("Entity %s is not active", entity.getName()));
        }
        if (deleteTables) {
            withDatabase(database -> {
                OClass oClass = database.getClass(entity.getName());
                if (oClass != null) {
                    database.command(String.format("DROP CLASS %s UNSAFE", entity.getName()));
                }
                return null;
            });
        }
        entity.setActive(false);
        store.saveResource(entity.eResource());
    }

    public void activateEntityType(EntityType entity) throws IOException {
        if (entity.isActive()) {
            throw new IllegalArgumentException(String.format("Entity %s is already active", entity.getName()));
        }
        for (EntityType superType: entity.getSuperTypes()) {
            if (!superType.isActive()) {
                throw new IllegalArgumentException(String.format("Supertype Entity %s is not active", superType.getName()));
            }
        }
        withDatabase(database -> {
            try {
                OClass oClass = database.getClass(entity.getName());
                if (oClass == null) {
                    oClass = database.createClass(entity.getName());
                    if (entity.isAbstract()) {
                        oClass.setAbstract(true);
                    }
                }
                for (EntityType superType: entity.getSuperTypes()) {
                    OClass superClass = database.getClass(superType.getName());
                    if (superClass == null) {
                        throw new IllegalArgumentException(String.format("Supertype OClass %s does not exists", superType.getName()));
                    }
                    ensureSuperClass(oClass, superClass);
                }
                for (Attribute attribute: entity.getAttributes()) {
                    OProperty oProperty = oClass.getProperty(attribute.getName());
                    if (oProperty == null) {
                        createProperty(database, oClass, attribute.getName(), attribute.getAttributeType());
                    }
                }
                PrimaryKey pk = entity.getPrimaryKey();
                if (pk != null) {
                    oClass.createIndex(pk.getName(), OClass.INDEX_TYPE.UNIQUE, entity.getAttributes()
                            .stream().map(attribute -> attribute.getName()).toArray(size -> new String[size]));
                }
                for (InvertedEntry ie: entity.getInvertedEntries()) {
                    if (ie instanceof PlainIndex) {
                        OClass.INDEX_TYPE iType = ((PlainIndex) ie).isUnique() ? OClass.INDEX_TYPE.UNIQUE : OClass.INDEX_TYPE.NOTUNIQUE;
                        oClass.createIndex(ie.getName(), iType, entity.getAttributes()
                                .stream().map(attribute -> attribute.getName()).toArray(size -> new String[size]));
                    }
                    else if (ie instanceof FulltextIndex) {
                        ODocument meta = new ODocument().field("analyzer", StandardAnalyzer.class.getName());
                        oClass.createIndex(ie.getName(), "FULLTEXT", null, meta, OLuceneIndexFactory.LUCENE_ALGORITHM,
                                entity.getAttributes()
                                        .stream().map(attribute -> attribute.getName()).toArray(size -> new String[size]));
                    }
                    else if (ie instanceof SpatialIndex) {
                        ODocument meta = new ODocument().field("analyzer", StandardAnalyzer.class.getName());
                        oClass.createIndex(ie.getName(), "SPATIAL", null, meta, OLuceneIndexFactory.LUCENE_ALGORITHM,
                                entity.getAttributes()
                                        .stream().map(attribute -> attribute.getName()).toArray(size -> new String[size]));
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return null;
        });
        entity.setActive(true);
        store.saveResource(entity.eResource());
    }

    public ODatabaseDocument createDatabaseDocument() {
        return provider.getServer().getOServer().openDatabase(masterdataDbName);
    }

    public OEntity insert(ODatabaseDocument db, EntityType entityType, ObjectNode node) {
        return insert(db, entityType.getName(), node);
    }

    public OEntity insert(ODatabaseDocument db, String entityTypeName, ObjectNode node) {
        try {
            ODocument entity = new ODocument(entityTypeName);
            entity.setProperty("__created", new Date());
            entity.setProperty("__createdBy", Authorization.getUserName());
            String jsonString = new ObjectMapper().writeValueAsString(node);
            entity.fromJSON(jsonString);
            db.save(entity);
            return new OEntity(entity);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public OEntity insert(ODatabaseDocument db, ObjectNode node) {
        return insert(db, node.get("@class").asText(), node);
    }

    public OEntity update(ODatabaseDocument db, OEntity oEntity) {
        ObjectNode node = oEntity.getObjectNode();
        String id = oEntity.getRid();
        return update(db, id, node);
    }

    public OEntity update(ODatabaseDocument db, ObjectNode node) {
        return update(db, node.get("@rid").asText(), node);
    }

    public OEntity update(ODatabaseDocument db, String id, ObjectNode node) {
        try {
            ODocument entity = db.load(new ORecordId(id));
            entity.setProperty("__updated", new Date());
            entity.setProperty("__updatedBy", Authorization.getUserName());
            String jsonString = new ObjectMapper().writeValueAsString(node);
            entity.fromJSON(jsonString);
            entity.save();
            return new OEntity(entity);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public ODatabaseDocument delete(ODatabaseDocument db, OEntity oEntity) {
        return delete(db, oEntity.getRid());
    }

    public ODatabaseDocument delete(ODatabaseDocument db, ObjectNode node) {
        return delete(db, node.get("@rid").asText());
    }

    public ODatabaseDocument delete(ODatabaseDocument db, String recordId) {
        db.delete(new ORecordId(recordId));
        return db;
    }

    public OEntity load(ODatabaseDocument db, String recordId) {
        ODocument entity = db.load(new ORecordId(recordId));
        return new OEntity(entity);
    }

    public<R> R withDatabase(Function<ODatabaseDocument, R> f) {
        ODatabaseDocumentInternal dbOld = ODatabaseRecordThreadLocal.instance().getIfDefined();
        try {
            try (ODatabaseDocument database = createDatabaseDocument()) {
                return f.apply(database);
            }
        }
        finally {
            if (dbOld != null) {
                dbOld.activateOnCurrentThread();
            }
        }
    }

    public <R> R inTransaction(Function<ODatabaseDocument, R> f) {
        int delay = 1;
        int maxDelay = 1000;
        int maxAttempts = 100;
        int attempt = 1;
        while (true) {
            try {
                return withDatabase(database -> {
                    database.begin(OTransaction.TXTYPE.OPTIMISTIC);
                    try {
                        return f.apply(database);
                    }
                    catch (Throwable tx) {
                        database.rollback();
                        throw tx;
                    }
                    finally {
                        database.commit(true);
                    }
                });
            }
            catch (OConcurrentModificationException e) {
                String message = e.getClass().getSimpleName() + ": " + e.getMessage() + " attempt no " + attempt;
                logger.debug(message);
                if (++attempt > maxAttempts) {
                    throw e;
                }
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ex) {
                }
                if (delay < maxDelay) {
                    delay *= 2;
                }
                continue;
            }
        }
    }

    private void initTypes() throws IOException {
        ensurePlainType("STRING", java.lang.String.class.getName());
        ensurePlainType("INTEGER", java.lang.Integer.class.getName());
        ensurePlainType("LONG", java.lang.Long.class.getName());
        ensurePlainType("FLOAT", java.lang.Float.class.getName());
        ensurePlainType("DOUBLE", java.lang.Double.class.getName());
        ensurePlainType("DECIMAL", java.math.BigDecimal.class.getName());
        ensurePlainType("DATE", java.util.Date.class.getName());
        ensurePlainType("DATETIME", java.util.Date.class.getName());
        ensurePlainType("BOOLEAN", java.lang.Boolean.class.getName());
        ensurePlainType("BYTE", java.lang.Byte.class.getName());
        ensurePlainType("BINARY", (new byte[0]).getClass().getName()); //TODO: ???
        ensureArrayType("ListOfDouble", "DOUBLE");
        ensureArrayType("List2OfDouble", "ListOfDouble");
        ensureArrayType("List3OfDouble", "List2OfDouble");
        ensureArrayType("List4OfDouble", "List3OfDouble");
        ensureDocumentType("OPoint", documentType -> {
            createAttribute(documentType, "coordinates", "ListOfDouble");
        });
        ensureDocumentType("OMultiPoint", documentType -> {
            createAttribute(documentType, "coordinates", "List2OfDouble");
        });
        ensureDocumentType("OLineString", documentType -> {
            createAttribute(documentType, "coordinates", "List2OfDouble");
        });
        ensureDocumentType("OMultiLineString", documentType -> {
            createAttribute(documentType, "coordinates", "List3OfDouble");
        });
        ensureDocumentType("OPolygon", documentType -> {
            createAttribute(documentType, "coordinates", "List3OfDouble");
        });
        ensureDocumentType("OMultiPolygon", documentType -> {
            createAttribute(documentType, "coordinates", "List4OfDouble");
        });
        ensureDocumentType("ORectangle", documentType -> {
            createAttribute(documentType, "coordinates", "ListOfDouble");
        });
    }

    public Attribute createAttribute(DocumentType entityType, String name, String attributeTypeName) {
        try {
            List<Resource> attributeTypeList = DocFinder.create(store, MasterdataPackage.Literals.CLASSIFIER, new HashMap() {{put("name", attributeTypeName);}})
                    .execute().getResources();
            if (attributeTypeList.size() == 0) {
                throw new IllegalArgumentException(String.format("Attribute Type %s not found", attributeTypeName));
            }
            Attribute attribute = MasterdataFactory.eINSTANCE.createAttribute();
            attribute.setName(name);
            attribute.setAttributeType((Classifier) attributeTypeList.get(0).getContents().get(0));
            entityType.getAttributes().add(attribute);
            return attribute;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public PrimaryKey createPrimaryKey(EntityType entityType, String name, String ...fieldNames) {
        PrimaryKey primaryKey = MasterdataFactory.eINSTANCE.createPrimaryKey();
        setupIndex(entityType, name, primaryKey, fieldNames);
        entityType.setPrimaryKey(primaryKey);
        return primaryKey;
    }

    public ForeignKey createForeignKey(EntityType entityType, EntityType foreignEntityType, String name, String ...fieldNames) {
        ForeignKey foreignKey = MasterdataFactory.eINSTANCE.createForeignKey();
        setupIndex(entityType, name, foreignKey, fieldNames);
        foreignKey.setForeignEntityType(foreignEntityType);
        entityType.getForeignKeys().add(foreignKey);
        return foreignKey;
    }

    public PlainIndex createPlainIndex(EntityType entityType, boolean unique, String name, String ...fieldNames) {
        PlainIndex plainIndex = MasterdataFactory.eINSTANCE.createPlainIndex();
        setupIndex(entityType, name, plainIndex, fieldNames);
        plainIndex.setUnique(unique);
        entityType.getInvertedEntries().add(plainIndex);
        return plainIndex;
    }

    public FulltextIndex createFulltextIndex(EntityType entityType, String name, String ...fieldNames) {
        FulltextIndex fulltextIndex = MasterdataFactory.eINSTANCE.createFulltextIndex();
        setupIndex(entityType, name, fulltextIndex, fieldNames);
        entityType.getInvertedEntries().add(fulltextIndex);
        return fulltextIndex;
    }

    public SpatialIndex createSpatialIndex(EntityType entityType, String name, String ...fieldNames) {
        SpatialIndex spatialIndex = MasterdataFactory.eINSTANCE.createSpatialIndex();
        setupIndex(entityType, name, spatialIndex, fieldNames);
        entityType.getInvertedEntries().add(spatialIndex);
        return spatialIndex;
    }

    private void setupIndex(EntityType entityType, String name, Index index, String[] fieldNames) {
        index.setName(name);
        for (String fieldName: fieldNames) {
            Attribute attribute = null;
            for (Attribute a: entityType.getAttributes()) {
                if (a.getName().equals(fieldName)) {
                    attribute = a;
                    break;
                }
            }
            if (attribute == null) {
                throw new IllegalArgumentException(String.format("Attribute %s not found", fieldName));
            }
            index.getAttributes().add(attribute);
        }
    }

    private PlainType ensurePlainType(String name, String javaClassName) throws IOException {
        List<Resource> typeList = DocFinder.create(store, MasterdataPackage.Literals.PLAIN_TYPE, new HashMap() {{put("name", name);}})
                .execute().getResources();
        if (typeList.size() == 0) {
            PlainType pt = MasterdataFactory.eINSTANCE.createPlainType();
            pt.setName(name);
            pt.setJavaClassName(javaClassName);
            store.createEObject(pt);
            return pt;
        }
        return (PlainType) typeList.get(0).getContents().get(0);
    }

    private ArrayType ensureArrayType(String name, String elementTypeName) throws IOException {
        List<Resource> typeList = DocFinder.create(store, MasterdataPackage.Literals.ARRAY_TYPE, new HashMap() {{put("name", name);}})
                .execute().getResources();
        if (typeList.size() == 0) {
            List<Resource> elementTypeList = DocFinder.create(store, MasterdataPackage.Literals.CLASSIFIER, new HashMap() {{put("name", elementTypeName);}})
                    .execute().getResources();
            if (elementTypeList.size() == 0) {
                throw new IllegalArgumentException(String.format("Element Type %s not found", elementTypeName));
            }
            ArrayType at = MasterdataFactory.eINSTANCE.createArrayType();
            at.setName(name);
            at.setElementType((Classifier) elementTypeList.get(0).getContents().get(0));
            store.createEObject(at);
            return at;
        }
        return (ArrayType) typeList.get(0).getContents().get(0);
    }

    private EObject ensureDocumentType(String name, Consumer<DocumentType> documentTypeConsumer) throws IOException {
        List<Resource> resList = DocFinder.create(store, MasterdataPackage.Literals.DOCUMENT_TYPE, new HashMap() {{put("name", name);}})
                .execute().getResources();
        if (resList.size() == 0) {
            DocumentType dt = MasterdataFactory.eINSTANCE.createDocumentType();
            dt.setName(name);
            documentTypeConsumer.accept(dt);
            store.createEObject(dt);
            return dt;
        }
        return resList.get(0).getContents().get(0);
    }

    public <R> R query(String sql, Map args, Function<OResultSet, R> consumer) {
        return withDatabase(database -> {
            try (OResultSet rs = database.query(sql, args)) {
                return consumer.apply(rs);
            }
        });
    }

    public List<OEntity> query(String sql) {
        return query(sql, new HashMap());
    }

    public List<OEntity> query(String sql, Map args) {
        return query(sql, args, oResultSet -> {
            List<OEntity> result = new ArrayList<>();
            while (oResultSet.hasNext()) {
                OResult oResult = oResultSet.next();
                result.add(new OEntity(oResult.toElement()));
            }
            return result;
        });
    }

    public ArrayNode queryNode(String sql) {
        return queryNode(sql, new HashMap());
    }

    public ArrayNode queryNode(String sql, Map args) {
        ArrayNode result = new ObjectMapper().createArrayNode();
        for (OEntity oEntity: query(sql, args)) {
            result.add(oEntity.getObjectNode());
        }
        return result;
    }
}
