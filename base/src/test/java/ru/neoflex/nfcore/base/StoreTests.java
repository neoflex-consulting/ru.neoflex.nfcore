package ru.neoflex.nfcore.base;

import org.eclipse.emf.ecore.resource.Resource;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.auth.*;
import ru.neoflex.nfcore.base.services.Context;

import java.io.IOException;

@RunWith(SpringRunner.class)
@SpringBootTest
public class StoreTests {
    @Autowired
    Context context;

    @Test
    public void loadAndStore() throws ClassNotFoundException, IllegalAccessException, InstantiationException, IOException {
        Role superAdminRole = createSuperAdminRole();
        User superAdminUser = createSuperAdminUser();
        superAdminUser.getRoles().add(superAdminRole);
        Resource roleResource = context.getStore().createEObject(superAdminRole);
        Resource userResource = context.getStore().createEObject(superAdminUser);
        Resource resource2 = context.getStore().getResourceSet().createResource(userResource.getURI());
        resource2.load(null);
        Assert.assertEquals(superAdminUser.getName(), ((User)resource2.getContents().get(0)).getName());
        context.getStore().deleteResource(roleResource.getURI());
        context.getStore().deleteResource(userResource.getURI());
    }

    public static Role createSuperAdminRole() {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("SuperAdminRole");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantStatus(GrantStatus.GRANTED);
        allPermission.getActionTypes().add(ActionType.ALL);
        superAdmin.getGrants().add(allPermission);
        return superAdmin;
    }

    public static User createSuperAdminUser() {
        User superAdminUser = AuthFactory.eINSTANCE.createUser();
        superAdminUser.setName("SuperAdminUser");
        superAdminUser.setEmail("admin@neoflex.ru");
        PasswordAuthenticator password = AuthFactory.eINSTANCE.createPasswordAuthenticator();
        password.setPassword("secret");
        password.setDisabled(false);
        superAdminUser.getAuthenticators().add(password);
        return superAdminUser;
    }

}
