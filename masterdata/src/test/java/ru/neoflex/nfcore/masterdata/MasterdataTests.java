package ru.neoflex.nfcore.masterdata;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.services.Context;
import ru.neoflex.nfcore.base.services.Store;
import ru.neoflex.nfcore.masterdata.services.MasterdataProvider;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest", "masterdata.dbname=masterdatatest"})
public class MasterdataTests {
    @Autowired
    Store store;
    @Autowired
    Context context;
    @Autowired
    MasterdataProvider masterdataProvider;

    @Test
    public void testMasterdata() {

    }
}
