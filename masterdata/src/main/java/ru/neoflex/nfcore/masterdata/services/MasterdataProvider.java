package ru.neoflex.nfcore.masterdata.services;

import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.ODatabaseRecordThreadLocal;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import com.orientechnologies.orient.core.exception.OConcurrentModificationException;
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
            return null;
        });
    }

    public ODatabaseDocument createDatabaseDocument() {
        return provider.getServer().getOServer().openDatabase(masterdataDbName);
    }

    public interface DatabaseFunction<R> {
        R call(ODatabaseDocument database);
    }

    public<R> R withDatabase(DatabaseFunction<R> f) {
        ODatabaseDocumentInternal dbOld = ODatabaseRecordThreadLocal.instance().getIfDefined();
        try {
            try (ODatabaseDocument database = createDatabaseDocument()) {
                return f.call(database);
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
