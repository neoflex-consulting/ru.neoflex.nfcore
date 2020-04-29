package ru.neoflex.nfcore.masterdata.services;

import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.exception.OConcurrentModificationException;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OProperty;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.tx.OTransaction;
import com.orientechnologies.orient.server.OServer;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.base.services.providers.OrientDBStoreProvider;
import ru.neoflex.nfcore.base.util.DocFinder;
import ru.neoflex.nfcore.masterdata.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
            activateEntities();
            return null;
        });
    }

    private void activateEntities() throws IOException {
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
                    if (entity.getSuperTypes().size() == 0) {
                        oClass = database.createVertexClass(entity.getName());
                    }
                    else {
                        oClass = database.createClass(entity.getName());
                    }
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
            documentType.getAttributes().add(createAttribute("coordinates", "ListOfDouble"));
        });
        ensureDocumentType("OMultiPoint", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "List2OfDouble"));
        });
        ensureDocumentType("OLineString", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "List2OfDouble"));
        });
        ensureDocumentType("OMultiLineString", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "List3OfDouble"));
        });
        ensureDocumentType("OPolygon", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "List3OfDouble"));
        });
        ensureDocumentType("OMultiPolygon", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "List4OfDouble"));
        });
        ensureDocumentType("ORectangle", documentType -> {
            documentType.getAttributes().add(createAttribute("coordinates", "ListOfDouble"));
        });
    }

    private Attribute createAttribute(String name, String attributeTypeName) {
        try {
            List<Resource> attributeTypeList = DocFinder.create(store, MasterdataPackage.Literals.CLASSIFIER, new HashMap() {{put("name", attributeTypeName);}})
                    .execute().getResources();
            if (attributeTypeList.size() == 0) {
                throw new IllegalArgumentException(String.format("Attribute Type %s not found", attributeTypeName));
            }
            Attribute attribute = MasterdataFactory.eINSTANCE.createAttribute();
            attribute.setName(name);
            attribute.setAttributeType((Classifier) attributeTypeList.get(0).getContents().get(0));
            return attribute;
        } catch (IOException e) {
            throw new RuntimeException(e);
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

}
