package ru.neoflex.meta.emforientdb;

import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.db.document.ODatabaseDocument;
import org.eclipse.emf.ecore.EPackage;

import java.io.Closeable;
import java.io.IOException;
import java.util.List;

public class Database extends SessionFactory implements Closeable {
    private final OrientDB orientDB;
    private final ODatabasePool pool;
    private final String user;
    private final String password;

    public Database(String url, String dbName, String user, String password, List<EPackage> packages) {
        super(dbName, packages);
        this.user = user;
        this.password = password;
        orientDB = new OrientDB(url, user, password, OrientDBConfig.defaultConfig());
        orientDB.createIfNotExists(dbName, ODatabaseType.PLOCAL);
        pool = new ODatabasePool(orientDB,dbName,user,password);
    }

    @Override
    public void close() {
        pool.close();
        orientDB.close();
    }

    @Override
    public ODatabaseDocument createDatabaseDocument() {
        return pool.acquire();
    }
}
