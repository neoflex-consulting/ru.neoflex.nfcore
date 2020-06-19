package ru.neoflex.nfcore.base;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.auth.*;

@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"dbtype=orientdb", "orientdb.dbname=modelstest"})
public class XcoreTests {

    @Test
    public void createTest() throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdmin");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantType(GrantType.ALL);
        superAdmin.getGrants().add(allPermission);
        Role securityOfficer = AuthFactory.eINSTANCE.createRole();
        securityOfficer.setName("SecurityOfficer");
    }
}
