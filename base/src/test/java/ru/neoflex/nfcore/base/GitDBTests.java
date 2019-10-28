package ru.neoflex.nfcore.base;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.meta.gitdb.Database;
import ru.neoflex.meta.gitdb.Transaction;
import ru.neoflex.nfcore.base.auth.*;
import ru.neoflex.nfcore.base.services.Context;

import java.io.IOException;

@RunWith(SpringRunner.class)
@SpringBootTest
public class GitDBTests {
    @Autowired
    Context context;

    @Test
    public void loadAndStore() throws IOException {
        Role superAdminRole = createSuperAdminRole();
        User superAdminUser = createSuperAdminUser();
        superAdminUser.getRoles().add(superAdminRole);
        try (Transaction tx = context.getWorkspace().createTransaction()) {
            Database db = tx.getDatabase();
            ResourceSet rs1 = db.findByEClass(superAdminUser.eClass(), superAdminUser.getName(), tx);
            if (!rs1.getResources().isEmpty()) rs1.getResources().get(0).delete(null);
            ResourceSet rs2 = db.findByEClass(superAdminRole.eClass(), superAdminRole.getName(), tx);
            if (!rs2.getResources().isEmpty()) rs2.getResources().get(0).delete(null);
            tx.commit("superadmin role and user deleted");
        }
        try (Transaction tx = context.getWorkspace().createTransaction()) {
            Database db = tx.getDatabase();
            Resource roleResource = db.createResource(tx, null, null);
            roleResource.getContents().add(superAdminRole);
            roleResource.save(null);
            Resource userResource = db.createResource(tx, null, null);
            userResource.getContents().add(superAdminUser);
            userResource.save(null);
            Resource resource2 = db.createResource(tx, db.getId(userResource.getURI()), null);
            resource2.load(null);
            Assert.assertEquals(superAdminUser.getName(), ((User)resource2.getContents().get(0)).getName());
            tx.commit("superadmin role and user created");
        }
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
