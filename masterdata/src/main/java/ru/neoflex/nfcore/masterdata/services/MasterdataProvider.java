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
        List<Resource> resList = DocFinder.create(store, MasterdataPackage.Literals.ENTITY)
                .execute().getResources();
        for (Resource r: resList) {
            Entity entity = (Entity) r.getContents().get(0);
            if (entity.isActive()) {
                activateEntity(entity);
            }
        }
    }

    public void ensureSuperClass(OClass oClass, OClass oSuperClass) {
        if (!oClass.getAllSuperClasses().contains(oSuperClass)) {
            oClass.addSuperClass(oSuperClass);
        }
    }

    private OType convertPlainType(PlainType plainType) throws ClassNotFoundException {
        Class<?> iClass = Class.forName(plainType.getJavaClassName());
        OType oType = OType.getTypeByClass(iClass);
        return oType != null ? oType : OType.STRING;
    }

    private Entity activateEntity(Entity entity) throws IOException {
        if (entity.isActive()) {
            throw new IllegalArgumentException(String.format("Entity %s already active", entity.getName()));
        }
        for (Entity superType: entity.getSuperTypes()) {
            if (!superType.isActive()) {
                throw new IllegalArgumentException(String.format("Supertype Entity %s is not active", superType.getName()));
            }
        }
        withDatabase(database -> {
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
            for (Entity superType: entity.getSuperTypes()) {
                OClass superClass = database.getClass(superType.getName());
                if (superClass == null) {
                    throw new IllegalArgumentException(String.format("Supertype OClass %s does not exists", superType.getName()));
                }
                ensureSuperClass(oClass, superClass);
            }
            for (Feature feature: entity.getFeatures()) {
                OProperty oProperty = oClass.getProperty(feature.getName());
                if (oProperty == null) {
                    if (feature.isAttribute()) {
                        Attribute attribute = (Attribute) feature;
                        if (attribute.getAttributeType().getBaseType().isPlain()) {
                            PlainType plainType = (PlainType) attribute.getAttributeType().getBaseType();
                            OType oType = convertPlainType(plainType);
                            if (attribute.isMany()) {
                                oClass.createProperty(attribute.getName(), OType.EMBEDDEDLIST, oType);
                            }
                            else {
                                oClass.createProperty(attribute.getName(), oType);
                            }
                        }
                    }
                }
            }
            return null;
        });
        entity.setActive(true);
        store.saveResource(entity.eResource());
        return entity;
    }

    public ODatabaseDocument createDatabaseDocument() {
        return provider.getServer().getOServer().openDatabase(masterdataDbName);
    }

    public interface DatabaseFunction<R> {
        R call(ODatabaseDocument database) throws ClassNotFoundException;
    }

    public<R> R withDatabase(DatabaseFunction<R> f) {
        ODatabaseDocumentInternal dbOld = ODatabaseRecordThreadLocal.instance().getIfDefined();
        try {
            try (ODatabaseDocument database = createDatabaseDocument()) {
                return f.call(database);
            } catch (Throwable e) {
                throw new RuntimeException(e);
            }
        }
        finally {
            if (dbOld != null) {
                dbOld.activateOnCurrentThread();
            }
        }
    }

    public <R> R inTransaction(DatabaseFunction<R> f) {
        int delay = 1;
        int maxDelay = 1000;
        int maxAttempts = 100;
        int attempt = 1;
        while (true) {
            try {
                return withDatabase(database -> {
                    database.begin(OTransaction.TXTYPE.OPTIMISTIC);
                    try {
                        return f.call(database);
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
        ensurePlainType("BYTES", (new byte[0]).getClass().getName()); //TODO: ???
        ensureShapeType("Point", ShapeType.POINT);
        ensureShapeType("MultiPoint", ShapeType.MULTI_POINT);
        ensureShapeType("LineString", ShapeType.LINE_STRING);
        ensureShapeType("MultiLineString", ShapeType.MULTI_LINE_STRING);
        ensureShapeType("Polygon", ShapeType.POLYGON);
        ensureShapeType("MultiPolygon", ShapeType.MULTI_POLYGON);
        ensureShapeType("Rectangle", ShapeType.RECTANGLE);
        ensureShapeType("GeometryCollection", ShapeType.GEOMETRY_COLLECTION);
    }

    private EObject ensurePlainType(String name, String javaClassName) throws IOException {
        List<Resource> resList = DocFinder.create(store, MasterdataPackage.Literals.NAMED_TYPE, new HashMap() {{put("name", name);}})
                .execute().getResources();
        if (resList.size() == 0) {
            NamedType nt = MasterdataFactory.eINSTANCE.createNamedType();
            nt.setName(name);
            PlainType pt = MasterdataFactory.eINSTANCE.createPlainType();
            pt.setJavaClassName(javaClassName);
            nt.setBaseType(pt);
            store.createEObject(nt);
            return nt;
        }
        return resList.get(0).getContents().get(0);
    }

    private EObject ensureShapeType(String name, ShapeType st) throws IOException {
        List<Resource> resList = DocFinder.create(store, MasterdataPackage.Literals.NAMED_TYPE, new HashMap() {{put("name", name);}})
                .execute().getResources();
        if (resList.size() == 0) {
            NamedType nt = MasterdataFactory.eINSTANCE.createNamedType();
            nt.setName(name);
            Shape sh = MasterdataFactory.eINSTANCE.createShape();
            sh.setShapeType(st);
            nt.setBaseType(sh);
            store.createEObject(nt);
            return nt;
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
