package ru.neoflex.nfcore.masterdata.services;

import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.server.OServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.neoflex.nfcore.base.services.providers.OrientDBStoreProvider;

import javax.annotation.PostConstruct;

@Service
public class MasterdataProvider {
    @Autowired
    OrientDBStoreProvider provider;
    @Value("${masterdata.dbname:masterdata}")
    String masterdataDbName;

    @PostConstruct
    public void init() {
        OServer oServer = provider.getServer().getOServer();
        if (!oServer.existsDatabase(masterdataDbName)) {
            oServer.createDatabase(masterdataDbName, ODatabaseType.PLOCAL, OrientDBConfig.defaultConfig());
        }
    }
}
