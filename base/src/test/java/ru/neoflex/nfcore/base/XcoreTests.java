package ru.neoflex.nfcore.base;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.auth.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class XcoreTests {

    @Test
    public void createTest() throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdmin");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantStatus(GrantStatus.GRANTED);
        allPermission.getActionTypes().add(ActionType.ALL);
        superAdmin.getGrants().add(allPermission);
        Role securityOfficer = AuthFactory.eINSTANCE.createRole();
        securityOfficer.setName("SecurityOfficer");
        PackagePermission authPermission = AuthFactory.eINSTANCE.createPackagePermission();
        authPermission.setEPackage(AuthPackage.eINSTANCE);
        authPermission.setGrantStatus(GrantStatus.GRANTED);
        authPermission.getActionTypes().add(ActionType.ALL);
        securityOfficer.getGrants().add(authPermission);
    }
}
