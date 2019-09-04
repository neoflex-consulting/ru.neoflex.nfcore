package ru.neoflex.nfcore.base;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import ru.neoflex.nfcore.base.auth.*;
import ru.neoflex.nfcore.base.components.Publisher;
import ru.neoflex.nfcore.base.services.Context;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
public class PublisherTests {
    @Autowired
    Context context;

    @Test
    public void handleEvents() throws IOException {
        List<String> strings = new ArrayList<>();
        Publisher.BeforeSaveHandler<Role> beforeSaveHandler = new Publisher.BeforeSaveHandler<Role>(AuthPackage.Literals.ROLE) {
            @Override
            public EObject handleEObject(Role eObject) {
                strings.add(eObject.getName());
                return eObject;
            }
        };
        context.getPublisher().subscribe(beforeSaveHandler);
        Publisher.AfterSaveHandler<Role> afterSaveHandler = new Publisher.AfterSaveHandler<Role>(AuthPackage.Literals.ROLE) {
            @Override
            public EObject handleEObject(Role eObject) {
                strings.add(eObject.getName());
                return eObject;
            }
        };
        context.getPublisher().subscribe(afterSaveHandler);
        Publisher.AfterLoadHandler<Role> afterLoadHandler = new Publisher.AfterLoadHandler<Role>(AuthPackage.Literals.ROLE) {
            @Override
            public EObject handleEObject(Role eObject) {
                strings.add(eObject.getName());
                return eObject;
            }
        };
        context.getPublisher().subscribe(afterLoadHandler);
        Publisher.BeforeDeleteHandler<Role> beforeDeleteHandler = new Publisher.BeforeDeleteHandler<Role>(AuthPackage.Literals.ROLE) {
            @Override
            public EObject handleEObject(Role eObject) {
                strings.add(eObject.getName());
                return eObject;
            }
        };
        context.getPublisher().subscribe(beforeDeleteHandler);
        Publisher.AfterDeleteHandler<Role> afterDeleteHandler = new Publisher.AfterDeleteHandler<Role>(AuthPackage.Literals.ROLE) {
            @Override
            public EObject handleEObject(Role eObject) {
                strings.add(eObject.getName());
                return eObject;
            }
        };
        context.getPublisher().subscribe(afterDeleteHandler);
        Role role = createMyRole();
        Resource roleResource = context.getStore().createEObject(role);
        Resource resource2 = context.getStore().loadResource(roleResource.getURI());
        context.getStore().deleteResource(roleResource.getURI());
        Assert.assertEquals(5, strings.size());
        Assert.assertTrue(context.getPublisher().unsubscribe(beforeSaveHandler));
        Assert.assertTrue(context.getPublisher().unsubscribe(afterSaveHandler));
        Assert.assertTrue(context.getPublisher().unsubscribe(afterLoadHandler));
        Assert.assertTrue(context.getPublisher().unsubscribe(beforeDeleteHandler));
        Assert.assertTrue(context.getPublisher().unsubscribe(afterDeleteHandler));
    }

    public static Role createMyRole() {
        Role superAdmin = AuthFactory.eINSTANCE.createRole();
        superAdmin.setName("MyRole");
        Permission allPermission = AuthFactory.eINSTANCE.createAllPermission();
        allPermission.setGrantStatus(GrantStatus.GRANTED);
        allPermission.getActionTypes().add(ActionType.ALL);
        superAdmin.getGrants().add(allPermission);
        return superAdmin;
    }
}
